# Erebe and Much Ado reuse audit

P067 follows Andrew's request to get the best of both projects. This is an audit
of local source plus a bounded implementation, not a claim that either reference
application was freshly deployed or browser-tested.

Subsequent delivery: P068 deployed these controls and versioned links in release
`59496114`; current lander/aerial views and model images were browser-verified on
the existing project hostname. See [repair evidence](plans/p068-black-models-deploy.md)
for the corrected domain, DNS limitation and original archive-viewer issue.

## Source boundaries

Erebe was inspected at working commit
`bbf81794de537436244781f0543dd777d460a3e1` with no working diff. Much Ado was
inspected at `5cd1dd7dc8907569bd174dc0eb18bdee9bfc7f2e`; its existing planning
document changes were left alone. Neither repository was edited.

Erebe's simple crew site and its richer `deliveries/R16` configurator are
different surfaces. R16 documents an unresolved full application build; its
source patterns are useful, but this audit does not promote it to a verified
production dependency. Much Ado's archival geometry uses inches; Zencelades uses
metres. Geometry, credentials, project identity and cost rules are project-specific.

## Applied and already present

| Pattern and source | Zencelades disposition |
| --- | --- |
| Erebe `site/src/main.ts`: explicit zoom, rotation and reset controls alongside orbit navigation | Added a **Move view** disclosure with zoom in/out and 30-degree left/right rotation. Zoom respects camera limits. Existing preset views and reset remain available. Buttons use 44 px minimum targets. |
| Much Ado `shared/fabrication-downloads.ts` and its byte-checking test: full SHA-256 version in download URLs | Added the packet manifest's SHA-256 to attachment links on the generated home, mounts and model gallery pages. Verified 37 links against actual output bytes. Archived source/download HTML is not rewritten. |
| Much Ado `src/components/sculpture-viewer.tsx` and `fabrication-preview.tsx`: lazy loading, cleanup, readable failure states and source downloads | Lazy 3D loading, lifecycle cleanup, status and GLB downloads already exist. Added a direct link from Dimensions & accuracy to the rendered gallery/source files so viewers can reach the grant models. |
| Erebe R16 `src/domain/config.ts` and `src/components/App.tsx`: validated scenarios drive options and estimates, with local recovery and import/export | Existing Zencelades scenario validation and shared option/budget/resource state cover the core pattern. Existing tests cover its domain behavior. This pass does not claim R16's undo, named scenarios or every export feature were copied. |
| Erebe drawing-control records and lessons: source drawings govern decisions; missing rates remain unknown | Keep nominal dimensions, provisional interfaces, allocations versus quotes and engineering gates explicit. The workbook comparison remains attributed to the supplied workbook. Rendered geometry does not establish an occupied suspension rating. |

The existing Vite/React, Babylon, TanStack, ReactFlow and Tailwind stack supports
these changes. No production dependency was added; a second 3D viewer library
would duplicate the current engine for this scope.

## Remaining implementation work

These are recorded gaps, not completed features:

1. Use the corrected clear-front grant GLBs in the cockpit and produce the
   lower-count projector variants. The current cockpit's procedural model and
   the grant gallery are separate representations; preserve the open entrance,
   flanking front legs and rear leg when unifying them.
2. Connect the selected one/two/three-projector option to the latest sourced
   prices, quantities and inventory. The $3,000 allocation is not a quote, and
   the newly supplied workbook is not yet a runtime pricing database.
3. Add component selection/isolation and connect a selected physical component
   to its parts/cost evidence when the model identifiers and ledger are aligned.
   Much Ado's picking/hiding and Erebe's work packages are appropriate precedents.
4. Implement per-person server persistence against the project's own API and
   PG18 boundaries. Much Ado's cancellable TanStack requests and retry states are
   useful patterns; copying its identity or substituting local storage would not
   complete this requirement.
5. Land the attachment-preserving build path before relying on future routine
   deployments. URL versions help refresh changed files but cannot restore files
   omitted by an older deployment pipeline.

Truck variants remain deferred. Pacinman import and the grant application remain
separate tracked work. This audit neither completes nor cancels them.

## Verification

All commands below ran on maxipaxi in the triangle-projection-cockpit lane:

- `bun test` in `cockpit`: exit 0, 15 passed, 0 failed, 267 expectations.
- `ruff check scripts/build_site.py`: exit 0. Biome and Ruff formatting completed.
- `just site-build`: exit 0, including TypeScript/Vite and import checks for 28
  GLBs. The build preserved 132 original and 84 v4 byte-verified downloads.
- A scoped HTML-parser check failed on an unversioned link in the baseline
  build, then passed all 37 attachment links after this change, comparing each
  full hash with the file bytes. Its script and build log are in
  `~/.cache/codex/p067-reuse/`. A later invocation with the system `python3`
  failed on modern type annotations; rerunning through the repository's pinned
  runtime with `mise exec -- python` passed all 37 links, exit 0.
- Visible local browser at `http://127.0.0.1:54164/`: model rendered; Move view
  opened; zoom out and rotate right visibly changed the scene; inverse controls
  and Reset returned it to the initial framing. No browser console errors were
  returned. Screenshot: `~/.cache/codex/p067-reuse/camera-controls.jpg`.

The existing large SceneView chunk warning remains. Narrow-screen layout was not
tested in this pass. Pytest remains paused at Andrew's request. These P067
changes are locally built and browser-checked; this record does not claim a new
commit, merge or production deployment.
