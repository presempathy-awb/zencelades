# Sphere size in common-holder models

The model view and Parts plan share the existing 2.5 m / 3 m configuration.
Changing diameter updates the shell, ring/triangle elevation, over-sphere webbing,
collector and dimension guides. Switching between landed and aerial holders
preserves the selected diameter. Current-view GLB filenames and metadata include
both diameter and projector count.

The six-foot ring, 1.8 m triangle corner radius, human witness and external host
remain at their nominal dimensions. At the retained 1.7 m sphere centre, the
ring centre is approximately 0.848 m for 2.5 m and 0.511 m for 3 m. The inner
shell remains a proportional display placeholder, not a measured product
interior. These are concept studies without fabrication or capacity approval.
Fixed gallery renders and source downloads retain their existing dimensions.

## Verification on maxipaxi

Before the fix, the geometry and binary-export regressions failed because a
2.5 m request still created the 3 m shell. A second reproducer showed changing
to the aerial model reset a 2.5 m plan to S30. All now pass. Geometry tests
measure shell bounds, guide width, holder height and unscaled participant;
webbing tests sample both sphere sizes. GLB tests read binary headers, nodes
and size/count metadata, excluding viewer-only camera and ground.

The visible local browser selected a 2.5 m lander with one head, changed to the
aerial rig while retaining 2.5 m, and downloaded the current GLB. Direct file
readback verified `basket-aerial-rig-2.5m-1-head.glb`: 509,588 bytes, a 2.5 m shell,
one head, all three webbings and SHA-256
`f024f8f260feccf3ff3ba11124a739087ebf0544631defca09b6648aafd6666c`.
Changing back to 3 m updated the visible dimension label. Screenshots and
rendered DOM are retained in the task's sphere-size cache.

Fresh checks: 34 Bun tests, 466 assertions, zero failures; 57 Python tests plus
13 subtests; Ruff/format/ledger; 17 Node tests. The complete site build passed,
including 28 fixed source models, 132 original and 84 v4 verified downloads.
The existing entry/SceneView bundle-size warnings remain. No dependency added.

## Gallery report

Andrew reported “gallery broken?” during this work. All ten image URLs returned
HTTP 200 with image/png. The visible live gallery decoded all ten images after
scrolling to the lazily loaded previews. Clicking the size comparison opened
the full 2000 by 1415 PNG. The browser's bare canonical URL followed an old
redirect to zencelades.com; a fresh `?verify=gallery` URL stayed on zenceladus.com
and rendered the gallery. Fresh HTTP requests did not redirect. This supports
a cached-navigation issue, not a reproduced live asset outage. The exact symptom
Andrew saw remains pending; no gallery repair is claimed.

Publication of the size change is pending the scoped release and live readback.
Login, authenticated persistence, live private inventory editing and remaining
model configuration integration remain unfinished.
