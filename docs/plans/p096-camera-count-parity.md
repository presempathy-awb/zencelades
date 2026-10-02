# P096 — Parts camera count follows the common holder

Current precedence: P095 resolved the layout question and P098 approved the Go
service and pgx dependency. Those approvals are not still pending. P108 later
published and browser-verified the two-inside-phone primary lander and Parts
defaults. The complete interactive 0/1/2 camera-to-export path has local test
coverage below, but this record does not establish its full browser acceptance.
Production account deployment and authenticated saves remain unfinished.

Goal-derived work under Andrew's existing requests for cameras, selectable
parts/models, all prior prompts and green tests. This is not a new user prompt.

Observed gap: PartsPlan exposes 0–2 cameras, but App/SceneView do not send that
choice to buildModel or the GLB exporter. The existing live-overlay study always
shows one inside camera and the camera-arm study always shows one outside camera.

Implement selected counts through the existing builders and exports, retaining
those studies' location semantics and the fixed proposal's two-phone baseline.
Common lander/aerial/truck studies show optional interior camera witnesses for
participant capture; external-arm studies retain triangle-based camera arms.
These witnesses show counts and intent, not validated product placement or fit.

Verify zero removes all camera witnesses, one/two produce that exact count,
shared triangle/ring and entrance remain unchanged, and GLB matches selection.
Do not silently change the fixed grant budget from Parts experiments. The layout
clarification, backend approval and fresh browser verification remain pending.

The geometry/export regression run failed before implementation (four failing
cases, including missing camera meshes in all three hosts' exported GLBs).
After wiring App → SceneView → buildModel → seedGeometry → basketGeometry and
the same count through exportModel, the complete Bun suite passes: 39 tests,
686 assertions. TypeScript, Vite and 31 generated native/GLB model checks pass.
Existing bundle-size warnings remain. The selected capture cameras are meshes;
the exported scene still contains no viewer camera or ground plane. No new
dependency or service was introduced. Browser recheck, rendered-DOM design
lint, deployment, and account persistence remain unverified or unfinished.
