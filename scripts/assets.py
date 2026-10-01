"""Preserve supplied files and extract the release without executing its contents."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import stat
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent.parent
UPLOAD_NAMES = (
    "Enceladus_v3_Design_Review.pdf",
    "enceladus_within_cinematic_previs_h264.mp4",
    "Enceladus_Within_v3_Project.zip",
    "CATALOG.md",
    "Enceladus_v3_Budget_and_Gates.xlsx",
    "ChatGPT Image Sep 30, 2026, 11_59_59 AM.png",
    "ChatGPT Image Sep 30, 2026, 11_59_25 AM.png",
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def safe_path(name: str) -> PurePosixPath:
    path = PurePosixPath(name)
    if path.is_absolute() or not path.parts or ".." in path.parts or "\\" in name:
        raise ValueError(f"Unsafe archive path: {name}")
    return path


def extract_zip(source: Path, target: Path) -> None:
    """Validate the whole archive before writing; preserve differing existing files."""
    with zipfile.ZipFile(source) as archive:
        members = archive.infolist()
        if len(members) > 10000 or sum(m.file_size for m in members) > 1024**3:
            raise ValueError(
                "Archive exceeds the 1 GiB / 10,000 entry inspection limit"
            )
        seen: set[str] = set()
        for member in members:
            path = safe_path(member.filename)
            if str(path) in seen or stat.S_ISLNK(member.external_attr >> 16):
                raise ValueError(f"Duplicate path or symbolic link: {path}")
            seen.add(str(path))
            destination = target / path
            if not destination.resolve().is_relative_to(target.resolve()):
                raise ValueError(f"Path escapes extraction root: {path}")
            if (
                not member.is_dir()
                and destination.exists()
                and destination.read_bytes() != archive.read(member)
            ):
                raise ValueError(f"Existing file differs: {destination}")
        for member in members:
            destination = target / safe_path(member.filename)
            if member.is_dir():
                destination.mkdir(parents=True, exist_ok=True)
            elif not destination.exists():
                destination.parent.mkdir(parents=True, exist_ok=True)
                with archive.open(member) as src, destination.open("xb") as dst:
                    shutil.copyfileobj(src, dst)


def verify_release(root: Path) -> int:
    """Verify exact file set, sizes and SHA-256 against the supplied manifest."""
    manifest = json.loads((root / "manifest.json").read_text())
    expected = manifest["files"]
    if not isinstance(expected, dict) or not expected:
        raise ValueError("Empty or unsupported release manifest")
    actual = {str(p.relative_to(root)) for p in root.rglob("*") if p.is_file()}
    if actual != set(expected) | {"manifest.json"}:
        raise ValueError(
            f"Release file set differs: {actual ^ (set(expected) | {'manifest.json'})}"
        )
    for name, entry in expected.items():
        path = root / safe_path(name)
        if path.stat().st_size != entry["bytes"] or sha256(path) != entry["sha256"]:
            raise ValueError(f"Release checksum mismatch: {name}")
    return len(expected)


def inventory(root: Path = ROOT) -> list[dict[str, str | int]]:
    """Record every upload and extracted member with its original provenance."""
    entries: list[dict[str, str | int]] = []
    for folder, provenance in (
        ("source/uploads", "Andrew supplied file"),
        ("deliveries/enceladus_v3", "Enceladus_Within_v3_Project.zip"),
    ):
        for path in sorted((root / folder).rglob("*")):
            if path.is_file():
                entries.append(
                    {
                        "path": str(path.relative_to(root)),
                        "bytes": path.stat().st_size,
                        "content_sha256": sha256(path),
                        "provenance": provenance,
                        "lakefs_repo": "",
                        "lakefs_commit": "",
                        "lakefs_path": "",
                    }
                )
    return entries


def ingest(downloads: Path) -> None:
    """Copy exact originals, extract the archive and record a hash inventory."""
    for name in UPLOAD_NAMES:
        if not (downloads / name).is_file():
            raise ValueError(f"Missing supplied upload: {name}")
    upload_dir = ROOT / "source/uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    for name in UPLOAD_NAMES:
        source, destination = downloads / name, upload_dir / name
        if destination.exists() and sha256(source) != sha256(destination):
            raise ValueError(f"Existing upload differs: {destination}")
        if not destination.exists():
            shutil.copy2(source, destination)
    extract_zip(upload_dir / "Enceladus_Within_v3_Project.zip", ROOT / "deliveries")
    count = verify_release(ROOT / "deliveries/enceladus_v3")
    entries = inventory()
    manifest_path = ROOT / "assets/inventory.json"
    if manifest_path.exists():
        previous = json.loads(manifest_path.read_text())
        if [(e["path"], e["content_sha256"]) for e in previous] != [
            (e["path"], e["content_sha256"]) for e in entries
        ]:
            raise ValueError("Existing asset inventory differs; reconcile deliberately")
    else:
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(entries, indent=2) + "\n")
    print(
        f"7 originals preserved; {count} release hashes verified; {len(entries)} individual assets inventoried"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--downloads", type=Path, required=True)
    args = parser.parse_args()
    ingest(args.downloads)


if __name__ == "__main__":
    main()
