"""Build an additive private-studio release from the actual live manifest; plan by default."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import shlex
import shutil
import subprocess
import tarfile
import tempfile
from pathlib import Path, PurePosixPath

from scripts.assets import ROOT

IMPORT = "    import private-studio.caddy\n"
MEDIA_SUFFIXES = {
    ".png",
    ".jpg",
    ".jpeg",
    ".mp4",
    ".glb",
    ".blend",
    ".npz",
    ".pdf",
    ".xlsx",
    ".zip",
}


def validate_path(name: str) -> None:
    """Require a canonical relative artifact path without control characters."""
    relative = PurePosixPath(name)
    if (
        not name
        or relative.is_absolute()
        or ".." in relative.parts
        or "\\" in name
        or str(relative) != name
        or any(ord(c) < 32 or ord(c) == 127 for c in name)
    ):
        raise ValueError("Unsafe manifest path")


def artifact_files(directory: Path) -> list[Path]:
    """Validate a generated tree before reading or copying its regular files."""
    files = []
    for path in directory.rglob("*"):
        validate_path(path.relative_to(directory).as_posix())
        if path.is_symlink() or not (path.is_file() or path.is_dir()):
            raise ValueError("Linked or non-regular build artifact")
        if path.is_file():
            files.append(path)
    return files


def guard_config(config: str) -> str:
    """Add the guard without replacing the live media, headers or routes."""
    if IMPORT in config:
        return config
    needle = "    bind 127.0.0.1\n"
    if config.count(needle) != 1:
        raise ValueError("Expected exactly one existing loopback site")
    return config.replace(needle, needle + IMPORT, 1)


def retired_config(
    paths: list[str], previous: str = "", republished: set[str] | None = None
) -> str:
    """Deny old prompt-bearing artifacts while retaining their immutable bytes."""
    if previous and previous != "# No retired private prompt bundles.\n":
        match = re.search(r"^    path (.+)$", previous, re.MULTILINE)
        if not match:
            raise ValueError("Unrecognized prior private asset guard")
        patterns = match[1].split()
        old_paths = ["site/dist" + pattern.removesuffix("*") for pattern in patterns]
        if retired_config(old_paths) != previous:
            raise ValueError("Unrecognized prior private asset guard")
        paths = [*paths, *old_paths]
    paths = [path for path in paths if path not in (republished or set())]
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
    raw = subprocess.check_output(
        ["bun", str(ROOT / "cockpit/scripts/private-markers.ts")], timeout=30
    )
    markers = json.loads(raw)
    if (
        not isinstance(markers, list)
        or not markers
        or any(not isinstance(marker, str) or not marker for marker in markers)
    ):
        raise ValueError("Expected non-empty prompt markers")
    return [marker.encode() for marker in markers]


def contains_prompt(data: bytes, markers: list[bytes]) -> bool:
    """Recognize current excerpts in raw text and common JavaScript escapes."""
    normalized = re.sub(
        rb"(?<!\\)\\(?:u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2}))",
        lambda match: chr(int(match[1] or match[2], 16)).encode(errors="surrogatepass"),
        data,
    )
    return any(
        marker in normalized
        or json.dumps(marker.decode(), ensure_ascii=False)[1:-1].encode() in normalized
        for marker in markers
    )


def public_payload(directory: Path, markers: list[bytes]) -> dict[str, bytes]:
    """Refuse stale builds containing prompts before preparing any release."""
    if not (directory / "index.html").is_file():
        raise ValueError("Build both frontend artifacts before planning a release")
    payload = {}
    for path in artifact_files(directory):
        data = path.read_bytes()
        if contains_prompt(data, markers):
            raise ValueError(f"Private prompt in public build: {path}")
        payload[f"site/dist/{path.relative_to(directory).as_posix()}"] = data
    return payload


def write_private_artifacts(
    public: Path, private: Path, destination: Path, deny_file: Path
) -> None:
    """Keep private content out of the public root in complete site builds too."""
    markers = prompt_markers()
    retired = []
    artifact_files(private)
    if not (private / "index.html").is_file():
        raise ValueError("Missing private build")
    for path in artifact_files(public):
        if path.suffix not in MEDIA_SUFFIXES:
            content = path.read_bytes()
            if contains_prompt(content, markers):
                retired.append(f"site/dist/{path.relative_to(public).as_posix()}")
    previous = deny_file.read_text() if deny_file.exists() else ""
    deny = retired_config(retired, previous)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(
        dir=destination.parent, prefix=".private-build-"
    ) as temporary:
        staged = Path(temporary) / "new"
        backup = Path(temporary) / "previous"
        shutil.copytree(private, staged)
        if destination.exists():
            destination.rename(backup)
        try:
            staged.rename(destination)
        except OSError:
            if backup.exists():
                backup.rename(destination)
            raise
    with tempfile.NamedTemporaryFile(
        mode="w", dir=deny_file.parent, delete=False
    ) as stream:
        stream.write(deny)
        staged_deny = Path(stream.name)
    staged_deny.chmod(0o644)
    staged_deny.replace(deny_file)


COMMIT_ID = re.compile(r"[0-9a-f]{40}|[0-9a-f]{64}")
# Inherited GIT_* variables could point git at another repository or rewrite origin's URL
# (GIT_CONFIG_COUNT with url.*.insteadOf), so only ssh settings are kept. Replace refs
# (refs/replace/*) live in the repository itself; GIT_NO_REPLACE_OBJECTS=1, set below, is
# what stops them grafting a stale HEAD onto main.
GIT_ENV_KEPT = ("GIT_SSH", "GIT_SSH_COMMAND", "GIT_SSH_VARIANT")


def source_check(root: Path, *, unverified: bool) -> str:
    """Refuse to release from a folder whose history lacks the forge's main; return what was checked.

    A release publishes the app as built in this folder, so a checkout or lane behind main would
    put an older app live (docs/releasing.md). A folder with no git history (a scratch copy)
    cannot be checked: it is refused unless the caller passes unverified, and the plan says so.
    A folder with history is always checked; unverified does not skip that."""
    env = {
        k: v
        for k, v in os.environ.items()
        if not k.startswith("GIT_") or k in GIT_ENV_KEPT
    }
    env["GIT_NO_REPLACE_OBJECTS"] = "1"

    def run(
        *command: str, stdin: str | None = None
    ) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            command,
            input=stdin,
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
            env=env,
        )

    # A git checkout answers for its HEAD. A jj workspace without its own .git (a lane)
    # answers for its working-copy commit, through the git directory jj stores it in.
    git: tuple[str, ...] = ("git", "-C", str(root))
    head = "HEAD"
    if not (root / ".git").exists() and (root / ".jj").is_dir():
        # A jj lane is checked through jj or not at all: a failing jj never falls through
        # to "no history", where --unverified-source would wave it on.
        jj = ("jj", "-R", str(root), "--ignore-working-copy")
        try:
            store = run(*jj, "git", "root")
            commit = run(*jj, "log", "--no-graph", "-r", "@", "-T", "commit_id")
        except FileNotFoundError:
            raise ValueError(
                f"{root} is a jj workspace and jj is not installed"
            ) from None
        for answer in (store, commit):
            if answer.returncode != 0:
                raise ValueError(
                    f"jj could not read {root}: {answer.stderr.strip()[:200]}"
                )
        if not COMMIT_ID.fullmatch(commit.stdout.strip()):
            raise ValueError(
                f"jj gave {root}'s working copy a malformed commit id: "
                f"{commit.stdout.strip()[:80]!r}"
            )
        git, head = (
            ("git", f"--git-dir={store.stdout.strip()}"),
            commit.stdout.strip(),
        )
    if (
        run(*git, "rev-parse", "--verify", "--quiet", f"{head}^{{commit}}").returncode
        != 0
    ):
        if unverified:
            return "unverified"
        raise ValueError(
            f"{root} has no git history to check against main; build from a checkout "
            "of main, or pass --unverified-source"
        )

    def git_run(
        *args: str, stdin: str | None = None
    ) -> subprocess.CompletedProcess[str]:
        return run(*git, *args, stdin=stdin)

    live = git_run("ls-remote", "origin", "refs/heads/main")
    fields = live.stdout.split()
    if live.returncode != 0 or not fields:
        raise ValueError(
            f"Could not read origin's main from {root}: {live.stderr.strip()}"
        )
    main_sha = fields[0]
    if not COMMIT_ID.fullmatch(main_sha):
        raise ValueError(f"origin's main is not a commit id: {main_sha[:80]!r}")
    stale = (
        f"{root} does not contain origin/main {main_sha[:12]}; bring it up to main "
        "before releasing (docs/releasing.md)"
    )
    # A folder that never fetched main's newest commit lacks the object itself; --batch-check
    # tells that apart from a failing repository, which `cat-file -e` reports the same way.
    found = git_run("cat-file", "--batch-check", stdin=main_sha + "\n")
    if found.returncode != 0:
        raise ValueError(f"Could not read {root}'s objects: {found.stderr.strip()}")
    if found.stdout.split()[1:2] == ["missing"]:
        raise ValueError(stale)
    ancestor = git_run("merge-base", "--is-ancestor", main_sha, head)
    if ancestor.returncode == 1:
        raise ValueError(stale)
    if ancestor.returncode != 0:
        raise ValueError(
            f"Could not compare {root} with origin/main {main_sha[:12]}: "
            f"{ancestor.stderr.strip()}"
        )
    return main_sha


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", required=True)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument(
        "--unverified-source",
        action="store_true",
        help="release from a folder with no git history; the plan records it as unverified",
    )
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", args.host):
        raise ValueError("Expected a hostname or SSH alias")
    source = source_check(ROOT, unverified=args.unverified_source)

    def remote(command: str) -> bytes:
        return subprocess.check_output(["ssh", args.host, command], timeout=60)

    base = remote("readlink -f /srv/thatsnozorb/current").decode().strip()
    if not re.fullmatch(r"/srv/thatsnozorb/releases/[a-f0-9]{64}", base):
        raise ValueError("Unexpected live release")
    raw = remote(f"cat {base}/release-files.json")
    if digest(raw) != Path(base).name:
        raise ValueError("Live manifest identity mismatch")
    rows = json.loads(raw)
    for row in rows:
        name = row["path"]
        validate_path(name)
    old = {row["path"]: row for row in rows}
    if len(old) != len(rows):
        raise ValueError("Duplicate live manifest entry")
    paths = [
        name
        for name in old
        if name in ("deploy/Caddyfile", "deploy/private-studio-retired.caddy")
        or (
            name.startswith("site/dist/")
            and PurePosixPath(name).suffix not in MEDIA_SUFFIXES
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
        if name.startswith("site/dist/") and contains_prompt(data, markers)
    ]
    payload = public_payload(ROOT / "cockpit/dist", markers)
    for directory, prefix in ((ROOT / "cockpit/private-dist", "site/private-studio"),):
        if not (directory / "index.html").is_file():
            raise ValueError("Build both frontend artifacts before planning a release")
        for path in artifact_files(directory):
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
    previous_guard = snapshots.get("deploy/private-studio-retired.caddy", b"").decode()
    payload["deploy/private-studio-retired.caddy"] = retired_config(
        retired, previous_guard, set(payload)
    ).encode()
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
            validate_path(name)
            item = tarfile.TarInfo(name)
            item.size, item.mode = len(data), 0o644
            archive.addfile(item, io.BytesIO(data))
    plan = {
        "base": Path(base).name,
        "source_main": source,
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
    staging = remote("mktemp -d /tmp/zenc-private-upload.XXXXXXXXXX").decode().strip()
    if not re.fullmatch(r"/tmp/zenc-private-upload\.[A-Za-z0-9]+", staging):
        raise ValueError("Unexpected private staging directory")
    subprocess.run(
        [
            "scp",
            str(bundle_path),
            f"{args.host}:{staging}/release.tar.gz",
        ],
        check=True,
        timeout=180,
    )
    command = "sudo -n python3 - " + " ".join(
        [plan["base"], release, plan["archive_sha256"], f"{staging}/release.tar.gz"]
    )
    with (ROOT / "deploy/private-studio-overlay.py").open() as script:
        subprocess.run(
            ["ssh", args.host, command], stdin=script, check=True, timeout=600
        )


if __name__ == "__main__":
    main()
