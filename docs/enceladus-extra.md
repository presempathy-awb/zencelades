# Additional Enceladus material and Orbilander

The Enceladus Orbilander is an orbiter-and-lander mission concept. The verified
[Lunar and Planetary Institute presentation](https://www.youtube.com/watch?v=NAM8SWw14vs),
**Flagship Concepts for Astrobiology at Enceladus**, is a video viewing reference.
The organizer's [OPAG presentation](https://www.lpi.usra.edu/opag/meetings/opag2020fall/presentations/Spilker_6010.pdf)
links the same video; its title and publisher were checked with YouTube oEmbed.
No freely reusable official touchdown animation was established. The Babylon
film therefore adds an original Orbilander-inspired spacecraft and imagined
landing sequence, clearly identified as art.

The [NASA NTRS mission report](https://ntrs.nasa.gov/citations/20205008712)
provides context and notes that some portions may be copyright protected.
[APL's terms](https://www.jhuapl.edu/privacy) require written permission for
redistribution. APL imagery/video and the LPI lecture are viewing references,
not clips in the reusable mashup pool.

## Four additional NASA originals

| ID | Publisher page / public viewing source | Resolution | Duration |
| --- | --- | --- | --- |
| E16 | [Enceladus: Cold Faithful](https://www.jpl.nasa.gov/videos/enceladus-cold-faithful/) | 320 × 240 | 191.060 s |
| E14 | [Deep Dive into Enceladus' Plume](https://www.jpl.nasa.gov/videos/deep-dive-into-enceladus-plume/) | 1280 × 720 | 111.467 s |
| E15 | [Enceladus: Mystery of the Icy Moon](https://www.jpl.nasa.gov/videos/enceladus-mystery-of-the-icy-moon/) | 1280 × 720 | 154.700 s |
| E13 | [Surprising Enceladus](https://svs.gsfc.nasa.gov/13692/) | 1920 × 1080 | 28.729 s |

E13 also has an English SRT caption sidecar. The
[catalog](../assets/enceladus-extra/catalog.json) records each exact download URL,
credit, SHA-256, byte count and immutable lakeFS locator. Originals retain their
soundtracks. The Babylon film uses muted excerpts only; music and other third-party
rights are not assumed to be free. Follow the
[NASA media policy](https://www.nasa.gov/nasa-brand-center/images-and-media/),
credit the named publisher and avoid implying endorsement.

An additional NASA [SmallSat constellation visualization reference](https://nas.nasa.gov/SC23/research/project42.html)
links to Vimeo video 875032632. The video downloader returned HTTP 404; no video
from that link was archived or used.

## Verified preservation

Five individual objects, **280,719,234 bytes**, are preserved in
`thatsnozorb-assets` on `ingest-enceladus-videos-extra-20261001`.
Immutable commit: `5c9f43ace44f6ce785108212f81941261d5e990ffe44113ad65a8acf5d9688dc`.
Prefix: `imports/research/enceladus-extra/2026-10-01/`.

[Full readback receipt](../assets/enceladus-extra/lakefs-receipt.json) and
[upload manifest](../assets/enceladus-extra/upload-plan.json) record the exact file set.
The owner-managed Telpher/hid-in process on presvd1 verified main protection,
uploaded to a fresh branch, committed, read back every byte at that immutable
commit, matched all SHA-256 values and checked that the listed destination file
set exactly equals the manifest. Main remains protected and unmerged.

On maxipaxi, ffprobe inspected all four videos. Each was fully decoded with
`ffmpeg -v error -threads 2 -i FILE -f null -`: all four exited 0 with empty
error output. These checks establish source-file integrity, not browser playback.
The collection adds four originals to the prior 12: **16 original motion assets**,
plus the earlier surface film and compatibility previews. Together the two
preservation batches contain **25 objects / 496,110,556 bytes**.

The [Babylon film guide](enceladus-cinema.md) describes the seven-insert mashup,
original lander, creative transitions and pending browser/render step.
