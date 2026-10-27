# Contributing

## License of contributions

This project is licensed under either of the [MIT License](LICENSE-MIT) or the
[Apache License, Version 2.0](LICENSE-APACHE), at your option (`MIT OR Apache-2.0`).

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions. That
includes the patent license in Apache-2.0 section 3.

Only submit code you can license under both. Code under the GPL, LGPL, AGPL or
another copyleft license cannot be accepted. Do not paste code from Stack
Overflow (its content is CC BY-SA) or from copyleft projects; write it
yourself. Code written with an AI assistant is submitted on the same terms:
you review it as your own and your sign-off certifies its origin; never ask an
assistant to reproduce a named project's implementation or paste third-party
code into a prompt, and where a well-known library already does the job, depend
on it under its licence rather than generating a re-implementation. Record the
assistance with an `Assisted-by: <tool> (<model>)` trailer on each commit the
assistant wrote or materially changed (older commits carry a `Co-Authored-By`
line with the same meaning). Either line records tool use, not authorship: an
AI system is never an author of this project and never signs off. See
AUTHORSHIP.md.

Dependencies are a separate matter from the code you write. A new dependency must
pass `scripts/license-audit.sh`, run locally before the pull request. It needs Trivy,
plus cargo-deny, pip-licenses or go-licenses for the lockfiles present, at the root or
in any sub-project, and each Node project's dependencies installed; it stays a local
command until a workflow invokes it. The policy is `.trivy-license.yaml` and the
audit's allow-lists: permissive and weak-copyleft licences (MIT, BSD, Apache-2.0, ISC,
MPL-2.0 and the like) pass; GPL, AGPL and SSPL never; an LGPL dependency is an
exception taken deliberately, in the same pull request and with the reason: add the
identifier the audit reports, in the exact spelling it prints (`LGPL-2.1-only`, say),
to an `ignored` list under `license:` in `.trivy-license.yaml`, with a comment naming
the dependency and the reason. Never start a `reciprocal` list for it: a category the
file sets replaces Trivy's whole default list, and MPL-2.0, EPL and CDDL would fail.
Then add the licence string pip-licenses prints for it to `PY_ALLOW` where Python applies,
and for a Go module or a Rust
crate add the tool's own allow entry (go-licenses `--ignore`, `deny.toml`), since those
tools never read the Trivy file. Anything else the policy rejects is replaced in the
same pull request.

## Sign-off (DCO)

Every commit must be signed off under the
[Developer Certificate of Origin 1.1](https://developercertificate.org/):

    git commit -s

This adds `Signed-off-by: Your Name <you@example.com>`, taken from your committer
identity. It must match the commit's author, so `-s` covers a commit you authored; a
commit someone else authored needs that person's own sign-off. A check on each pull request on git.telpher.stream, the forge where pull requests merge, enforces the sign-off. Pull requests opened
by the maintainer accounts listed in MAINTAINERS are exempt: those commits are
certified afterwards by a maintainer who reads each change and records a
signed attestation on the `signoff-ledger` branch (AUTHORSHIP.md).

## Headers

Keep every existing copyright line and `SPDX-License-Identifier:` header. A new
source file starts with `SPDX-License-Identifier: MIT OR Apache-2.0` and a copyright
line; files that still lack a header are the maintainers' to complete, not a
contributor's. You may add your own copyright line to files you change
substantially.

## Authorship

Contributions are merged at the maintainers' sole discretion. Contributing
does not make you a joint author or co-owner of zencelades as a whole: you keep
the copyright in your contribution and license it as above. AUTHORSHIP.md is
the project's record of who its authors are and how the commit history reads.
