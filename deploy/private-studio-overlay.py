"""Install a scoped additive overlay, then use the existing locked release activator."""

import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
from pathlib import Path, PurePosixPath


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_digest(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def stage_release(
    root: Path, base_id: str, release_id: str, archive_sha: str, archive_bytes: bytes
) -> Path:
    """Verify immutable archive bytes and install a complete additive release."""
    base, target = root / "releases" / base_id, root / "releases" / release_id
    if (root / "current").resolve() != base or digest(archive_bytes) != archive_sha:
        raise SystemExit("Live release or archive changed; re-plan")
    raw = (base / "release-files.json").read_bytes()
    if digest(raw) != base_id:
        raise SystemExit("Invalid base manifest")
    old_rows = json.loads(raw)
    old = {row["path"]: row for row in old_rows}
    with tarfile.open(fileobj=io.BytesIO(archive_bytes), mode="r:gz") as bundle:
        members = bundle.getmembers()
        raw = bundle.extractfile("release-files.json").read()
        if digest(raw) != release_id:
            raise SystemExit("Invalid target manifest")
        rows = json.loads(raw)
        new = {row["path"]: row for row in rows}
        if (
            len(new) != len(rows)
            or len(old) != len(old_rows)
            or not set(old) <= set(new)
        ):
            raise SystemExit("Duplicate entries or removal of live files")
        changed = {name for name in new if new[name] != old.get(name)}
        aliases = (
            "about",
            "application",
            "mounts",
            "grants",
            "pricing",
            "catalog",
            "naming",
            "name-concepts",
            "open-source",
            "models",
            "studio",
            "audio",
            "showtime",
        )
        allowed = {
            "site/dist/index.html",
            "deploy/Caddyfile",
            "deploy/private-studio.caddy",
            "deploy/private-studio-retired.caddy",
            *[f"site/dist/{a}/index.html" for a in aliases],
        }
        if not 1 <= len(changed) <= 300 or any(
            name not in allowed
            and not name.startswith(
                ("site/dist/studio-assets/", "site/private-studio/")
            )
            for name in changed
        ):
            raise SystemExit("Overlay exceeds private-studio scope")
        if (
            len(members) != len(changed) + 1
            or not all(m.isfile() for m in members)
            or {m.name for m in members} != changed | {"release-files.json"}
        ):
            raise SystemExit("Archive differs from scoped manifest")
        for name, entry in new.items():
            relative = PurePosixPath(name)
            if (
                not name
                or relative.is_absolute()
                or ".." in relative.parts
                or "\\" in name
                or str(relative) != name
                or any(ord(c) < 32 or ord(c) == 127 for c in name)
            ):
                raise SystemExit("Unsafe manifest path")
            if name in changed:
                data = bundle.extractfile(name).read()
                valid = len(data) == entry["bytes"] and digest(data) == entry["sha256"]
            else:
                path = base / name
                valid = (
                    path.is_file()
                    and not path.is_symlink()
                    and path.resolve().is_relative_to(base)
                    and path.stat().st_size == entry["bytes"]
                    and file_digest(path) == entry["sha256"]
                )
            if not valid:
                raise SystemExit(f"File verification failed: {name}")
        if target.exists():
            raise SystemExit("Never overwrite an existing release")
        # Only a completed overlay receives the immutable release name. A failed
        # copy/write cleans its own temporary directory and leaves retry possible.
        with tempfile.TemporaryDirectory(
            prefix=".private-studio-", dir=root / "releases"
        ) as temporary:
            staging = Path(temporary) / "release"
            staging.mkdir()
            for name in old:
                destination = staging / name
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(base / name, destination, follow_symlinks=False)
            for name in changed | {"release-files.json"}:
                path = staging / name
                if not path.resolve().is_relative_to(staging):
                    raise SystemExit("Linked staging parent")
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(bundle.extractfile(name).read())
            # All publishers use this same activation lock. Protect the rename too
            # so another publisher cannot install this immutable target concurrently.
            import fcntl

            with os.fdopen(
                os.open(
                    root / "activation.lock",
                    os.O_WRONLY | os.O_CREAT | os.O_NOFOLLOW,
                    0o600,
                ),
                "w",
            ) as lock:
                deadline = time.monotonic() + 30
                while True:
                    try:
                        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                        break
                    except BlockingIOError:
                        if time.monotonic() >= deadline:
                            raise SystemExit("Activation lock busy; re-plan")
                        time.sleep(0.05)  # Bounded lock contention polling.
                if target.exists():
                    raise SystemExit("Never overwrite an existing release")
                if (root / "current").resolve() != base:
                    raise SystemExit("Live release changed while staging; re-plan")
                for name, entry in new.items():
                    path = staging / name
                    if (
                        path.is_symlink()
                        or not path.is_file()
                        or path.stat().st_size != entry["bytes"]
                        or file_digest(path) != entry["sha256"]
                    ):
                        raise SystemExit(f"Staged file verification failed: {name}")
                staging.rename(target)
    return target


def main() -> None:
    base_id, release_id, archive_sha, archive_path = sys.argv[1:]
    if not all(
        re.fullmatch("[a-f0-9]{64}", value)
        for value in (base_id, release_id, archive_sha)
    ):
        raise SystemExit("Invalid release identity")
    if not re.fullmatch(
        r"/tmp/zenc-private-upload\.[A-Za-z0-9]+/release.tar.gz", archive_path
    ):
        raise SystemExit("Invalid archive staging path")
    root = Path("/srv/thatsnozorb")
    # Hash and parse the same immutable snapshot; never reopen after verification.
    with os.fdopen(os.open(archive_path, os.O_RDONLY | os.O_NOFOLLOW), "rb") as stream:
        archive_bytes = stream.read()
    target = stage_release(root, base_id, release_id, archive_sha, archive_bytes)
    subprocess.run(
        [
            "bash",
            str(target / "deploy/activate.sh"),
            release_id,
            "--apply",
            str(root / "releases" / base_id),
        ],
        check=True,
        timeout=300,
    )
    # Keep a completed release on activation failure/timeout for diagnosis.
    print(f"Activated {release_id}; retained all prior entries and prior release")
    try:
        Path(archive_path).unlink()
        Path(archive_path).parent.rmdir()
    except OSError as error:
        print(
            f"Activation succeeded; upload cleanup incomplete: {error}", file=sys.stderr
        )


if __name__ == "__main__":
    main()
