"""Plan or install only the reviewed account service; migration and routing are separate."""

from __future__ import annotations

import argparse
import fcntl
import hashlib
import json
import os
import re
import stat
import subprocess
import tempfile
import time
import urllib.request
from http.client import HTTPResponse
from pathlib import Path
from typing import cast, override

ROOT = Path("/srv/zencelades-account")
UNIT = Path("/etc/systemd/system/zencelades-account.service")
CREDENTIAL = Path("/etc/zencelades-account/database-url")
BINARY = "zencelades-account"
UNIT_NAME = "zencelades-account.service"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_regular(path: Path, limit: int = 64 * 1024 * 1024) -> bytes:
    """Read bounded bytes from the opened regular file, never a linked target."""
    with os.fdopen(
        os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK), "rb"
    ) as stream:
        info = os.fstat(stream.fileno())
        if not stat.S_ISREG(info.st_mode) or not 0 < info.st_size <= limit:
            raise ValueError(f"Invalid regular file: {path}")
        data = stream.read(limit + 1)
        if len(data) > limit:
            raise ValueError(f"File grew beyond limit: {path}")
        return data


def state() -> tuple[str, str]:
    """Refuse unfamiliar current pointers and linked units before any replacement."""
    current = ROOT / "current"
    release = "absent"
    if current.is_symlink():
        target = current.resolve(strict=True)
        if (
            target.parent != ROOT / "releases"
            or not target.is_dir()
            or not re.fullmatch(r"[0-9a-f]{64}", target.name)
        ):
            raise RuntimeError("Unrecognized account current pointer")
        hashes = {
            name: digest(read_regular(target / name)) for name in (BINARY, UNIT_NAME)
        }
        if digest(json.dumps(hashes, sort_keys=True).encode()) != target.name:
            raise RuntimeError("Current account release bytes changed")
        release = target.name
    elif current.exists():
        raise RuntimeError("Account current is not a release symlink")
    if UNIT.is_symlink():
        raise RuntimeError("Refusing linked systemd unit")
    unit_hash = digest(read_regular(UNIT, 65536)) if UNIT.exists() else "absent"
    return release, unit_hash


def require_root() -> None:
    if os.geteuid() != 0 or not Path("/run/systemd/system").is_dir():
        raise RuntimeError("Apply requires root on the systemd deployment host")


def private_credential() -> None:
    """Check the owner-provisioned file's metadata without reading its secret."""
    fd = os.open(CREDENTIAL, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    try:
        info = os.fstat(fd)
        if (
            not stat.S_ISREG(info.st_mode)
            or info.st_uid != os.geteuid()
            or info.st_mode & 0o077
            or not 0 < info.st_size <= 8192
        ):
            raise RuntimeError(
                "Credential must be private, root-owned and at most 8 KB"
            )
    finally:
        os.close(fd)


def secure_directory(path: Path) -> None:
    info = path.lstat()
    if (
        not stat.S_ISDIR(info.st_mode)
        or info.st_uid != os.geteuid()
        or info.st_mode & 0o022
    ):
        raise RuntimeError(f"Refusing untrusted deployment directory: {path}")


def service(action: str) -> bool | None:
    command = ["systemctl", action]
    if action != "daemon-reload":
        command.append(UNIT_NAME)
    if action in ("is-active", "is-enabled"):
        result = subprocess.run(
            command, capture_output=True, text=True, timeout=30, check=False
        )
        value = result.stdout.strip()
        allowed = (
            {"active", "inactive", "failed", "unknown"}
            if action == "is-active"
            else {"enabled", "disabled", "not-found"}
        )
        if value not in allowed:
            raise RuntimeError(f"Refusing unfamiliar {action} state: {value}")
        return value in {"active", "enabled"}
    _ = subprocess.run(command, check=True, timeout=30)
    return None


def validate_unit(unit: Path, binary: Path) -> None:
    """Verify the exact unit with only its executable relocated for staging."""
    text = read_regular(unit, 65536).decode()
    installed = str(ROOT / "current" / BINARY)
    if text.count(installed) != 1:
        raise ValueError("Unit must reference the account current-release binary once")
    with tempfile.TemporaryDirectory(prefix="account-unit-") as temporary:
        candidate = Path(temporary) / UNIT_NAME
        _ = candidate.write_text(text.replace(installed, str(binary)))
        _ = subprocess.run(
            ["systemd-analyze", "verify", str(candidate)], check=True, timeout=30
        )


class NoRedirect(urllib.request.HTTPRedirectHandler):
    @override
    def redirect_request(
        self,
        req: urllib.request.Request,
        fp: object,
        code: int,
        msg: str,
        headers: object,
        newurl: str,
    ) -> None:
        return None


def healthy() -> None:
    """Poll the anonymous session contract; this is not authenticated save proof."""
    opener = urllib.request.build_opener(NoRedirect)
    deadline = time.monotonic() + 20
    while True:
        try:
            with cast(
                HTTPResponse,
                opener.open("http://127.0.0.1:18134/account/api/session", timeout=2),
            ) as r:
                payload = r.read(32769)
                if (
                    len(payload) > 32768
                    or r.status != 200
                    or "no-store" not in r.headers.get("Cache-Control", "")
                    or json.loads(payload)
                    != {
                        "data": {
                            "user": None,
                            "signInURL": "/outpost.goauthentik.io/start?rd=%2F",
                            "signOutURL": "/outpost.goauthentik.io/sign_out",
                        }
                    }
                ):
                    raise ValueError("Unexpected anonymous account session")
                return
        except (OSError, ValueError, AttributeError) as error:
            if time.monotonic() >= deadline:
                raise RuntimeError("Account service did not become healthy") from error
            # Bounded condition polling while systemd starts the service.
            time.sleep(0.2)


def write_atomic(path: Path, data: bytes, mode: int = 0o644) -> None:
    fd, name = tempfile.mkstemp(prefix=".account-unit-", dir=path.parent)
    temporary = Path(name)
    try:
        with os.fdopen(fd, "wb") as stream:
            _ = stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
            os.fchmod(stream.fileno(), mode)
        _ = temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def switch(target: Path, current: Path) -> None:
    with tempfile.TemporaryDirectory(
        prefix=".account-pointer-", dir=current.parent
    ) as d:
        pointer = Path(d) / "current"
        pointer.symlink_to(target)
        _ = pointer.replace(current)


def install(
    source: Path,
    *,
    expected_current: str,
    expected_unit: str,
    apply: bool = False,
    release: str | None = None,
) -> dict[str, object]:
    """Pin source and prior state; retain artifacts and roll back failed activation."""
    for expected in (expected_current, expected_unit):
        if expected != "absent" and not re.fullmatch(r"[0-9a-f]{64}", expected):
            raise ValueError("Expected state must be a SHA-256 or 'absent'")
    if source.is_symlink() or not source.is_dir():
        raise ValueError("Source must be a regular candidate directory")
    for name in (BINARY, UNIT_NAME):
        if (source / name).is_symlink():
            raise ValueError("Refusing linked candidate file")
    assets = {name: read_regular(source / name) for name in (BINARY, UNIT_NAME)}
    hashes = {name: digest(data) for name, data in assets.items()}
    candidate = digest(json.dumps(hashes, sort_keys=True).encode())
    expected = (expected_current, expected_unit)
    if state() != expected:
        raise RuntimeError(
            "Live account service changed; rebuild the installation plan"
        )
    plan: dict[str, object] = {
        "release": candidate,
        "files": hashes,
        "previous": expected,
        "applied": False,
    }
    if not apply:
        return plan
    if release != candidate:
        raise ValueError("Apply requires the exact reviewed --release digest")
    require_root()
    private_credential()
    secure_directory(ROOT.parent)
    secure_directory(UNIT.parent)
    ROOT.mkdir(mode=0o755, exist_ok=True)
    secure_directory(ROOT)
    lock_fd = os.open(
        ROOT / ".install.lock", os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600
    )
    with os.fdopen(lock_fd, "r+") as lock:
        info = os.fstat(lock.fileno())
        if (
            info.st_uid != os.geteuid()
            or info.st_nlink != 1
            or info.st_mode & 0o077
            or not stat.S_ISREG(info.st_mode)
        ):
            raise RuntimeError("Refusing untrusted installation lock")
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if state() != expected:
            raise RuntimeError(
                "Account service changed while acquiring installation lock"
            )
        releases = ROOT / "releases"
        releases.mkdir(mode=0o755, exist_ok=True)
        secure_directory(releases)
        target = releases / candidate
        if target.exists() or target.is_symlink():
            secure_directory(target)
            if any(
                read_regular(target / name) != data for name, data in assets.items()
            ):
                raise RuntimeError("Account release collision; refusing overwrite")
        else:
            with tempfile.TemporaryDirectory(prefix=".stage-", dir=releases) as d:
                staging = Path(d) / candidate
                staging.mkdir(mode=0o755)
                for name, data in assets.items():
                    path = staging / name
                    _ = path.write_bytes(data)
                    path.chmod(0o755 if name == BINARY else 0o644)
                _ = staging.rename(target)
        validate_unit(target / UNIT_NAME, target / BINARY)
        active, enabled = service("is-active"), service("is-enabled")
        old_unit = read_regular(UNIT, 65536) if expected_unit != "absent" else None
        old_mode = stat.S_IMODE(UNIT.stat().st_mode) if old_unit is not None else 0o644
        backups = ROOT / "activation-backups"
        backups.mkdir(mode=0o700, exist_ok=True)
        secure_directory(backups)
        backup = Path(tempfile.mkdtemp(prefix=candidate[:12] + "-", dir=backups))
        _ = (backup / "previous.json").write_text(
            json.dumps(
                {
                    "current": expected_current,
                    "unit": expected_unit,
                    "unit_mode": old_mode,
                    "active": active,
                    "enabled": enabled,
                }
            )
            + "\n"
        )
        if old_unit is not None:
            _ = (backup / UNIT_NAME).write_bytes(old_unit)
        if state() != expected:
            raise RuntimeError(
                "Account service changed during validation; refusing activation"
            )
        current = ROOT / "current"
        enable_attempted = False
        try:
            switch(target, current)
            if state() != (candidate, expected_unit):
                raise RuntimeError("Account service changed before unit replacement")
            write_atomic(UNIT, assets[UNIT_NAME])
            _ = service("daemon-reload")
            _ = service("restart")
            healthy()
            if not service("is-active"):
                raise RuntimeError("Account unit is not active after the health probe")
            if state() != (candidate, hashes[UNIT_NAME]):
                raise RuntimeError("Account service changed during health verification")
            if not enabled:
                enable_attempted = True
                _ = service("enable")
        except BaseException as error:
            try:
                # Refuse to roll back over a deployment made by a different owner.
                now = state()
                if now[0] != candidate or now[1] not in {
                    hashes[UNIT_NAME],
                    expected_unit,
                }:
                    raise RuntimeError(
                        "Concurrent account deployment; automatic rollback refused"
                    )
                _ = service("stop")
                if enable_attempted and not enabled:
                    _ = service("disable")
                if old_unit is not None:
                    write_atomic(UNIT, old_unit, old_mode)
                else:
                    UNIT.unlink(missing_ok=True)
                if expected_current == "absent":
                    current.unlink()
                else:
                    switch(releases / expected_current, current)
                _ = service("daemon-reload")
                if active:
                    _ = service("start")
            except (
                OSError,
                RuntimeError,
                ValueError,
                subprocess.SubprocessError,
                KeyboardInterrupt,
                SystemExit,
            ) as rollback_error:
                raise BaseExceptionGroup(
                    "Account activation and rollback failed", [error, rollback_error]
                )
            raise
        return {**plan, "applied": True, "backup": str(backup)}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    _ = parser.add_argument("source", type=Path)
    _ = parser.add_argument("--expected-current", required=True)
    _ = parser.add_argument("--expected-unit", required=True)
    _ = parser.add_argument(
        "--release", help="Exact candidate digest from the reviewed plan"
    )
    _ = parser.add_argument("--apply", action="store_true")
    args = vars(parser.parse_args())
    result = install(
        source=cast(Path, args["source"]),
        expected_current=cast(str, args["expected_current"]),
        expected_unit=cast(str, args["expected_unit"]),
        release=cast(str | None, args["release"]),
        apply=cast(bool, args["apply"]),
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
