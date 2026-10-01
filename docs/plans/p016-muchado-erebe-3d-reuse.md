# P016 — Reuse Much Ado and Erebe options and 3D

Andrew's prompt, verbatim:

> can likely use a lot of options type 3d stuff from muchadoaboutoneside and erebe

Captured: 2026-10-01T00:17:01Z (September 30 local time).

Follow-up: [P067 reuse audit](../reference-project-reuse.md) records fresh source
inspection, the implemented camera controls and versioned grant links, local
verification, and the remaining model/pricing/persistence gaps. The original
comparison below remains a historical planning record.

## Intent and scope

Prefer existing Much Ado About One Side and Erebe options, configuration and
3D presentation code when building the Enceladus project interface. Codex will
inspect the actual source, identify reusable components and their dependencies,
and map them to the sphere/mount/optics alternatives already researched.
Do not assume all reference features exist or are reusable unchanged.

## Work

1. Resolve the current reference checkout and any isolated Enceladus lane;
   read their instructions and preserve concurrent work.
2. Locate existing 3D scenes, geometry/export tools, option controls and saved
   configuration mechanisms. Record source paths and revision/state.
3. Specify the smallest practical reuse boundary and the first useful project
   interface, including evidence limits and connection to current pricing data.
4. Update the durable project direction without reopening P013's deferred
   Pacinman/Pawthentik work or claiming a deployed configurator.

Status: source inspection and reuse plan complete. Implementation is queued
under the existing website work; no configurator was built or deployed in this
turn. No reference repository, preserved delivery or runtime was changed.

## Source provenance

Inspected on maxipaxi, September 30 local time / October 1 UTC:

- Current Much Ado owner checkout:
  `/Users/andrew/code/pres/make/muchadoaboutoneside`, JJ working commit
  `5cd1dd7dc8907569bd174dc0eb18bdee9bfc7f2e`, parent
  `ec0b152555cd38f1c1d80b7c48880af0fb310e35`. Its working diff contains three
  planning files; preserve those owners' changes. The older Phase 0 checkout
  under Documents was inspected first, then superseded as the reference by this
  current source. Do not copy the old snapshot's dependencies or instructions.
- Erebe owner checkout: `/Users/andrew/code/pres/make/erebe`, JJ working commit
  `bbf81794de537436244781f0543dd777d460a3e1`, empty working diff. R16 is an
  immutable delivered application under `deliveries/R16/`, separate from the
  crew-board client under `site/`.
- Existing Enceladus host integration lane:
  `/Users/andrew/code/branch/muchadoaboutoneside/enceladus-module/main`,
  `2d1a2964` at inspection. It contains the second web-module registration and
  isolation work; it is not evidence of an installed project configurator.

These are source observations. No browser, fresh reference build, deployment
check or complete test suite ran for this documentation-only study.

## What to reuse

| Existing capability | Verified source | Enceladus use and adaptation |
| --- | --- | --- |
| A single scenario drives appearance, quantities, work and unresolved requirements | Erebe R16 `src/domain/types.ts`, `config.ts`, `engine.ts`; `src/components/App.tsx` | One project-specific configuration supplies the selected mount, surface, optics, estimate and setup steps. Retain missing prices as unknown and deliberately owned items as zero acquisition cost. Replace all timber, spire and sewing rules. |
| Orbit, zoom, part picking/hiding, wireframe, reset, reduced motion and scene cleanup | Much Ado `src/pages/studio.tsx`, `src/components/sculpture-viewer.tsx`, `src/lib/sculpture-scene.ts` | Adapt the viewer lifecycle and interaction patterns to truck, sphere, support, projector and cable groups. Its asset URL, part names, camera scale and geometry are snake-specific; the component is not a drop-in generic viewer. |
| Whole/frame/exploded/inside/plan views, camera presets and component isolation | Erebe R16 `src/render/types.ts`, `src/render/babylon.ts`, `src/components/Viewport.tsx` | Useful review views for sphere shell, support and optical layout. Replace temple offsets and units; display transforms never rewrite archived source geometry. |
| Named scenarios, import/export, local recovery and undo | Erebe R16 `src/components/App.tsx`, `src/domain/config.ts`, `src/domain/export.ts` | Save a chosen layout with its assumptions, budget basis and unresolved requirements. Adapt validation to Enceladus; use existing platform ZIP support rather than importing a custom ZIP writer automatically. |
| Load models only when requested, version choices and hash-addressed heavy assets | Erebe `site/src/main.ts`, `site/scripts/build-models.ts`; Much Ado `server/modules.ts` | Preserve a usable page before 3D loads. Reuse the asset-manifest approach and the project-scoped host lane, without inheriting Erebe database, token or identity settings. |

Much Ado also has a directly relevant Enceladus-inspired six-movement treatment
in `shared/projection-plan.ts`: ice, fissures, plumes and ocean imagery with cue
exports. Reuse the content organization and operator-state ideas where they fit;
it is a plan for that sculpture, not a reusable running media renderer or a
finished soundtrack for this one.

## Important distinction in Erebe

The deployed crew-board source uses `@google/model-viewer` for selecting and
viewing GLBs. R16 is the richer assembly configurator Andrew is referring to.
R16's README explicitly says its full Vite/Babylon/React Flow dependency build
was not resolved in the delivery environment. Its recorded browser checks ran
the compatibility entry and CPU rendering fallback. Those historical checks
are not a fresh successful Babylon build.

Use R16's domain/UI approach with the existing Much Ado Babylon dependency;
do not transplant its older npm manifest, add another engine, or claim its
entire application is already hosted. Much Ado pins Babylon 9.26.1 in its
inspected package manifest. No new production dependency was added here.

## First useful Enceladus options workspace

Proposed behavior, not implemented:

1. **Choose a layout.** Start with this project's eight existing pricing IDs:
   `ground-light`, `ground-half`, `ground-sphere`, `fixed-bed`,
   `fixed-pedestal`, `existing-hang`, `fixed-cantilever`, `own-gantry`.
   Link truck/aerial/tree research where applicable. A tree is a conditional
   support candidate, not an automatically approved anchor preset.
2. **Inspect the matching scene.** Offer whole, support-only and optical-layout
   views plus front/side/plan cameras. Display actual supplied geometry for its
   matching variant; use explicitly schematic geometry for alternatives that
   have not been modeled. Never relabel the original truck model as a cradle
   or gantry configuration merely by hiding a few parts.
3. **Adjust relevant options.** Surface/diffusion, conceptual projection layout,
   external capture and environmental setting can be scenario inputs. The
   owned-hazer option means haze added during normal blower inflation with
   $0 hazer acquisition, per P015. A haze preview is illustrative, not an
   optical-density or breathing-safety simulation. Water and occupancy remain
   separately unresolved concept alternatives, not ordinary enabled defaults.
4. **Read one consistent estimate and setup plan.** Keep
   `site/pricing/options.json` and exported `calculate()` in
   `site/pricing/pricing.mjs` as the current budgeting basis. Adapt those rather
   than replacing them with Erebe's temple calculator. Owned hazer cost must
   not become a blanket credit deducted from every unrelated layout. Keep
   unspecified prices unknown and preserve allowance/source distinctions.
5. **Save a reviewable scenario.** Export configuration, source/model identity,
   estimate and open decisions together. Browser-local recovery and a download
   are the first persistence scope; shared per-person storage remains on P013's
   deferred path. Never label a local save as synchronized to PG18/lakeFS.

The current project already has two small GLBs:
`deliveries/enceladus_v3/models/v3_A_literal_dual_hitch.glb` and
`deliveries/enceladus_v3/models/v3_B_chassis_saddle.glb` (about 196/205 KiB).
They are Y-up in meters. Much Ado's archival model is Y-up in inches; Erebe's
assembly records use feet with a renderer axis transform. Make this conversion
explicit at import so a reused camera or support is not scaled incorrectly.
The original files remain unchanged. A is the literal dual-hitch concept; B
is the chassis-saddle concept. Neither represents all eight pricing layouts.

## Implementation boundary and acceptance

Prefer a small Enceladus-specific scene adapter and scenario record inside the
existing shared-host direction. Extract only genuinely common viewer lifecycle
code after checking its current callers (Much Ado studio, foil and scales);
avoid refactoring those working pages just to launch the new viewer. This study
does not require a new shared component package, table framework or flow editor.

Acceptance for the implementation: selecting a scenario changes the matching
scene, cost and setup details together; invalid imports preserve the last valid
scenario; zero/unknown/owned costs remain distinct; original model hashes and
units stay correct; missing models or WebGL failure leave pricing and downloads
usable; exported assumptions match the screen. Reuse existing behavioral checks
and verify the new UI within Andrew's browser-consent scope at that point.
The prior mount-page consent alone does not cover a new logged-in workflow.

## Evidence fingerprints

SHA-256 from the inspected files:

| File | SHA-256 |
| --- | --- |
| Much Ado `src/lib/sculpture-scene.ts` | `2a712ff3a1c87740ffccdf5da158cba9eab799a004b5e613b54fe1334138c505` |
| Much Ado `src/components/sculpture-viewer.tsx` | `8aaa23b9a42e98b604e1e4543970fee74453adf4ed3e06ef3a11808217e5ca38` |
| Erebe R16 `src/domain/config.ts` | `bb249435b38f319bfb88854b05ff3756c69a4de3fedaf1eac9a4eb34347da709` |
| Erebe R16 `src/domain/engine.ts` | `cd0de77696fb38fa55536c90be9a198e0cc3c784c5c9ad4528a2dc88e1bc814b` |
| This project `site/pricing/pricing.mjs` | `bf9473c7f948911aead04d0b6068ba56657f35726d80f226d24d4729c3402f0b` |
| This project `site/pricing/options.json` | `9214e8ebf7efb24a5bdd8e53b20a8ad6c1288b56b4fe53c5f65406b6b4a7451e` |

Read-only source searches, JJ state reads and hash commands exited 0 on the
resolved owner checkouts. Initial discovery encountered an unavailable PATH
entry for agents-config and two guessed absent reference paths; the installed
helper and actual paths were then resolved. No check was suppressed into a
runtime-success claim. Pytest remains paused.
