#!/usr/bin/env python3
# SPDX-License-Identifier: MIT OR Apache-2.0
# Copyright 2026 Andrew Briscoe and the zencelades contributors
"""List installed Node packages that declare no licence.

Trivy's default licence scan, the audit's own, reads a package's
package.json and reports nothing for one whose package.json declares no
`license` (only the audit's `--full` mode adds a scan of licence files), so
the audit would pass it. This reads the package.json at the root of every
installed package, `node_modules/<name>` or `node_modules/@scope/<name>`
(hoisted, scoped, nested, pnpm's store and a sub-project's own install), and
not the fixture or build manifests a package carries inside itself. It
prints the ones with no `license` or `licenses` value (npm's `UNLICENSED`
counts as none, as a string, a `{type}` object or a list of them), and exits
1 when there are any, or when no package was found at all: an install that
left nothing behind must not pass. Dev dependencies are included: the
manifest walk cannot see the lockfile's dev flag, and a false alarm is
cheaper than a shipped package nobody licensed.

Usage: license_gaps.py node PROJECT_ROOT
"""

import json
import stat
import sys
from pathlib import Path


def is_package_root(manifest):
    """True for node_modules/<name>/package.json and
    node_modules/@scope/<name>/package.json."""
    parts = manifest.parent.parts
    if len(parts) >= 2 and parts[-2] == "node_modules":
        return not parts[-1].startswith((".", "@"))
    return len(parts) >= 3 and parts[-3] == "node_modules" and parts[-2].startswith("@")


def node_manifests(root):
    """Every installed package's package.json, at the package's root."""
    return sorted(p for p in Path(root).rglob("package.json") if is_package_root(p))


def declared_licences(meta):
    """The licence values a manifest declares, a string, a `{type}` object or a list
    of either. As in npm, `license` decides alone when it is there, and the
    deprecated `licenses` only when it is not. `UNLICENSED` and empty values are
    not licences."""
    value = meta["license"] if meta.get("license") is not None else meta.get("licenses")
    values = []
    for item in value if isinstance(value, list) else [value]:
        if isinstance(item, dict):
            item = item.get("type")
        if isinstance(item, str) and item.strip() and item.strip() != "UNLICENSED":
            values.append(item.strip())
    return values


def node_missing(root, manifests):
    root = Path(root)
    missing = []
    for meta_path in manifests:
        name = str(meta_path.parent.relative_to(root))
        # Two handlers, not a tuple: ruff's formatter strips a tuple's parentheses
        # under a py314 target and keeps them below it, so no one text would pass
        # every repository's format check.
        reason = "not a JSON object"
        try:
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
        except OSError as exc:
            meta, reason = None, str(exc)
        except ValueError as exc:
            meta, reason = None, str(exc)
        if not isinstance(meta, dict):
            missing.append(f"{name} (unreadable package.json: {reason})")
            continue
        if not declared_licences(meta):
            missing.append(name)
    return missing


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if len(argv) != 2 or argv[0] != "node":
        print("Usage: license_gaps.py node PROJECT_ROOT", file=sys.stderr)
        return 2
    try:
        is_dir = stat.S_ISDIR(Path(argv[1]).stat().st_mode)
    except OSError as exc:
        print(f"cannot read {argv[1]}: {exc.strerror}", file=sys.stderr)
        return 2
    if not is_dir:
        print(f"{argv[1]} is not a directory", file=sys.stderr)
        return 2
    manifests = node_manifests(argv[1])
    if not manifests:
        print("no installed packages under node_modules: run the install first")
        return 1
    missing = node_missing(argv[1], manifests)
    for name in missing:
        print(f"no licence declared: {name}")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
