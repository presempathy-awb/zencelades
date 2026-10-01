# P103 — Homepage video and alternate truck designs

Andrew: “also lil plain vid on homepage like same as showime just loop no
controls clicking goes there, take out truck pics for now except in alt put
all there”

1. Identify the current Showtime video and every default truck image.
2. Add the same video as a small muted, inline looping homepage link; preserve
   the hero and route clicks to Showtime. Move truck visuals to Alternate designs.
3. Verify media behavior and content retention, build, publish a scoped release
   and inspect the live homepage/gallery within approved browser scope.

Original source assets remain intact. Account persistence is separate pending work.

Published October 1: `90891ed11a4b898b23ef0e1194d0c98acb909f4a45361fab9f7ed902f68f72a1`.
The small homepage preview uses the existing 44-second `/media/above-the-ice.mp4`
from the published Showtime film section. It is muted, inline, looping and has
no controls; its link opens `/#/showtime`. Reduced motion pauses playback. The
new 3D projection stage in the other chat is separate work, not this movie.

Design → Alternate designs (`/#/alternates`) holds both original truck concept
boards, the dual-hitch/chassis drawings and the original cinematic film. The
default Media and native Showtime film sections no longer feature that old film.
Ten current gallery images and all source/download URLs remain intact.

Fresh maxipaxi checks: 49 Bun tests / 761 assertions; 59 Python tests +13
subtests, 17 Node tests, Ruff, ledger, TypeScript and site build pass. The new
preview and default-film separation tests were red before their implementation.
Live browser verified playback advancing to 15 seconds, muted/loop/no-controls
state, preview click → Showtime, Alternate designs navigation, all four original
images loading and 389 px layout without overflow. Console errors/warnings: none.
Rendered-DOM Impeccable findings: none. Public HTTPS readback: 162 hashes match,
service active, release unchanged through verification. Existing build/deployment
notices remain; startup health check retried during restart and passed.
