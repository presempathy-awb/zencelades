"""Plan or activate the isolated Shakesplurian project API behind the site proxy."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import shlex
import subprocess
import tarfile
import tempfile
import tomllib
from pathlib import Path

from scripts.assets import ROOT, sha256


def expected_catalog(palette: Path) -> bytes:
    families = tomllib.loads(palette.read_text())["families"]
    return (
        json.dumps(
            {
                f["name"]: {"words": f["words"], "pool": f.get("reserve", [])}
                for f in families
            },
            sort_keys=True,
        )
        + "\n"
    ).encode()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", required=True, help="agents-config SSH peer alias")
    parser.add_argument(
        "--binary", required=True, type=Path, help="Linux amd64 naming-workbench binary"
    )
    parser.add_argument(
        "--palette", required=True, type=Path, help="authored project family TOML"
    )
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    sources = {
        "naming-workbench": args.binary,
        "data/families/thatsnozorb.toml": args.palette,
        "naming-workbench.service": ROOT / "deploy/naming-workbench.service",
        "activate-naming.sh": ROOT / "deploy/activate-naming.sh",
    }
    entries = [{"path": name, "sha256": sha256(path)} for name, path in sources.items()]
    catalog = expected_catalog(args.palette)
    entries.append(
        {"path": "expected-catalog.json", "sha256": hashlib.sha256(catalog).hexdigest()}
    )
    manifest = (json.dumps(entries, sort_keys=True, indent=2) + "\n").encode()
    release = hashlib.sha256(manifest).hexdigest()
    print(
        f"Naming release {release}: {len(entries)} files; host={args.host}; apply={args.apply}",
        flush=True,
    )
    if not args.apply:
        print(
            "Plan: verify binary and palette hashes; activate loopback API on 18132; existing tailnet route is preserved."
        )
        return
    with tempfile.TemporaryDirectory(prefix="enceladus-naming-") as temporary:
        archive = Path(temporary) / f"{release}.tar.gz"
        hashes = Path(temporary) / "files.sha256"
        hashes.write_text(
            "".join(f"{entry['sha256']}  {entry['path']}\n" for entry in entries)
        )
        with tarfile.open(archive, "w:gz") as bundle:
            for name, path in sources.items():
                bundle.add(path, arcname=name, recursive=False)
            info = tarfile.TarInfo("expected-catalog.json")
            info.size = len(catalog)
            bundle.addfile(info, io.BytesIO(catalog))
            bundle.add(hashes, arcname="files.sha256", recursive=False)
        remote = f"/tmp/enceladus-naming-{release}.tar.gz"
        subprocess.run(["scp", str(archive), f"{args.host}:{remote}"], check=True)
        target = f"/srv/thatsnozorb-naming/releases/{release}"
        command = (
            f"sudo -n install -d -m 0755 {shlex.quote(target)} && "
            f"sudo -n tar -xzf {shlex.quote(remote)} -C {shlex.quote(target)} && "
            f"bash {shlex.quote(target + '/activate-naming.sh')} {release} --apply"
        )
        subprocess.run(["ssh", args.host, command], check=True)
    (ROOT / "assets/naming-deployment-receipt.json").write_text(
        json.dumps(
            {"release_sha256": release, "host": args.host, "files": entries}, indent=2
        )
        + "\n"
    )


if __name__ == "__main__":
    main()
