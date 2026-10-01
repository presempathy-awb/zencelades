# Into the jets — Babylon.js cinema

A separate 60-second film entry point combines an actual Babylon.js world with
three inserts from the verified public Enceladus media collection. It preserves
the active cockpit/modeling files and uses installed Babylon.js 9.26.1, Bun and
Vite. No new package or paid generation service is needed.

## The flight

The camera approaches a fractured icy moon, descends to the south pole, follows
luminous tiger stripes, enters a central geyser, rises through drifting crystals
and pulls out toward Saturn. Effects include moving backlit vapor, ice grains,
procedural ridges and escarpments, stars, ring geometry, bloom, grain, chromatic
aberration, slight camera roll, vignette, letterboxing and crossfades. Distances,
plume brightness and the local surface are artistic choices, not measured
reconstructions. The output is a standard flat film of a spatially rendered
scene, not stereoscopic or equirectangular VR.

| Film time | Material |
| --- | --- |
| 0–11 seconds | Babylon.js orbital approach and descent |
| 11–17 seconds | NASA surface-to-space visualization, E02 |
| 17–29 seconds | Babylon.js fissure skim and jet approach |
| 29–34 seconds | NASA geyser fly-through visualization, E01 |
| 34–48 seconds | Babylon.js jet interior and ascent |
| 48–52 seconds | Real Cassini plume sequence, E08, looped |
| 52–60 seconds | Babylon.js retreat and closing title |

Each insert crossfades for 0.75 seconds at its ends. NASA/Goddard Conceptual Image
Lab and NASA/JPL-Caltech/SSI credits accompany their material. E08 is originally
500×300 and is enlarged in the film; its original detail is retained in the
source collection. All inserts are muted and the edit is silent. The page links
the original publishers and reuse policy; NASA endorsement is not implied.

## Prepare and preview

Commands are verified against the installed Bun/Vite frontend. Run from the
existing checkout on maxipaxi. The preparation command hashes every original
against `assets/enceladus-videos/catalog.json` before copying it into ignored
`source/research/enceladus-cinema/web/film-media/`.

```bash
# maxipaxi
P=~/code/pres/make/thatsnozorb/cockpit
(cd "$P" && bun scripts/prepare-film.ts)
(cd "$P" && bun node_modules/vite/bin/vite.js \
  --config film.vite.config.ts --host 127.0.0.1)
```

Open `/enceladus-film.html` at the local URL Vite prints. The page starts paused.
Use Begin the voyage, Play/Pause, the seek slider or Jump into the jets. Effects,
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

Output is `cockpit/dist/film/enceladus-film.html` with its media and assets. This
build is separate from the active main cockpit build and deployment.

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
