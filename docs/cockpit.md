# Zencelades project studio — P017–P056

The single-page cockpit is implemented in `cockpit/` and built into the local
site distribution. P045 authorizes local browser acceptance. P056 authorizes
the PR, merge, deployment and temporary public access; release receipts record
which revision has actually reached the live site.

## What is implemented

- **Unified header:** a single desktop row holds the brand, section and view
  buttons, column choices and account controls. Import and export use labelled
  icon buttons. The brand subtitle is omitted from the toolbar and the column
  group keeps its accessible label. Multiple columns retain independent view
  selectors below the utility row; narrow screens wrap without hiding primary
  navigation in menus.
- **Page fit implementation:** the shell uses a fixed viewport. Long-form pages
  use section selectors; functional forms keep their controls together in a
  contained reading panel. The homepage stacks lander and aerial images with
  the introduction and Showtime preview beside them. This is the layout contract,
  not a claim that every route and screen size has passed browser acceptance;
  release receipts record the exercised routes and sizes.
- **Music & sound prompts:** the private studio build offers eight Suno music
  prompts and sixteen ElevenLabs effect prompts with prompt-text copy, settings
  and source-document downloads. Public `/#/audio` links to the authenticated studio. Route
  activation and login proof are tracked in [the access contract](private-studio-access.md).
  Generation and adaptive Showtime audio playback remain deferred.

- **Model:** 28 generated studies retain the complete source archive, while
  active selectors exclude deferred truck and hitch studies. The occupied studies
  include the common ring/triangle on detachable lander legs, webbing over the
  sphere, an aerial rig, external tripod and optional triangle camera mounts.
  The wooden platform is removed by P041; an older rigid cradle and open-entry
  scenic alternative remain references. The Ram, factory
  receiver and original Andersen remain archived using the sourced datums in the
  [model register](truck-and-option-models.md). Projected holder studies carry
  three aimed heads, rain covers and an optional inside-camera witness.
  These additions are unpriced beyond the $3,000 LED allocation. Orbit, zoom, reset, side/rear/top
  views, dimension guides, GLB downloads and wireframe controls are implemented;
  WebGL/load failures leave an explicit
  message. Hidden model views do not render scene frames.
- **Budget:** editable line allowances, rental days/rate/discount, contingency,
  tax and documented credit; every alternative is compared under the same
  assumptions. Both the older pricing page and cockpit import the same pure
  calculation. The default occupied ground basket allocates $2,400 plus a $600
  reserve, within Andrew's $3,000 TOTAL DIY cap. Labor is in-kind. These are
  procurement ceilings, not found quotes. The suspended basket and host remain
  unpriced references; selecting them retains an explicitly separate ground
  budget. The earlier $19,300–$39,675 ground-cradle estimate is a historical
  unoccupied projection comparison, not the current baseline. Possible grant,
  owner and fundraiser contributions never reduce the build cost or count
  automatically as confirmed cash.
- **Workflow:** React Flow presents the selected support's planned setup
  sequence. Select a node for its requirements; move nodes and pan/zoom for
  inspection. Node positions are a temporary view, not exported planning data.
  No node indicates that a real approval or physical test has occurred.
- **Parts:** the published studio filters the 88-record catalog by 2.5/3 m
  lander or suspended holder and open-surround configurations. LED or one/two/three
  projector choices, zero/one/two cameras, ring/host/projector alternatives,
  holder arms versus stands and optional equipment are explicit. Selecting a
  known occupied model updates its parts configuration and depicted head count;
  unrelated historical studies preserve the parts plan. Common-holder studies
  follow selected sphere diameter, projector count and capture-camera count in
  both the viewer and current GLB export. Camera-count wiring is source-tested
  but not yet deployed; the fixed Love Burn proposal retains its two-phone
  baseline. Host, stand and other procurement choices do not regenerate the
  model. Shared parts appear once;
  unselected alternatives are excluded and listed as unresolved decisions.
  Unknown prices remain unquoted and prevent a complete total. Owned hazer/tool
  acquisition does not include operation or inspection. The view uses the public
  planning catalog, not private live Pacinman records. Release `55a27320` and
  its public byte readback are recorded in [Parts verification](parts-plan-verification.md).
  New-view browser acceptance remains pending.
- **Research:** TanStack Query loads the occupied-basket, grant and mount registers and
  132-file v3 catalog and separate 84-record v4 catalog. Search, collection switching and pagination operate on
  those records. Source links and downloads retain their existing targets.
- **Scenario:** validated temporary state, JSON import/export and a committed
  design note persist across studio views while the page stays open. Reloading
  resets guest changes. Export explicitly preserves the scenario and build-board
  progress and parts choices in a file; invalid imports retain the current scenario. Account saving
  and login remain unfinished. The
  large hazer is already owned: $0 acquisition, externally below the sphere,
  with no inflation connection. Consumables remain unpriced. An inside-camera
  geometry study represents the proposed portrait overlay; it captures no video.

The footer links the public Gitea and GitHub sources and the six-page dimensioned
grant PDF. The site builder verifies every file in the 36-file P055 delivery
catalog before copying it to `/attachments/`. The physical studies remain
concept geometry, not fabrication approval or occupied lifting approval.

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

Latest P041 evidence on maxipaxi: `bun test` exits 0 (15 tests, 5,649 assertions),
`just site-build` exits 0, 27 native/GLB model pairs pass hash/component/bounds
readback, and `bun run verify:http http://127.0.0.1:59063` exits 0 with 198 matching
studio files and six legacy routes. The earlier concurrent film failures were
resolved by its owner without basket changes. The Vite SceneView chunk warning
remains (984.27 kB / 239.23 kB gzip). Browser interaction is untested, and no
cockpit release was activated. [Receipt](../assets/basket-verification.json).

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

Git/JJ metadata was created by concurrent work on September 30, after P017's
initial implementation. A `media-index` Gitea remote now exists from concurrent
work; this chat has not claimed that remote's changes or made a cockpit PR/merge.
Do not run a whole-site deploy from the mixed local distribution: another chat
owns naming work. The selective publication packet is prepared from the current
immutable live release, with every non-cockpit entry retained. It must be
replanned if that live release changes before activation. The browser acceptance
step must cover actual controls, models, narrow layout and console failures
before publication. New infrastructure and per-person identity remain separate.

## Verification record

P056, October 1 UTC: 15 Bun tests / 267 assertions pass. All 28 model pairs
pass native/GLB reload, component, bounds and SHA checks. TypeScript/Vite and
the complete site build pass; Ruff check and format pass for the six Python
files changed by this lane. Pytest remains paused.

The local visible browser rendered the lander, switched to the suspended rig,
opened the geometry disclosure, and edited draft grant/owner contributions
without altering the $3,000 cost or claiming secured funds. Source links and
the grant PDF target are present. Export's browser download observation timed
out; no browser import/export success is claimed (JSON round trips pass in Bun).

Initial browser rendering failed because the local stdlib server's backlog of
five dropped concurrent module requests. The unchanged workload failed 131 of
148 requests. Using the OS backlog limit in `PreviewServer` passes all 148;
the retained HTTP verifier reproduces failure against the old running server
and passes against the fixed one, including 200 file hashes and six legacy
routes. This is a preview transport fix, not a change to production Caddy.
The existing large lazy-scene chunk advisory remains.

P019 update, September 30: the complete Bun suite passes **6 tests / 78
assertions**, exit 0. Every generated GLB is imported by Babylon's actual
loader and checked for retained component names and finite world bounds;
all 20 models pass native/GLB SHA-256 readback. The production build exits 0,
with the existing >500 kB lazy 3D chunk advisory (983.00 kB, 239.55 kB gzip).
The assembled preview serves all **181 studio files** with matching SHA-256,
required root security headers and six working legacy routes. This is
headless/HTTP evidence; browser visual/interaction acceptance remains pending.
Pytest has not run in this work. Earlier checkpoints below remain historical.

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
