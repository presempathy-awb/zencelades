#!/usr/bin/env bash
# SPDX-License-Identifier: MIT OR Apache-2.0
# Copyright 2026 Andrew Briscoe and the zencelades contributors
# Fail unless every non-merge commit in BASE..HEAD carries
# "Signed-off-by: <its author>", unless the pull request was opened by a
# maintainer account listed in MAINTAINERS at BASE: those commits are certified
# after reading, through the project's sign-off ledger (AUTHORSHIP.md), and an
# agent never writes a human's sign-off. The exemption keys on the forge
# account that opened the pull request (passed by the workflow), never on the
# commit's author line, which anyone can type. Reads git metadata only.
#
#   dco-check.sh BASE HEAD [PR_AUTHOR_LOGIN]
set -euo pipefail
umask 077
base="$1"
head="$2"
opener="${3-}"
if [[ -n ${opener} ]]; then
	# A MAINTAINERS that is absent at BASE exempts nobody; one that is there but cannot be read
	# fails the check (set -e), rather than falling through as if nobody were listed.
	maintainers=""
	if git cat-file -e "${base}:MAINTAINERS" 2>/dev/null; then
		listed="$(git show "${base}:MAINTAINERS")"
		maintainers="$(printf '%s\n' "${listed}" | sed -e 's/#.*//' -e 's/[[:space:]]*$//' | grep -v '^$' || true)"
	fi
	if printf '%s\n' "${maintainers}" | grep -Fxq -- "${opener}"; then
		echo "pull request opened by maintainer account '${opener}': sign-off is recorded in the project's sign-off ledger, not per commit"
		exit 0
	fi
fi
fail=0
# rev-list inside a for word list would hide its failure from set -e: a base or head the
# checkout lacks must fail the check, never pass it as an empty range.
if ! commits="$(git rev-list --no-merges "${base}..${head}")"; then
	echo "::error::cannot list the commits ${base}..${head} (is the head commit in the checkout?)"
	exit 1
fi
for c in ${commits}; do
	author="$(git log -1 --format='%an <%ae>' "${c}")"
	if ! git log -1 --format='%(trailers:key=Signed-off-by,valueonly)' "${c}" | grep -Fxq "${author}"; then
		echo "::error::commit ${c:0:12} has no 'Signed-off-by: ${author}' (git commit -s adds one from your committer identity, which passes when that is also the commit's author)"
		fail=1
	fi
done
exit "${fail}"
