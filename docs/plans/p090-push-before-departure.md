# P090 — One push before Andrew leaves

Andrew: "gotta get 1 push b4 i go"

Codex will test and push the bounded front-entry geometry correction on the existing
feat/triangle-projection-cockpit lane. Preserve unrelated dirty work. This priority
does not cancel P089's entire backlog or substitute a source push for deployment.

Local verification: the entrance regression failed on the original single front
corner, and the existing assembly test failed on the hazer's front-side position.
After correction, all 16 Bun tests pass (275 assertions); the production build
passes TypeScript/Vite and verifies 28 exported models with finite geometry.
The existing large-chunk warning remains. Fresh browser acceptance and live
activation remain pending; a source push is not a deployment.

The geometry correction was pushed as `14c0e9ee`. Andrew repeated the immediate
push request. The next bounded source push adds the artwork homepage, separate
studio route, OSS/AI disclosure, actual 24-task build board and 88-part catalog,
and temporary guest drafts with explicit import/export. Account saving remains
unfinished; no login or deployment completion is claimed.

Fresh maxipaxi checks: `just check` exited 0 with 55 tests and 13 subtests,
Ruff checks and grant ledger verification passing. `just cockpit-check` exited
0 with 20 Bun tests, TypeScript/Vite build and 28 model checks passing. The
existing large-chunk warning remains. New-page browser acceptance is pending.

Status: bounded source changes verified locally and ready to push; broader
backlog, authenticated persistence and release verification remain active.
