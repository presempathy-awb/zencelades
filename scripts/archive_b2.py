"""Plan ZIP archival; --apply uploads with hid-in and verifies a full B2 readback."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from scripts.assets import ROOT, sha256


def request_json(url: str, token: str, payload: dict | None = None) -> dict:
    """Read B2 metadata without sending credentials to another provider."""
    parsed = urlparse(url)
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or not any(
            parsed.hostname.endswith(suffix)
            for suffix in (".backblazeb2.com", ".backblaze.com")
        )
    ):
        raise ValueError("Unexpected B2 API destination")
    request = Request(url, headers={"Authorization": token})
    if payload is not None:
        request.data = json.dumps(payload).encode()
        request.add_header("Content-Type", "application/json")
    try:
        with urlopen(request, timeout=30) as response:
            return json.load(response)
    except HTTPError as error:
        raise RuntimeError(f"B2 metadata request failed: HTTP {error.code}") from None


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--owner", type=Path, required=True, help="Telpher checkout")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--batch", choices=("v3", "v4"), default="v3")
    args = parser.parse_args()
    owner = args.owner.expanduser().resolve()
    config = json.loads(
        (owner / ".remember/glassine-mac-backup/config.json").read_text()
    )
    bucket = config["bucket"]
    prefix = "archives/thatsnozorb/sha256/"
    if prefix.startswith(config["prefix"].rstrip("/") + "/"):
        raise ValueError("Archive must remain outside the encrypted backup repository")
    inventory_name = "inventory.json" if args.batch == "v3" else "v4-inventory.json"
    receipt_name = (
        "b2-archive-receipt.json"
        if args.batch == "v3"
        else "v4-b2-archive-receipt.json"
    )
    inventory = json.loads((ROOT / "assets" / inventory_name).read_text())
    archives = [row for row in inventory if Path(row["path"]).suffix.lower() == ".zip"]
    if not archives:
        raise ValueError("No catalogued ZIPs to archive")
    for row in archives:
        source = ROOT / row["path"]
        if (
            source.stat().st_size != row["bytes"]
            or sha256(source) != row["content_sha256"]
        ):
            raise ValueError(f"Local ZIP differs from inventory: {row['path']}")
        row["b2_bucket"] = bucket
        row["b2_key"] = prefix + row["content_sha256"] + "/" + source.name
    print(json.dumps({"apply": args.apply, "files": archives}, indent=2), flush=True)
    if not args.apply:
        print("Plan only; no credentials read and no remote writes.")
        return
    secret_names = ("GLASSINE_B2_KEY_ID", "GLASSINE_B2_APPLICATION_KEY")
    if not all(os.environ.get(name) for name in secret_names):
        if os.environ.get("THATSNOZORB_B2_AUTH_ATTEMPTED"):
            raise RuntimeError("Required B2 credentials unavailable through hid-in")
        env = dict(os.environ, THATSNOZORB_B2_AUTH_ATTEMPTED="1")
        subprocess.run(
            [
                sys.executable,
                str(owner / "bin/hid-in-env"),
                *secret_names,
                "--",
                sys.executable,
                "-m",
                "scripts.archive_b2",
                "--owner",
                str(owner),
                "--batch",
                args.batch,
                "--apply",
            ],
            cwd=ROOT,
            env=env,
            check=True,
        )
        return
    basic = base64.b64encode(
        ":".join(os.environ[name] for name in secret_names).encode()
    ).decode()
    auth = request_json(
        "https://api.backblazeb2.com/b2api/v3/b2_authorize_account", "Basic " + basic
    )
    storage = auth["apiInfo"]["storageApi"]
    buckets = request_json(
        storage["apiUrl"] + "/b2api/v3/b2_list_buckets",
        auth["authorizationToken"],
        {"accountId": auth["accountId"], "bucketName": bucket},
    )["buckets"]
    if len(buckets) != 1 or buckets[0]["bucketType"] != "allPrivate":
        raise ValueError("Expected one existing private B2 bucket; refusing upload")
    metadata = buckets[0]
    for rule in metadata.get("lifecycleRules", []):
        if rule.get("daysFromUploadingToHiding") and any(
            row["b2_key"].startswith(rule["fileNamePrefix"]) for row in archives
        ):
            raise ValueError("B2 lifecycle would automatically hide these archives")
    env = {
        key: value for key, value in os.environ.items() if not key.startswith("RCLONE_")
    }
    env.update(
        RCLONE_B2_ACCOUNT=os.environ[secret_names[0]],
        RCLONE_B2_KEY=os.environ[secret_names[1]],
    )

    def rclone(*arguments: str) -> bytes:
        result = subprocess.run(
            ["rclone", "--config", os.devnull, "--retries", "1", *arguments],
            env=env,
            capture_output=True,
            timeout=300,
            check=False,
        )
        if result.returncode:
            # Rclone's bounded normal stderr contains the error cause, not headers.
            detail = result.stderr.decode(errors="replace")
            for name in secret_names:
                detail = detail.replace(os.environ[name], "[redacted]")
            raise RuntimeError(f"rclone failed ({result.returncode}): {detail[-2000:]}")
        return result.stdout

    for row in archives:
        remote = f":b2:{bucket}/{row['b2_key']}"
        existing = json.loads(rclone("lsjson", remote, "--stat", "--hash"))
        if existing.get("IsDir"):
            rclone(
                "copyto", str(ROOT / row["path"]), remote, "--immutable", "--checksum"
            )
        before = json.loads(rclone("lsjson", remote, "--stat", "--hash"))
        if (
            before.get("IsDir")
            or before.get("Size") != row["bytes"]
            or not before.get("ID")
        ):
            raise ValueError("B2 object metadata does not match the archive")
        # Spool the readback to a temporary file so large ZIPs do not fill RAM.
        with tempfile.TemporaryFile() as restored:
            result = subprocess.run(
                ["rclone", "--config", os.devnull, "cat", remote],
                env=env,
                stdout=restored,
                stderr=subprocess.PIPE,
                timeout=300,
                check=False,
            )
            if result.returncode:
                raise RuntimeError(
                    f"B2 archive readback failed; rclone exit {result.returncode}"
                )
            size = restored.tell()
            restored.seek(0)
            digest = hashlib.file_digest(restored, "sha256").hexdigest()
        after = json.loads(rclone("lsjson", remote, "--stat", "--hash"))
        if (
            before["ID"] != after["ID"]
            or size != row["bytes"]
            or digest != row["content_sha256"]
        ):
            raise ValueError("B2 readback bytes or object version changed")
        row.update(
            b2_file_id=after["ID"], readback_sha256=digest, readback_verified=True
        )
    receipt = {
        "verified_at": datetime.now(UTC).isoformat(),
        "bucket_type": metadata["bucketType"],
        "lifecycle_rules": metadata.get("lifecycleRules", []),
        "file_lock_configuration": metadata.get("fileLockConfiguration"),
        "files": archives,
        "readback_verified": True,
        "retention_note": "Version IDs recorded; no Object Lock or lifecycle changes requested.",
    }
    path = ROOT / "assets" / receipt_name
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(receipt, indent=2) + "\n")
    temporary.replace(path)
    print(
        f"Verified {len(archives)} ZIP archive(s) by full SHA-256 readback; receipt {path}"
    )


if __name__ == "__main__":
    main()
