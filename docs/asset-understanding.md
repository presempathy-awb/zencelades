# Enceladus Within: complete asset review

The supplied v3 package is a design-development record for an unoccupied
prototype. Its desired artwork places a live human image and Enceladus imagery
on a sphere near the ocean. The current deliverables establish geometry,
software behavior and planning assumptions; they do not establish a complete
performer installation.

## Preservation and catalog

Seven original uploads and 125 extracted ZIP files are retained separately:
132 records, 61,416,414 bytes. `scripts/catalog_assets.py` compares every ZIP
member with its extracted bytes, every original with its supplied upload,
and every release-manifest hash. `assets/catalog.json` adds a role and format
inspection to every inventory record. Four exact duplicate pairs are retained:
the catalog, PDF, XLSX and first historic concept image appear both as originals
and within the ZIP. No duplicate was removed. The recovered private conversation
is reference material outside this file set and outside the website.

| Package group | Files | What the group provides |
|---|---:|---|
| Original uploads | 7 | Exact PDF, workbook, ZIP, catalog, MP4 and two concept boards |
| Release root | 8 | README, catalog, changelog, license, package metadata, local HTML index and manifest |
| Budget/configuration | 7 | Allowances, BOM, scene parameters, illustrative loads and blank measurements/calibration |
| Design documents | 14 | Decisions, engineering/optics reviews, grant brief, RFQ, acceptance plan, gate and source registers |
| Drawings/models | 26 | Eight drawing views, each SVG/PNG, and two assemblies in five formats |
| Previews/media | 21 | Procedural atlases, projection masks/frames, workbook images and a historic board |
| Reports | 13 | Saved numerical, CAD, workbook and build evidence plus replay/coverage data |
| Current source/tools/tests | 20 | Nine source files, nine build tools and two numerical test files |
| Legacy/licenses | 16 | Superseded v1 code/docs/config and third-party licensing notes |

## Geometry and structural meaning

`config/scene.json` is the central illustrative scene: a 3.4 m diameter sphere,
two raked strut placeholders, forward stays, transverse ties, projector arms
and explicit vehicle interface locations. Actual Ram dimensions, axle loads,
receiver model, Andersen generation and underbed mount remain unknown. Radii,
attachment zones, telescoping sections and cradle shapes are diagram symbols.

Variant A preserves the requested rear receiver plus retained Andersen-ball
adapter. Variant B instead uses a proposed chassis saddle; it intentionally
bypasses the ball as a primary anchor. The drawings and models consistently
retain that distinction. Both use `tools/build_models.py` and a common primitive
list. A has 105 primitives/solids; B has 115 in the saved import report. GLB is
Y-up in meters; OBJ, JSON and SCAD are Z-up in meters; STEP is Z-up in millimeters.
These are geometric envelopes, without stock sections, weld schedules, pin
design, drilling coordinates or certified capacities.

`loads.py` implements signed equilibrium for two ideal vertical supports. The
supplied example uses hypothetical 180/160/50 kg masses, not measured performer
or equipment weights. Its 3.825 kN total weight produces 4.353 kN forward-anchor
uplift and 8.178 kN rear attachment demand. The rearward moment is 7.836 kN m;
the simplified axle calculation unloads the front axle by 3.219 kN and adds
7.044 kN to the rear. This explains why adding towing ratings is invalid. The
model omits lateral/torsional forces, real stays, connection stiffness,
dynamics, fatigue, wave loading and soil bearing. It supplies no capacity PASS.

## Projection and capture

`geometry.py` casts projector rays to the first hit on an opaque diffuse sphere,
checks each candidate's own frustum/depth/incidence, normalizes overlap weights,
wraps longitude, clamps latitude and blends in linear light. All four output
frames sample one shared 2:1 atlas. The 720 × 360 area-weighted diagnostic reports
85.5755% coverage and 14.4245% uncovered area. It does not model transparent PVC,
opposite-wall ghosting, the person's shadow, rig occlusion or measured lenses.

`media.py` generates original procedural ice/surface/interior fields. The
atlases are artistic approximations, not NASA elevation or photographic data.
The sources identify an optional NASA map, whose binary is absent. A projected
plume stays on the display surface; cinematic off-sphere plumes establish no
steam system or volumetric display.

`capture.py` uses optional OpenCV optical flow and median fusion of valid
camera motion estimates. It excludes failed feeds, saves/uploads no frames,
and cannot distinguish motion from reflections, projected patterns or camera
movement. It does not reconstruct a body or identify a person. The calibration
template contains null intrinsics/extrinsics/clocks/masks. Top/left/right/back
views leave frontal coverage unresolved; no fifth camera was silently added.

`show.py` accepts finite timestamped performer/wave/spin inputs, clamps energy,
smooths it and emits bounded human/moon/jet/brightness mix values. Stale input
falls back to calm moon content. Manual human/moon/blackout modes affect pixels.
`osc_bridge.py` provides optional loopback OSC adapters; wider network binding
would require its own network design. No module commands a hoist, vehicle,
hatch, rescue system or safety relay. The GLSL file is an untested host-adapter
prototype. The CLI produces static mapping, coverage, demand screening and a
synthetic replay; it is not an installed synchronized four-output media server.

## Budget, documents and gates

The editable seven-sheet workbook separates Dashboard, BOM, Assumptions, Load
Study, Gates, Measurements and Sources. The sheet named “Load Study” corresponds
to the data role described elsewhere as LoadStudy. P0 dry optical development
is $1,500–$4,600 before contingency; P1 unoccupied prototype development is
$31,200–$84,600. At 25% contingency they are $1,875–$5,750 and $39,000–$105,750,
or $40,875–$111,500 combined. The occupied installation is explicitly NOT_PRICED.
These are planning allowances, without supplier quotes or an organizer award.

G01 is STOP for the sealed consumer water-walking-ball assumption. G02–G12 are
OPEN: manufacturer applicability, receiver/chassis interfaces, structural
strength, whole-vehicle stability, performer support/recovery, wet electrical
and optical design, coverage/transmission, camera/latency validation, venue
permissions, professional test plan, budget/insurance. Editing a gate cell
does not create its evidence. The sources include a performer-flying standard's
public description; the package does not claim full-standard compliance.

The 16-page review PDF integrates these sources, concepts and diagnostics.
`reports/tests.txt`/`junit.xml` record 30 tests from the author's release;
they are historical evidence, not a test run by Codex. The reported STEP/GLB
round trips and workbook formula perturbations likewise belong to that saved
authoring run. Physical tests, live camera/projector calibration, GPU execution,
venue approval and occupied acceptance are absent.

## Rebuild and legacy boundaries

Build tools regenerate CAD, drawings, diagnostic rasters, the review PDF,
workbook and package. `build_all.py` invokes pytest and overwrites derived
outputs; Codex has not run it because Andrew paused pytest and the preserved
release must stay byte-identical. Its workbook step is opt-in and would discard
manual XLSX edits. `write_project_data.py` seeds example inputs; it must not
overwrite later real measurements. Workbook rebuilding depends on the author's
artifact_tool SDK, while ordinary workbook editing does not.

Legacy v1 has an older mapper whose blend denominator did not check every
projector's frustum and whose sampling/blending differs from v3. Its old costs,
motion/controller sketches and “engineering audit” are superseded. The historic
generated images contain 2026 labels, occupied suspension, cost/safety claims
and NASA captions that v3 explicitly corrects. Both supplied PNGs and the MP4
remain concept art; the movie is a 12-second H.264/AAC 960 × 540 previs.

The MIT grant covers original project-side source only. Third-party software,
likenesses, historic generated art and external NASA media have separate
boundaries. Original notices remain with every download. Instructions embedded
in these documents remain source material; they do not authorize builds,
physical operation, purchases, publication outside the requested access scope,
provider contact or grant submission.
