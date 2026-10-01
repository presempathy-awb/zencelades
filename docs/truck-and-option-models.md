# Zenceladus — truck and support model register

P019/P020, September 30, 2026. Andrew identifies a **2021 Ram 2500 Laramie
Mega Cab 4x4**, **factory rear receiver** and **original Andersen Ultimate**.
These models are dimensioned layout studies, not OEM manufacturing CAD or
an engineered lifting system. The existing v3/v4 GLBs remain unchanged.

## What can be selected

The eight priced concepts each have a model: ground light, curved half-screen,
ground cradle, fixed bed, fixed pedestal, existing host point, fixed truck
cantilever and freestanding gantry. Their selected budget remains linked.

Nine additional studies cover receiver crane with ground leg, bed-corner
material crane, short chassis mast, truck-adjacent portal, trailer portal,
tall four-leg aerial rig, single-tree suspension, two-tree highline and
Fixed15 rebuilt around the dimensioned truck. These studies have no complete
project estimate. Selecting a reference never silently selects a budget.

Three hardware views isolate the Ram, receiver and original Ultimate. That
makes **20 generated studies**, plus the **three untouched v3 A/B and v4 GLBs**.
The commercial crane studies show small material loads; they do not imply
that their short booms fit or safely support the full-size globe. The aerial
study is generic; the X-POLE, JuggleGear, ACHILLE and Uplift comparisons remain
in the mount research, without pretending to have exact product CAD for each.

## Geometry, datums and accuracy

New models use metres and Y-up. For the truck, the rear axle is X=0, front is
negative X and width is Z. The supplied GLBs also use Y-up metres, while the
original STEP files use millimetres and Z-up. No original is rescaled or edited.

| Published Ram datum | Used value | Evidence |
| --- | ---: | --- |
| Overall length | 6.348 m | 2021 press specifications p10 |
| Wheelbase | 4.074 m | p10 numeric row; heading calls it 160.5 in, row says 160.4 in |
| Height | 2.036 m | p10, curb weight / standard tires and wheels |
| Front / rear track | 1.745 / 1.729 m | p10 |
| Closed bed floor length | 1.9385 m | p7, 6 ft 4 in box |
| Cargo width / between wheelhouses | 1.6869 / 1.2954 m | p7 |
| Bed depth | 0.5111 m | p7 |

[Ram's manufacturer specification PDF](https://s3.amazonaws.com/chryslermedia.iconicweb.com/mediasite/specs/2021_RAM_2500_3500_HD_SPhm1sepjdo9eoujkapnjtrf1c2c.pdf)
is preserved locally. Metric values are used directly; rounded inch and
metric columns are not blended to create invented precision.

The press sheet lists 2.120 m width at SgRP. A
[Ram body-builder chart](https://www.ramtrucks.com/BodyBuilder/service/Image?imageId=MtQrP%2FFqLY5r%2Fest8MtGjGgHzAHGUTU0WB3rWuqSY7YmQ2vEhuBWBJGmi4So8FAO%0A)
lists 2.0174 m maximum body width for Crew Cab, a different cab/datum. The
model uses 2.0174 m as a **provisional body envelope**, not a verified Mega Cab
surface width. The matching Mega Cab chart has an unresolved YEAR placeholder
and its direct download returned 403. Those discrepancies remain open.

The long Mega Cab greenhouse, four doors, open bed, wheel tubs, hood, wheel
arches, grille, lights, mirrors, running boards, frame and hitch are modeled.
White paint and chrome follow the concept reference. Surface curves, mirror
configuration, rim design, front/rear overhang split and mechanical detail are
illustrative. An 18-inch / 275/70 tire envelope is provisional; actual tire and
suspension equipment have not been identified. Bed-floor height 1.0 m, receiver
height 0.55 m, receiver pin inset 0.13 m and gooseneck over the rear axle are
explicit **layout assumptions**, not measured fitment.

## Factory receiver and original Ultimate

[Mopar's 2021 Ram parts listing](https://store.mopar.com/v-2021-ram-2500--tradesman--6-4l-v8-gas/frame-bumper-and-fascia--trailer-tow-and-tow-hooks)
describes the factory 2.5-to-2-inch adapter. The model shows a 63.5 mm receiver
opening. Wall thickness, crossmember shape, brackets, welds and pin location
remain approximate. The pin is shown detached for inspection. The listing is
not a VIN-specific part confirmation and no aftermarket receiver is assumed.

For the original Ultimate, the model uses **pre-Gen-3 standard #3220** geometry
from Andersen's January 2022 manual, preserved from a retailer's document CDN:
[manufacturer-authored manual, pp4–5](https://parleys-diesel.sfo3.digitaloceanspaces.com/media-uploads/ITeIjpwUdmJCubeSwBKxBQRT24pMks4mrWBxKYd9.pdf).

| Dimension | Original reference | Gen 3 comparison, not used |
| --- | ---: | ---: |
| Base length | 31½ in | 31½ in |
| Base width | 35⅝ in | 29⅝ in |
| Base height | 13 in | 14 in |
| Low / high ball top | 16½ / 18 5/16 in | 17 9/16 / 19 9/16 in |
| Drawing's horizontal column spacing | 5 7/16 in | 3¼ in |

The older footprint is 0.8001 × 0.904875 m. Lower ball setting is displayed;
the installed setting and exact older revision still need checking. Frame
members, joints and bolts are schematic. The detached trailer-side coupler is
an exploded reference, not an approved adapter to the art structure.

[Andersen's current installation page](https://andersenhitches.com/pages/ultimate-connection-installation)
links the Gen 3 manual; it was downloaded and inspected **for comparison only**.
The project does not mix its smaller footprint into Andrew's original hitch.

## Libraries and deliverables

The browser uses the existing Babylon 9.26.1 core/loader. Scene primitives,
camera presets, dimension guides and native serialization need no additional
runtime package. `@babylonjs/serializers` at the matching version is a
**build-only dependency** for portable GLB output. The new model source is
project-authored; no third-party commercial meshes were copied or purchased.

The build writes independent models and a SHA-256 manifest under
`cockpit/public/studio-models/`. Native `.babylon` JSON retains component names
and metadata. GLB is the portable interchange format. The source models remain
procedural and reproducible. Each study downloads independently; no ZIP is
needed for this set.

[glTF Transform](https://gltf-transform.dev/) would be useful for optimizing a
future high-detail licensed mesh or scan. It is not installed: these studies
use reused solid materials and no large textures. Draco/Meshopt/KTX2 decoders,
React Three Fiber, Three.js, physics engines and CAD kernels are unnecessary
for the current viewer. A physics animation cannot establish lifting capacity.
For a genuinely surface-accurate truck, the missing input is an appropriately
licensed exact-cab mesh or a measured scan, not another renderer.

## Verification boundary

Headless geometry and datum checks are separate from browser visual acceptance.
The first test run failed because the model implementation was absent. After
implementation, six Bun tests pass (two geometry/datum and four scenario tests).
No pytest or physical trial ran. Current build, GLB round-trip and browser
results are recorded in P019's plan when performed; do not infer them here.

Zenceladus is the requested public identity. Domain registration/TLS transition
is tracked separately in P021. Historical assets and stable storage/service
identifiers retain their earlier names for provenance and compatibility.
