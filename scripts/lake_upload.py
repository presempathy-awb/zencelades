"""Plan or upload preserved assets through a scoped hesellsheshells principal."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from urllib.error import HTTPError
from urllib.parse import quote, urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

from scripts.assets import ROOT, inventory, safe_path, sha256

TOKEN_ENV = "LAKE_BROKER_THATSNOZORB_PUBLISHER_TOKEN"


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def endpoint_origin(value: str) -> str:
    endpoint = urlsplit(value)
    loopback = endpoint.hostname in {"127.0.0.1", "localhost", "::1"}
    if (
        not endpoint.hostname
        or endpoint.username
        or endpoint.password
        or endpoint.path not in {"", "/"}
        or endpoint.query
        or endpoint.fragment
        or (endpoint.scheme != "https" and not (endpoint.scheme == "http" and loopback))
    ):
        raise ValueError("Broker must be an HTTPS or loopback HTTP origin")
    return value.rstrip("/")


def run(args: argparse.Namespace) -> None:
    endpoint = endpoint_origin(args.endpoint)
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{2,62}", args.repo):
        raise ValueError("Repository must be a plain lakeFS repository name")
    if args.branch == "main" or not re.fullmatch(
        r"ingest-[a-z0-9-]{1,80}", args.branch
    ):
        raise ValueError("Use a fresh ingest-* branch, never main")
    prefix = str(safe_path(args.prefix)).rstrip("/")
    entries = json.loads((ROOT / "assets/inventory.json").read_text())
    actual = inventory()
    if entries != actual:
        raise ValueError("Preserved assets differ from the inventory")
    print(
        json.dumps(
            {
                "mode": "apply" if args.apply else "plan",
                "endpoint": endpoint,
                "repository": args.repo,
                "new_branch": args.branch,
                "source_ref": "main",
                "prefix": prefix,
                "files": len(entries),
                "bytes": sum(entry["bytes"] for entry in entries),
                "token_env": TOKEN_ENV,
                "merge": False,
            },
            indent=2,
        )
    )
    if not args.apply:
        return
    token = os.environ.get(TOKEN_ENV, "").strip()
    if not token:
        raise ValueError(f"{TOKEN_ENV} is unavailable; use the scoped hid-in grant")
    receipt_path = ROOT / "assets/upload-receipt.json"
    staging_path = ROOT / "assets/upload-staging.json"
    if receipt_path.exists() or staging_path.exists():
        raise ValueError(
            "An upload record already exists; inspect and preserve it before another run"
        )
    # TLS validation stays enabled. A redirect must never carry the capability away.
    opener = build_opener(NoRedirect())

    def request(
        path: str,
        method: str = "GET",
        data: bytes | None = None,
        headers: dict[str, str] | None = None,
    ) -> bytes:
        req = Request(
            endpoint + path,
            data=data,
            method=method,
            headers={
                **(headers or {}),
                "Authorization": f"Bearer {token}",
            },
        )
        try:
            with opener.open(req, timeout=60) as response:
                return response.read()
        except HTTPError as error:
            # Error bodies can contain upstream internals; report only the status.
            raise RuntimeError(f"Broker refused {method} (HTTP {error.code})") from None

    def post_json(path: str, value: dict[str, object]) -> bytes:
        return request(
            path,
            "POST",
            json.dumps(value).encode(),
            {"Content-Type": "application/json"},
        )

    base = f"/api/v1/repositories/{quote(args.repo, safe='')}"
    # A pre-existing branch returns conflict; never attach to or overwrite one.
    post_json(
        base + "/branches?" + urlencode({"name": args.branch}),
        {"name": args.branch, "source": "main"},
    )
    branch = base + f"/branches/{quote(args.branch, safe='')}"
    records = []
    for number, entry in enumerate(entries, 1):
        source = ROOT / safe_path(entry["path"])
        if (
            not source.resolve().is_relative_to(ROOT.resolve())
            or sha256(source) != entry["content_sha256"]
        ):
            raise ValueError("Source changed during ingestion")
        key = f"{prefix}/{entry['path']}"
        request(
            branch + "/objects?" + urlencode({"path": key}),
            "POST",
            source.read_bytes(),
            {
                "Content-Type": "application/octet-stream",
                "X-Lakefs-Meta-content-sha256": entry["content_sha256"],
            },
        )
        records.append({**entry, "lakefs_repo": args.repo, "lakefs_path": key})
        print(f"Staged {number}/{len(entries)}: {entry['path']}")
    committed = json.loads(
        post_json(
            branch + "/commits",
            {
                "message": "Preserve supplied Enceladus v3 uploads and individual extracted assets",
            },
        )
    )
    commit = committed.get("id")
    if not isinstance(commit, str) or not re.fullmatch(r"[0-9a-f]{64}", commit):
        raise ValueError("Broker returned an invalid immutable commit id")
    with staging_path.open("x") as handle:
        json.dump(
            {
                "repository": args.repo,
                "branch": args.branch,
                "commit": commit,
                "readback_complete": False,
            },
            handle,
            indent=2,
        )
        handle.write("\n")
    for number, entry in enumerate(records, 1):
        data = request(
            base
            + f"/refs/{commit}/objects?"
            + urlencode({"path": entry["lakefs_path"]})
        )
        if (
            len(data) != entry["bytes"]
            or hashlib.sha256(data).hexdigest() != entry["content_sha256"]
        ):
            raise ValueError(f"Committed readback mismatch: {entry['path']}")
        entry["lakefs_commit"] = commit
        print(f"Verified {number}/{len(records)}: {entry['path']}")
    receipt = {
        "repository": args.repo,
        "branch": args.branch,
        "commit": commit,
        "merge": False,
        "files": records,
    }
    with receipt_path.open("x") as handle:
        json.dump(receipt, handle, indent=2)
        handle.write("\n")
    print(f"Verified immutable readback; receipt: {receipt_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--endpoint", required=True)
    parser.add_argument("--repo", required=True)
    parser.add_argument("--branch", required=True)
    parser.add_argument("--prefix", required=True)
    parser.add_argument("--apply", action="store_true")
    run(parser.parse_args())


if __name__ == "__main__":
    main()
