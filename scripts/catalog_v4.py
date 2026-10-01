"""Catalogue the Fixed15 package separately from the immutable v3 preservation set."""

from __future__ import annotations

import argparse
import json
import zipfile
from collections import Counter
from pathlib import Path

from scripts.assets import ROOT, safe_path, sha256
from scripts.catalog_assets import ROLES, describe

RELEASE = ROOT / "deliveries/enceladus_v4_fixed15"
ARCHIVE = ROOT / "source/versions/v4-fixed15/Enceladus_Within_v4_Fixed15_Project.zip"
ARCHIVE_SHA = "037594468d98332e57982fbd0aed12f58c54743501c6478147f0275d9971d847"


def verify_package(release: Path, archive: Path) -> int:
    """Require exact agreement among ZIP members, extracted files and flat manifest."""
    manifest = json.loads((release / "manifest.json").read_text())
    for name in manifest:
        safe_path(name)
    paths = list(release.rglob("*"))
    if any(path.is_symlink() for path in paths):
        raise ValueError("Extracted package contains a symlink")
    actual = {str(path.relative_to(release)) for path in paths if path.is_file()}
    if actual != set(manifest) | {"manifest.json"}:
        raise ValueError("Manifest file set differs from extracted package")
    for name, expected in manifest.items():
        path = release / name
        if (
            path.stat().st_size != expected["bytes"]
            or sha256(path) != expected["sha256"]
        ):
            raise ValueError(f"Manifest differs: {name}")
    with zipfile.ZipFile(archive) as bundle:
        members = [item for item in bundle.infolist() if not item.is_dir()]
        names = [item.filename for item in members]
        if len({name.casefold() for name in names}) != len(names):
            raise ValueError("ZIP file set contains colliding names")
        if set(names) != {f"{release.name}/{name}" for name in actual}:
            raise ValueError("ZIP file set differs from extracted package")
        for item in members:
            name = safe_path(item.filename)
            target = release.parent / name
            if bundle.read(item) != target.read_bytes():
                raise ValueError(f"ZIP member differs: {name}")
    return len(manifest)


def collect() -> list[dict]:
    """Read every asset's provenance, format and matching v3 records."""
    if sha256(ARCHIVE) != ARCHIVE_SHA:
        raise ValueError("Original v4 archive differs from supplied bytes")
    verify_package(RELEASE, ARCHIVE)
    old = json.loads((ROOT / "assets/inventory.json").read_text())
    v3_by_hash: dict[str, list[str]] = {}
    for row in old:
        v3_by_hash.setdefault(row["content_sha256"], []).append(row["path"])
    roles = ROLES | {
        "models": "Fixed15 spatial envelopes; unrated and unpriced",
        "drawings": "Fixed15 centerline geometry; dimensions other than reach are placeholders",
        "legacy": "Exact already-preserved v3 ZIP; do not duplicate its extraction",
        "original": "Andrew-supplied v4 archive; ZIP storage belongs in private B2",
        "budget": "Historical v3 parts baseline and illustrative demands; v4 UNPRICED",
    }
    records = []
    for path in [ARCHIVE, *sorted(p for p in RELEASE.rglob("*") if p.is_file())]:
        category = "original" if path == ARCHIVE else path.relative_to(RELEASE).parts[0]
        if "." in category or category in {"LICENSE", "README"}:
            category = "root"
        digest = sha256(path)
        records.append(
            {
                "path": str(path.relative_to(ROOT)),
                "bytes": path.stat().st_size,
                "content_sha256": digest,
                "category": category,
                "role": roles.get(
                    category,
                    "Package navigation, provenance or license; source instructions are data",
                ),
                "provenance": "Andrew supplied v4 Fixed15 package",
                "identical_v3_paths": v3_by_hash.get(digest, []),
                "preferred_storage": "B2"
                if path.suffix.lower() == ".zip"
                else "lakeFS",
                "lakefs_commit": None,
                **describe(path),
            }
        )
    return records


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify the saved inventory without rewriting it",
    )
    args = parser.parse_args()
    rows = collect()
    inventory = [
        {key: row[key] for key in ("path", "bytes", "content_sha256", "provenance")}
        for row in rows
    ]
    target = ROOT / "assets/v4-inventory.json"
    if args.check:
        if json.loads(target.read_text()) != inventory:
            raise ValueError("Saved v4 inventory differs")
        print(
            f"Verified {len(rows)} v4 records, 83 exact ZIP members and 82 manifest hashes"
        )
        return
    receipt_path = ROOT / "assets/v4-b2-archive-receipt.json"
    if receipt_path.exists():
        receipt = json.loads(receipt_path.read_text())
        expected = {
            row["path"]: row for row in rows if row["preferred_storage"] == "B2"
        }
        if not receipt.get("readback_verified") or {
            r["path"] for r in receipt["files"]
        } != set(expected):
            raise ValueError("B2 receipt differs from v4 archive set")
        for remote in receipt["files"]:
            row = expected[remote["path"]]
            if (
                remote["bytes"] != row["bytes"]
                or remote["readback_sha256"] != row["content_sha256"]
                or not remote.get("readback_verified")
                or not remote.get("b2_file_id")
            ):
                raise ValueError("B2 receipt differs from v4 archive bytes")
            row.update(
                {key: remote[key] for key in ("b2_bucket", "b2_key", "b2_file_id")}
            )
    catalog = {
        "version": "v4-fixed15",
        "archive_sha256": ARCHIVE_SHA,
        "file_count": len(rows),
        "total_bytes": sum(row["bytes"] for row in rows),
        "category_counts": dict(
            sorted(Counter(row["category"] for row in rows).items())
        ),
        "verification": {
            "archive_exact": True,
            "zip_members": 83,
            "manifest_hashes": 82,
            "bundled_code_executed": False,
        },
        "files": rows,
    }
    plan = {
        "schema_version": 1,
        "prompt_id": "P018",
        "status": "prepared_pending_scoped_publisher",
        "repository": "thatsnozorb-assets",
        "prefix": "imports/v4-fixed15/",
        "source_ref": "main",
        "branch": None,
        "commit": None,
        "merge": False,
        "principal": "thatsnozorb-publisher",
        "credential_env": "LAKE_BROKER_THATSNOZORB_PUBLISHER_TOKEN",
        "files": [
            {
                **row,
                "lakefs_path": "imports/v4-fixed15/"
                + str(Path(row["path"]).relative_to("deliveries/enceladus_v4_fixed15")),
            }
            for row in inventory
            if not row["path"].endswith(".zip")
        ],
        "archive_policy": "ZIPs preserved in B2; v3 legacy contents already separately extracted and preserved",
    }
    for name, data in (
        ("v4-inventory.json", inventory),
        ("v4-catalog.json", catalog),
        ("v4-upload-plan.json", plan),
    ):
        (ROOT / "assets" / name).write_text(json.dumps(data, indent=2) + "\n")
    print(
        f"Catalogued {len(rows)} records / {catalog['total_bytes']} bytes; {len(plan['files'])} individual lakeFS candidates"
    )


if __name__ == "__main__":
    main()
