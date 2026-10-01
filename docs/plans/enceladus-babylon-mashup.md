# Enceladus Babylon.js mashup

Status: in progress. User asks for an actual 3D video mashup, with a flight into the jets and abundant effects, continuing the public-source library and lakeFS/Gitea delivery.

Latest request: put all video/projection phases together at `/showtime` in real
time with Andrew moving around. Best-supported interpretation is an opt-in live
camera feed blended over the existing moon/jet/ocean cinema. Inspect routing and
available runtime first; create a dedicated view without changing the concurrent
grant/model cockpit. Provide native camera start/stop and an uploaded-video
alternative, phase playback/looping, and spherical projection preview. Camera
permission remains Andrew's browser action. Test behavior, build and verify local
serving. Browser control testing needs the previously required explicit scoped
go-ahead; no accounts or unrelated tabs are in scope. The restricted workspace
policy now applies to the isolated lane and network writes. Keep existing archive
and browser-recording gaps visible.

Showtime source is implemented at `cockpit/showtime/index.html`, with a dedicated
Babylon sphere, continuously refreshed composition, camera/video start and stop,
moon/ice/lander/jets/ocean/Saturn phase selection, adjustable human fade/blend and
flat projection output. The local `/showtime`, `/showtime/` and query-string routes
serve the dedicated page at `http://127.0.0.1:54624/showtime`. Fresh full primary
Bun run: 26 pass / 0 fail / 16,015 assertions. Showtime camera lifecycle and clock
tests: 7 pass / 0 fail / 63 assertions. Strict film TypeScript, Biome and dedicated
production build exit 0. Source review approves the repaired full files. The
1.079 MB shared Babylon chunk triggers Vite's nonfatal size advisory.

Remaining current verification: actual moving-video pixels on the sphere, browser
controls, camera hardware and rendered frame rate. The rule audit flags this
functional evidence gap; unit tests and HTTP serving do not fill it. Andrew's
explicit go-ahead for the narrowly scoped local browser test remains pending.
Native camera permission is Andrew's action. No public deployment or recording
is claimed for this new runtime page.

Fresh route discovery: main `0f5bcfead81a86ec26d7506e5c34eeafc37ff5de`
contains the other chat's static grant/media page at `site/showtime/index.html`
from zencelades `feat/grant-resource-ledger` (#5). The primary working copy is
older and does not contain that page. Do not replace its builder with this dirty
checkout's older copy. Local film-Vite `/showtime` is the new realtime view;
the landed website `/showtime/` is prerecorded grant/media content. Whole-site
integration still needs a main-based lane: preserve the grant page, expose the
live page through a top-level link, build film after the normal cockpit build,
respect a nested `/film/` asset base and check the existing media CSP. Current
`frame-ancestors 'none'` forbids an iframe, so do not weaken it to force an embed.
Public realtime deployment is an outstanding integration step, not completed
by this local route or the Gitea source update.

Actual regression proof in the isolated lane: reintroducing elapsed-time
clamping makes the clock test fail (exit 1); removing the loop envelope makes
the seam test fail (exit 1). Restoring both fixes gives the full isolated film
suite 13 pass / 0 fail. The live primary preview was never regressed for these
checks. Human blend and Fade controls now also apply to the still fallback;
the film's original two-argument portrait draw retains its existing defaults.

Moon-only request completed: three new 1536×1024 PNG concepts for ice geography,
geyser dive and suspended under-ice ocean. Enlarged human overlays removed; small
occupants from the supplied renders remain visible. All three visually inspected,
dimension-checked and hash-verified; complete exact prompts and metadata verified.
Published PR #2 head `5294fd6b08e2d61b6e1d3332c6b26dd19888bfae`, SSH readback and
actual-head diff --check pass. Three images / 7,629,385 bytes are staged for lakeFS
at `/home/andr/.cache/codex/enceladus-moon-stills.Ck81kUic`; fresh gunlock-status
confirms vault still locked. No lakeFS ingest or readback claimed for this batch.
No application code changed; code suites were not repeated for this addition.

Latest request: more moon-only night stills, with no enlarged human projection.
Produce three full-sphere Enceladus phases on the supplied installation renders:
ice geography, luminous geyser dive, and artistic under-ice ocean. Preserve the
night beach and rig; let continuous moon content dominate the entire sphere.
Save each successful new concept separately, record exact prompts/provenance,
and extend the existing Gitea index. LakeFS delivery remains dependent on the
known presvd1 hid-in vault unlock; do not bypass or conceal that boundary.

Full-wrap correction result: N01-v2 orbital and N04-v2 suspended ocean complete,
1536×1024, visually inspected and dimension-checked. N03-v2 geyser revision was
rejected by output moderation; no image returned. Local files and upload manifest
are ready. LakeFS upload stopped before branch creation because the presvd1
hid-in general vault is locked. No archive/readback is claimed for these two
revisions. Existing archived files remain intact. Metadata documents this gap.
Published revision head: `0b7cca7b8e292dbaf435991c5c44c6982c805d86`, verified
by SSH remote readback. Actual-head diff --check passes; JSON parses and both
selected hashes match. Existing PR #2 remains draft/open with the gap recorded.

Latest still correction: interpret “more surrounding fully like in the mockup”
as continuous projection coverage around the entire curved zorb, including its
edges and bottom, with the large face and body dissolved into the wrapping moon
texture. Revise the three selected night stills non-destructively; preserve the
rig, night setting and confirmed identity/clothing. Inspect coverage before
saving and index/archive successful revisions through the existing media lane.

Still generation result: three successful night concepts—ground orbital blend,
ground geyser burst and suspended ocean glow. The separate suspended ice-fracture
variant was rejected by imagegen's output moderation with a sexual-content flag;
no image was created for that variant and no safety settings were changed.
The completed stills use the confirmed person's appearance and reference attire,
and actual source frames as visual input. They are concept edits, not pixel-exact
video projection screenshots or a verified Babylon recording.

New still-picture request: make four cinematic night concept stills on the two
newly supplied ground-supported and suspended zorb renders, showing orbital,
cracked-ice, geyser and under-ice phases of the film with the confirmed human
reference blended in at different fade strengths. Use actual source-video
frames as projection-content references. Preserve the supplied zorb forms,
rig/support composition and beach setting while changing night lighting and
projection content. These are concept edits, not screenshots of a verified
Babylon render. Complete these stills now; carry the unfinished face/body video
and pending Babylon browser/export steps forward.

Latest portrait steering: use Andrew's attached `/Users/andrew/Downloads/zorb.jpeg`
as the identity and composition reference. Blend his face and seated body across
the moon, repeatedly fading in and out in the same large-face/body aspect as
the reference. No mounting, truck, rig or installation diagram is in scope.
The imagegen cutout attempt was rejected, so use the exact confirmed reference
pixels in a cached feathered video layer, with smooth dissolves and ice/plume
detail showing through. No generated cutout or reconstructed 3D body is used.
Preserve/index the new project media within the already
requested lakeFS/Gitea delivery. Browser recording remains pending its existing
explicit approval; the new request does not authorize broader desktop control.

Latest steering: find video of the Enceladus Orbilander (the best-supported reading of “orb lander”), collect more public Enceladus material, and make the transitions/effects substantially more creative. Check official mission-concept media and reuse terms first; preserve new originals with provenance in lakeFS and extend the Gitea index. Add actual tested transition behavior to the film; carry the existing browser approval/export step forward.

1. Build a separate cinematic entry in `cockpit` using its installed Babylon.js version. Preserve the active cockpit/modeling work.
2. Create a reproducible 60-second camera flight: orbit, descent, fissure skim, geyser passage, ascent. Mix the preserved NASA visualizations and Cassini observations with procedural 3D ice, Saturn, stars, plumes, crystals and restrained lens effects. Clearly label imagined surface scenes.
3. Test the camera path before implementation, then run Bun tests, type checking and a dedicated production build. Use a visible scoped browser only after Andrew approves testing/recording.
4. Export the film, decode-check it, preserve it on a fresh lakeFS ingest branch with immutable readback, and publish its source/provenance/index through the existing isolated Gitea media lane.
5. Record evidence and leave a resumable checkpoint if browser approval or authenticated storage prevents completion.

Design: an immersive art film for installation/projection audiences. Quiet editorial controls surround a cold blue ice world and a warm Saturn horizon. The memorable passage is through a forest of luminous plumes, close enough for moving ice crystals to cross the lens. Public footage comes first; generated geometry is an artistic interpretation, not a measured surface reconstruction. Film is silent for clean reuse. Motion begins only through an explicit play/record action.

Browser scope pending: a new visible local preview tab, playback/seek/effect testing and film export; no signed-in accounts or unrelated tabs. The question has been submitted, with no approval received yet.

Implementation evidence: the full cockpit Bun suite passes (14 tests, 0 failures), including camera descent, geyser entry, continuous/deterministic seek and terrain clearance across 1,800 frames. The assertions were first observed failing against the placeholder path. TypeScript passes; Biome is clean; the dedicated Vite production build succeeds. The 1.116 MB main JS chunk triggers Vite's large-chunk advisory. Public media E01, E02 and E08 pass stored SHA-256 verification before preparation. None of these checks is browser or GPU rendering proof.

Current local preview: `http://127.0.0.1:54624/enceladus-film.html`, Vite process held by exec session 27107. This is a temporary local preview, not a public deployment.

Published source: https://git.telpher.stream/telpher/zencelades/pulls/2 — zencelades `feat/enceladus-cinema` (#2), targeting the existing `docs/enceladus-videos` media index. Latest head `ed1e2135bbee0b7bcf2e850fe2bf94227f26e904` was verified by SSH remote readback. Lane: `/Users/andrew/code/branch/thatsnozorb/enceladus-cinema/main`. Standalone `bun install` succeeded; its full six-test suite, strict TypeScript, clean Biome and SHA-verified media preparation/production build passed. The PR remains open and marked draft while browser/GPU verification and export are pending. Active main-checkout modeling/grant changes were excluded.

Latest extension completed: original Orbilander-inspired geometry and smooth
20–27-second touchdown; seven public-source inserts with shard, fracture,
orbital/plume iris and ocean-plunge transitions; expanding image echoes in the
jet. Transition and touchdown tests were observed failing against placeholders
before implementation. Fresh full source-checkout Bun suite: 18 pass / 0 fail.
Fresh isolated film lane suite: 5 pass / 0 fail. Strict TypeScript, clean Biome,
SHA-verified seven-source preparation and dedicated production builds pass.
Static Impeccable scan of the changed HTML/CSS reports zero findings. The 1.122 MB
main chunk triggers the same nonfatal Vite advisory. Browser/GPU and actual
Babylon movie recording remain pending the existing scoped approval.

Additional collection complete: four NASA originals and one caption sidecar,
280,719,234 bytes. All four videos pass ffprobe and full ffmpeg decode (exit 0,
empty error output). Fresh lakeFS branch `ingest-enceladus-videos-extra-20261001`,
immutable commit `5c9f43ace44f6ce785108212f81941261d5e990ffe44113ad65a8acf5d9688dc`.
Every object passes immutable full-byte SHA-256 readback; the exact destination
file set matches. Protected main is unmerged. LPI's Orbilander video is indexed
as a viewing reference; APL concept imagery is excluded because redistribution
permission was not established. The NASA SmallSat Vimeo link returned 404 and
is recorded as an unavailable reference.

The host's `update_plan` tool is unavailable, so this file is the current session plan.

Portrait/still delivery verified: three selected 1536×1024 concept stills plus
a playable H.264 portrait preview, 1920×1080/30 fps, silent, 44.266016 seconds.
The preview edits the existing NASA-based surface film; it is not the pending
Babylon recording. Complete decode exits 0; representative fade frames checked.
Night collection: 10 objects / 46,522,678 bytes, lakeFS branch
`ingest-enceladus-videos-night-stills-20261001`, immutable commit
`f264962365ba1c5398266b27036e221a9eb90df63ae9a8823a745c65d30e0600`.
Every object passed immutable full-byte SHA-256 readback and the file set matches.
Protected main remains unmerged. All still prompts, failed-generation status,
human reference and source frame provenance are indexed. Current source suite
19 pass / 0 fail; isolated full film suite 6 pass / 0 fail; strict TypeScript,
Biome, 8-source SHA preparation, build and static UI scan pass. Browser/GPU
verification of the new portrait layer and the 60-second recording remain
pending the original scoped approval.

Finished portrait-video frame comparison passes: at seconds 0, 13 and 31 the
mean RGB difference from the original is below 3; at portrait peaks 8, 24 and
38 seconds it exceeds 10. This confirms the rendered fades, separate from the
Babylon timing tests. The failed fourth cracked-ice concept and rejected isolated
portrait cutout remain recorded; three completed stills fulfill the still request.
