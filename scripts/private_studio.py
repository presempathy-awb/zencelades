"""Build an additive private-studio release from the actual live manifest; plan by default."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import shlex
import shutil
import subprocess
import tarfile
from pathlib import Path, PurePosixPath

from scripts.assets import ROOT

IMPORT = "    import private-studio.caddy\n"


def guard_config(config: str) -> str:
    """Add the guard without replacing the live media, headers or routes."""
    if IMPORT in config:
        return config
    needle = "    bind 127.0.0.1\n"
    if config.count(needle) != 1:
        raise ValueError("Expected exactly one existing loopback site")
    return config.replace(needle, needle + IMPORT, 1)


def retired_config(paths: list[str]) -> str:
    """Deny old prompt-bearing artifacts while retaining their immutable bytes."""
    for path in paths:
        if (
            not re.fullmatch(r"site/dist/[A-Za-z0-9_./-]+", path)
            or ".." in PurePosixPath(path).parts
        ):
            raise ValueError("Unsafe retired asset path")
    if not paths:
        return "# No retired private prompt bundles.\n"
    patterns = " ".join(
        "/" + path.removeprefix("site/dist/") + "*" for path in sorted(set(paths))
    )
    return (
        "@retiredPrivatePrompts {\n    not host studio.zenceladus.com\n"
        f"    path {patterns}\n}}\nrespond @retiredPrivatePrompts 404\n"
    )


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def prompt_markers() -> list[bytes]:
    """Use actual source text to locate formerly bundled private prompts."""
    markers = []
    for path in (ROOT / "docs/audio/suno").glob("*.md"):
        markers.append(
            path.read_text().split("```text\n", 1)[1].split("\n", 1)[0][:45].encode()
        )
    for line in (ROOT / "docs/audio/elevenlabs-effects.md").read_text().splitlines():
        if line.startswith("| sfx-"):
            markers.append(line.split("|")[5].strip()[:45].encode())
    if len(markers) != 24 or any(len(marker) < 30 for marker in markers):
        raise ValueError("Expected eight songs and sixteen effect markers")
    return markers


def write_private_artifacts(
    public: Path, private: Path, destination: Path, deny_file: Path
) -> None:
    """Keep private content out of the public root in complete site builds too."""
    markers = prompt_markers()
    retired = []
    for path in public.rglob("*"):
        if path.is_file() and path.suffix in (".js", ".html", ".md", ".json"):
            content = path.read_bytes()
            if any(marker in content for marker in markers):
                retired.append(f"site/dist/{path.relative_to(public).as_posix()}")
    shutil.copytree(private, destination, dirs_exist_ok=True)
    deny_file.write_text(retired_config(retired))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    def remote(command: str) -> bytes:
        return subprocess.check_output(["ssh", args.host, command], timeout=60)

    base = remote("readlink -f /srv/thatsnozorb/current").decode().strip()
    if not re.fullmatch(r"/srv/thatsnozorb/releases/[a-f0-9]{64}", base):
        raise ValueError("Unexpected live release")
    raw = remote(f"cat {base}/release-files.json")
    if digest(raw) != Path(base).name:
        raise ValueError("Live manifest identity mismatch")
    rows = json.loads(raw)
    old = {row["path"]: row for row in rows}
    if len(old) != len(rows):
        raise ValueError("Duplicate live manifest entry")
    paths = [
        name
        for name in old
        if name == "deploy/Caddyfile"
        or (
            name.startswith("site/dist/")
            and name.endswith((".js", ".html", ".md", ".json"))
        )
    ]
    # These paths come from the verified manifest, not shell or document instructions.
    command = (
        "tar -czf - -C "
        + shlex.quote(base)
        + " -- "
        + " ".join(map(shlex.quote, paths))
    )
    with tarfile.open(fileobj=io.BytesIO(remote(command)), mode="r:gz") as archive:
        snapshots = {name: archive.extractfile(name).read() for name in paths}
    if any(digest(data) != old[name]["sha256"] for name, data in snapshots.items()):
        raise ValueError("Live text asset differs from manifest")

    markers = prompt_markers()
    retired = [
        name
        for name, data in snapshots.items()
        if name.startswith("site/dist/") and any(marker in data for marker in markers)
    ]
    payload = {}
    for directory, prefix in (
        (ROOT / "cockpit/dist", "site/dist"),
        (ROOT / "cockpit/private-dist", "site/private-studio"),
    ):
        if not (directory / "index.html").is_file():
            raise ValueError("Build both frontend artifacts before planning a release")
        for path in directory.rglob("*"):
            if path.is_file():
                if path.is_symlink():
                    raise ValueError("Linked build artifact")
                payload[f"{prefix}/{path.relative_to(directory).as_posix()}"] = (
                    path.read_bytes()
                )
    # Limit the public overlay to entrypoints and generated code, preserving live data/models.
    payload = {
        name: data
        for name, data in payload.items()
        if name.startswith(("site/private-studio/", "site/dist/studio-assets/"))
        or name == "site/dist/index.html"
    }
    for name, data in snapshots.items():
        if (
            name.endswith("/index.html")
            and b'<div id="root">' in data
            and b"/studio-assets/index-" in data
        ):
            payload[name] = payload["site/dist/index.html"]
    payload["deploy/Caddyfile"] = guard_config(
        snapshots["deploy/Caddyfile"].decode()
    ).encode()
    payload["deploy/private-studio.caddy"] = (
        ROOT / "deploy/private-studio.caddy"
    ).read_bytes()
    payload["deploy/private-studio-retired.caddy"] = retired_config(retired).encode()
    payload = {
        name: data
        for name, data in payload.items()
        if name not in old or digest(data) != old[name]["sha256"]
    }
    new = dict(old)
    new.update(
        {
            name: {"path": name, "bytes": len(data), "sha256": digest(data)}
            for name, data in payload.items()
        }
    )
    manifest = (
        json.dumps(
            sorted(new.values(), key=lambda row: row["path"]), sort_keys=True, indent=2
        )
        + "\n"
    ).encode()
    release = digest(manifest)
    work = ROOT / ".remember/private-studio" / release
    work.mkdir(parents=True, exist_ok=True)
    bundle_path = work / f"{release}.tar.gz"
    with tarfile.open(bundle_path, "w:gz") as archive:
        for name, data in {**payload, "release-files.json": manifest}.items():
            item = tarfile.TarInfo(name)
            item.size, item.mode = len(data), 0o644
            archive.addfile(item, io.BytesIO(data))
    plan = {
        "base": Path(base).name,
        "release": release,
        "archive_sha256": digest(bundle_path.read_bytes()),
        "retired_public_paths": retired,
        "changed_paths": sorted(payload),
        "archive": str(bundle_path),
    }
    (work / "plan.json").write_text(json.dumps(plan, indent=2) + "\n")
    print(json.dumps(plan, indent=2), flush=True)
    if not args.apply:
        return
    subprocess.run(
        [
            "scp",
            str(bundle_path),
            f"{args.host}:/tmp/zencelades-private-{release}.tar.gz",
        ],
        check=True,
    )
    command = "sudo -n python3 - " + " ".join(
        [plan["base"], release, plan["archive_sha256"]]
    )
    with (ROOT / "deploy/private-studio-overlay.py").open() as script:
        subprocess.run(["ssh", args.host, command], stdin=script, check=True)


if __name__ == "__main__":
    main()
