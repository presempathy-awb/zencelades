# Zencelades grant attachment packet — 3 m study

Prepared October 1, 2026 UTC for Andrew's P047–P050 attachment sprint.
The local upload folder is `output/grant-attachments/`. Generated binary files
are ignored by Git; their hashes and planned lakeFS keys are in
`assets/grant-attachment-catalog.json`. No new remote storage receipt is implied.

## Suggested upload order

1. `zencelades-concept-landed-v2.png`: primary concept art, the current ground
   configuration. A participant sits in the soft inner floor; the entrance,
   shell ties, triangle, loop, detachable legs and three optical arms remain visible.
2. `zencelades-grant-schematics.pdf`: seven pages comprising both concept images,
   landed and suspended studies, projection/capture flow, interface geometry,
   and the working budget. Prefer this single PDF to separately uploading every sheet.
3. `zencelades-concept-suspended-v2.png`: the alternative installation under a
   generic aerial host, using the same holder and optical arms. No host rig is
   selected, owned or booked by virtue of this rendering.

Five separate 2200 px schematic PNGs are included for image-only form fields.
Their numbers match sheets 01–05 in the PDF. The budget sheet is a planning
worksheet; it is not a quotation or proof that the illustrated projection build
can be purchased for $3,000.

## Captions ready to paste

**Landed concept.** Zencelades places a person inside an illuminated, nominal
3 m sphere: a small human world becoming an icy moon. A padded circular loop
and low triangular holder support the sphere concept, with detachable lander
legs below and three proposed projector arms above. The open entrance and soft
inner seating floor remain visible. Concept art; equipment and structure are
subject to design review and selection.

**Suspended alternative.** The same holder and projector arms are shown below
an illustrative aerial rig. Three broad webbing paths rise from the triangle
corners over the sphere to upper hardware and a halyard. The visible shell ties
are distinct from the lifting attachments on the metal frame. Host selection,
skin contact, loaded balance and recovery require resolution. Concept art.

**Projection and participant.** Three arm-mounted heads are proposed to project
Enceladus imagery. Optional internal capture would blend the participant's live
image with the moon. The diagram describes the proposed signal path, not an
implemented capture system or demonstrated full-sphere coverage.

## Consistent facts for the form

- Andrew selected the **3.0 m outside-diameter study**. At a 1.7 m centre, the
  sphere top is **3.2 m, approximately 10 ft 6 in**, before suspension hardware.
  The inner 2 m envelope and 4.8 m host height are illustrative inputs.
- The illustrated triangle has 1.8 m centre-to-corner radius (3.12 m sides), a
  1.83 m seating loop, and 2 m arms at 30 degrees. The proposed 2.2 m corner
  radius and 2.5 m arms are separate future variants.
- The current cash cap is **$3,000 total**, regardless of grant/owner/fundraiser
  split. Existing ground/LED allocations are $2,400 plus a $600 reserve.
  Three-head projection, optional live capture and suspension are unpriced.
- The present packet has no truck, wooden platform, water installation or
  occupied haze. The person inside is essential to the concept.
- These are generated illustrations and nominal schematics, not photographs,
  fabrication drawings, verified capacities or an approved occupied installation.

The source for the HD146X flat-screen throw ratio is
[Optoma's product specification](https://www.optomausa.com/product/HD146X).
At a 2.75 m lens-to-flat-screen distance, a 1.47–1.62 ratio gives a 1.70–1.87 m
image width. This does not establish coverage, focus or overlap on a sphere.

## Reproduction and provenance

`scripts/grant_attachment_sheets.py` uses the bundled ReportLab/pypdf runtime.
It reads the existing seed allocation from `assets/seed-options.json`, writes
the combined PDF and geometry JSON, and keeps component PDFs under `tmp/pdfs/`.
Render the components with Poppler for separate PNGs. No production dependency
was added. Image-generation prompts are preserved individually in
`docs/visual-prompts/`; original generated files remain in the tool's output directory.

Validation: Ruff passed; all final PDF pages were rendered and visually read;
PDF readback checks the selected 3 m dimensions, throw calculation and budget
totals. No pytest, grant submission, lakeFS upload or deployment occurred during
this attachment sprint. PR/merge and cockpit changes remain tracked under P042.
