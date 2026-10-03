# Showtime homepage recording

The homepage keeps its renders, artwork narrative and plain, clickable video.
Its silent loop is a capture of the current interactive Showtime renderer.
Clicking it opens `/#/showtime`; reduced-motion preferences pause autoplay.
The poster remains visible when playback is unavailable.

`just record-showtime` builds the standalone renderer, opens visible Chrome,
and captures one 60-second canvas presentation. Run it only within an approved
browser-control scope. It never runs as a side effect of a deployment plan.
The recorder sets the aerial rig, dusk lighting and elevated right view using
`cockpit/scripts/homepage-preset.json`. The interactive stage retains its
lander default and all other viewing choices.

Movie blend defaults to 70% in both the interactive scene and this recording
preset, making the moving moon flight more prominent than the static lunar map.
The interactive slider still spans 0–100%, independently of Human blend.

The publishing host needs the existing Bun dependencies, Node, Playwright
(local or global), Chrome, FFmpeg and ffprobe. The recorder installs nothing.
Its fresh browser context has no camera or microphone permission; network
requests are restricted to its loopback server. It records the synthetic
concept person, not a live participant. The optional `--headless` argument is
for separately approved unattended capture only.

Outputs live in the ignored asset directory
`source/research/enceladus-cinema/web/`: `homepage-loop.mp4`,
`homepage-poster.jpg`, and `homepage-recording.json`. The MP4 is silent H.264,
1280 × 720, 30 fps, with fast-start metadata. The receipt binds output digests
to the renderer source, asset catalogs, selected preset and compiled input
bytes. Capture refuses source/build changes during recording. The SPA build
refuses a missing receipt, changed source/catalog/preset or damaged movie/poster;
rerun the recording after changing those inputs.

Vite publishes the movie and poster as hashed `studio-assets` alongside the
homepage. Use the existing `just private-studio-release` plan and `--apply`
workflow after checks and review: it preserves the active gallery, film assets,
private-studio protection and activation lock. The older full-site publisher
from the recording study is intentionally not part of this integration.

Source lineage: the runtime came from zencelades `feat/showtime-natural-motion`
(#10); the recorder originated in `feat/homepage-recording` (#12), adapted for
the autostarting renderer, elevated views and current additive release.
