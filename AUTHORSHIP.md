# Authorship

This file says who the author of zencelades is, how the commit history records the tools and people involved, and what contributing does and does not make you. It is part of the project's record; keep it accurate.

## Author of record

zencelades is authored by the people who direct, select, arrange, modify and review its code and documentation, and the copyright is held by Andrew Briscoe and the zencelades contributors (see NOTICE and the LICENSE files). Contributors hold the copyright in their own contributions and license them under the terms in CONTRIBUTING.md.

## AI assistants are tools

Much of this code is written with AI coding assistants (for example Claude Code and Codex) working under human direction: a person writes the brief and the design, chooses between the assistant's proposals, orders and arranges the result, corrects it, and decides what is merged. The assistant is an instrument. No AI system is an author, co-author, inventor or contributor of this project, and none has signed off on anything in it.

The human authorship this project claims is the written design and documentation, the human-written and human-modified code, and the selection, coordination and arrangement of the generated parts into this program. Generated text that a person accepted without more is not claimed as that person's writing. Any copyright registration describes the human contribution and excludes the generated material.

## How to read the history

| Trailer                                                                     | Meaning                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Signed-off-by: Name <email>` on a contributor's commit                     | A **human** contributor certifies the Developer Certificate of Origin 1.1 for that commit. A tool never adds this line, and the maintainers' agents never write a human's.                                                                                                                                               |
| `Assisted-by: <tool> (<model>)`                                             | An AI assistant wrote or materially changed the commit under a maintainer's direction. It records tool use, not authorship.                                                                                                                                                                                              |
| `Co-Authored-By: Claude … <noreply@anthropic.com>`                          | Older commits: the same meaning as `Assisted-by`. The name of the trailer is a tool convention; an AI cannot be an author.                                                                                                                                                                                               |
| `Claude-Session: <url>`                                                     | A link to the session in which the assistance happened. The link is as public as the commit it is on; the session itself stays private, part of the design record.                                                                                                                                                       |
| `attest(<repo>): reviewed N commits on main` on the `signoff-ledger` branch | The maintainers' certification. A maintainer read each listed commit on `main` after it landed and recorded, in a commit signed with their own key and ending in their `Signed-off-by`, that they certify it (or rejected it, with the issue that follows), with an optional note on what was kept, rejected or changed. |

Maintainers' pull requests (opened from the accounts in `MAINTAINERS`) therefore carry no per-commit sign-off; every commit on `main` is certified afterwards in the ledger, in any order, and a release is cut only when no commit is pending. Pull requests on the forge keep the individual commits and their trailers; a squash merge onto `main` may carry only the pull-request title and description, with the forge's `Reviewed-on` and `Reviewed-by` lines, so the pull request is the record of which commits had assistance.

## Design record

Human-written design documents (intent, specifications, decisions, interfaces) live under `docs/` and are committed before or with the code that implements them. Pull-request descriptions name the documents a change implements and the decisions taken. Review comments and merge decisions are part of the record.

## Contributing does not make you a joint author

Contributions are reviewed and merged at the maintainers' sole discretion, and the maintainers decide what the project is. By contributing you keep the copyright in your contribution and license it under the terms in CONTRIBUTING.md; you do not become a joint author or co-owner of zencelades as a whole, and the maintainers do not become authors of your contribution. The parties intend this to be the written statement of that understanding.

## Dependencies and pasted code

Third-party code enters this project only as a dependency under its own licence, listed in the notices. The rules the project works to: nothing is pasted from other projects, Stack Overflow or similar sources; no assistant is asked to reproduce a named project's implementation, and no third-party code is pasted into a prompt; where a well-known library already does the job the project depends on it rather than generating a re-implementation; and a generated block that reproduces a known library is treated as third-party code and removed or licensed. The record of how each change came to be (the design document, the prompt, the review) is kept so that any claim that code was copied can be answered with how it was actually written.

Not legal advice. Copyright 2026 Andrew Briscoe and the zencelades contributors.
