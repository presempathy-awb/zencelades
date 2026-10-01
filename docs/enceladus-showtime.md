# Showtime — live Enceladus projection

`/showtime` combines the 60-second moon flight, lander, jets, ocean and Saturn
scenes with a live human layer. It can use Andrew's opt-in camera, a chosen
local video or the existing reference portrait. The result appears as a
rotatable Babylon.js sphere or a flat projection preview.

## Start the local show

Prepare the verified film media, then start the dedicated film Vite server:

```bash
# maxipaxi
P=~/code/pres/make/thatsnozorb/cockpit
(cd "$P" && bun scripts/prepare-film.ts)
(cd "$P" && bun node_modules/vite/bin/vite.js \
  --config film.vite.config.ts --host 127.0.0.1)
```

Open [http://127.0.0.1:54624/showtime](http://127.0.0.1:54624/showtime) when
the local server uses port 54624. If Vite prints a different port, open
`/showtime` on that local address. Choose **Start the show** for the continuous
loop.

## Put a moving person on the moon

Choose **Start camera** to request camera access. Andrew handles the browser's
native permission prompt. Once access is granted, the show starts and the live
picture blends into every phase. Moving farther from the camera provides more
of the body. **Stop camera** stops and releases the camera stream.

**Use a moving video** selects a file from this Mac and loops it as the human
layer. The file stays in the browser and is not uploaded. **Stop camera** also
clears that selected video so the same file can be selected again.

The human controls change the composite without changing its sources:

- **Human blend** sets the maximum strength of the camera, video or portrait.
- **Fade in & out** follows the four human passages in the film. Turn it off to
  keep the human layer visible through the whole loop.
- **Mirror camera** reverses the moving input horizontally.
- **Reference portrait when camera is off** uses the supplied still when no
  camera or local video is active.

The **Moon**, **Ice**, **Lander**, **Jets**, **Ocean** and **Saturn** buttons
hold the flight on the selected scene. Camera or local-video movement remains
live while the moon is paused. Use **Start the show** to resume the flight.

The default sphere can be dragged to turn and scrolled to zoom. Choose **Flat
projection** to inspect the composed frame directly; **Sphere preview** returns
to the rotatable globe. This is an artistic wrap preview, not calibrated
projector output, stereoscopic video or a 3D scan.

## Privacy, sources and current limits

Camera and selected-video pixels remain inside the local browser session. The
page does not request a microphone, upload the input or record/export a movie.
Stopping the input or leaving the page releases the camera and clears the local
video object.

The moon program uses the same credited NASA/Goddard, NASA/JPL-Caltech/SSI and
NASA/ESA/CSA/STScI material described in [Into the jets](enceladus-cinema.md),
with original Babylon.js moon, lander and transition art. The lander flight,
ocean color and local surface are imagined; the page does not imply NASA
endorsement.

The film build now emits both
`cockpit/dist/film/enceladus-film.html` and
`cockpit/dist/film/showtime/index.html`. It remains separate from the main
cockpit build and deployment. The route, unit tests, type check and production
build have been verified. Browser/GPU rendering and real camera movement still
await the separately scoped local-browser test, so those interactions are not
claimed as verified yet.

The website's separately landed grant/media `/showtime/` page is a different
entry point. This change verifies the realtime route on the existing local film
server. Publishing it into the whole website requires integration with the
landed site builder and its media policy; that deployment is not claimed here.
