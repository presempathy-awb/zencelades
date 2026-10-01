# Enceladus Within project studio — P017

The single-page cockpit is implemented in `cockpit/` and built into the local
site distribution. **It is not yet deployed or browser-accepted.** Andrew's
approval of the newly requested browser scope is still pending. The existing
live project and its research pages remain the published version.

## What is implemented

- **Model:** eight support schematics share the same selected option as the
  estimate. The supplied A/B and v4 Fixed15 GLBs load separately as archival references, with
  explicit metre/Y-up provenance and a warning that their geometry does not
  represent the selected price alternative. Orbit, zoom, reset, top view and
  wireframe controls are implemented; WebGL/load failures leave an explicit
  message. Hidden model views do not render scene frames.
- **Budget:** editable line allowances, rental days/rate/discount, contingency,
  tax and documented credit; every alternative is compared under the same
  assumptions. Both the older pricing page and cockpit import the same pure
  calculation. The default ground-cradle cash range is $19,300–$39,675:
  $9,500–$25,800 in line allowances, $5,940 hire, then 25% contingency.
- **Workflow:** React Flow presents the selected support's planned setup
  sequence. Select a node for its requirements; move nodes and pan/zoom for
  inspection. Node positions are a temporary view, not exported planning data.
  No node indicates that a real approval or physical test has occurred.
- **Research:** TanStack Query loads the actual grant/mount registers and
  132-file v3 catalog and separate 84-record v4 catalog. Search, collection switching and pagination operate on
  those records. Source links and downloads retain their existing targets.
- **Scenario:** validated browser-local state, JSON import/export and a saved
  design note persist across studio views. Invalid imports retain the current
  scenario. Storage failure is visible and export remains available. The
  hazer is already owned: $0 acquisition; enabling it adds the unoccupied
  trial during ordinary blower inflation. No internal cameras are introduced.

The scene uses illustrative primitive envelopes for the cheaper options. It
does not perform structural, wind, attachment, projection-coverage, haze or
human-occupancy validation. Optical trial consumables and effort have not been
priced simply because the machine is owned.

## References and implementation decisions

Hot Goddess Hot Pen's corrected hostname is
`hotgoddesshotpen.muchadoaboutoneside.com`. The current Much Ado
`practice-design/main` lane supplied its toolbar, fixed work surface, inspector
and bottom-strip patterns. Walterville's product name in source is
`walternship.com`; its `WalterWorkspaceShell` supplied the persistent workspace
and focused-pane approach. Only generic UI source was inspected, not housing
records. Web reads of those sites were inaccessible; their live visuals have
not been verified in this task.

[P016's pinned reuse map](plans/p016-muchado-erebe-3d-reuse.md) records the
Much Ado and Erebe paths/revisions. The new scenario keeps Erebe's useful
selection → scene/estimate/workflow relationship. It uses Much Ado's Babylon
stack and a locally owned shadcn Button pattern; it does not copy the snake's
units, parts or material mapping. The generated
[working design concept](design/p017-cockpit-concept.png) guided the layout;
it is a design reference, not a screenshot of the implementation. Its decorative
text and rendered physical claims are not requirements.

Vite/React, React Flow, Tailwind 4, shadcn and TanStack were explicitly requested.
Versions come from the inspected Much Ado manifest and are locked. TanStack
Router uses [hash history](https://tanstack.com/router/latest/docs/framework/react/guide/history-types)
to retain static hosting. Tailwind uses its official
[Vite plugin](https://tailwindcss.com/docs/installation/using-vite).

The desktop has a stable central workspace, support rail, collapsible inspector
and note strip. Narrow screens stack those controls and make the workflow and
tables scroll within their appropriate surfaces. The layout has keyboard focus,
labelled controls and reduced-motion styling; responsive visual and keyboard
acceptance still need the browser check.

## Local commands and publication boundary

Run commands from this project on maxipaxi. The recipe names were checked with
`just --list` in this task.

```bash
# maxipaxi
(cd ~/code/pres/make/thatsnozorb && just cockpit-check)
(cd ~/code/pres/make/thatsnozorb && just site-build)
(cd ~/code/pres/make/thatsnozorb && just preview)
```

`just site-build` now compiles the cockpit and assembles all original downloads.
The former landing/catalog HTML is at `/catalog/`. All existing pricing,
mounts, grants, naming and download routes remain in the distribution.
The unchanged Caddy content-security policy and access configuration are used.
The Vite development server is a developer convenience; use the assembled
preview for the legacy routes and production-header checks.

This directory has no Git/JJ metadata. No P017 source PR or merge is claimed.
Do not run a whole-site deploy from the mixed local distribution: another chat
owns naming work. The selective publication packet is prepared from the current
immutable live release, with every non-cockpit entry retained. It must be
replanned if that live release changes before activation. The browser acceptance
step must cover actual controls, models, narrow layout and console failures
before publication. New infrastructure and per-person identity remain separate.

## Verification record

On maxipaxi, September 30 local / October 1 UTC:

- The initial Bun test run failed because the new scenario implementation did
  not exist. The final scenario suite has **4 passing tests, 0 failures and
  23 assertions**, covering real baseline totals, all support rental counts,
  free owned haze, workflow inclusion, JSON round trips, invalid imports,
  edited allowances and credit floors. This is the complete cockpit suite,
  not the Python or broader owner-repository suites.
- TypeScript and Vite production build exit **0**. `just site-build` exits
  **0**, verifying and copying all **132 original downloads**. Ruff check and
  format check for the changed Python builder pass. Biome checks the frontend
  source, preparation/check scripts and Vite configuration without findings.
- Vite still reports its size warning for the lazy Babylon scene chunk,
  approximately **962 KB / 231 KB gzip**. Narrow imports reduced the initial
  5.8 MB scene bundle. The warning is retained; it is not a build failure or
  proof of measured runtime performance.
- Static palette calculations found one small-text pair below 4.5:1; its
  foreground was darkened. This calculation is not a rendered contrast audit.
- The actual preview's root and catalog respond with the intended HTML and
  original CSP/nosniff headers. `scripts/verify-http.ts` checks every studio
  output file by SHA-256 and six legacy routes; its receipt is recorded
  in [the preview receipt](../assets/cockpit-preview-receipt.json): **137 studio
  files match and six legacy routes respond**, exit 0. The initial six-request
  parallel checks intermittently failed with socket reset/refusal; a minimal
  batch later succeeded, and the serial integrity check passed. The precise
  transport cause is unresolved; no production-server fix or concurrency
  acceptance is claimed. HTTP success is not browser-interaction
  evidence. Pytest, rendered-DOM Impeccable, live login, visual comparison and
  browser workflow checks have **not** run for P017.

Browser-local scenario storage is the deliberate shortcut. Its upgrade trigger
is the deferred, verified per-person identity contract and project API. It is
not PG18 synchronization, shared editing or Pawthentik authorization. P011's
publisher PRs and six-PDF preservation remain outstanding; P013 stays deferred.

The historical P017 [prepared release plan](../assets/cockpit-release-plan.json) was based on
live release `722b4a3512787b76d2309588a38878ebf02f2531b5282b2c33ee024ba3fd3edc`.
Its candidate is `9d57ea76c50f5a8e284ccb013b8b2ea020218087ee71a65d3492c5ef805d6acb`:
140 overlay paths, 321 final entries, 181 unchanged entries and all 20 naming
files preserved. This is a local candidate, **not an activated release**. Its
packet/preparation helper is under the task cache `p017-cockpit`; refresh the
live base and revalidate the packet after browser fixes, before any activation.

P018 supersedes that candidate with [the v4-inclusive plan](../assets/v4-cockpit-release-plan.json),
based on `09b9b6ffc2d3182d8736e07ff73efc7bbc5937c15cae872ab1f77b7df78b9bd2`.
It adds all 84 v4 downloads, the versioned catalogue/model and comparison while
retaining 183 existing entries and all 20 live naming files. Its 412-entry
candidate is `55ab57ca5af11c545a7acb1729db19c6e3afa72c1e9402b9b1082ed1b5e1b3a7`.
The packet is local under the task cache `p018-v4`; it has not been activated.
Fresh P018 checks pass: four Bun tests / 23 assertions, TypeScript/Vite build,
139 studio-file HTTP hash matches and six legacy routes. All 84 v4 downloads
and the comparison match through the running preview; see
[the v4 preview receipt](../assets/v4-preview-receipt.json).
The v4 assets and comparison are already published independently, as documented
in [asset-only delivery](v4-delivery-verification.md). This does not activate
the cockpit or establish browser interaction results.
