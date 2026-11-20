# Night projection phase stills

Three additional [moon-only phases](enceladus-moon-stills.md) show full-sphere
ice geography, geysers and the under-ice ocean without an enlarged human overlay.

The [full sphere revisions](enceladus-night-wrap.md) enlarge the projected body
to surround the orbital and ocean spheres like Andrew's original mockup. Those
two new files are indexed separately; their lakeFS upload is pending vault unlock.

Three 1536 × 1024 night concept edits use Andrew's two installation renders,
his confirmed person/clothing reference and selected NASA video frames.
The sphere, entry opening, seams, optical arms, beach setting and support
composition follow the supplied ground/suspended renders. The projected face
and person follow the separate confirmed identity reference.

| ID | Still | Configuration | Projection content reference |
| --- | --- | --- | --- |
| N01 | 01-ground-orbital-blend.png | Ground supported | E02, surface-to-space at 4 seconds |
| N03 | 03-ground-geyser-burst.png | Ground supported | E01, geyser fly-through at 6 seconds |
| N04 | 04-suspended-ocean-glow.png | Suspended | E04, ocean vents at 5 seconds |

N01 mixes a large smiling face with fractured moon geography and a ring sweep.
N03 brings ice jets and drifting particles through the human portrait.
N04 shifts to teal ocean columns, amber vent bases and a face resurfacing above
the seated body. Warm distant festival lights contrast with the cold projected
light. These are AI-edited concept art using the video frames as references;
they are not pixel-exact projected frames, verified Babylon screenshots or a
measured optical simulation. The ocean colors are artistic choices.

The built-in image_gen tool produced the three selected stills. The separate
N02 suspended cracked-ice attempt was rejected by output moderation with a
sexual-content flag; no N02 image was returned. No safety settings were changed.
The earlier isolated portrait-cutout attempt was also rejected. The video
compositor instead uses the supplied reference-sheet pixels unchanged.

[Catalog](../../../assets/archive/enceladus-cinema-2026-09-30/enceladus-night-stills/catalog.json) records the selected
references, failures, credits, dimensions, byte counts, hashes and lakeFS locators.
[Exact prompt set](../../../assets/archive/enceladus-cinema-2026-09-30/enceladus-night-stills/prompts.json) includes all four
attempts. E01/E02/E04 imagery credit: NASA's Goddard Space Flight Center Conceptual
Image Lab. Installation and personal references were supplied by Andrew; no
blanket public reuse license for those images is asserted.

The related portrait video is an edit of the already preserved 44.267-second
NASA-based above-the-ice film, with the exact confirmed reference pixels softly
fading in and out. It is distinct from the pending 60-second Babylon recording.
See [film guide](enceladus-cinema.md) and
[portrait provenance](../../../assets/enceladus-human/catalog.json).

## Verified storage and checks

Ten individual objects / **46,522,678 bytes** are preserved in `thatsnozorb-assets`.
Branch: `ingest-enceladus-videos-night-stills-20261001`.
Immutable commit: `f264962365ba1c5398266b27036e221a9eb90df63ae9a8823a745c65d30e0600`.
Every object passed full-byte immutable SHA-256 readback; the listed file set
exactly matches the manifest. Main remains protected and unmerged. Originals,
three selected NASA frames, three stills and the portrait preview are independent
objects. [Readback receipt](../../../assets/archive/enceladus-cinema-2026-09-30/enceladus-night-stills/lakefs-receipt.json)
and [upload plan](../../../assets/archive/enceladus-cinema-2026-09-30/enceladus-night-stills/upload-plan.json) provide details.

All three stills were visually inspected and ffprobe confirms 1536 × 1024 RGB PNG.
The portrait MP4 is 1920 × 1080, 30 fps, H.264, silent and 44.266016 seconds;
ffprobe and a full `ffmpeg -v error -xerror -map 0:v:0 -f null -` decode exited 0.
Representative fade-in frames at 8, 24 and 38 seconds were inspected, including
readable source/interpretation captions. Its source portrait is limited by the
265-pixel reference region; no new facial detail or live motion is claimed.

The Babylon source's portrait fade test was first observed failing against a
placeholder and now passes across 1,800 samples. Fresh complete source-checkout
Bun suite: 19 pass / 0 fail. Fresh entire isolated film-lane suite: 6 pass / 0 fail.
Strict film TypeScript, Biome, eight-source SHA-verified preparation and dedicated
Vite build succeed. Static changed-HTML Impeccable scan reports zero findings.
The build retains a nonfatal large-chunk advisory. Browser/GPU acceptance and
recording of the 60-second Babylon film remain pending scoped approval.
