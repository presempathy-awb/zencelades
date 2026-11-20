# Moon-only night projection phases

Three 1536 × 1024 concept stills wrap Enceladus imagery across the entire zorb
without the enlarged human face/body projection. The small occupant from the
supplied installation render remains visible, especially in the geyser phase.

| ID | Phase | File | Content reference |
| --- | --- | --- | --- |
| M01 | Whole moon ice geography | 01-moon-ice.png | E02 at 4 seconds |
| M02 | Geyser dive with Saturn rings | 02-moon-geyser-dive.png | E01 at 6 seconds |
| M03 | Under-ice ocean | 03-moon-under-ice-ocean.png | E04 at 5 seconds |

The ground-supported sphere becomes the projected moon in M01. M02 surrounds
the interior with luminous ice plumes and a ring sweep. M03 fills the suspended
sphere with an ice ceiling, blue water and vent columns. The night beach,
optical arms, support forms, sphere seams and entrance follow the input renders.
The built-in image_gen tool produced all three concepts. These are artistic
projection edits, not exact movie screenshots or measured optical simulations.
Ocean colors and lighting are artistic choices. NASA Goddard Space Flight
Center Conceptual Image Lab provided the visualization frames; Andrew supplied
the installation renders. No blanket reuse license for his references is implied.

[Catalogue](../../../assets/archive/enceladus-cinema-2026-09-30/enceladus-moon-stills/catalog.json),
[exact prompts](../../../assets/archive/enceladus-cinema-2026-09-30/enceladus-moon-stills/prompts.json) and
[upload plan](../../../assets/archive/enceladus-cinema-2026-09-30/enceladus-moon-stills/upload-plan.json) record provenance,
byte counts and SHA-256 hashes. Local selected PNGs are under
source/research/enceladus-moon-stills/derived. All three were visually inspected
and their 1536 × 1024 dimensions checked with ffprobe. Metadata parses and
selected-file hashes match. No application code changed, so code tests were not
repeated for this asset-only addition.

LakeFS delivery is prepared on a fresh ingest branch; no immutable commit or
readback is claimed. A fresh presvd1 hid-in gunlock-status check confirmed the
vault is locked. Images, manifest and owner runner are retained locally and
staged at the remote path in the catalogue for upload after Andrew unlocks it.
Previously verified media remains intact.
