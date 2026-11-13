#!/usr/bin/env bash
# SPDX-License-Identifier: MIT OR Apache-2.0
# Copyright 2026 Andrew Briscoe and the zencelades contributors
# Fail unless every non-merge commit in BASE..HEAD carries
# "Signed-off-by: <its author>", unless the pull request was opened by a
# maintainer account listed in MAINTAINERS at BASE: then every commit in the range
# is exempt, and the maintainer certifies after reading, through the sign-off ledger
# on the signoff-ledger branch (procedure: AUTHORSHIP.md), which this script does
# not read. An agent never writes a human's
# sign-off. The exemption keys on the forge account that opened the pull request
# (passed by the workflow), never on the commit's author line, which anyone can
# type. Reads git metadata only. The exemption waives the sign-off comparison and
# nothing else: both revisions must name commits here and the range must list first.
# No text a contributor can type reaches a `::error::` line: what one is about follows on a
# line of its own, and the only value in one is a short commit hash that git printed. Its tests
# are legal-index's templates/oss/common/scripts/test_dco_check.py, run in its CI on every kit
# change.
#
#   dco-check.sh BASE HEAD [PR_AUTHOR_LOGIN]
set -euo pipefail
umask 077
opener="${3-}"
# The characters an author is never printed with, because a log line can break at them:
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
# A revision that names no commit here fails the check before the exemption is read, so a
# maintainer's pull request with a missing head cannot pass with no commit listed.
if ! base="$(git rev-parse --verify --quiet --end-of-options "$1^{commit}")"; then
	echo "::error::the base revision names no commit in this checkout"
	exit 1
fi
if ! head="$(git rev-parse --verify --quiet --end-of-options "$2^{commit}")"; then
	echo "::error::the head revision names no commit in this checkout"
	exit 1
fi
# rev-list inside a for word list would hide its failure from set -e: a range that cannot be
# listed must fail the check, never pass it as an empty one.
if ! commits="$(git rev-list --no-merges "${base}..${head}")"; then
	echo "::error::cannot list the commits of the pull request"
	echo "  range: ${base:0:12}..${head:0:12}"
	exit 1
fi
if [[ -n ${opener} ]]; then
	# A MAINTAINERS that is absent at BASE exempts nobody; one that is there but cannot be read
	# fails the check (set -e), rather than falling through as if nobody were listed.
	maintainers=""
	if git cat-file -e "${base}:MAINTAINERS" 2>/dev/null; then
		listed="$(git show "${base}:MAINTAINERS")"
		maintainers="$(printf '%s\n' "${listed}" | sed -e 's/#.*//' -e 's/[[:space:]]*$//' | grep -v '^$' || true)"
	fi
	if printf '%s\n' "${maintainers}" | grep -Fxq -- "${opener}"; then
		echo "pull request opened by maintainer account '${opener}': every commit in ${base:0:12}..${head:0:12} is exempt from the per-commit sign-off; the maintainer certifies after reading, through the project's sign-off ledger on the signoff-ledger branch (procedure: AUTHORSHIP.md), which this check does not read"
		exit 0
	fi
fi
fail=0
for c in ${commits}; do
	# A git failure here must be its own error, never read as a missing sign-off; and an
	# author line that starts with a dash is a value to grep, never an option.
	if ! author="$(git log -1 --format='%an <%ae>' "${c}")"; then
		echo "::error::cannot read the author of commit ${c:0:12}"
		exit 1
	fi
	if ! trailers="$(git log -1 --format='%(trailers:key=Signed-off-by,valueonly)' "${c}")"; then
		echo "::error::cannot read the trailers of commit ${c:0:12}"
		exit 1
	fi
	if ! printf '%s\n' "${trailers}" | grep -Fxq -- "${author}"; then
		echo "::error::commit ${c:0:12} has no Signed-off-by line that names its author (git commit -s adds one from your committer identity, which passes when that is also the commit's author)"
		# Anyone can type the author, so it goes on the next line, never in the command. An author
		# with any character shown() drops is never printed, since a carriage return there could
		# start a line of its own; the message below asks for the commit to be rewritten with a plain
		# author instead. shown() returning the author unchanged means no such character is in it.
		if [[ "$(shown "${author}")" == "${author}" ]]; then
			printf '  it needs: Signed-off-by: %s\n' "${author}"
		else
			echo "  its author holds characters that break a log line, so it is not printed: rewrite commit ${c:0:12} with a plain author and its sign-off (for the newest commit: git commit --amend --reset-author --no-edit -s)"
		fi
		fail=1
	fi
done
exit "${fail}"
