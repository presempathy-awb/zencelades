"""Plan or preserve the separate research batch through its scoped broker token."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from urllib.error import HTTPError
from urllib.parse import quote, urlencode
from urllib.request import Request, build_opener

from scripts.assets import ROOT, safe_path, sha256
from scripts.lake_upload import TOKEN_ENV, NoRedirect, endpoint_origin


def run(args: argparse.Namespace, *, batch: str = "research") -> None:
    scopes = {
        "research": ("imports/research/", "source/research"),
        "model": ("imports/models/p041/", "cockpit/public/studio-models"),
        "v4": ("imports/v4-fixed15/", "deliveries/enceladus_v4_fixed15"),
    }
    if batch not in scopes:
        raise ValueError("Unknown preservation batch")
    prefix, source_folder = scopes[batch]
    endpoint = endpoint_origin(args.endpoint)
    if not re.fullmatch(r"ingest-[a-z0-9-]{1,80}", args.branch):
        raise ValueError("Use a fresh ingest-* branch")
    plan = json.loads((ROOT / f"assets/{batch}-upload-plan.json").read_text())
    if plan["repository"] != "thatsnozorb-assets" or plan["prefix"] != prefix:
        raise ValueError(
            "Research destination differs from the scoped preservation plan"
        )
    entries = plan["files"]
    if not entries or len(entries) != plan.get("file_count", len(entries)):
        raise ValueError("Research file count differs from the plan")
    expected = {}
    for entry in entries:
        source = ROOT / safe_path(entry["path"])
        key = entry["lakefs_path"]
        if (
            not source.resolve().is_relative_to(ROOT.resolve() / source_folder)
            or source.is_symlink()
            or (batch == "model" and source.suffix not in {".glb", ".babylon", ".json"})
            or (batch == "v4" and source.suffix.lower() == ".zip")
            or str(safe_path(key)) != key
            or not key.startswith(prefix)
            or key in expected
            or source.stat().st_size != entry["bytes"]
            or sha256(source) != entry["content_sha256"]
        ):
            raise ValueError(
                "Research path, key, length or digest differs from the plan"
            )
        expected[key] = entry
    total_bytes = sum(e["bytes"] for e in entries)
    if total_bytes != plan.get("total_bytes", total_bytes):
        raise ValueError("Research byte count differs from the plan")
    print(
        json.dumps(
            {
                "apply": args.apply,
                "endpoint": endpoint,
                "repository": plan["repository"],
                "branch": args.branch,
                "files": len(entries),
                "bytes": total_bytes,
                "merge": False,
            },
            indent=2,
        ),
        flush=True,
    )
    if not args.apply:
        return
    token = os.environ.get(TOKEN_ENV, "").strip()
    if not token:
        raise ValueError(f"Missing scoped {TOKEN_ENV}; run through hid-in")
    receipt_path = ROOT / f"assets/{batch}-upload-receipt.json"
    staging_path = ROOT / f"assets/{batch}-upload-staging.json"
    if receipt_path.exists() or staging_path.exists():
        raise ValueError(
            "Research execution record already exists; inspect it before recovery"
        )
    opener = build_opener(NoRedirect())

    def request(
        path: str,
        method: str = "GET",
        data: bytes | None = None,
        media: str = "application/json",
        denied: bool = False,
    ) -> bytes:
        req = Request(
            endpoint + path,
            method=method,
            data=data,
            headers={"Authorization": f"Bearer {token}", "Content-Type": media},
        )
        try:
            with opener.open(req, timeout=180) as response:
                content = response.read()
        except HTTPError as error:
            if denied and error.code == 403:
                return b""
            raise RuntimeError(f"Broker refused {method} (HTTP {error.code})") from None
        if denied:
            raise RuntimeError("Required broker scope refusal did not occur")
        return content

    base = "/api/v1/repositories/thatsnozorb-assets"
    for path in (
        base,
        "/api/v1/repositories/erebe-assets",
        "/api/v1/auth/users",
        base + "/refs/main/objects?path=public%2Fpublisher-denial-probe",
    ):
        request(path, denied=True)
    # A revoked token can receive the same denials; prove scoped read access first.
    request(
        base + "/refs/main/objects/ls?" + urlencode({"prefix": prefix, "amount": 1})
    )
    record = {
        "repository": plan["repository"],
        "branch": args.branch,
        "source_ref": "main",
        "commit": None,
        "status": "creating_branch",
        "files": entries,
        "scope_refusals": 4,
        "readback_complete": False,
    }
    with staging_path.open("x") as handle:
        json.dump(record, handle, indent=2)
    request(
        base + "/branches?" + urlencode({"name": args.branch}),
        "POST",
        json.dumps({"name": args.branch, "source": "main"}).encode(),
    )
    branch = base + "/branches/" + quote(args.branch, safe="")
    record["status"] = "uploading"
    staging_path.write_text(json.dumps(record, indent=2) + "\n")
    for number, entry in enumerate(entries, 1):
        content = (ROOT / safe_path(entry["path"])).read_bytes()
        if (
            len(content) != entry["bytes"]
            or hashlib.sha256(content).hexdigest() != entry["content_sha256"]
        ):
            raise ValueError("Research source changed during ingestion")
        request(
            branch + "/objects?" + urlencode({"path": entry["lakefs_path"]}),
            "POST",
            content,
            "application/octet-stream",
        )
        print(
            f"Staged {number}/{len(entries)}: {entry.get('source_id', entry['lakefs_path'])}",
            flush=True,
        )
    committed = json.loads(
        request(
            branch + "/commits",
            "POST",
            json.dumps(
                {"message": f"Preserve the verified Enceladus {batch} batch"}
            ).encode(),
        )
    )
    commit = committed.get("id")
    if not isinstance(commit, str) or not re.fullmatch(r"[a-f0-9]{64}", commit):
        raise ValueError("Broker returned an invalid immutable commit id")
    record.update(commit=commit, status="verifying_immutable_readback")
    staging_path.write_text(json.dumps(record, indent=2) + "\n")
    ref = base + "/refs/" + commit
    listing = json.loads(
        request(
            ref + "/objects/ls?" + urlencode({"prefix": plan["prefix"], "amount": 1000})
        )
    )
    rows = listing["results"]
    if (
        listing["pagination"]["has_more"]
        or len(rows) != len(expected)
        or {row["path"] for row in rows} != set(expected)
    ):
        raise ValueError("Immutable research object set differs from the exact batch")
    for row in rows:
        if row["size_bytes"] != expected[row["path"]]["bytes"]:
            raise ValueError("Immutable listed size differs from the plan")
    for entry in entries:
        content = request(ref + "/objects?" + urlencode({"path": entry["lakefs_path"]}))
        if (
            len(content) != entry["bytes"]
            or hashlib.sha256(content).hexdigest() != entry["content_sha256"]
        ):
            raise ValueError("Immutable research readback differs from the original")
    record.update(
        status="verified",
        readback_complete=True,
        files_verified=len(entries),
        bytes_verified=total_bytes,
        merge=False,
    )
    with receipt_path.open("x") as handle:
        json.dump(record, handle, indent=2)
        handle.write("\n")
    staging_path.write_text(json.dumps(record, indent=2) + "\n")
    print(f"Verified {len(entries)} {batch} objects at immutable commit {commit}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--endpoint", required=True)
    parser.add_argument("--branch", required=True)
    parser.add_argument("--apply", action="store_true")
    run(parser.parse_args())


if __name__ == "__main__":
    main()
