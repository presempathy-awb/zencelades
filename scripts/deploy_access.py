"""Plan or apply a selective access-service/site release through Telpher's route renderer."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import io
import json
import subprocess
import sys
import tarfile
import tempfile
from dataclasses import replace
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROUTE = "/etc/traefik/dynamic/muchadoaboutoneside-thatsnozorb.yml"


def patch_home(text: str) -> str:
    if 'src="/access.js"' in text:
        return text
    if text.count("</head>") != 1:
        raise ValueError("Unrecognized live homepage; refusing replacement")
    return text.replace("</head>", '<script src="/access.js" defer></script>\n</head>')


def patch_caddy(text: str) -> str:
    routes = [
        "reverse_proxy /access/api/* 127.0.0.1:18133",
        "reverse_proxy /access/login 127.0.0.1:18133",
    ]
    existing = [line.strip() for line in text.splitlines() if "/access/" in line]
    if any(line not in routes for line in existing):
        raise ValueError("Conflicting live access route")
    marker = "    file_server"
    if text.count(marker) != 1:
        raise ValueError("Unrecognized live Caddy config")
    missing = ["    " + line + "\n" for line in routes if line not in existing]
    return text.replace(marker, "".join(missing) + marker)


def ssh(host: str, command: str) -> str:
    return subprocess.run(
        ["ssh", host, command], check=True, capture_output=True, text=True, timeout=60
    ).stdout


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", required=True)
    parser.add_argument("--telpher", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    previous = ssh(args.host, "readlink -f /srv/thatsnozorb/current").strip()
    if (
        not previous.startswith("/srv/thatsnozorb/releases/")
        or len(Path(previous).name) != 64
    ):
        raise ValueError("Unrecognized live release")
    original_home = ssh(args.host, "cat /srv/thatsnozorb/current/site/dist/index.html")
    original_caddy = ssh(args.host, "cat /srv/thatsnozorb/current/deploy/Caddyfile")
    route_sha = ssh(args.host, "sha256sum " + ROUTE).split()[0]
    module_spec = importlib.util.spec_from_file_location(
        "_nozorb_route", args.telpher / "bin/_domain_route.py"
    )
    route = importlib.util.module_from_spec(module_spec)
    sys.modules[module_spec.name] = route
    module_spec.loader.exec_module(route)
    spec = replace(
        route.build_subdomain_spec(
            zone="muchadoaboutoneside.com",
            slug="muchadoaboutoneside",
            name="thatsnozorb",
            target=route.parse_target("http://127.0.0.1:18131"),
            resolvers=route.load_cert_resolvers(),
            tls="le",
            forward_auth=True,
            proxied=False,
        ),
        tailnet_or_auth=True,
        replace_existing=True,
    )
    auth = dict(
        route.load_authentik_defaults(),
        auth_url="http://127.0.0.1:18133/auth",
        trust_forward_header=False,
    )
    packet = route.render_packet(
        spec, authentik=auth, output_root=args.output, run_id="shared-ip"
    )
    rendered = Path(packet["files"]["route"]).read_text()
    if "trustForwardHeader: false" not in rendered:
        raise ValueError("Telpher renderer lacks untrusted-forward-header support")
    sources = {
        "site/dist/index.html": patch_home(original_home).encode(),
        "deploy/Caddyfile": patch_caddy(original_caddy).encode(),
        "site/dist/access.js": (ROOT / "site/access.js").read_bytes(),
        "site/dist/access.css": (ROOT / "site/access.css").read_bytes(),
        "access_server.py": (ROOT / "scripts/access_server.py").read_bytes(),
        "thatsnozorb-access.service": (
            ROOT / "deploy/thatsnozorb-access.service"
        ).read_bytes(),
        "activate_access.py": (ROOT / "deploy/activate_access.py").read_bytes(),
    }
    hashes = {name: hashlib.sha256(data).hexdigest() for name, data in sources.items()}
    plan = {
        "previous": previous,
        "route_sha256": route_sha,
        "overlay": hashes,
        "home_sha256": hashlib.sha256(original_home.encode()).hexdigest(),
        "caddy_sha256": hashlib.sha256(original_caddy.encode()).hexdigest(),
        "route_report": packet["files"]["report"],
        "host": args.host,
    }
    (args.output / "plan.json").write_text(json.dumps(plan, indent=2) + "\n")
    print(json.dumps(plan, indent=2), flush=True)
    if not args.apply:
        print(
            "Plan only: preserve the live release; add the scoped service and controls; then apply the rendered route."
        )
        return
    check = route.run_remote(Path(packet["files"]["report"]), host=args.host)
    (args.output / "route-dry-run.json").write_text(json.dumps(check, indent=2) + "\n")
    if not check["ok"]:
        raise RuntimeError("Telpher route dry-run refused; see saved report")
    with tempfile.TemporaryDirectory(prefix="nozorb-access-") as temporary:
        archive = Path(temporary) / "overlay.tar.gz"
        sources["plan.json"] = json.dumps(plan).encode()
        with tarfile.open(archive, "w:gz") as bundle:
            for name, data in sources.items():
                info = tarfile.TarInfo(name)
                info.size, info.mode = len(data), 0o644
                bundle.addfile(info, io.BytesIO(data))
        digest = hashlib.sha256(archive.read_bytes()).hexdigest()
        remote = f"/var/tmp/nozorb-access-{digest}"
        subprocess.run(
            ["scp", str(archive), f"{args.host}:{remote}.tar.gz"], check=True
        )
        command = f"mkdir -m 700 {remote} && tar -xzf {remote}.tar.gz -C {remote} && sudo -n /usr/bin/python3 {remote}/activate_access.py {remote} --apply"
        installed = ssh(args.host, command)
        (args.output / "activation.txt").write_text(installed)
        print(installed, flush=True)
    result = route.run_remote(
        Path(packet["files"]["report"]),
        host=args.host,
        execute=True,
        confirm=route.CONFIRM_PHRASE,
        confirm_host=spec.zone,
    )
    (args.output / "route-apply.json").write_text(json.dumps(result, indent=2) + "\n")
    if not result["ok"]:
        raise RuntimeError(
            "Route failed or rolled back; service is installed, but IP admission is not confirmed. See report."
        )
    print(
        "Access service and shared-IP route installed. Saved activation and route receipts."
    )


if __name__ == "__main__":
    main()
