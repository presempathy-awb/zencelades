# Homepage recording

`just deploy-site --host presvd1` builds Showtime and records a fresh 60-second
homepage loop before creating the release manifest. Planning also records locally
so the proposed movie is reviewable; only `--apply` uploads and activates it.
A failed build or recording stops deployment rather than reusing an old movie.

The versioned `cockpit/scripts/homepage-preset.json` selects the left projector
view, 35% movie, 70% human blend, 65% effects, 55% haze, and the existing reference
portrait and fade settings. These are the selected presentation defaults, not an
automatic aesthetic ranking. Change that preset to change future recordings.
Each receipt contains the preset, compiled input hashes, movie hash, duration,
and byte count. A changing build during capture is rejected.

The publishing machine needs the project's Bun dependencies plus installed Node,
Playwright (local or global), Google Chrome, FFmpeg and ffprobe. The recorder
installs nothing. Chrome opens a visible window with a fresh profile, no camera
or microphone permissions, and requests restricted to the local recording
server. Only the 3D canvas is recorded. The script accepts `--headless` for an
explicitly approved unattended environment; deployment uses a visible window.

`just record-showtime` repeats capture from an already prepared film build
without deploying. The export is H.264 MP4, 1280 × 720 at 30 fps, with no audio
and fast-start metadata. Generated files are stored under
`cockpit/dist/film/homepage-*`; deployment copies them into `site/dist/film` and
includes them in its release manifest.

The homepage video loops silently with native pause and play controls. Reduced
motion starts it paused with a poster; manual playback remains available. The
player links to `/film/showtime/` for the interactive show.

This change covers the existing full-site `deploy-site` recipe. The unpublished
`deploy-showtime` overlay work is a separate dependency and is not included in
this PR.
