# P053 — Produce actual 3D schematics

Andrew: “get some real 3d schematics done!!”

Immediate priority: Codex builds actual model geometry and renders dimensioned
orthographic and isometric attachment sheets. Include both landed and suspended
configurations, loop/triangle/webbing details, three outward projector arms with
rain covers, entry and compliant seating. Export reusable 3D files and image/PDF
views from that geometry. These replace stylized flat diagrams as the technical
submission drawings. Label nominal sizes and unresolved interfaces; no invented
member capacities or fabrication approval. Preserve earlier visual concepts and
the $3,000 total cap. Website/PR work resumes after these attachments.

## Local completion

Four editable Blender assemblies and matching GLBs, ten actual model renders,
five-page dimensioned PDF and six form-sized PNGs are complete. Both diameters
have independent loop elevations and inner shells. The entrance tunnel remains
distinct from the illustrative cutaway; seated scale witness, compliant floor,
triangle lifting points, three optical heads/covers, detachable legs and hung
webbing/collector/host are present.

Blender build and four exported-GLB re-import checks exited 0. Checks cover
finite geometry, sphere diameter/top, head positions, three heads/covers,
configuration-specific legs/webbing and pads on the ground. All five final PDF
pages were visually inspected; PDF text and all six PNG decodes passed.
Ruff passed for all three scripts. Pytest remains paused.

See `docs/grant-3d-guide.md` and `assets/grant-3d-catalog.json`. A durable copy is
at the main checkout's `deliveries/grant-3d-p053/`. Remote storage and website
activation are pending. These are nominal layout models, not load calculations,
fabrication instructions or validation of occupied suspension. The budget
draft does not include priced projection/suspension. Two existing cockpit Bun
tests remain red and block the separate P042 merge; this packet does not fix them.
