# SPDX-License-Identifier: MIT OR Apache-2.0
# Copyright 2026 Andrew Briscoe and the zencelades contributors
"""Restore cataloged original assets from a retained checkout without overwriting."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import tempfile
from pathlib import Path

from scripts.assets import ROOT, safe_path, sha256


def _manifest_entries(root: Path) -> dict[str, tuple[int, str]]:
    entries: dict[str, tuple[int, str]] = {}
    manifests = [
        root / "assets/catalog.json",
        root / "assets/v4-catalog.json",
        root / "assets/build-inputs.json",
    ]
    manifests.extend(sorted((root / "assets").glob("enceladus-*/catalog.json")))
    manifests.append(root / "assets/engineering-sources.json")
    # Citation records describe sources without a retained local copy.
    citations = root / "assets/engineering-sources.json"
    for manifest in manifests:
        if not manifest.is_file():
            continue
        data = json.loads(manifest.read_text())
        enceladus = manifest.name == "catalog.json" and manifest.parent.name.startswith(
            "enceladus-"
        )
        if enceladus:
            records = data.get("sources", data.get("inputs", []))
        else:
            records = data.get("files", data.get("sources", data.get("inputs", [])))
        if not isinstance(records, list):
            raise TypeError(f"Malformed catalog, records are not a list: {manifest}")
        for record in records:
            if not isinstance(record, dict):
                raise TypeError(f"Malformed catalog record in {manifest}: {record!r}")
            path = record.get("path") or record.get("local_path")
            relative_path = record.get("relative_path")
            if (
                not path
                and enceladus
                and isinstance(relative_path, str)
                and relative_path.startswith("originals/")
            ):
                path = f"source/research/{manifest.parent.name}/{relative_path}"
            if not path:
                if manifest == citations:
                    continue
                raise ValueError(f"Catalog record without a local path in {manifest}")
            relative = safe_path(path)
            if relative.as_posix() != path or relative.parts[0] not in {
                "source",
                "deliveries",
            }:
                raise ValueError(f"Noncanonical or unsupported catalog path: {path}")
            size, digest = record.get("bytes"), record.get("content_sha256")
            if type(size) is not int or not isinstance(digest, str):
                raise TypeError(f"Invalid local catalog length or digest: {path}")
            value = (size, digest)
            if path in entries and entries[path] != value:
                raise ValueError(f"Conflicting catalog records: {path}")
            entries[path] = value
    if not entries:
        raise ValueError("No cataloged original assets found")
    return entries


def _no_links(root: Path, path: Path) -> None:
    current = root
    for part in path.relative_to(root).parts:
        current /= part
        if current.is_symlink():
            raise ValueError(f"Symbolic link is not allowed: {current}")


def restore(retained: Path, *, apply: bool = False) -> tuple[int, int]:
    """Validate every original and destination, then copy only missing exact files."""
    target_root = ROOT.resolve()
    retained = retained.expanduser()
    if retained.is_symlink() or not retained.is_dir():
        raise ValueError(f"Retained checkout must be a real directory: {retained}")
    source_root = retained.resolve()
    entries = _manifest_entries(target_root)
    copies: list[tuple[Path, Path]] = []
    total_bytes = 0
    for name, (size, digest) in sorted(entries.items()):
        relative = safe_path(name)
        source = source_root / relative
        destination = target_root / relative
        _no_links(source_root, source)
        _no_links(target_root, destination)
        if (
            not source.is_file()
            or source.stat().st_size != size
            or sha256(source) != digest
        ):
            raise ValueError(f"Missing or mismatched retained original: {name}")
        if destination.exists():
            if (
                not destination.is_file()
                or destination.stat().st_size != size
                or sha256(destination) != digest
            ):
                raise ValueError(f"Existing destination differs: {name}")
        else:
            copies.append((source, destination))
        total_bytes += size
    if apply:
        staged: list[tuple[Path, Path]] = []
        try:
            for source, destination in copies:
                destination.parent.mkdir(parents=True, exist_ok=True)
                fd, name = tempfile.mkstemp(
                    prefix=".restore-assets-", dir=destination.parent
                )
                stage = Path(name)
                staged.append((stage, destination))
                with os.fdopen(fd, "wb") as dst, source.open("rb") as src:
                    shutil.copyfileobj(src, dst)
                    dst.flush()
                    os.fsync(dst.fileno())
                expected_size, expected_hash = entries[
                    destination.relative_to(target_root).as_posix()
                ]
                if (
                    stage.stat().st_size != expected_size
                    or sha256(stage) != expected_hash
                ):
                    raise ValueError(
                        f"Retained original changed while copying: {source}"
                    )
                # Widen to the original's mode only once the bytes are proven.
                stage.chmod(source.stat().st_mode & 0o777)
                descriptor = os.open(stage, os.O_RDONLY)
                try:
                    os.fsync(descriptor)
                finally:
                    os.close(descriptor)
            for stage, destination in staged:
                os.link(stage, destination)
            # Sync each directory that gained an entry, up to the checkout root.
            directories = set()
            for _, destination in staged:
                directories.update(
                    parent for parent in destination.relative_to(target_root).parents
                )
            for directory in sorted(target_root / d for d in directories):
                descriptor = os.open(directory, os.O_RDONLY)
                try:
                    os.fsync(descriptor)
                finally:
                    os.close(descriptor)
        finally:
            for stage, _ in staged:
                stage.unlink(missing_ok=True)
    return len(copies), total_bytes


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--retained", type=Path, required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    count, total = restore(args.retained, apply=args.apply)
    verb = "Restored" if args.apply else "Would restore"
    print(f"{verb} {count} missing files ({total} catalog bytes verified)")


if __name__ == "__main__":
    main()
