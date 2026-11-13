#!/usr/bin/env bash
# SPDX-License-Identifier: MIT OR Apache-2.0
# Copyright 2026 Andrew Briscoe and the zencelades contributors
# Licence audit of the dependencies this project ships. Exit 1 when a
# dependency of any project in the tree is outside the policy: each ecosystem's
# tool runs in every folder that holds its lockfile, the root and each
# sub-project (a lockfile in an installed, vendored or built tree, or in Go's
# testdata, makes no project; Trivy and license_gaps.py still read the whole
# tree), and each Node project must have its packages installed. Policy files: deny.toml
# (Rust; a project's own, else the root's), .trivy-license.yaml (Node, Go,
# licence text), PY_ALLOW below (Python). A dependency with no licence at all
# fails too: cargo-deny and pip-licenses reject it, and license_gaps.py (Node)
# and go-licenses (Go) cover the two ecosystems where Trivy stays silent.
# `--full` adds Trivy's text scan of source files for licence statements (slow;
# vendored code). Exit 2 when LICENSE_AUDIT_TIMEOUT is not a whole number above 0.
#
# A line that prints a value from the tree or the environment uses printf '%s\n', never echo,
# which expands backslashes when bash's xpg_echo is on, so a literal \n in a folder's name cannot
# become a line break.
# Every function called in a condition here returns its own status and the caller acts on it
# (`|| status=1`, `|| walk_failed`); none relies on set -e inside itself, which such a call
# switches off. bounded keeps the tool's exit code with `|| rc=$?` and returns it.
# shellcheck disable=SC2310
set -euo pipefail
umask 077
cd "$(dirname "$0")/.."
status=0
# A value from the tree or the environment is printed without the characters a log line can break
# at, as in dco-check.sh and license_gaps.py: a carriage return in a folder's name could start a
# line of its own in the log, and a line that starts with :: is a workflow command. They are
# C0 controls, DEL, C1 controls and the Unicode line and paragraph separators (U+2028, U+2029):
# the characters a log line can break at, and the set license_gaps.py drops (Cc, Zl and Zp).
# Deleting can join the bytes on either side of a deleted sequence into a new one (E2 E2 80 A8
# 80 A8 leaves E2 80 A8), so the deletions repeat until nothing changes; every pass that
# changes the value shortens it, so the loop ends.
shown() {
	local value="$1" before
	while :; do
		before="${value}"
		value="$(printf '%s' "${value}" | LC_ALL=C tr -d '\000-\037\177' |
			LC_ALL=C sed -e "s/$(printf '\302')[$(printf '\200')-$(printf '\237')]//g" -e "s/$(printf '\342\200')[$(printf '\250\251')]//g")"
		[[ ${value} != "${before}" ]] || break
	done
	printf '%s' "${value}"
}

# Its tests are legal-index's templates/oss/common/scripts/test_license_audit.py, run in its CI on
# every kit change.
# Each tool gets LICENSE_AUDIT_TIMEOUT seconds (a whole number above 0, default 1800), then
# TERM, and KILL 30 seconds later if it is still running, so a registry or mirror that stops
# answering fails the audit instead of hanging it. Where neither timeout nor gtimeout exists
# (macOS without coreutils) the tools run unbounded, and the audit says so; a limit only
# guards against a hang, since a tool that finishes gives its result either way.
# The default fills in only an unset value, so an empty one is refused below like any other.
limit="${LICENSE_AUDIT_TIMEOUT-1800}"
case "${limit}" in
"" | *[!0-9]*)
	printf '%s\n' "LICENSE_AUDIT_TIMEOUT must be a whole number of seconds, not '$(shown "${limit}")'"
	exit 2
	;;
*) ;;
esac
# Digits only by now, so above 0 means not all zeros. Bash arithmetic ([[ -gt ]], $(( )))
# would reject 08 and 09 as invalid octal.
if [[ ${limit} =~ ^0+$ ]]; then
	echo "LICENSE_AUDIT_TIMEOUT must be above 0"
	exit 2
fi
bounded() {
	local rc=0
	if command -v timeout >/dev/null 2>&1; then
		timeout -k 30 "${limit}" "$@" || rc=$?
	elif command -v gtimeout >/dev/null 2>&1; then
		gtimeout -k 30 "${limit}" "$@" || rc=$?
	else
		"$@" || rc=$?
	fi
	case "${rc}" in
	124) printf '%s\n' "$(shown "$*") stopped: no result after ${limit}s" ;;
	137 | 143) printf '%s\n' "$(shown "$*") was killed (exit ${rc}): the time limit of ${limit}s, or a signal from outside" ;;
	*) ;;
	esac
	return "${rc}"
}
command -v timeout >/dev/null 2>&1 || command -v gtimeout >/dev/null 2>&1 ||
	echo "no timeout or gtimeout command: the tools below run without a time limit"

# pip-licenses reports names, not SPDX ids, and the same licence appears in
# several spellings (Trove classifier or metadata). Both forms are listed.
PY_ALLOW='MIT License;MIT;Apache Software License;Apache-2.0;Apache License 2.0;Apache 2.0;BSD License;BSD-2-Clause;BSD-3-Clause;ISC License (ISCL);ISC;Python Software Foundation License;PSF-2.0;Mozilla Public License 2.0 (MPL 2.0);MPL-2.0;The Unlicense (Unlicense);Unlicense;Zero-Clause BSD (0BSD);0BSD;CC0-1.0;Public Domain;zlib/libpng License;Zlib;MIT OR Apache-2.0;Apache-2.0 OR MIT;Apache-2.0 OR BSD-2-Clause'

# Every folder that holds one of the named files, the root as ".", one per line. The skipped
# names follow SKIP_DIRS in legal-index's templates/oss/oss_setup.py (the kit this script comes
# from), plus Go's testdata: a lockfile there belongs to an
# installed package, a vendored copy, build output or a fixture, not to a project here.
# find hands the paths over NUL-separated, so a line break in a folder's name cannot split it into
# two lines; every list below is one folder per line, so such a folder is refused, and the function
# fails, as it does when find cannot read a folder. The refusal names the folder with each break
# written as \n, so a/b with a break between them is not read as the folder ab. find's own complaints (BSD find names a folder as
# it is) are printed after a prefix and through shown, so no piece of a name starts a line.
project_dirs() {
	local names=() n err line rc=0
	for n in "$@"; do names+=(-o -name "${n}"); done
	# A template both GNU and BSD mktemp take. Its complaint names the cause: with no mktemp, the
	# shell's command-not-found; for a TMPDIR that is missing or not writable, or a full disk, also
	# TMPDIR's path. So it is printed as find's are, after a prefix and through shown.
	if ! err="$(mktemp "${TMPDIR:-/tmp}/license-audit.XXXXXX" 2>&1)"; then
		echo "cannot create a temporary file for find's complaints" >&2
		while IFS= read -r line; do
			printf '%s\n' "mktemp reported: $(shown "${line}")" >&2
		done <<<"${err}"
		return 1
	fi
	find . \( -name .git -o -name .jj -o -name node_modules -o -name target -o -name .venv -o -name venv \
		-o -name vendor -o -name dist -o -name build -o -name .cache -o -name __pycache__ -o -name .mise \
		-o -name .codegraph -o -name third_party -o -name generated -o -name testdata \) -prune \
		-o -type f \( "${names[@]:1}" \) -print0 2>"${err}" | {
		local path refused=0
		while IFS= read -r -d '' path; do
			if [[ ${path} == *$'\n'* ]]; then
				path="${path%/*}"
				printf '%s\n' "a folder whose name holds a line break, not checked: $(shown "${path//$'\n'/\\n}")" >&2
				refused=1
			else
				printf '%s\n' "${path%/*}"
			fi
		done
		((refused == 0))
	} | LC_ALL=C sort -u || rc=$?
	while IFS= read -r line || [[ -n ${line} ]]; do
		printf '%s\n' "find reported: $(shown "${line}")" >&2
	done <"${err}"
	rm -f -- "${err}"
	return "${rc}"
}
# A folder find cannot read, or one refused by its name, fails the audit: a project inside it
# would go unchecked. This summary goes to stderr, as its cause (find's complaint, a refused name
# or a temporary file that could not be made) did just before it, so a log that keeps the two
# streams apart still shows them together.
walk_failed() {
	echo "could not read every folder, or refused one by its name, while looking for $*: projects there go unchecked" >&2
	status=1
}

# The loops read the folder list on descriptor 3, so a tool that reads its standard input
# cannot swallow the folders after its own.
rust_dirs="$(project_dirs Cargo.lock)" || walk_failed Cargo.lock
while IFS= read -r d <&3; do
	[[ -n ${d} ]] || continue
	printf '%s\n' "== Rust: cargo deny check licenses ($(shown "${d}"))"
	if [[ -f "${d}/deny.toml" ]]; then
		(cd "${d}" && bounded cargo deny --locked check licenses) || status=1
	elif [[ -f deny.toml ]]; then
		bounded cargo deny --locked --manifest-path "${d}/Cargo.toml" check licenses || status=1
	else
		printf '%s\n' "no deny.toml in $(shown "${d}") or at the root: add the kit's deny.toml at the root (legal-index templates/oss/common/deny.toml)"
		status=1
	fi
done 3<<<"${rust_dirs}"

py_dirs="$(project_dirs uv.lock)" || walk_failed uv.lock
# pip-licenses is pinned, as go-licenses is below: 5.5.5 is the latest release on PyPI (checked
# 2026-11-07), the version pip-licenses.md at the root of legal-index (the kit's repository) cites.
while IFS= read -r d <&3; do
	[[ -n ${d} ]] || continue
	printf '%s\n' "== Python: pip-licenses --allow-only, runtime dependencies only ($(shown "${d}"))"
	(cd "${d}" && bounded uv run --frozen --no-dev --with pip-licenses==5.5.5 pip-licenses --allow-only "${PY_ALLOW}") || status=1
done 3<<<"${py_dirs}"

# license_gaps.py reads every installed package below the root, and the same walk says whether each
# Node project is installed (its node_modules holds a package, scoped or not, or a pnpm or workspace
# link the walk vouches for), so an empty folder does not pass on the strength of another project's
# install, and the install check and the licence scan cannot disagree about what is there.
node_dirs="$(project_dirs bun.lock bun.lockb package-lock.json pnpm-lock.yaml yarn.lock)" || walk_failed Node lockfiles
if [[ -n ${node_dirs} ]]; then
	node_projects=()
	while IFS= read -r d; do node_projects+=("${d}"); done <<<"${node_dirs}"
	echo "== Node: each project installed, and installed packages with no licence field (Trivy skips them)"
	bounded python3 scripts/license_gaps.py node . "${node_projects[@]}" || status=1
fi

# go-licenses looks for a licence file inside each module, so it finds none for the packages of
# a module in a sub-folder; the tree's own modules are ignored, and their dependencies checked.
go_dirs="$(project_dirs go.mod)" || walk_failed go.mod
go_ignores=()
while IFS= read -r d <&3; do
	[[ -n ${d} ]] || continue
	# The first module line only; sed stops there, so a second one cannot break the pipe.
	if m="$(sed -n '/^module[[:space:]]/{s/^module[[:space:]]\{1,\}"\{0,1\}\([^"[:space:]]*\).*/\1/p;q;}' "${d}/go.mod" 2>/dev/null)"; then
		[[ -z ${m} ]] || go_ignores+=(--ignore "${m}")
	else
		printf '%s\n' "cannot read $(shown "${d}")/go.mod: its module is checked without being told to skip itself"
		status=1
	fi
done 3<<<"${go_dirs}"
# Trivy and go-licenses read licences from the module cache, hence the download first.
# proxy.golang.org lists v2.0.0-alpha.1, v2.0.0 and v2.0.1 of go-licenses (checked
# 2026-10-25); `go run` checks the download against sum.golang.org.
while IFS= read -r d <&3; do
	[[ -n ${d} ]] || continue
	printf '%s\n' "== Go: go-licenses check, unknown licences fail ($(shown "${d}"))"
	(cd "${d}" && bounded go mod download && bounded go run github.com/google/go-licenses/v2@v2.0.1 check \
		${go_ignores[@]+"${go_ignores[@]}"} --disallowed_types=forbidden,restricted,unknown ./...) || status=1
done 3<<<"${go_dirs}"

echo "== Trivy: licence categories (.trivy-license.yaml)"
bounded trivy fs --scanners license --config .trivy-license.yaml \
	--severity UNKNOWN,HIGH,CRITICAL --exit-code 1 -q . || status=1

if [[ ${1-} == "--full" ]]; then
	echo "== Trivy: licence statements in source and text files"
	bounded trivy fs --scanners license --license-full --config .trivy-license.yaml \
		--severity UNKNOWN,HIGH,CRITICAL --exit-code 1 -q . || status=1
fi

exit "${status}"
