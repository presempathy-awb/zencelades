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
not the fixture or build manifests a package carries inside itself. A folder at a
package's place that holds no package.json is not read as a package either: a
package manager writes one for every package it installs, so such a folder was
not installed as one. It
prints the ones with no `license` or `licenses` value (npm's `UNLICENSED`,
SPDX's `NONE`, which states no licence, and `NOASSERTION`, which states nothing,
are each a gap, in any case, as a string, a `{type}` object or a list of them),
and exits
1 when there are any, when a link or a folder could not be vouched for or read, or
when no package was found at all: an install that left nothing behind must not
pass. It exits 2 on a bad invocation, a root it
cannot look at or that is no folder, and a platform that cannot open a file
without following a link or waiting (no O_NOFOLLOW or O_NONBLOCK). Dev
dependencies are included: the
manifest walk cannot see the lockfile's dev flag, and a false alarm is
cheaper than a shipped package nobody licensed.

One walk of the tree, which follows no link, finds the packages, and the same
walk says whether each PROJECT (a folder that holds a Node lockfile, as the
audit passes them) is installed: its node_modules must hold a package. A link
where a package, a scope or a node_modules folder belongs must lead into the
tree. One that leads to the same kind of place under a node_modules folder
(pnpm's and bun's store links) is read where the walk meets that folder, so a
package's link there must find a package.json the walk recorded. A
package's link to a folder of the tree outside every node_modules folder (a
workspace member, or anything else linked in) is read as the package installed
there, from that folder's own package.json, so it needs a licence like any
other. Either kind of package link fails when the folder it leads to holds no
package.json. Any other link fails, out of the tree or to nothing, since what it holds
would go unread; so does a folder the walk cannot read, and a link whose target, or
whose package.json, cannot be looked at, which is named by the error's type rather
than reported as missing. A package.json that is a link, not a regular file, or
larger than MAX_MANIFEST bytes (at most MAX_MANIFEST + 1 are read), is not parsed,
and a read or parse that fails (one nested too deep for the parser included) is
reported by the exception's type alone, so no part of the file reaches the log, and
the other packages are still read.
Every name printed loses the characters a log line can break at (Unicode Cc,
Zl and Zp: C0, DEL, C1 and U+2028, U+2029, the set the kit's shell scripts drop),
so no folder's name can start a line of its own in the log, or a workflow
command. Its tests are legal-index's templates/oss/common/scripts/
test_license_gaps.py and test_license_audit.py, run in its CI on every kit change.

Usage: license_gaps.py node PROJECT_ROOT [PROJECT ...]
"""

import errno
import json
import os
import stat
import sys
import unicodedata
from pathlib import Path

# Three values that are not a licence: npm's UNLICENSED, SPDX's NONE (the package states it
# has no licence) and SPDX's NOASSERTION (no statement is made at all). Each is a gap.
NOT_A_LICENCE = {"UNLICENSED", "NONE", "NOASSERTION"}
USAGE = "Usage: license_gaps.py node PROJECT_ROOT [PROJECT ...]"
NO_PACKAGE_JSON = "a link to a package's folder that holds no package.json"
# A manifest is opened without following a link, and without waiting: a fifo opens at once and
# is refused, as anything but a regular file is. A platform without either flag reads none (None).
OPEN_FLAGS = (os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK
              if hasattr(os, "O_NOFOLLOW") and hasattr(os, "O_NONBLOCK") else None)
# A package.json is a few kilobytes; one larger than this is not parsed, and at most this many bytes
# plus one are read, so no file in the tree can make the read take the memory it asks for.
MAX_MANIFEST = 4 << 20
# What a failed stat means "nothing there": no such entry, or a part of the path that is no
# folder. ELOOP is a loop of links, or a chain of them too long to follow, and named as one. Any
# other error (a permission, an I/O error) is named by its type instead.
GONE = (errno.ENOENT, errno.ENOTDIR)


def shown(name):
    """NAME as the log may print it: its bytes decoded as UTF-8, each byte that is not part of a
    whole character replaced (U+FFFD), and a surrogate that stands for no byte replaced (`?`),
    then without the characters a log line can break at: control characters (Cc: C0, DEL and
    C1) and the line and paragraph separators (Zl, Zp), as the kit's shell scripts drop them.
    Only whole characters are dropped, so the bytes around one cannot join into another, and a
    newline in a folder's name cannot start a line of its own, nor a workflow command."""
    text = name if isinstance(name, str) else str(name)
    try:
        raw = text.encode("utf-8", "surrogateescape")  # the bytes the file system gave
    # A surrogate outside U+DC80-U+DCFF, which stands for no byte, so surrogateescape cannot encode
    # it: each becomes `?`.
    except UnicodeEncodeError:
        raw = text.encode("utf-8", "replace")
    whole = raw.decode("utf-8", "replace")
    return "".join(ch for ch in whole if unicodedata.category(ch) not in ("Cc", "Zl", "Zp"))


def at_package_place(folder):
    """True for node_modules/<name> and node_modules/@scope/<name>."""
    parts = folder.parts
    if len(parts) >= 2 and parts[-2] == "node_modules":
        return not parts[-1].startswith((".", "@"))
    return len(parts) >= 3 and parts[-3] == "node_modules" and parts[-2].startswith("@")


def at_scope_place(folder):
    """True for node_modules/@scope."""
    return folder.parent.name == "node_modules" and folder.name.startswith("@")


def is_package_root(manifest):
    """True for node_modules/<name>/package.json and
    node_modules/@scope/<name>/package.json."""
    return at_package_place(manifest.parent)


def walk(root):
    """One walk of ROOT, following no link: (the package.json at each installed package's root,
    each link where a package, a scope or a node_modules folder belongs, and each ("folder", error)
    for a folder that could not be read or ("entry", error) for an entry that could not be looked
    at). ROOT is resolved first, so every path is a real one."""
    root = Path(root).resolve()
    manifests, links, unread = [], [], []
    for top, dirs, files in os.walk(root, onerror=lambda exc: unread.append(("folder", exc))):
        here = Path(top)
        # A link to a folder is listed with the folders, any other link with the files.
        for name in dirs + files:
            path = here / name
            if not (name == "node_modules" or at_package_place(path) or at_scope_place(path)):
                continue
            try:
                is_link = stat.S_ISLNK(os.lstat(path).st_mode)
            # Listed, but not searchable, or the entry went away: the entry is reported by its own
            # path, and the folder's other entries are still looked at.
            except OSError as exc:
                unread.append(("entry", exc))
                continue
            if is_link:
                links.append(path)
        if at_package_place(here) and "package.json" in dirs + files:
            manifests.append(here / "package.json")
    return sorted(manifests), sorted(links), unread


def looked_at(path, follow=True):
    """(PATH's stat, None), or (None, why not): "missing" when nothing is there (GONE), "loop"
    for too many levels of symbolic links (ELOOP: a loop of links, or a chain too long to follow),
    otherwise the error's type, so a target that cannot be looked at is never reported as an
    absent one."""
    try:
        return (os.stat(path) if follow else os.lstat(path)), None
    except OSError as exc:
        if exc.errno in GONE:
            return None, "missing"
        return None, "loop" if exc.errno == errno.ELOOP else type(exc).__name__


def link_gap(root, link):
    """Why the walk cannot vouch for what LINK holds, or None when it can: LINK must lead to a
    folder inside ROOT, either the same kind of place under a node_modules folder, which the walk
    reads where it meets it, or, for a package's link, a folder outside every node_modules folder,
    whose package.json is then read as that package's (own_package)."""
    root = Path(root).resolve()
    target = Path(os.path.realpath(link))
    info, why = looked_at(target)
    if why == "missing":
        return "a link that leads nowhere"
    if why == "loop":
        return "a link in a loop of links"
    if why is not None:
        return f"a link whose target cannot be looked at: {why}"
    try:
        inside = target.relative_to(root)
    except ValueError:
        return "a link out of the tree"
    if not stat.S_ISDIR(info.st_mode):
        return "a link to something that is not a folder"
    if "node_modules" not in inside.parts:
        if at_package_place(link):
            return None  # read from its own package.json: own_package
        return "a link to a folder outside every node_modules folder, which is not read"
    if link.name == "node_modules":
        same = target.name == "node_modules"
    elif at_scope_place(link):
        same = at_scope_place(target)
    else:
        same = at_package_place(target)
    return None if same else "a link to a folder of an install that is not read as a package"


def own_package(root, link):
    """The package.json that LINK, a package's link the walk vouches for, installs from a folder of
    the tree outside every node_modules folder, or None when LINK leads into an install."""
    target = Path(os.path.realpath(link))
    if "node_modules" in target.relative_to(Path(root).resolve()).parts:
        return None
    return target / "package.json"


def install_of(package):
    """The node_modules folder that holds PACKAGE, a folder at a package's place."""
    return package.parent if package.parent.name == "node_modules" else package.parent.parent


def holds_a_package(node_modules, manifests, accepted):
    """True when NODE_MODULES, a real path, holds a package: a package root with a package.json, or
    a link to one that the walk vouches for (a pnpm or workspace link)."""
    packages = [manifest.parent for manifest in manifests]
    packages += [link for link in accepted if at_package_place(link)]
    return any(install_of(package) == node_modules for package in packages)


def declared_licences(meta):
    """The licence values a manifest declares, a string, a `{type}` object or a list
    of either. As in npm, `license` decides alone when it is there, and the
    deprecated `licenses` only when it is not. Empty values, npm's `UNLICENSED`, SPDX's
    `NONE` (no licence) and `NOASSERTION` (no assertion made), in any case, are gaps, not
    licences."""
    value = meta["license"] if meta.get("license") is not None else meta.get("licenses")
    values = []
    for item in value if isinstance(value, list) else [value]:
        if isinstance(item, dict):
            item = item.get("type")
        if isinstance(item, str) and item.strip() and item.strip().upper() not in NOT_A_LICENCE:
            values.append(item.strip())
    return values


def read_manifest(path):
    """(the manifest, None), or (None, why it was not read). A link is never followed, and only a
    regular file of at most MAX_MANIFEST bytes is read; a failed read or parse gives its
    exception's type, never its text: a parser's RecursionError and a MemoryError too, so the walk
    goes on."""
    try:
        if OPEN_FLAGS is None:  # main refuses to start first; any other caller still reads nothing
            return None, "not read: this platform has no O_NOFOLLOW or O_NONBLOCK"
        if stat.S_ISLNK(os.lstat(path).st_mode):
            return None, "a link, not read"
        fd = os.open(path, OPEN_FLAGS)
    except OSError as exc:
        return None, type(exc).__name__
    try:
        # Checked on the descriptor before anything wraps it: Python refuses a folder's outright.
        if not stat.S_ISREG(os.fstat(fd).st_mode):
            return None, "not a regular file"
        with open(fd, "rb", closefd=False) as manifest:
            data = manifest.read(MAX_MANIFEST + 1)   # never more, however large the file is
        if len(data) > MAX_MANIFEST:
            return None, f"larger than {MAX_MANIFEST} bytes"
        meta = json.loads(data.decode("utf-8"))
    except (OSError, ValueError, RecursionError, MemoryError) as exc:
        return None, type(exc).__name__
    finally:
        os.close(fd)
    if not isinstance(meta, dict):
        return None, "not a JSON object"
    return meta, None


def node_missing(root, manifests, linked=()):
    """The packages that declare no licence: MANIFESTS, each named by its folder, then LINKED, the
    (link, package.json) pairs own_package found, each named by its link."""
    root = Path(root).resolve()
    named = [(manifest.parent, manifest) for manifest in manifests] + list(linked)
    missing = []
    for place, meta_path in named:
        name = shown(place.relative_to(root))
        meta, reason = read_manifest(meta_path)
        if meta is None:
            missing.append(f"{name} (unreadable package.json: {reason})")
        elif not declared_licences(meta):
            missing.append(name)
    return missing


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if len(argv) < 2 or argv[0] != "node":
        print(USAGE, file=sys.stderr)
        return 2
    # A name stdout cannot encode (LC_ALL=C with PYTHONUTF8=0 gives an ASCII stdout) is written
    # escaped, never raised as a traceback halfway through the report.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(errors="backslashreplace")
    if OPEN_FLAGS is None:
        print("this platform has no O_NOFOLLOW or O_NONBLOCK, so a package.json cannot be opened "
              "without following a link or waiting: nothing is read", file=sys.stderr)
        return 2
    try:
        is_dir = stat.S_ISDIR(Path(argv[1]).stat().st_mode)
    except OSError as exc:
        why = shown(exc.strerror or type(exc).__name__)
        print(f"cannot read {shown(argv[1])}: {why}", file=sys.stderr)
        return 2
    if not is_dir:
        print(f"{shown(argv[1])} is not a directory", file=sys.stderr)
        return 2
    root = Path(argv[1]).resolve()
    manifests, links, unread = walk(root)
    failed = False
    for kind, exc in unread:
        what = "read the folder" if kind == "folder" else "look at"
        why = shown(exc.strerror or type(exc).__name__)
        print(f"cannot {what} {shown(exc.filename)}: {why}")
        failed = True
    walked = set(manifests)
    accepted, linked, refused = [], [], set()
    for link in links:
        gap = link_gap(root, link)
        if gap is None and at_package_place(link):
            manifest = own_package(root, link)
            if manifest is None:  # into an install: read where the walk met it, if it recorded one
                if Path(os.path.realpath(link)) / "package.json" not in walked:
                    gap = NO_PACKAGE_JSON
            else:
                _, why = looked_at(manifest, follow=False)
                if why is None:
                    linked.append((link, manifest))
                elif why == "missing":
                    gap = NO_PACKAGE_JSON
                elif why == "loop":
                    gap = "a link to a package's folder whose package.json is in a loop of links"
                else:
                    gap = ("a link to a package's folder whose package.json cannot be looked at: "
                           f"{why}")
        if gap is not None:
            print(f"not read: {shown(link.relative_to(root))} ({gap})")
            refused.add(link)
            failed = True
        else:
            accepted.append(link)
    # A folder the walk could not read, an entry it could not look at and a refused link were
    # each printed above: in a node_modules that holds one, that is the finding, and the install
    # sentence would name the wrong cause.
    reported = [Path(exc.filename) for _, exc in unread if exc.filename] + sorted(refused)
    for project in argv[2:]:
        node_modules = Path(project) / "node_modules"
        if Path(project).resolve() / "node_modules" in refused:
            continue  # the refused link is the finding, printed above
        # Path.is_dir raises on a permission error (Python 3.12): stat it, and name an error that
        # is not an absence by its type, a loop of links as one.
        info, why = looked_at(node_modules)
        if why == "loop":
            print(f"{shown(project)}/node_modules is in a loop of links")
            failed = True
        elif why not in (None, "missing"):
            print(f"cannot look at {shown(project)}/node_modules: {why}")
            failed = True
        elif info is None or not stat.S_ISDIR(info.st_mode):
            problem = f"node_modules missing in {shown(project)}: install its dependencies first"
            print(problem + " (licences are read from it)")
            failed = True
        elif not holds_a_package(node_modules.resolve(), manifests, accepted):
            here = node_modules.resolve()
            if not any(place == here or here in place.parents for place in reported):
                where = f"{shown(project)}/node_modules"
                problem = f"no installed packages under {where}: install its dependencies first"
                print(problem + " (licences are read from them)")
            failed = True
    if not manifests and not linked:
        # After a link or a folder that could not be read, that is the finding, not the install.
        if not failed:
            print("no installed packages under node_modules: run the install first")
        return 1
    missing = node_missing(root, manifests, linked)
    for name in missing:
        print(f"no licence declared: {name}")
    return 1 if missing or failed else 0


if __name__ == "__main__":
    sys.exit(main())
