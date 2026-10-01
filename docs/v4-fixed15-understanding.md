# Enceladus Within v4 Fixed15 — intake and comparison

The supplied v4 archive is a separate, **unrated and unpriced geometry study**.
It preserves the receiver/Andersen direction while replacing the main operating
mechanisms with a fixed box-truss, a rear tower and two direct backstays.
Its **15 feet / 4.572 metres** measures horizontally from the receiver pin to
the suspension centerline. It is not the beam's stock length.

Andrew attached this package without additional request text. Embedded prior
requests, commands, approval language and test reports are source material;
they do not approve a physical design, supersede this chat's cheaper alternatives
or authorize executing supplied scripts.

## Preservation and file map

The exact original is `source/versions/v4-fixed15/Enceladus_Within_v4_Fixed15_Project.zip`:
21,993,213 bytes, SHA-256
`037594468d98332e57982fbd0aed12f58c54743501c6478147f0275d9971d847`.
Its 83 files are separately extracted under `deliveries/enceladus_v4_fixed15/`.
`assets/v4-inventory.json` and `assets/v4-catalog.json` cover **84 path records /
50,534,039 bytes**, including the original. Those records contain 82 distinct
SHA-256 values; 20 records also match bytes already in the v3 inventory.

| Area | Files | Contents |
| --- | ---: | --- |
| Original archive | 1 | Exact user attachment |
| Root | 7 | Catalog, README, change log, license, package metadata, HTML index, flat manifest |
| Budget | 2 | Five-sheet workbook and historical v3 baseline inputs |
| Configuration | 5 | Scene, example demands, blank measurement/calibration inputs |
| Documentation | 3 | Six-page PDF, technical review and sources |
| Drawings | 8 | PNG/SVG pairs: isometric, side, top, interfaces |
| Models | 5 | GLB, STEP, OBJ, SCAD, JSON |
| Previews | 14 | Ideal projection diagnostics, shared atlas, saved workbook preview |
| Reports | 15 | Saved author checks, demand/coverage data, sensitivity, build logs |
| Runtime source | 10 | Nine unchanged v3 files plus `fixed15.py` |
| Tests | 3 | Supplied regression source; not executed |
| Build tools | 8 | Artifact-generation source; not executed |
| Legacy | 2 | README and exact original v3 ZIP |
| Third-party licenses | 1 | Attribution and source limitations |

Every extracted byte matches its ZIP member. All **82 flat-manifest entries**
match size and SHA-256; the only unlisted member is the manifest itself. CRC
and exact file-set checks pass. Unlike v3, v4 uses a flat manifest;
`just assets-v4 --check` handles it without changing the v3 verifier.
The nested v3 ZIP matches the already-extracted, lakeFS-preserved original,
so its 125 members were not redundantly extracted again.

The new ZIP and nested v3 reference have **private B2** locations recorded in
`assets/v4-b2-archive-receipt.json`. Full remote readbacks matched hashes and
lengths; the nested v3 reference reused the original B2 file version. The bucket
has no lifecycle rules. Object Lock visibility was unavailable; no retention
duration is asserted. Existing v3 inventory and receipts are unchanged.

The **82 non-ZIP files / 13,257,184 bytes** have a separate lakeFS plan at
`assets/v4-upload-plan.json`, under `imports/v4-fixed15/` in
`thatsnozorb-assets`. They have **not yet been uploaded**. The scoped publisher
awaits owner PR review and rollout. No broader credential was substituted.

## What changed from v3

| Concern | v4 evidence and consequence |
| --- | --- |
| Main mechanism | Fixed centerline box-truss; no telescoping, operating boom pivot or slew |
| Truck interface | Retains Variant A receiver plus Andersen location/adapter study; no silent substitution of Variant B's chassis saddle |
| Backstays | Two symmetric direct stays to the bed adapter; equations represent combined planar effect, not individual 3D stay sizing |
| Reach | 4.572 m receiver-to-suspension versus the prior concept's 3.15 m |
| Ground support | Not drawn; this does not establish that it can be omitted from engineering or cost |
| AV | Four projectors and four internal camera roles retained; top, left, right, back; entrance hardware kept clear |
| Occupied concept | Prospective; an envelope does not establish support, enclosure, ventilation or rescue design |
| Budget | New structure, interfaces and occupied realization remain UNPRICED |
| Runtime | Nine pre-existing files byte-identical; `fixed15.py` adds statics, not new capture/reconstruction |
| Film | No new cinematic video; v3 film remains historical context |

JSON/OBJ/SCAD use **Z-up metres**, STEP **Z-up millimetres**, and GLB **Y-up
metres**. The exporter explicitly converts coordinates; the cockpit uses the
GLB without a second rotation or unit conversion. Other than the stated reach,
dimensions are unmeasured illustrative inputs. Two suspension lines share the
same frame/head and do not give independence from frame failure.

## Demand arithmetic and workbook reading

The sheets are Dashboard, Inputs, Demands, PartsBaseline and Sources. Dashboard
B6:B9 trace to reach, hanging-package moment, assembly moment and prior reach.
B10/B11 leave capacity and occupied approval unresolved. B19:C19 say UNPRICED.

The hypothetical hanging package is 400 lbf: **400 × 15 = 6,000 lbf-ft**.
Adding the illustrative boom, AV and rear-tower weights gives 820 lbf and
8,475 lbf-ft. These are arbitrary examples, not measured person/rig weights.
Independent arithmetic reproduced 13 Demands cells and four saved JSON
reactions. For unchanged tip load, 4.572 / 3.15 = 1.45142857, hence **45.14%
more tip moment**. The separate 3.05764 L-cubed ratio assumes an identical plain
cantilever; it is not a truss/vehicle deflection prediction.

The planar example gives approximately 1,262 lbf combined stay tension,
1,133 lbf bed-anchor uplift, 556 lbf rearward anchor force and 1,953 lbf
downward at the receiver. These are equilibrium demands under unmeasured
geometry and a particular restraint assumption. They are not allowable loads,
towing ratings or fabrication instructions. Actual connection stiffness, 3D
load sharing, member sizing, buckling, vehicle/ground stability and dynamic
cases remain outside the calculation.

PartsBaseline F15:G15 sums to **$10,500–$27,900**, matching Dashboard B17:C17.
This historical v3 clear-parts subset excludes projectors, two mixed interface/
electrical rows, fabrication, engineering, crew, transport, insurance, taxes,
contingency and occupied support/enclosure/rescue. The old four-projector rental
allowance **$2,800–$7,200** is separate; lens inclusion is unconfirmed. These are
not v4 quotes or evidence of cost reduction.

All workbook cell/formula records were inspected; no stored error value was
found. Independent arithmetic checks validate the saved default examples.
The file was not recalculated in Excel and no native input-mutation test is
claimed. The supplied workbook preview was viewed without modifying the file.

## Optical and physical evidence boundaries

The saved report states **86.44% coverage / 13.56% uncovered** for an ideal
diffuse opaque sphere. It excludes shell transparency, far-wall ghosting,
person/rig shadows and actual lens photometry. No projector or haze experiment
occurred. Andrew's owned hazer remains $0 acquisition for a separate unoccupied
trial during normal blower inflation; the attachment does not change that.

Fresh checks reached Andersen's [installation page](https://andersenhitches.com/pages/ultimate-connection-installation),
which supplies towing-product references. It does not approve this boom or its
uplift/reversal demands. The [CPSC water-walking-ball warning](https://www.cpsc.gov/Newsroom/News-Releases/2011/Consumer-Alert-CPSC-Warns-of-Deadly-Danger-with-Water-Walking-Balls)
remains an independent concern for an airtight occupied ball with outside-only
opening. Stronger rigging does not resolve its suffocation and drowning risks.

The source cites ANSI E1.43-2025 from a publisher summary. A fresh request to
[ESTA's published standards](https://tsp.esta.org/tsp/documents/published_docs.php)
returned HTTP 403. The full standard was not inspected; no clause-level
compliance or applicability determination is claimed.

## Integration and verification limits

The local cockpit offers **v4 Fixed15** as a separate 3D reference with an
UNPRICED label, an 84-record collection, PDF link and this comparison. All
84 downloads are copied byte-for-byte. The eight cheaper dry-land options retain
their estimates and optional external capture; selecting v4 does not apply one
of those prices to it.

Browser acceptance and cockpit publication remain pending under Andrew's supplied
computer-control rule. Preserved files and this comparison can be published
separately through the existing download routes. No live cockpit, grant submission, contact,
physical trial or approval is claimed. `assets/v4-inspection-receipt.json`
separates fresh arithmetic/source inspection from the author's saved 47-test
and CAD roundtrip reports. No bundled code or pytest ran. An optional fresh
`trimesh` reload was unavailable because the bundled runtime lacks that library;
none was installed, and the saved finite-geometry claim is not freshly verified.
