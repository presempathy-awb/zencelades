"""Stage a verified catalog release; plan activation unless --apply."""

from __future__ import annotations

import argparse
import hashlib
import json
import shlex
import subprocess
import tarfile
import tempfile
from pathlib import Path

from scripts.assets import ROOT, sha256
from scripts.build_site import build


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", required=True, help="agents-config peer alias")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    build()
    files = sorted((ROOT / "site/dist").rglob("*"))
    files += [
        ROOT / "deploy" / name
        for name in ("Caddyfile", "thatsnozorb.service", "activate.sh")
    ]
    entries = [
        {
            "path": str(path.relative_to(ROOT)),
            "bytes": path.stat().st_size,
            "sha256": sha256(path),
        }
        for path in files
        if path.is_file()
    ]
    manifest = (json.dumps(entries, sort_keys=True, indent=2) + "\n").encode()
    release = hashlib.sha256(manifest).hexdigest()
    print(
        f"Release {release}: {len(entries)} files; host {args.host}; apply={args.apply}",
        flush=True,
    )
    if not args.apply:
        print(
            "Plan only: stage under /srv/thatsnozorb/releases; validate and activate the loopback-only static service"
        )
        return
    with tempfile.TemporaryDirectory(prefix="thatsnozorb-deploy-") as temporary:
        archive = Path(temporary) / f"{release}.tar.gz"
        manifest_path = Path(temporary) / "release-files.json"
        manifest_path.write_bytes(manifest)
        with tarfile.open(archive, "w:gz") as bundle:
            for entry in entries:
                bundle.add(ROOT / entry["path"], arcname=entry["path"], recursive=False)
            bundle.add(manifest_path, arcname="release-files.json")
        remote = f"/tmp/thatsnozorb-release-{release}.tar.gz"
        subprocess.run(["scp", str(archive), f"{args.host}:{remote}"], check=True)
        target = f"/srv/thatsnozorb/releases/{release}"
        command = (
            f"sudo -n install -d -m 0755 {shlex.quote(target)} && "
            f"sudo -n tar -xzf {shlex.quote(remote)} -C {shlex.quote(target)} && "
            f"bash {shlex.quote(target + '/deploy/activate.sh')} {release} --apply"
        )
        subprocess.run(["ssh", args.host, command], check=True)
    receipt = {
        "release_sha256": release,
        "host": args.host,
        "files": entries,
        "service": "thatsnozorb.service",
    }
    (ROOT / "assets/deployment-receipt.json").write_text(
        json.dumps(receipt, indent=2) + "\n"
    )


if __name__ == "__main__":
    main()
