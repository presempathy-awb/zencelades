"""Catalog every preserved file, its format, source role and release lineage."""

from __future__ import annotations

import ast
import csv
import io
import json
import struct
import zipfile
from collections import Counter, defaultdict
from pathlib import Path
from xml.etree import ElementTree

from scripts.assets import ROOT, UPLOAD_NAMES, inventory, sha256, verify_release

ROLES = {
    "budget": "Planning allowances and editable formulas; occupied realization unpriced",
    "config": "Illustrative inputs or blank measurement/calibration templates",
    "docs": "Design-development rationale, evidence sources and open approval gates",
    "drawings": "Model-derived A/B spatial drawings; no fabrication or load rating",
    "models": "A/B geometric envelopes, with explicit export axes and units",
    "previews": "Procedural art or idealized projection/workbook diagnostics",
    "reports": "Saved release-authoring verification; not a fresh physical acceptance",
    "src": "CPU projection, statics and media-control reference; no machinery control",
    "tools": "Artifact-generation source; some commands overwrite derived outputs",
    "tests": "Supplied numerical regression source; execution currently paused",
    "legacy": "Superseded v1 context; not the governing design",
    "licenses": "Third-party and original-source licensing boundaries",
    "media": "Historical generated occupied-sphere art; technical captions unapproved",
}


def describe(path: Path) -> dict:
    suffix = path.suffix.lower()
    detail: dict = {"format": suffix.lstrip(".") or "text"}
    raw = path.read_bytes()
    if suffix == ".png":
        if raw[:8] != b"\x89PNG\r\n\x1a\n":
            raise ValueError(f"Bad PNG header: {path}")
        detail["pixels"] = list(struct.unpack(">II", raw[16:24]))
    elif suffix == ".glb":
        magic, version, size = struct.unpack("<4sII", raw[:12])
        if magic != b"glTF" or version != 2 or size != len(raw):
            raise ValueError(f"Invalid GLB envelope: {path}")
        length, kind = struct.unpack("<II", raw[12:20])
        if kind != 0x4E4F534A:
            raise ValueError("GLB first chunk must be JSON")
        data = json.loads(raw[20 : 20 + length])
        detail.update(
            {
                "glTF_version": data["asset"]["version"],
                "meshes": len(data.get("meshes", [])),
                "nodes": len(data.get("nodes", [])),
                "axes": "Y-up",
                "units": "meters",
            }
        )
    elif suffix in {".zip", ".npz", ".xlsx"}:
        with zipfile.ZipFile(path) as bundle:
            if bundle.testzip() is not None:
                raise ValueError(f"Archive CRC failed: {path}")
            detail["archive_members"] = len(bundle.infolist())
            if suffix == ".npz":
                detail["arrays"] = bundle.namelist()
            elif suffix == ".xlsx":
                workbook = ElementTree.fromstring(bundle.read("xl/workbook.xml"))
                detail["sheets"] = [
                    s.attrib["name"]
                    for s in workbook.iter()
                    if s.tag.endswith("}sheet")
                ]
    elif suffix == ".py":
        tree = ast.parse(raw.decode())
        detail["public_definitions"] = [
            node.name
            for node in tree.body
            if isinstance(node, (ast.FunctionDef, ast.ClassDef))
        ]
        detail["imports"] = sorted(
            {
                node.module or ""
                for node in ast.walk(tree)
                if isinstance(node, ast.ImportFrom)
            }
            | {
                alias.name
                for node in ast.walk(tree)
                if isinstance(node, ast.Import)
                for alias in node.names
            }
        )
    elif suffix == ".json":
        data = json.loads(raw)
        detail["top_level"] = (
            list(data) if isinstance(data, dict) else f"{len(data)} records"
        )
    elif suffix == ".jsonl":
        lines = raw.decode().splitlines()
        for line in lines:
            json.loads(line)
        detail["records"] = len(lines)
    elif suffix == ".csv":
        rows = list(csv.reader(io.StringIO(raw.decode())))
        detail.update({"columns": rows[0], "data_rows": len(rows) - 1})
    elif suffix == ".svg":
        root = ElementTree.fromstring(raw)
        detail.update(
            {
                "viewBox": root.attrib.get("viewBox"),
                "width": root.attrib.get("width"),
                "height": root.attrib.get("height"),
            }
        )
    elif suffix == ".step":
        text = raw.decode()
        if not text.startswith("ISO-10303-21;") or "END-ISO-10303-21;" not in text:
            raise ValueError("Invalid STEP envelope")
        detail.update(
            {
                "axes": "Z-up",
                "units": "millimeters",
                "solid_records": text.count("MANIFOLD_SOLID_BREP("),
            }
        )
    elif suffix not in {".pdf", ".mp4"}:
        text = raw.decode()
        detail["text_lines"] = len(text.splitlines())
        if suffix == ".md":
            detail["headings"] = [
                line.lstrip("# ") for line in text.splitlines() if line.startswith("#")
            ]
    return detail


def main() -> None:
    release = ROOT / "deliveries/enceladus_v3"
    verify_release(release)
    records = inventory()
    previous = json.loads((ROOT / "assets/inventory.json").read_text())
    if records != previous:
        raise ValueError("Preserved inventory changed")
    receipt_path = ROOT / "assets/upload-receipt.json"
    if receipt_path.exists():
        receipt = json.loads(receipt_path.read_text())
        uploaded = receipt["files"]
        if not receipt.get("immutable_readback_verified") or [
            (row["path"], row["bytes"], row["content_sha256"]) for row in uploaded
        ] != [(row["path"], row["bytes"], row["content_sha256"]) for row in records]:
            raise ValueError("Upload receipt differs from preserved inventory")
        for record, remote in zip(records, uploaded, strict=True):
            record.update(
                {
                    key: remote[key]
                    for key in ("lakefs_repo", "lakefs_commit", "lakefs_path")
                }
            )
    b2_receipt = ROOT / "assets/b2-archive-receipt.json"
    if b2_receipt.exists():
        receipt = json.loads(b2_receipt.read_text())
        archives = {row["path"]: row for row in receipt["files"]}
        expected = {
            row["path"] for row in records if row["path"].lower().endswith(".zip")
        }
        if not receipt.get("readback_verified") or set(archives) != expected:
            raise ValueError("B2 receipt does not cover the exact ZIP set")
        for record in records:
            if record["path"] not in archives:
                continue
            remote = archives[record["path"]]
            if (
                not remote.get("readback_verified")
                or remote["readback_sha256"] != record["content_sha256"]
                or remote["bytes"] != record["bytes"]
                or not remote["b2_file_id"]
            ):
                raise ValueError("B2 receipt differs from the preserved ZIP")
            record.update(
                {key: remote[key] for key in ("b2_bucket", "b2_key", "b2_file_id")}
            )
            record["preferred_archive_storage"] = "B2"
    original_zip = ROOT / "source/uploads/Enceladus_Within_v3_Project.zip"
    with zipfile.ZipFile(original_zip) as bundle:
        members = [item for item in bundle.infolist() if not item.is_dir()]
        if {item.filename for item in members} != {
            str(path.relative_to(ROOT / "deliveries"))
            for path in release.rglob("*")
            if path.is_file()
        }:
            raise ValueError("Extracted file set differs from ZIP")
        for item in members:
            if bundle.read(item) != (ROOT / "deliveries" / item.filename).read_bytes():
                raise ValueError("Extracted bytes differ from ZIP")
    for name in UPLOAD_NAMES:
        if sha256(Path.home() / "Downloads" / name) != sha256(
            ROOT / "source/uploads" / name
        ):
            raise ValueError("Preserved original differs from upload")
    hashes: dict[str, list[str]] = defaultdict(list)
    categories: Counter = Counter()
    for record in records:
        path = ROOT / record["path"]
        relative = record["path"].removeprefix("deliveries/enceladus_v3/")
        category = (
            relative.split("/")[0]
            if record["path"].startswith("deliveries/")
            else "original-upload"
        )
        if category not in ROLES and category != "original-upload":
            category = "release-root"
        role = ROLES.get(
            category,
            "Exact supplied original"
            if category == "original-upload"
            else "Release entry point, catalog, license or packaging metadata",
        )
        record.update(
            {"category": category, "role": role, "inspection": describe(path)}
        )
        categories[category] += 1
        hashes[record["content_sha256"]].append(record["path"])
    result = {
        "file_count": len(records),
        "original_uploads": len(UPLOAD_NAMES),
        "zip_files": len(members),
        "total_bytes": sum(row["bytes"] for row in records),
        "categories": dict(categories),
        "identical_byte_groups": [paths for paths in hashes.values() if len(paths) > 1],
        "preservation": "exact original/ZIP file sets and bytes verified; no deduplication",
        "inspection_limits": "Format envelopes and source read; saved release checks are historical; PDF/video inspected separately; no physical acceptance or fresh pytest",
        "files": records,
    }
    (ROOT / "assets/catalog.json").write_text(json.dumps(result, indent=2) + "\n")
    print(
        json.dumps(
            {key: value for key, value in result.items() if key != "files"}, indent=2
        )
    )


if __name__ == "__main__":
    main()
