# Zencelades real 3D grant packet - P055

The packet is preserved in the main checkout at `deliveries/grant-3d-p055/`.
Its working output is `output/grant-3d/` in the triangle-projection-cockpit lane.
The byte-level inventory is `assets/grant-3d-p055-catalog.json`; remote publication
remains pending. These are editable nominal layout studies, not approved
fabrication or occupied-suspension designs.

## Files and suggested sequence

| File | Purpose |
| --- | --- |
| `Zencelades-3D-Schematics.pdf` | Six sheets: landed cutaway; orthographic dimensions; suspended assembly; frame detail; two sizes; owned hazer. |
| `UPLOAD-PHOTOS/01-Concept.png` | Opening experience image; disclose AI-generated concept art, not a built prototype. |
| `UPLOAD-PHOTOS/02-Lander-3D.png` | Actual model render with entry, soft inner floor and shared holder. |
| `UPLOAD-PHOTOS/03-Plan-Elevation.png` | Orthographic views and full assembly dimensions. |
| `UPLOAD-PHOTOS/04-Frame-Details.png` | Sphere hidden to show ring, triangle, optical arms and detachable legs. |
| `UPLOAD-PHOTOS/05-Suspension-3D.png` | Conditional alternative with webbing, collector, halyard and generic host. |
| `UPLOAD-PHOTOS/06-Size-Options.png` | Separate 2.5 m and 3 m studies, not two sizes claimed for one design. |
| `UPLOAD-PHOTOS/07-Owned-Hazer.png` | Large already-owned unit below the lower sphere edge; generic envelope and $0 equipment purchase. |
| `Zencelades-Budget-DRAFT.pdf` | Separate budget allocation. Unquoted; optics and suspension are not priced into it. |

Lead with images 01-04. Include 05-06 if the application explains the conditional
alternatives. Image 07 documents the owned external effect. All seven PNGs total
**5,596,086 bytes**; the largest is **2,644,535
bytes**. They fit the live form's stated photo guidance: preferably no more
than 5 MB each and below 20 MB combined. No upload was attempted.

The live form has a separate required budget field accepting PDF, XLS or CSV;
it prefers printable PDF. It also accepts an optional public video link under
two minutes. The current budget PDF is not a reconciled market-price estimate
for the rendered assembly. Keep the $3,000 total cap and close the quote gap
before representing the complete project as funded. See `Form-Strategy.md`
for field details, captions, primary grant guidance and a spoken-video outline.

## Editable assemblies

| Model stem | Sphere | Mode |
| --- | --- | --- |
| `zencelades-3p0m-lander` | 3.0 m | Three detachable lower legs and pads. |
| `zencelades-3p0m-suspended` | 3.0 m | Three over-sphere webbing paths and illustrative aerial host. |
| `zencelades-2p5m-lander` | 2.5 m | Same triangle and arms; recomputed ring height and inner shell. |
| `zencelades-2p5m-suspended` | 2.5 m | Smaller sphere with recomputed webbing and ring height. |

Each stem has a native `.blend` and portable `.glb`. Blender files open with
the isometric camera selected. Ten raw render PNGs are included for further
layout work. `SOURCE/` contains the model builder, sheet composer and GLB
readback verifier. Geometry, camera-projected dimension anchors and modeled
bounds are recorded in `geometry.json`; readback results are in `verification.json`.

## What is modeled and what remains provisional

- A 1.829 m padded loop rests at the modeled sphere intersection, joined to a
  triangle with a 1.8 m corner radius and 3.118 m side. The circular centerline
  overhangs the triangle's inscribed circle by about 14 mm; the joints are unresolved.
- Three 2 m optical arms rise outward at 30 degrees. Each carries a head and an
  open-sided rain canopy. The landed model spans **6.618 m x 5.758 m**, before
  circulation, ballast and access. Tube/plate/head envelopes are illustrative.
- Both spheres have their center at 1.7 m. Sphere tops are 3.200 m and 2.950 m.
  The smaller sphere does not make the complete installation smaller than 10 ft
  across. Report the entire installation to Love Burn's placement/permit team.
- The small round tunnel is the actual proposed entry, nominally 680 mm and
  unverified. Large removed shell panels are a cutaway convention. Product,
  exit, ventilation, interior dimensions and occupant fit remain unselected.
- The soft dished floor and seated figure illustrate scale and compliance.
  Suspended webbing bears on the skin; contact pressure, loaded balance, joints,
  stability, recovery, wind and occupied-use suitability remain unresolved.

The generic aerial host is neither owned nor selected hardware. The three
gold arm stays are conceptual. No optical coverage, rated load, weather rating
or total build price is established by these drawings. Internal portrait
cameras remain optional and are not modeled in this packet. Truck, wood
platform and water are absent from the active concept.

P055 adds Andrew's owned large hazer on the ground under the lower sphere edge
in all four models. It stays on the ground in the suspended option. The 0.8 x
0.6 x 0.34 m body is a provisional envelope; there is no connection to the zorb.
Machine purchase is $0, while fluid, power and protection remain unpriced. See
`Hazer-Placement.md` and `Owned-Hazer-Resource.csv`. The actual model and manual
are needed to establish size, operating clearances and outlet orientation.

## Verification and provenance

Installed Blender 5.2.0 LTS generated all four assemblies and ten model renders.
Four exported GLBs were re-imported: finite geometry, sphere diameter/top,
head positions, three heads/covers, correct legs/webbing and pads at ground
all passed. A ground-pad check first caught a 47.5 mm float; the geometry was
corrected and the readback then passed. P055 added an initially failing
missing-hazer check; the regenerated GLBs passed with one external hazer each
and no body intersection with the sphere. Six final PDF pages were visually
inspected; PDF text checks and decoding of seven upload PNGs passed. Ruff passed
for all three Python scripts. No pytest run was made, per Andrew's pause.

The 01 concept image is generated artwork carried forward from P047-P050.
Images 02-07 derive from actual Blender geometry. No image is evidence of a
completed physical prototype. The live form was inspected read-only; no
application data, uploads, consent changes or submission occurred. This packet
does not claim a website deployment, PR merge or new lakeFS/B2 publication.
