# What Enceladus should learn from Umesemu

Studied September 30, 2026 by Codex. This is a source and operations study, not
a fresh aesthetic review of Umesemu's images or a browser acceptance test.

**Recommendation:** keep Much Ado/Erebe as Enceladus's application foundation,
PG18 for shared project records, hesellsheshells/lakeFS for versioned assets and
B2 for original archives. Borrow Umesemu's production discipline: separate
preservation from selection, bind reviews to exact files, test assets in their
actual setting, and give the visitor a useful page even when the spectacle
cannot load. Its most valuable contribution is how it manages creative work.

## Evidence and freshness

The canonical checkout is an older working copy, with an unrelated untracked
`docs/integrations.md`. It was preserved. `git ls-remote` identified current
main as `053b2cf5ae461a3c7b67a12fca66877d3732bcc0` (through PR 107). That commit
already existed locally, so no fetch, branch switch or source modification was
needed. A read-only export of 231 selected source/document files was inspected.
Other active lanes were located with the worktrees skill and left unchanged.

| Evidence layer | Observed in this study | What it establishes |
| --- | --- | --- |
| Main source | `053b2cf5ae46`, read by immutable commit | Code and documents at that revision |
| Asset migration PR 68 | Gitea reports closed and merged, head `a50c40cb66a5` | It is no longer the open PR described in older notes |
| Installed release | `/srv/umesemu/current` → `umesemu-db5b7600add2`; release JSON names `db5b7600add29384fb401be32130ea612a969105`, built September 30 at 12:25 UTC | Production is a different revision from current main |
| Live service | `systemctl is-active umesemu.service` → active | Unit runs; this alone is not product acceptance |
| HTTPS with curl | Home and health 200; public `/bench`, `/prompts`, `/review/app/bench.html` and a missing JS file 404; Bench host 302 to Authentik | Public/protected route separation and missing-file behavior on this request path |
| Individual-file receipts | September 28 receipts record 423 Gitea files, 775 lakeFS files and 1,606 restored occurrences from 1,198 blobs | Historical full readback/restore evidence, inspected now; not a fresh 1 GB remote restore |

Python urllib requests received edge 403 responses where curl succeeded. This
client-path discrepancy is recorded, not diagnosed as an application failure.
No interactive browser, authenticated Bench session, phone, screen reader,
headphone session or physical projection test was performed for this study.
No pytest, Umesemu build, deployment or mutation was performed.

Source links below pin the inspected main revision. They require forge access.
The deployed plain-reading implementation exists in `db5b7600add2`; the newer
edit-link and words-with-media changes after that release are not claimed live.

## 1. Preserve everything, but publish a deliberate selection

Umesemu has three useful layers:

| Layer | Meaning | Enceladus equivalent |
| --- | --- | --- |
| Complete constituent inventory | Every original occurrence, nested source chain, byte identity and remote locator, including rejected and superseded material | The seven supplied uploads, all 125 ZIP members, derived media and future test captures |
| Working asset set | Assets needed for builds and proofs; archive masters remain separately fetchable | Calibrated sphere textures, selected preview video, approved diagrams and measured optical fixtures |
| Served catalogue | Human names, purpose and where an asset is used; it references measurements rather than duplicating them | Visitor-facing experience, committee packet and crew review views over the same asset records |

The intake code keeps **occurrences separate from unique blobs**. Identical
bytes can have different provenance, captions, intended uses or classifications.
Deduplication therefore saves storage without erasing those relationships.
Its archive reader rejects traversal, case/Unicode collisions, encrypted or
special entries and excessive expansion. It records incomplete attempts and
supports verified per-source checkpoints instead of restarting every archive.

Enceladus already has unusually good preservation: 132 files, immutable lakeFS
readbacks, retained duplicate occurrences, a detailed format catalogue, and a
versioned B2 copy of the original ZIP. **Do not re-upload or re-extract this
collection merely to adopt Umesemu's schema.** Our next gap is a selected release
manifest and review history, not another storage migration.

Keep this project's explicit storage decision: originals/ZIPs in B2, individual
files in lakeFS, small project metadata in the eventual forge/PG18 workflow.
Umesemu's own small-file/Gitea split and archive policies are project decisions,
not universal defaults that override Andrew's Enceladus instructions.

Sources: [intake and bounded extraction](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/scripts/asset_intake.py),
[index validation](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/scripts/asset_index.py),
[working/archive fetch policy](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/scripts/lake-assets.ts),
[served catalogue](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/src/assets/catalogue.ts).

## 2. Separate what was requested, what arrived and what was accepted

The garden intake is more valuable than a folder full of attractive renders.
It stores the intended job separately from observed setting, season, time and
weather. It records confidence, the basis for classification, reviewer, date,
rubric version, strengths, defects and the exact source SHA-256. The actual
generation prompt stays null when it was not recovered. A planned prompt is
not retroactively presented as the prompt that made an image.

It records file hashes and decoded-pixel hashes separately. Two PNGs can contain
the same picture while differing in metadata. The apply step rechecks file bytes,
dimensions, pixels and retained attribute hashes; a review cannot silently move
to a changed source. Existing IDs with conflicting metadata are refused.

Most importantly, the visual-review schema fixes `runtimeAcceptance` to
`not-assessed`. A good visual score cannot approve runtime use.

For Enceladus, retain distinct dimensions rather than one misleading "approved"
badge:

| Dimension | Examples of evidence | What it cannot establish |
| --- | --- | --- |
| Provenance/integrity | Original hash, source upload, archive lineage, immutable remote readback | Beauty, rights or safe construction |
| Technical validity | Decode, dimensions, duration, mesh structure, UV compatibility | Appearance on a real sphere |
| Artistic review | Legibility, atmosphere, science/fiction labeling, composition | Measured projector performance |
| Intended-use acceptance | Named screen/sphere material, projector, lens, brightness, throw, viewing angle and captured result | Structural approval or event placement |
| External permission | Specific rights evidence, professional design decision, organizer Offer Notice | Approval for a different revision or configuration |

Bind an acceptance to **asset hash + configuration revision + use**. A beautiful
human-in-water concept board stays useful concept art without becoming evidence
that a suspended occupied sphere, truck hitch or beach-water installation works.
A projector/material change should invalidate the relevant optical acceptance;
an updated caption should not erase an unrelated measurement.

Sources: [review schema](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/scripts/garden-intake-data.ts),
[prepare/apply/verify workflow](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/scripts/garden-intake.ts),
[supplied claims versus measurements](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/scripts/asset_metadata.py).

## 3. Build a focused review workbench

Umesemu's Bench puts rival candidates beside their intended use, allows notes
and yes/no/maybe verdicts, and includes **none of these** for a whole group.
Its gallery explains how an asset is used. Audio stops the previous audition
when the next starts. These small interactions support an actual creative
decision; a storage dashboard would not.

For Enceladus, the useful workbench is one candidate sheet with the render/video,
original download, selected alternative, observed defects and a next revision
request. Initial comparisons should answer bounded questions:

1. Can the ice texture read on the actual material under ambient light?
2. Does a person-to-moon transition remain legible from several viewing angles?
3. Which dry-land support option preserves the experience at the chosen budget?
4. Can the experience work without internal cameras or a participant inside?
5. Is the proposed grant scope understandable from one image and one paragraph?

Allow "none" and "need another candidate". Do not force a winner to make the
plan look complete. Keep an aesthetic rejection separate from a failed decode.

**Adapt the persistence, do not copy it blindly.** Umesemu stores one verdict
object per item and accepts partial fields, which avoids a delayed note save
overwriting a newer verdict in ordinary sequential updates. Its inspected
`createBench.put` still does read–merge–write without a visible compare-and-swap
in that function. That is not evidence of multi-user conflict safety. Our PG18
version should use transactions/version checks and record actor, date, asset hash
and previous revision for review changes. This is a design recommendation, not
a reproduced Umesemu concurrency defect.

Sources: [Bench persistence](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/server/bench.ts),
[candidate presentation](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/src/bench/items.ts),
[gallery](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/src/pages/gallery.tsx).

## 4. Judge the assembled experience, not the delivery label

Umesemu's garden assessment is a strong example. Its delivered model had named
anchors and plausible PBR materials, yet the inkwell occupied the space needed
by the open card; anchor names changed on load; water looked opaque; the lantern
did not illuminate; and repeated embedded textures inflated the package.
The written assessment retained the good parts and identified exact replacements.

These are historical measurements/verdicts in the source, not measurements I
repeated here. Their lesson is transferable: **the intended camera, lighting,
composition and runtime expose faults a supplier preview conceals.**

For this project, inspect actual sphere projection before funding expensive
rigging. Use our existing P0 optical bench to record material, viewing distance,
ambient condition, lens/throw, seam position, projection overlap, occlusion and
what the audience can read. Compare ordinary video to live imagery before adding
cameras. Keep the dry-land, unoccupied/no-internal-camera alternatives visible.

WebGL sphere previews and CAD can explain geometry and compare concepts. Neither
certifies optics, suspension, anchorage, weather limits or occupied operation.
The supplied code already states that its show controller is media-only and its
camera motion estimate cannot distinguish human movement from projection flicker,
camera motion or reflections. Preserve those limits in the product story.

Source: [garden judged under the app's own light](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/assets/quiet-light-v2/README.md).
Local counterparts: `docs/asset-understanding.md`, `deliveries/enceladus_v3/src/enceladus/show.py`
and `capture.py`. No new engineering limits are inferred here.

## 5. Keep prompts, generation settings and production contracts distinct

The current Umesemu run sheet explicitly rejects a universal word-count target.
It preserves useful composition/relationship details, keeps model/settings outside
copied descriptive text and separates generation from exact delivery requirements.
It labels suggested settings as untested comparisons and records contradictory
provider documentation instead of inventing certainty.

That is the important lesson. I did not revalidate current Midjourney syntax for
this study, and these notes do not endorse copying an old parameter string.

For Enceladus, split creative work by deliverable rather than asking one image
to be a persuasive poster, mechanically consistent rig diagram and calibrated
texture atlas simultaneously:

| Creative job | Production contract outside the prompt |
| --- | --- |
| Hero concept | Which proposed configuration it depicts; concept-art label; legible caption |
| Comparison render | Same camera/scale/lighting across ground, gantry and fixed-truck alternatives |
| Moon surface | Source/rights, map projection, seam orientation, texture dimensions and color handling |
| Human/ice transition | Consent and capture scope; output format, timing, mapping and fallback behavior |
| Technical diagram | Geometry/dimensions from the maintained model, not generated lettering |

Archive literal submitted prompt/settings and output identity when available.
Keep source imagery and scientific-data attribution explicit. Render engineering
labels from maintained text/CAD after image generation. A new prompt is a candidate
until judged in the intended use.

Source: [current prompt run sheet](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/docs/art-direction/prompts/midjourney-v8.2.md).

## 6. Give every audience a useful lightweight path

Umesemu's server produces a real HTML reading of a card. The scene mounts over it
only when it can render; a load failure or lost drawing context returns the reading.
Three.js is lazy-loaded. Controls and actual text survive without the garden.
The production release contains this code, but its full browser behavior was not
retested during this study.

Our static proposal site already gets the foundation right. Keep the story,
scope alternatives, funding request, accessible captions and downloads useful
before any 3D viewer loads. Add a preview on demand, preserve normal MP4 downloads
and avoid making a committee member wait for large CAD or a cinematic scene.

Umesemu also distinguishes original, reduced and explicitly experimental GPU
assets. The lossy GPU tier is not automatically selected before visual judgment.
Borrow that promotion rule; do not copy its device-memory thresholds as though
they were Enceladus performance measurements. Make thumbnails/posters derivatives
of preserved originals with recorded transforms. Ship only selected derivatives.

Sources: [plain reading](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/server/plain-reading.ts),
[fallback and lazy scene](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/src/main.tsx),
[quality policy](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/src/scene/quality.ts),
[selected build assets](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/scripts/sync-assets.ts).

## 7. Separate public presentation from protected production work

Umesemu separates the public app and Bench into distinct build entry points.
A build guard refuses Bench/prompt/gallery modules in the public bundle. The
server checks the expected host as well as relying on Authentik at the edge.
Missing private routes return 404 on the public host; hiding a navigation link
alone would not establish that boundary. Fresh curl results matched that design.

Enceladus currently serves the full verified catalogue to the tailnet and,
after P007's applied OR access change, authorized Authentik members.
That is still a project workspace. A later anonymous public/committee view needs
an explicit allowlist containing only its selected assets and documents.
The private recovered ChatGPT transcript stays excluded. Do not infer public
permission from a file being preserved or available to the crew.

Use the requested access model deliberately: real tailnet source **or** an
authorized Authentik account. Tailnet access is network trust, not proof of an
individual author. Read-only project pages can accept either; review/edit APIs
should require named identity. Machine broker tokens likewise do not identify
the human who approved an asset.

Grant reviewers outside the tailnet still need usable form attachments or an
explicitly approved share route/account. A login redirect is not delivery of a
grant packet, and it is not an Art Committee Offer Notice.

Sources: [public build guard](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/vite.config.ts),
[server host and route boundary](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/server/app.ts).

## 8. Borrow the storage boundary; retain our chosen PG18 stack

Umesemu uses Bun/Elysia, a storage interface, local operational counters and
lakeFS content through a server-only hesellsheshells principal. It is **not a
PG18 application in the inspected implementation**. We should not import its
card-specific JSON storage to replace the PG18 work Andrew requested.

| Enceladus responsibility | Recommended home | Reason |
| --- | --- | --- |
| Original uploads and ZIP recovery objects | Existing private B2 archive plus retained preservation history | Exact source recovery |
| Individual media, CAD, immutable render outputs | Existing lakeFS repository via scoped broker principals | Versioned bytes, immutable locators and readback |
| Candidates, reviews, selected alternatives, quote revisions and grant records | Project PG18 database | Relationships, transactions, queries and concurrent editing |
| Membership and login | Existing Authentik/Pawthentik/Much Ado authority seam | Avoid a competing account database |
| Frozen show media and calibration/configuration bundle | Verified local copy on the show machine | Keep essential playback independent of event connectivity |

The broker client refuses credential-bearing endpoint URLs and redirects; tokens
stay server-side. The lake reader compares returned bytes and sizes with stored
hashes. Those are concrete patterns to reuse. Umesemu's per-object write/commit
strategy is not automatically a transaction across several project records.
Keep our existing batch-preservation commit for imports and use PG18 transactions
for project decisions. Cross-store publication should record a pending state,
verify the immutable blob, then expose its reference; retry from a receipt rather
than pretend SQL and lakeFS share one atomic transaction.

Sources: [broker client](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/server/lake-broker.ts),
[lake storage and integrity](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/server/lake-storage.ts).
Our existing integration plan is `docs/stack-rollout.md`; PG18 exists but HBA
confinement and the shared-app runtime release remain unfinished.

## 9. Make the performance reproducible without tying it to the website

Umesemu represents its performance as a pure function of time. Its scene can
pause or start at a chosen timestamp, and audio follows the same clock. That
turns a defect into a reproducible moment rather than "it looked wrong once".

Our supplied show controller is stateful and reacts to timestamped input. Keep
its useful stale-input calm-moon behavior. For future media work, record the
configuration, input trace, time source and exact media revisions so the same
sequence can be replayed. A browser preview can explain that sequence; actual
show playback should use a pinned local media/calibration bundle and remain
independent of PG18, Authentik or Internet availability during the show.

Do not connect a website review verdict to a hoist, vehicle or safety actuator.
The existing media-only boundary is explicit. Physical safety remains a separate
engineering and operating responsibility.

Source: [time-based performance](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/src/card/timeline.ts).

## 10. Release the configuration and evidence with the code

Umesemu's release tooling records source revision, runtime and switch settings;
packages the expected systemd unit; verifies its asset allowlist; starts a
packaged release on a spare loopback port with disposable data; and exercises
page, private-route, missing-bundle and create/read/pace behavior before activation.
The declared deploy recipe delegates switching to Telpher's owner tool.

The relevant lesson is the complete release contract. New code can be healthy
while an old unit omits the environment that exposes its protected interface.
Likewise, a generic health 200 cannot prove the intended bundle is installed.
Our current static release has byte hashes and an atomic activation path;
preserve those when moving into Much Ado. Add source/module revision, schema
version, selected asset commit, service settings and an exact served-bundle check
to the integrated release receipt. Verify negative access paths as well as 200s.

Source: [source identity](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/deploy/source-revision.ts),
[release packaging](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/deploy/package-release.ts),
[packaged-release smoke workflow](https://git.telpher.stream/awb/umesemu/src/commit/053b2cf5ae461a3c7b67a12fca66877d3732bcc0/deploy/release-smoke.ts).

## What not to copy

Umesemu is an example with limitations, not a finished template. Its main still
contains an older asset-intake narrative saying 333 locators await unlock,
while the later checked-in receipts record their readback. Use dated receipts
and current state instead of choosing whichever prose sounds most complete.
The seasonal environment selector is explicitly a plan at the inspected main;
the 94-image catalogue is not proof that this selector or a seasonal homepage
is shipped. A separate homepage lane exists. Browser/mobile/accessibility and
asset aesthetic claims still need their own relevant proof.

Do not bring over its full React/Three authoring stack just to present a grant
proposal, its exact catalogue sharding for our small collection, its card-specific
rate limits or private-link semantics, or a garden generation matrix unrelated
to Enceladus's actual deliverables. Do not turn its review scores into automated
physical approvals. Do not replace ordinary media downloads with ZIP-only access.

## Concrete implementation order for this project

| Step | Bounded change | Acceptance evidence |
| --- | --- | --- |
| 1. Finish storage and runtime integration | Retain P005/P007's applied access; complete PG18 HBA and scoped broker principals, then the reviewed Much Ado release | Access evidence is recorded separately; remaining proof is DB confinement, broker scope and the integrated service |
| 2. Add candidate/use records | Reference existing catalogue hashes; add intended job, observed result, review history, permitted audience and intended-use decision | An exact candidate can be selected/rejected without changing its original; a changed hash/config cannot inherit the wrong approval |
| 3. Build a small review sheet | One candidate group, image/video comparison, normal downloads, note, yes/no/maybe/none and clear revision request | A named crew member's note and verdict survive a reload; concurrent edits conflict visibly or merge transactionally |
| 4. Create the optical proof packet | Reuse P0; compare selected dry/unoccupied scopes and material/projection choices | Actual configuration and observations attached to immutable candidate files; no physical-safety claim from a render |
| 5. Publish a selected grant/show release | Curated committee assets and a separately pinned local playback bundle | Every linked/downloaded file exists and hashes correctly; reviewer delivery works; show media loads without network dependency |

Access is implemented and [directly verified](site-access-verification.md);
the remaining rows and storage/runtime work are proposed follow-up slices,
not changes claimed complete by this study. Continue from the existing assets and Much Ado lane. The next
creative milestone is a measured, convincing optical proof and a defensible
grant scope, not a larger software platform.
