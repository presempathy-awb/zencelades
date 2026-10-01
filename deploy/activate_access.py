"""Remote selective release installer. Retains previous site, service and IP database."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import tempfile
import time
import urllib.request
from pathlib import Path

ROOT = Path("/srv/thatsnozorb")
ACCESS = Path("/srv/thatsnozorb-access")
UNIT = Path("/etc/systemd/system/thatsnozorb-access.service")
ROUTE = Path("/etc/traefik/dynamic/muchadoaboutoneside-thatsnozorb.yml")


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def switch(target: Path, link: Path) -> None:
    temporary = link.with_name(link.name + ".access-next")
    temporary.symlink_to(target)
    temporary.replace(link)


def run(*args: str) -> None:
    subprocess.run(list(args), check=True, timeout=30, stdout=subprocess.DEVNULL)


def healthy(url: str) -> None:
    deadline = time.monotonic() + 15
    while True:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status == 200:
                    return
        except OSError:
            if time.monotonic() >= deadline:
                raise
        time.sleep(0.2)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    plan = json.loads((args.source / "plan.json").read_text())
    previous = (ROOT / "current").resolve(strict=True)
    if str(previous) != plan["previous"] or digest(ROUTE) != plan["route_sha256"]:
        raise RuntimeError(
            "Live site or route changed since planning; rebuild the packet"
        )
    if (
        digest(previous / "site/dist/index.html") != plan["home_sha256"]
        or digest(previous / "deploy/Caddyfile") != plan["caddy_sha256"]
    ):
        raise RuntimeError("Live release bytes changed since planning")
    for name, expected in plan["overlay"].items():
        path = Path(name)
        if (
            path.is_absolute()
            or ".." in path.parts
            or digest(args.source / path) != expected
        ):
            raise RuntimeError("Invalid overlay packet")
    run(
        "/usr/bin/caddy",
        "validate",
        "--config",
        str(args.source / "deploy/Caddyfile"),
        "--adapter",
        "caddyfile",
    )
    run("systemd-analyze", "verify", str(args.source / "thatsnozorb-access.service"))
    if not args.apply:
        print("Verified selective overlay; no activation requested")
        return
    if os.geteuid() != 0:
        raise RuntimeError("Activation requires sudo")
    ACCESS.mkdir(exist_ok=True)
    (ACCESS / "releases").mkdir(exist_ok=True)
    service_id = hashlib.sha256(
        (
            plan["overlay"]["access_server.py"]
            + plan["overlay"]["thatsnozorb-access.service"]
        ).encode()
    ).hexdigest()
    service_release = ACCESS / "releases" / service_id
    service_release.mkdir(exist_ok=True)
    for name in ("access_server.py", "thatsnozorb-access.service"):
        destination = service_release / name
        if destination.exists() and digest(destination) != plan["overlay"][name]:
            raise RuntimeError("Service release collision")
        shutil.copy2(args.source / name, destination)
    old_service = (
        (ACCESS / "current").resolve() if (ACCESS / "current").exists() else None
    )
    old_unit = UNIT.read_bytes() if UNIT.exists() else None
    with tempfile.TemporaryDirectory(
        prefix="access-overlay-", dir=ROOT / "releases"
    ) as scratch:
        stage = Path(scratch)
        shutil.copytree(previous, stage, dirs_exist_ok=True, symlinks=True)
        for name in (
            "site/dist/index.html",
            "site/dist/access.js",
            "site/dist/access.css",
            "deploy/Caddyfile",
        ):
            destination = stage / name
            if destination.is_symlink():
                raise RuntimeError("Refusing linked overlay target")
            shutil.copy2(args.source / name, destination)
        entries = []
        for path in sorted(stage.rglob("*")):
            if path.is_file() and path.name != "release-files.json":
                if path.is_symlink():
                    raise RuntimeError("Refusing linked release content")
                entries.append(
                    {
                        "path": str(path.relative_to(stage)),
                        "bytes": path.stat().st_size,
                        "sha256": digest(path),
                    }
                )
        manifest = (json.dumps(entries, sort_keys=True, indent=2) + "\n").encode()
        release_id = hashlib.sha256(manifest).hexdigest()
        target = ROOT / "releases" / release_id
        (stage / "release-files.json").write_bytes(manifest)
        if target.exists():
            raise RuntimeError(
                "Release already exists; verify active state before retrying"
            )
        shutil.copytree(stage, target)
    backup = ACCESS / ("activation-" + release_id)
    backup.mkdir(exist_ok=False)
    if old_unit is not None:
        (backup / UNIT.name).write_bytes(old_unit)
    (backup / "previous.json").write_text(
        json.dumps(
            {
                "site": str(previous),
                "service": str(old_service) if old_service else None,
            }
        )
    )
    try:
        # Recheck immediately before replacing pointers, preserving concurrent publishing.
        if (ROOT / "current").resolve() != previous or digest(ROUTE) != plan[
            "route_sha256"
        ]:
            raise RuntimeError("Concurrent publish detected before activation")
        switch(service_release, ACCESS / "current")
        shutil.copy2(service_release / UNIT.name, UNIT)
        run("systemctl", "daemon-reload")
        run("systemctl", "restart", UNIT.name)
        healthy("http://127.0.0.1:18133/health")
        switch(target, ROOT / "current")
        run("systemctl", "restart", "thatsnozorb.service")
        healthy("http://127.0.0.1:18131/")
        with urllib.request.urlopen("http://127.0.0.1:18131/", timeout=5) as response:
            if hashlib.sha256(response.read()).hexdigest() != digest(
                target / "site/dist/index.html"
            ):
                raise RuntimeError("Hosted homepage differs from release")
        run("systemctl", "enable", UNIT.name)
    except BaseException:
        if (ROOT / "current").resolve() == target:
            switch(previous, ROOT / "current")
            run("systemctl", "restart", "thatsnozorb.service")
        if old_service:
            switch(old_service, ACCESS / "current")
        if old_unit is not None:
            UNIT.write_bytes(old_unit)
            run("systemctl", "daemon-reload")
            run("systemctl", "restart", UNIT.name)
        else:
            run("systemctl", "stop", UNIT.name)
        raise
    print(
        json.dumps(
            {
                "site_release": str(target),
                "service_release": str(service_release),
                "previous_site": str(previous),
                "backup": str(backup),
            }
        )
    )


if __name__ == "__main__":
    main()
