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
# Every function called in a condition here returns its own status and the caller acts on it
# (`|| status=1`, `|| walk_failed`); none relies on set -e inside itself, which such a call
# switches off. bounded keeps the tool's exit code with `|| rc=$?` and returns it.
# shellcheck disable=SC2310
set -euo pipefail
umask 077
cd "$(dirname "$0")/.."
status=0

# Each tool gets LICENSE_AUDIT_TIMEOUT seconds (a whole number above 0, default 1800), then
# TERM, and KILL 30 seconds later if it is still running, so a registry or mirror that stops
# answering fails the audit instead of hanging it. Where neither timeout nor gtimeout exists
# (macOS without coreutils) the tools run unbounded, and the audit says so; a limit only
# guards against a hang, since a tool that finishes gives its result either way.
limit="${LICENSE_AUDIT_TIMEOUT:-1800}"
case "${limit}" in
"" | *[!0-9]*)
	echo "LICENSE_AUDIT_TIMEOUT must be a whole number of seconds, not '${limit}'"
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
	124) echo "$* stopped: no result after ${limit}s" ;;
	137 | 143) echo "$* was killed (exit ${rc}): the time limit of ${limit}s, or a signal from outside" ;;
	*) ;;
	esac
	return "${rc}"
}
command -v timeout >/dev/null 2>&1 || command -v gtimeout >/dev/null 2>&1 ||
	echo "no timeout or gtimeout command: the tools below run without a time limit"

# pip-licenses reports names, not SPDX ids, and the same licence appears in
# several spellings (Trove classifier or metadata). Both forms are listed.
PY_ALLOW='MIT License;MIT;Apache Software License;Apache-2.0;Apache License 2.0;Apache 2.0;BSD License;BSD-2-Clause;BSD-3-Clause;ISC License (ISCL);ISC;Python Software Foundation License;PSF-2.0;Mozilla Public License 2.0 (MPL 2.0);MPL-2.0;The Unlicense (Unlicense);Unlicense;Zero-Clause BSD (0BSD);0BSD;CC0-1.0;Public Domain;zlib/libpng License;Zlib;MIT OR Apache-2.0;Apache-2.0 OR MIT'

# Every folder that holds one of the named files, the root as ".", one per line. The skipped
# names follow oss_setup.py's SKIP_DIRS, plus Go's testdata: a lockfile there belongs to an
# installed package, a vendored copy, build output or a fixture, not to a project here.
project_dirs() {
	local names=() n
	for n in "$@"; do names+=(-o -name "${n}"); done
	find . \( -name .git -o -name .jj -o -name node_modules -o -name target -o -name .venv -o -name venv \
		-o -name vendor -o -name dist -o -name build -o -name .cache -o -name __pycache__ -o -name .mise \
		-o -name .codegraph -o -name third_party -o -name generated -o -name testdata \) -prune \
		-o -type f \( "${names[@]:1}" \) -print | sed 's|/[^/]*$||' | LC_ALL=C sort -u
}
# A folder find cannot read fails the audit: a project inside it would go unchecked.
walk_failed() {
	echo "could not read every folder while looking for $*: projects there go unchecked"
	status=1
}

# The loops read the folder list on descriptor 3, so a tool that reads its standard input
# cannot swallow the folders after its own.
rust_dirs="$(project_dirs Cargo.lock)" || walk_failed Cargo.lock
while IFS= read -r d <&3; do
	[[ -n ${d} ]] || continue
	echo "== Rust: cargo deny check licenses (${d})"
	if [[ -f "${d}/deny.toml" ]]; then
		(cd "${d}" && bounded cargo deny --locked check licenses) || status=1
	elif [[ -f deny.toml ]]; then
		bounded cargo deny --locked --manifest-path "${d}/Cargo.toml" check licenses || status=1
	else
		echo "no deny.toml in ${d} or at the root: add the kit's"
		status=1
	fi
done 3<<<"${rust_dirs}"

py_dirs="$(project_dirs uv.lock)" || walk_failed uv.lock
while IFS= read -r d <&3; do
	[[ -n ${d} ]] || continue
	echo "== Python: pip-licenses --allow-only, runtime dependencies only (${d})"
	(cd "${d}" && bounded uv run --frozen --no-dev --with pip-licenses pip-licenses --allow-only "${PY_ALLOW}") || status=1
done 3<<<"${py_dirs}"

# license_gaps.py reads every installed package below the root, so it runs once, after each
# Node project is found installed.
node_dirs="$(project_dirs bun.lock bun.lockb package-lock.json pnpm-lock.yaml yarn.lock)" || walk_failed Node lockfiles
if [[ -n ${node_dirs} ]]; then
	installed=1
	# A project counts as installed when its node_modules holds a package (scoped or not; pnpm links
	# are followed), so an empty folder does not pass on the strength of another project's install.
	while IFS= read -r d; do
		if [[ ! -d "${d}/node_modules" ]]; then
			echo "node_modules missing in ${d}: install its dependencies first (licences are read from it)"
			installed=0
			continue
		fi
		# Only whether find printed a path is checked: head stops reading at the first package.json,
		# so find's own status (SIGPIPE, or an error on a folder it could not read after printing
		# one) is not a result here.
		# shellcheck disable=SC2312
		if [[ -z "$(find -L "${d}/node_modules" -mindepth 2 -maxdepth 3 -name package.json | head -n 1)" ]]; then
			echo "no installed packages under ${d}/node_modules: install its dependencies first (licences are read from them)"
			installed=0
		fi
	done <<<"${node_dirs}"
	if [[ ${installed} == 1 ]]; then
		echo "== Node: installed packages with no licence field (Trivy skips them)"
		bounded python3 scripts/license_gaps.py node . || status=1
	else
		status=1
	fi
fi

# go-licenses looks for a licence file inside each module, so it finds none for the packages of
# a module in a sub-folder; the tree's own modules are ignored, and their dependencies checked.
go_dirs="$(project_dirs go.mod)" || walk_failed go.mod
go_ignores=()
while IFS= read -r d <&3; do
	[[ -n ${d} ]] || continue
	# The first module line only; sed stops there, so a second one cannot break the pipe.
	if m="$(sed -n '/^module[[:space:]]/{s/^module[[:space:]]\{1,\}"\{0,1\}\([^"[:space:]]*\).*/\1/p;q;}' "${d}/go.mod")"; then
		[[ -z ${m} ]] || go_ignores+=(--ignore "${m}")
	else
		echo "cannot read ${d}/go.mod: its module is checked without being told to skip itself"
		status=1
	fi
done 3<<<"${go_dirs}"
# Trivy and go-licenses read licences from the module cache, hence the download first.
# proxy.golang.org lists v2.0.0-alpha.1, v2.0.0 and v2.0.1 of go-licenses (checked
# 2026-10-25); `go run` checks the download against sum.golang.org.
while IFS= read -r d <&3; do
	[[ -n ${d} ]] || continue
	echo "== Go: go-licenses check, unknown licences fail (${d})"
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
