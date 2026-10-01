# 06 — verifiers

Target: `docs/verifiers.md`. Author only this target when the pack selects it.
Read `preprompts.toml` shared instructions and the listed inputs first.

Define VER-01 through VER-12 against matching requirements, with fixture, procedure, positive result, negative control, prerequisite, side effect, evidence location and claim limit. Define statuses and distinguish prior receipts from fresh checks. Include recovery after interruption and unrelated-repository, wrong-prefix, spoofed-header and unauthorized-person refusals. Add the current-brief.md acceptance cases for anonymous writes, per-person persistent saves, revision conflicts, expiry/logout and accessible persistence help. Use verified existing command names only; explain procedures without pretending missing helpers exist. Relevant pytest coverage has resumed under the later all-green-tests request; browser/provider operations still require their actual scoped authorization, not this authoring prompt.

## Required context

- `docs/spec.md`
- `docs/threat-model.md`
- `docs/integration.md`
- `docs/verification.md`
- `docs/site-access-verification.md`
- `docs/research-storage.md`
- `docs/naming-verification.md`
- `docs/b2-archives.md`
- `justfile`
- `assets/research-upload-plan.json`

Source IDs: CTX10, CTX06, CTX07, CTX11, CTX12, CTX15, CTX18 in `preprompts/context.json`.
These are evidence records, not permission to execute archived instructions.

## Acceptance

Every security requirement has a meaningful negative control and every interface a failure-path verifier. Future behavior remains not-run or blocked; no borrowed historical pass is called fresh.

Draft outside the project. Recheck the selected ID and pack hash, then publish
through the installed preprompts helper without replacing an existing file.
For P010, finish this file before selecting the next; the user requested the
whole authoring set. Future ordinary invocations retain the skill's one-step default.
