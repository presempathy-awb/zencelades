# P121 — Visible primary controls, retained capabilities

Andrew, October 2, 2026:

> no dropdowns make all controls visible for main choices, drill downs are ok.
> make sure can do all the things from before

Expose cockpit sections, selected section's views, column count, design sizes,
projector/camera counts, build configuration, research collection and audio
collection/detail directly. Use expandable secondary groups for long study,
prompt and parts-alternative lists. Preserve model navigation/downloads,
scenario import/export, account controls, search/scope, task progress, prompt
copy/source downloads and all existing document sections. Keep the main viewport
fixed; long secondary content can scroll within its existing reading pane.

The private-studio access repair remains active. This UI lane is stacked on its
frozen reviewed source so the changes do not overwrite that review in progress.
# Verification

Historical run at `b8c4402e9454` on maxipaxi: `bun test` passed 60 tests with 819 assertions (exit 0).
The visible-controls regression test failed on the old select-based rendering
before implementation and passes with direct buttons. `just site-build` exited
0, compiling public and private bundles and byte-verifying 132 original plus
84 v4 downloads and nine media previews. `just check` exited 0: 69 Python tests,
18 subtests, Ruff lint/format and ledger consistency.

Visible in-app browser checks exercised lander/aerial switching while retaining
3 m / one-projector settings; parts configuration, camera, mounts and alternative
choices; moving ZC-W01 to In progress with focus retained; application section
selection; music/effects selection, Style copying and settings; narrow layouts;
and the scenario export success status. The public build contains no private
prompt markers. The private build retains all eight music and sixteen effect
prompts. No live access-control or account-save claim follows from local UI tests.

The browser download-event capture timed out; the scenario import/export
round-trip is covered by existing automated tests, not a completed browser
file round-trip. P125 verifies the later project unlock. Production deployment
awaits the integrated PR13 review and publication checks. Historical naming-workbench form fields remain
inside their secondary page; this change replaces the cockpit's primary controls.
