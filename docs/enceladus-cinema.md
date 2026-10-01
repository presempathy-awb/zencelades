# Into the jets — Babylon.js cinema

A separate 60-second film entry point combines an actual Babylon.js world with
seven inserts from the verified public Enceladus media collections. It preserves
the active cockpit/modeling files and uses installed Babylon.js 9.26.1, Bun and
Vite. No new package or paid generation service is needed.

For the live sphere with an opt-in camera or a chosen local video, use the
[Showtime guide](enceladus-showtime.md).

## The flight

The camera approaches a fractured icy moon, descends to the south pole, follows
luminous tiger stripes, enters a central geyser, rises through drifting crystals
and pulls out toward Saturn. Andrew's confirmed face/body reference is blended
across the moon imagery in four passages (4–12, 20–30, 34–45 and 50–59 seconds),
with 2.4-second smooth entrances/exits and a maximum opacity of 0.72. The cached
portrait has softly feathered edges, subtle spherical curvature and screen
blending so ice and plume detail show through. The `Your face & body` checkbox
controls this layer; it is included in the recorded canvas.

The supplied reference image remains byte-for-byte unchanged. Its main front
sphere is sampled directly into the video compositor, retaining the large-face /
seated-body arrangement and the confirmed person's appearance and clothing.
This is reference-sheet imagery, not live camera footage or a 3D body scan.
An imagegen cutout attempt was rejected; no cutout image was produced or used.

An original Orbilander-inspired craft descends and
touches down between 20 and 27 seconds, with articulated-looking landing legs,
an antenna, thermal blankets, RTG fins, exhaust and a spreading frost ring.
This is an imagined craft and trajectory, not an official mission model.
Effects include moving backlit vapor, ice grains,
procedural ridges and escarpments, stars, ring geometry, bloom, grain, chromatic
aberration, slight camera roll, vignette and letterboxing. Transitions assemble
40 ice shards, widen a jagged ice fracture, open orbital ring irises, sweep through
a plume iris and zoom into ocean vents. A subtle expanding image echo reinforces
the passage through the central jet. Distances,
plume brightness and the local surface are artistic choices, not measured
reconstructions. The output is a standard flat film of a spatially rendered
scene, not stereoscopic or equirectangular VR.

| Film time | Material |
| --- | --- |
| 6–9 seconds | NASA Surprising Enceladus, E13; assembling ice shards |
| 11–17 seconds | NASA surface-to-space, E02; orbital ring iris |
| 18–21 seconds | NASA ice layers, E03; widening fracture |
| 21–29 seconds | Babylon.js Orbilander-inspired descent, touchdown and jet approach |
| 29–34 seconds | NASA geyser fly-through, E01; plume iris |
| 34–42 seconds | Babylon.js jet interior, drifting crystals and expanding echoes |
| 42–46 seconds | NASA ocean vents, E04; plunge zoom |
| 48–51 seconds | Real Cassini plume sequence, E08, looped; ice shards |
| 52–56 seconds | Webb plume/torus visualization, E11; ring iris |
| 56–60 seconds | Babylon.js retreat and closing title |

Each insert opens and closes over 1.1 seconds with a smooth mask and fade.
NASA/Goddard, its Conceptual Image Lab, NASA/JPL-Caltech/SSI and NASA/ESA/CSA/STScI
credits accompany their material. E08 is originally
500×300 and is enlarged in the film; its original detail is retained in the
source collection. All inserts are muted and the edit is silent. The page links
the original publishers and reuse policy; NASA endorsement is not implied.

## Prepare and preview

Commands are verified against the installed Bun/Vite frontend. Run from the
existing checkout on maxipaxi. The preparation command hashes every original
against the corresponding `assets/enceladus-videos/catalog.json` or
`assets/enceladus-extra/catalog.json`, with the human reference checked against
`assets/enceladus-human/catalog.json`, before copying it into ignored
`source/research/enceladus-cinema/web/film-media/`.

```bash
# maxipaxi
P=~/code/pres/make/thatsnozorb/cockpit
(cd "$P" && bun scripts/prepare-film.ts)
(cd "$P" && bun node_modules/vite/bin/vite.js \
  --config film.vite.config.ts --host 127.0.0.1)
```

Open `/enceladus-film.html` at the local URL Vite prints. The page starts paused.
Use Begin the voyage, Play/Pause, the seek slider, Jump into the jets or Jump to
the lander. Effects,
NASA inserts and captions can be adjusted. Reduced-motion preference removes
camera roll, grain and chromatic enhancement; the explicit Play action still
starts the requested flight.

## Build and checks

```bash
# maxipaxi
P=~/code/pres/make/thatsnozorb/cockpit
(cd "$P" && bun test)
(cd "$P" && bun x tsc --project film.tsconfig.json --noEmit)
(cd "$P" && bun node_modules/vite/bin/vite.js build \
  --config film.vite.config.ts)
```

Output includes `cockpit/dist/film/enceladus-film.html` and
`cockpit/dist/film/showtime/index.html` with their media and assets. This build
is separate from the active main cockpit build and deployment.

## Export

Save 60s film captures the composed canvas, including footage, transitions and
captions, as silent 1920×1080 WebM at a requested 30 fps. Frame delivery depends
on the GPU/browser; the encoder does not guarantee 30 rendered frames per
second. Keep the tab visible throughout recording. Backgrounding aborts the
take rather than accepting an incomplete movie. Recording controls prevent
seeking during the take. Unsupported recording browsers show a clear error.

The render and its browser interactions require the scoped computer-control
approval recorded in this chat. Until that approval and recording complete,
there is no claim that a movie has been exported, browser-tested or preserved
in lakeFS. Existing source-library storage remains verified independently.

Task plan: `docs/plans/enceladus-babylon-mashup.md`.

## Orbilander and more public material

The verified Lunar and Planetary Institute presentation,
[Flagship Concepts for Astrobiology at Enceladus](https://www.youtube.com/watch?v=NAM8SWw14vs),
is a viewing reference about the mission concept. No freely reusable official
landing animation was established. The [NASA NTRS report](https://ntrs.nasa.gov/citations/20205008712)
provides mission context and notes that some portions may be copyright protected.
[APL's website terms](https://www.jhuapl.edu/privacy) require written permission
for redistribution; its artwork/video is not used in this film.

The [additional media index](enceladus-extra.md) preserves four more NASA videos
and a caption sidecar, with credits, reuse caveats and immutable lakeFS locators.
Original soundtracks are preserved in those source files; all film inserts are
muted. The new lander geometry is original procedural art.
