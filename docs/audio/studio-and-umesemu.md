# Deferred audio studio, mixer and Umesemu reuse

Prepared October 2, 2026 for P114/P115. This is an implementation-ready design,
not a deployed feature. Music: **Suno**. Sound effects: **ElevenLabs**.
No provider generation or deployment occurred in this slice.

P118 supersedes the studio-hosting deferral below. The separate public/private
build and Authentik fallback are implemented, awaiting reviewed deployment and
live verification; [current access contract](../private-studio-access.md).
The first delivered controls select and copy prepared prompts. Persistent
editing, provider generation and the mixer remain future work.

## Product boundary and design

The public homepage keeps its media-first cockpit, renders and silent looping
Showtime teaser. Showtime plays approved assets. A discreet **Asset studio**
link leads to the authenticated authoring area, proposed at
`studio.zenceladus.com` using Andrew's confirmed domain spelling. The earlier
`studio.zencleastes` text is retained in P114; no DNS change is inferred.

Studio uses the existing cockpit layout: top-bar column count, a left drill-down
selector (Music / Effects / Visuals / Models), and a large preview with prompt
and settings alongside. A compact controls row chooses provider, scene/use,
revision and candidate. Detailed metadata lives in expandable panels. Preserve
the full-width preview; do not replace it with a dense administrative table.

First studio implementation is a **prompt workbench**: compose, edit, copy the
correct provider fields, record an external generation and import its result.
Umesemu itself calls no model. Do not imply it already provides an automated
generation backend or a Suno integration. A future paid generation button is a
separate scope with a supported provider interface, scoped credentials and an
explicit cost/quantity action; no unverified third-party Suno API.

## Existing source evidence

Inspected local Umesemu at working snapshot
`ca8a66a08f7407c1dc6f8cee8b41ceb84c3f04c7`, source inspection only.
Paths below are relative to that repository at
`/Users/andrew/code/pres/coms/umesemu`.
Zencelades account/cockpit source is the account-drafts lane whose reviewed
parent is `c8ba9c04`. The separately active Showtime source in the main checkout
was read at working snapshot `037511f9975d3c558f8c64d30e0769adc9718690`.
These observations do not certify live behavior, clean commits or performance.

| Pattern | Actual Umesemu evidence | Zencelades action / priority |
|---|---|---|
| Prompt text separate from settings | `src/pages/prompt-settings.tsx`, `src/lib/prompt-settings.ts` | P1: separate Suno Style / Exclude / Instrumental / sliders; ElevenLabs text / duration / loop / influence. Source date and recommended/optional/unknown states beside controls. |
| Copy, edit, count characters | `src/pages/prompt-review-controls.tsx` | P1: copy only the chosen field; visible copied/selected fallback. Keep artist prose free of export instructions. |
| Search and provider filters | `src/pages/prompt-library-view.tsx` | P1: filter by asset role, mode, provider, status and flag. Deep-link a prompt without losing the parent selector. |
| Review state and stale drafts | `src/lib/prompt-progress.ts` | P1: preserve source fingerprint and draft fingerprint, notes, job/model/reference metadata and export. Warn when the upstream prompt changed. Umesemu uses browser storage; account-owned PG18 saves require Zencelades' own service extension. |
| Candidate comparison | `src/pages/prompt-candidates.tsx`, `src/lib/prompt-candidates.ts` | P1: compare takes, separate generated/under-review/accepted/rejected, keep the prior winner until a replacement is accepted. Prompt provenance caveats stay visible. |
| Private review bench | `server/app.ts` bench routes and host guard | P1: borrow the public/private separation, not an anonymous card studio or a Host header as authentication. Protect UI, metadata, mutations and private media. |
| Source-addressed assets | `scripts/lake-assets.ts`, `assets/lake.json` | P1: stable asset IDs, immutable lakeFS commit and SHA-256; preserve individual masters and derive playback files. Use this project's existing publisher rather than another upload implementation. |
| Verified private downloads | `server/prompt-downloads.ts` | P1: size/hash verification and private no-store responses; do not leak unreleased takes through public artifact manifests or a ZIP. |
| One audio engine and manifest-driven cues | `src/card/sound.ts`, `src/card/sound-cues.ts`, `src/card/use-sound.tsx` | P2: a gesture-opened AudioContext, buses, stable cue IDs, repeat avoidance, retryable short-effect cache and cleanup. Keep Zencelades event names. |
| Stream long music, decode short effects | `src/card/sound.ts` buffer cache and score playback | P2: at most current/next long tracks in media elements; short approved effects in a bounded decoded cache. Umesemu's score is Ogg-only: add an actual tested music fallback instead of copying that limitation. |
| Spatial sound and ducking | `src/card/sound.ts`, `src/card/ears.tsx` | P2: mono point effects for headphones, broad stereo beds; optional speech ducking only when speech input is intentionally enabled. Venue speaker mix and browser binaural mix are separate presets. |
| Quality selection | `src/scene/quality.ts`, `src/scene/quality-loader.ts` | P3: explicit Auto / Full / Compact controls; honor Save-Data, preserve originals, show selection reason. Stable tier during a loaded scene avoids duplicate loads. |
| Cached asset compression | `scripts/compress-assets.ts` | P3: source+settings hash cache; meshopt/quantized derivatives, lossless WebP, compare geometry/rig/animation before and after. Do not copy Umesemu's dependency tree into this project. |
| Optional GPU textures | `scripts/compress-assets.ts`, `src/scene/quality-loader.ts` | P3: KTX2 is a later measured GPU-memory experiment, opt-in until accepted. Its bandwidth size and appearance can regress. Preserve linear data maps and local decoder delivery. |
| Scenario-based proofs | `scripts/sound-check.ts`, `scripts/model-check.ts`, `scripts/bench-check.ts` | P1–P3: reuse the proof idea and acceptance cases with this app's routes/events; run checks after implementation, never call source inspection a test pass. |

The existing Zencelades cockpit already lazy-loads SceneView, WorkflowView,
ResearchView and PartsView in `cockpit/src/App.tsx`; SceneView disposes its
Babylon scene/engine and gates rendering by panel visibility. The newer
Showtime main source already skips work while the document is hidden, pauses
insert videos, honors reduced motion, disposes on pagehide, and caps the sphere
renderer pixel density. Preserve those measures rather than claiming them as
new Umesemu imports.

Zencelades uses **Babylon.js** here; Umesemu uses React Three Fiber / Three.js.
Transfer behavior and asset contracts, not the renderer or its React hooks.
Exact decoder support and any build-time tooling dependency need verification
when implementing; no new dependency was added by this plan.

## Prompt optimization worth carrying over

Umesemu's `docs/art-direction/prompts/optimization-notes-2026-09-23.md`
records a useful correction: its initial 30–60-word rule was withdrawn.
Reduced character count measured length, not artistic quality, cost or model
fidelity. Preserve needed details; remove contradictions, repetitions and
post-production requirements from the generation field.

Apply that lesson to this pack: one distinct musical direction per Suno prompt;
one sound action or texture per ElevenLabs effect; controls outside prose;
production acceptance outside both. Start with one calm song, one rhythmic song
and five key effects. Compare one changed setting at a time, with the same model
and other settings recorded. Randomness means a single better take does not
establish an optimal slider. Do not ask a generator to deliver a technically
perfect loop, exact loudness, aligned stems or a calibrated physical sound field.

Umesemu's settings inference uses text heuristics. For this new workbench use
explicit provider and asset-kind metadata so a sentence mentioning music does
not silently select the wrong provider workflow. These eight Suno prompts are
new original text; no ElevenLabs Music prompt is being presented as a Suno API.

## Studio controls and data

| Area | Controls / stored facts |
|---|---|
| Prompt | Stable ID; title; use/mode tags; provider/workflow; canonical text and editable draft; source revision; character count; Copy Style / Copy Exclude / Copy Effect; Restore canonical only after a clear action. |
| Suno | Custom mode; Instrumental; available model recorded exactly; Weirdness and Style Influence; optional owned/approved audio reference with its actual Audio Influence. BPM/key are requested musical targets, not validated controls. |
| ElevenLabs | Sound Effects workflow; model; 0.5–30 s duration; loop on/off; prompt influence 0–1 where exposed; current output options and actual returned format. |
| Take / review | Provider job and URL; model/version; source prompt/settings snapshot; original asset hash; draft/generated/under-review/accepted/rejected; notes and chosen use. Changing the prompt does not rewrite an old take. |
| Mix metadata | Measured BPM/key and confidence; duration; beat/downbeat grid; cue-in/out; loop region; mix family; gain/peak/loudness analysis; approved SFX events; codec variants. Empty means unverified, not zero. |
| Saves | Account subject, revision and conflict-aware update; export/import backup with validation; explicit local-only state until PG18 save succeeds. No cross-account local-draft attachment without the owner's action. |

Do not copy Umesemu's entire library parser or build a new generalized asset
framework. Reuse the current cockpit and catalog, then add the minimum explicit
metadata needed for this pack. New PG18 draft types and media permissions are
real implementation work, not something the scenario endpoint already supports.

## Pawthentik login flow

The asset-studio link goes to the configured studio origin. A guest is sent
through the existing **gimmesomepaw-generated sign-in navigation** into Authentik;
successful authentication returns to that studio's root and its chosen asset.

In this candidate, `account-service/server.go` obtains `SignInURL("/")` and
`SignOutURL()` from gimmesomepaw. `site/naming/account-client.mjs` accepts only
the exact same-origin sign-in/out paths. Reuse that verified contract on the
studio host; do not invent a new “gimmesomepaw login” service domain or place
tokens/identity in a URL. Keep an intended asset ID in local navigation state
rather than accepting an arbitrary redirect target.

Provision the studio route/provider through Telpher later. Authorized studio
membership is required even on tailnet: public playback access and permission
to author/publish assets are different. Forwarded identities are trusted only
through the installed proxy boundary. UI hiding is not authorization.

Acceptance must exercise guest login, allowed member, non-member, expired
session, logout, public-host/private-media denial, direct-IP/origin access,
forged identity headers and two-account save isolation. Require permission
server-side on import, review, generation (if added) and publishing. Preserve
CORS/CSRF controls and host-only session behavior. The candidate's production
account login/save deployment remains a separate unfinished task.

## Mix behavior

The current Showtime loop is **60 seconds**, from
`cockpit/src/film/flight.ts` and `showtime/timeline.ts`. Its short chapters
include tiger stripes, imagined touchdown, geyser, plume and a return. Whole
3–4-minute songs must not restart every time one of these chapters changes.

| Playback choice | Behavior |
|---|---|
| Film / Auto | Keep one selected bed across the 60-second loop. Use a few chapter cues/effect layers; one effect per boundary crossing. A repeat, seek or pause must not double-trigger a stale event. |
| Hold a mode | Operator selects Arrival / Portrait / Ice / Ocean / Plume / Orbit / Play / Return. Pick the matching song and remain there. These are proposed audio categories, not a claim those exact buttons exist today. |
| Auto journey | Broader mode requests choose the next track after a tunable minimum dwell (initial 90 seconds), not at every visual chapter. Brief camera motion modulates an approved effect/energy control, not a song change or inferred emotion. |
| DJ | Manual A/B selection, cue and crossfader; optional quantized transitions only after the beat grids are verified. A manual selection holds until the operator releases it. |
| Quiet / Stop | Quiet can retain a low ambience if requested. Stop cancels pending cues and silences all buses immediately; it never waits for a bar, countdown or closing track. |

Tempo groups:
- **72 BPM**: Shore to Saturn; An Ocean Wearing Your Face; We Carry Oceans.
- **96 BPM**: Tiger Stripe Lattice; The Ocean Inside.
- **120 BPM**: Plume Bloom; Orbit Together; Moon Boots Optional.

All use requested D minor / F major, compatible relative tonal centers, but the
generated recording must be checked. Same-family DJ blend: start with a
reviewed 8-bar transition, align actual downbeats, and trade bass gradually.
For different tempo families or uncertain grids, fade the rhythm down through
Weightless Air, start the new track and restore energy. Do not force a 72→120
BPM speed jump or stack unrelated strong bass lines.

Use gain automation with reserved headroom; an equal-power curve is a starting
point for unrelated material, not a guarantee against clipping on correlated
stems. Normalize derivatives conservatively, measure combined peaks and audition
the actual mix. A limiter is not a substitute for appropriate levels. Stem
mixing waits for real extracted stems from the **same accepted take**, aligned
and artifact-checked; eight independently generated tracks are not stems.

Suno offers paid stem extraction, with availability and credits depending on
the current plan/method. Verify the account's available export before relying
on it. An initial two-deck mixer does not need stem extraction or paid provider
calls at playback time.

## Performance work, in useful order

1. **Measure the current scene first.** Capture cold transfer bytes, time to
   first usable frame, p50/p95 frame time, decoded audio memory, texture memory
   estimate and active source count on a desktop and representative phone.
   Compare the same saved camera, lighting, media and interaction. No speedup
   percentage is established by this research.
2. **Avoid unused work.** Lazy-load studio tools and preview media; do not
   prefetch all eight songs or decode a long score. Keep at most two music decks,
   a bounded short-SFX cache, limited concurrent fetch/decode, and eviction.
   Current Showtime preloads its insert videos with `auto`; test selective
   next-insert preload before changing it, preserving seamless chapter cuts.
3. **Use verified derivatives.** Preserve masters; generate preview posters,
   responsive images and compressed playback versions once per source/settings
   digest. Test visual geometry, seam/contact, projection UVs and text clarity;
   compression must not “fix” fit by silently changing the model.
4. **Treat GPU changes as optional.** Test Babylon-compatible mesh/texture
   loading with locally served decoders. Profile projection-texture updates
   before adding invalidation complexity. Keep live human/motion updates and
   projector mapping correct; lower GPU resolution only through explicit,
   measured quality choices.
5. **Prove the complete experience.** No sound before opt-in; mute survives
   navigation; Stop is immediate; crossfades do not clip; phone codec fallback
   works; offscreen/hidden pages release work; no repeated failed fetch storm;
   accepted content, gallery and homepage renders remain present after release.

## Deferred implementation sequence and completion evidence

Phase 1: land the existing account/access work through its own gates. Confirm
the proposed studio hostname before creating its route. Keep this document pack
outside the account PR's current reviewed head.

Phase 2: add the private prompt workbench and explicit metadata. Read-only
source list, field-specific copy and provider settings first; import/review and
account saves next. Tests cover field fidelity, invalid imports, stale prompt
warnings, revision conflicts and access denial. Browser proof covers keyboard
use, narrow layout, preserving edited drafts and full-size media.

Phase 3: Andrew auditions the pilot generations; record actual exports,
provenance and acceptance. Publish accepted derivatives with immutable manifests.
The prompt plan itself never claims an asset exists or has been listened to.

Phase 4: add the AudioContext, buses, format fallback, cue clock and two-deck
crossfade. Tests cover seek/loop/pause event deduplication, unloaded next-track
failure, immediate stop, manual hold, transition cancellation and cache limits.
Use a local synthetic audio fixture for deterministic tests; provider generation
must not be a CI dependency. Browser listening and actual event-speaker setup
are distinct acceptance steps.

Phase 5: measure and introduce only the optimizations that improve the target
devices without sacrificing render appearance. Compare captures and metrics;
preserve the active release's gallery and Showtime assets during deployment.

## Official provider references

- [Suno Custom mode](https://help.suno.com/en/articles/3726721)
- [Suno Creative Sliders](https://help.suno.com/en/articles/6141377)
- [Suno Exclude](https://help.suno.com/en/articles/3161921)
- [Suno stem extraction](https://help.suno.com/en/articles/13925185)
- [ElevenLabs SFX API controls](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert)

[Music and effect index](README.md)
