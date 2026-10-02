"""Install a scoped additive overlay, then use the existing locked release activator."""

import hashlib
import json
import re
import shutil
import subprocess
import sys
import tarfile
from pathlib import Path, PurePosixPath

base_id, release_id, archive_sha = sys.argv[1:]
if not all(
    re.fullmatch("[a-f0-9]{64}", value) for value in (base_id, release_id, archive_sha)
):
    raise SystemExit("Invalid release identity")
root = Path("/srv/thatsnozorb")
base, target = root / "releases" / base_id, root / "releases" / release_id
archive = Path("/tmp") / f"zencelades-private-{release_id}.tar.gz"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_digest(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


if (root / "current").resolve() != base or file_digest(archive) != archive_sha:
    raise SystemExit("Live release or archive changed; re-plan")
raw = (base / "release-files.json").read_bytes()
if digest(raw) != base_id:
    raise SystemExit("Invalid base manifest")
old_rows = json.loads(raw)
old = {row["path"]: row for row in old_rows}
with tarfile.open(archive) as bundle:
    members = bundle.getmembers()
    raw = bundle.extractfile("release-files.json").read()
    if digest(raw) != release_id:
        raise SystemExit("Invalid target manifest")
    rows = json.loads(raw)
    new = {row["path"]: row for row in rows}
    if len(new) != len(rows) or len(old) != len(old_rows) or not set(old) <= set(new):
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
        and not name.startswith(("site/dist/studio-assets/", "site/private-studio/"))
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
        if relative.is_absolute() or ".." in relative.parts or "\\" in name:
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
    shutil.copytree(base, target, copy_function=shutil.copy2)
    for name in changed | {"release-files.json"}:
        path = target / name
        if not path.resolve().is_relative_to(target):
            raise SystemExit("Linked staging parent")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(bundle.extractfile(name).read())
subprocess.run(
    ["bash", str(target / "deploy/activate.sh"), release_id, "--apply", str(base)],
    check=True,
)
print(
    f"Activated {release_id}; retained all {len(old)} prior entries and prior release"
)
