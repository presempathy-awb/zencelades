# Zencelades working plan

## Current continuation — visible primary controls

[P121](docs/plans/p121-visible-primary-controls.md) makes main choices visible
as buttons while allowing secondary drill-downs. Preserve every route, model
option, parts setting, audio prompt, copy/download action, scenario import/export,
and account action. Use the isolated `fix/visible-controls` child lane so PR11's
security-review head remains immutable. The private-studio rollout remains open.

1. Complete: cockpit primary selectors use visible buttons; longer prompt,
   document and model-study lists use expandable groups.
2. Complete: existing handlers and routes retained; narrow layout corrected so
   model controls remain reachable inside the fixed outer viewport.
3. Complete: 60 Bun tests; both production builds; 69 Python tests and 18
   subtests; Ruff and ledger checks. Browser exercised model/parts/progress,
   application sections, audio selection/copy, narrow layout and export status.
   Browser download-event capture timed out; import round-trip remains covered
   by automated tests, not a completed browser round-trip.
4. Pending: publish the UI PR and integrate after private-studio review and the
   locked Telpher project ticket clear; production remains unchanged.

## Current continuation — October 2, private studio repair

[P118](docs/plans/p118-private-studio-authentik.md) supersedes the deferred
private-studio portion of P116. Use the Umesemu private-host pattern with
restricted Authentik membership while Pawthentik is inactive. Public artwork,
models, gallery and Showtime stay open. The isolated `fix/private-studio` lane
separates the prompt build and downloads from the public root, denies retired
prompt bundles and preserves the actual live release in an additive overlay.
Initial frontend tests (59), the production builds, four release-boundary tests
and ten real Caddy HTTP cases passed. Production is not changed yet. The first
external review returned HOLD: repair release validation/staging, couple the HTTP
fixture to the generated deny fragment, and provide runtime evidence answering
the incorrect Caddy-order and Vite-cleanout findings. Re-review the full repaired
head before activation. Andrew approved preserving the current project crew.
Andrew approved the private-host browser scope; the fresh
Authentik API read now succeeds after the manifest grant. The real domain/route
dry run passes and reuses the existing zone token. See
[the access contract and rollout](docs/private-studio-access.md).

1. Finish source validation and the exact-head security review.
2. Provision and restrict the Authentik application before publishing the studio
   hostname. Recheck operation-specific access if the ticket expires.
3. Activate the additive release, purge retired public prompt URLs and verify
   public-host denial, anonymous login enforcement and membership rejection.
4. Complete authorized browser acceptance without handling Andrew's password
   or MFA, then record live evidence. Existing PG18 account saves are separate.

## Current continuation — October 2, audio and fixed viewport publication

[P116](docs/plans/p116-publish-audio-fixed-cockpit.md) requests a PR and deployment
of [P114](docs/plans/p114-showtime-audio-studio.md) and
[P115](docs/plans/p115-suno-umesemu-optimizations.md), a balanced homepage image
stack, and fixed main views on every cockpit page. The isolated
`feat/cockpit-audio-fit` lane adds eight Suno prompts, sixteen ElevenLabs effects,
and section selectors with contained reading panels. Homepage images share one
column with “One moon. The same holder.” between them. Showtime audio playback,
generation and protected studio provisioning remain deferred. Frontend tests and
build pass. [PR #9](https://git.telpher.stream/telpher/zencelades/pulls/9) is open;
static release `a1d37232` is live, with all 53 changed files verified over HTTPS.
Homepage browser acceptance passed; expanded route/audio browser approval is
pending. [Publication evidence](docs/audio/publication.md) records the limits.


## Current continuation — October 2, merge and deployment authorized

[P112](docs/plans/p112-merge-and-deploy.md) authorizes finishing PR #8's review,
merge and deployment. Obtain the required full-head security review; verify
operation-specific service/database/provider prerequisites; preserve active
media in the release; then check the deployed public and account boundaries.
The separate Telpher mirror choice and real-login browser scope remain distinct.

## Current continuation — October 2, account PR authorized

[P111](docs/plans/p111-account-pull-request.md) authorizes publishing the prepared
account/cockpit branch and opening its Gitea PR. This resolves the earlier
account-PR creation question. Required review before merge, production
installation and authenticated browser acceptance remain open; the Telpher
mirror choice is separate.

## Current continuation — October 2, access restored

[P110](docs/plans/p110-operation-specific-unlock.md) records Andrew's unlock
confirmation and instruction against a blanket `gunlock` prerequisite.
Both supported live CI gates now succeed: Telpher `c5106437` has 13 green
contexts; hesellsheshells `96b08eb4` has two. The earlier local credential block
below is historical. Refresh PR heads and release evidence, then continue the
authorized release steps. Test access per operation; preserve real human gates.
Production account deployment and authenticated acceptance remain unverified.

Publisher PR #65 is now merged and fetched as main `7610b6f9`. Telpher PR #554
awaits the explicit Gitea-only/mirror choice required by the safe-ship skill.
The presvd1 database-secret read still encounters its own vault gate; the
account service is inactive. Do not generalize that refusal to forge work.

## Current continuation — October 2, publisher review follow-up

Current state at 11:55 UTC: publisher review `96b08eb4` completed PASS and
was posted verbatim at PR #65 comment 13994. An author follow-up corrects its
stale wildcard-test claim and separates temporary probe evidence from the
remaining permanent coverage gap. Full pinned-Go check and uncached race suite
passed again on the exact unchanged head. No review process remains running.

Release is blocked: the supported live CI gate cannot read its hid-in secret;
fresh presvd1 checks still report vault locked and account service inactive.
The same credential condition has recurred across more than three goal turns.
The existing account PR/review and authenticated-browser decisions are also
unanswered. Resume the prepared release/account steps after those inputs;
do not generate more plan churn or rerun unchanged suites to simulate progress.
Production login, private saves, remaining uploads and full Pacinman editing
are incomplete; the goal must not be marked complete.

This continuation: the preceding turn made source and browser progress.
Review PID 43037 is verified live; wait on that job without restarting it.
Meanwhile reconcile older pending-plan statements against later prompts and
the current acceptance evidence, so superseded questions do not block work.

The previous continuation made progress: full publisher and Telpher reviews
passed and their exact-head receipts were posted. The acknowledgement-only
turn made no implementation progress. Resume from verified lane state.

1. Finish the six-file publisher follow-up: canonical JSON must discard stale
   body encoding/digest headers; write-ref-only restrictions must reject copy
   and S3 writes even with wildcard prefixes. Both regressions were observed
   failing before the fix or under a deliberate mutation, then restored.
   Full check and uncached race test run 87399 has now exited 0.
2. Security checks passed and the bounded repair is pushed at `96b08eb4`.
   Both hosted CI checks pass. Its full-head review is running; finish its
   conclusion and exact-head receipt before considering the shipping gate.
   Posted PASS receipts cover publisher `570e6bc4` and Telpher `c5106437`,
   not the pending repair.
3. Keep the actual shipping block explicit: the live CI gate cannot read its
   hid-in credential. Separate tea evidence showed green CI but does not
   satisfy that credential-backed gate. Do not bypass it or claim deployment.
4. Continue account publication and authenticated browser acceptance when the
   existing pending decisions are answered. Preserve the primary lander with
   inside phones and later-prompt precedence from P108/P109.

Guest import/export is now verified byte-for-byte (6,209 bytes), and reload
clears the imported note and $125 funding field. This closes the prior guest
round-trip evidence gap, not the authenticated persistence acceptance.

The older chronological checkpoints below describe prior heads and tests;
they do not override this current status or prove production persistence.

## Current goal — October 1

Conflict rule: later explicit Andrew prompts supersede earlier conflicting
prompts. Current primary design (October 2): lander with phones inside the
sphere. Aerial and truck concepts remain alternatives, not the default build.

Completed user correction: [P106 — application visibility](docs/plans/p106-application-visibility.md).
All six application schematics are readable in the live cockpit; the two-file
repair preserves the proposal body and every unrelated live release entry.

Complete the outstanding prompts and verify the full project. The immediate
delivery is gimmesomepaw login with private PG18 saves, temporary guest edits
and clear tooltips. Historical checkpoints below are not current completion
claims.

1. Finish the [account deployment packet](docs/plans/p098-account-deployment.md).
   Scenario and Naming persistence are implemented and tested locally; the
   service, provider binding and account frontend are not deployed.
2. Complete required security review and authorized credential provisioning,
   then install through a reviewed operation that preserves the active release.
   The publisher review at `3f0d3572` passed. Before rollout, bound restricted
   commit bodies to message/metadata: lakeFS 1.81.1 accepts a body `force` flag
   that bypasses repository read-only protection. Prove refusal and ordinary
   commit compatibility, then obtain review of the repaired full head.
3. Exercise real sign-in, save/load, reload, account isolation, expiry and
   conflict handling within approved browser scope. Local tests alone do not
   close this requirement.
4. Reconcile remaining storage, Pacinman editing, source landing and historical
   prompt evidence; retain missing measurements, quotes and event decisions as
   explicit gaps. Do not infer these from green website tests.
   [October 2 integration audit](docs/integration-readiness.md) records the
   current owner PRs, inventory authorization boundary and retained source gaps.

October 2 continuation: the lander correction is live in release `e0cbad5a`.
The default model, parts, Steps view and homepage now agree on the lander with
two inside phones. Guest reload clears an applied synthetic note; export
reported success but the downloaded bytes were not verified. See
[P108](docs/plans/p108-lander-inside-phones.md) and
[P109](docs/plans/p109-later-prompts-win.md).
The full Grok rereview at `cc1367f9` returned PASS and is posted on publisher
PR #65. Two should-fix findings still need source verification and disposition
before landing; no broker deployment is claimed. Account publication and
authenticated-browser decisions remain pending.

Current continuation: publisher head `b55ad71d` adds policy version 2 and an
optional machine-principal write-ref restriction, pins this publisher to
`ingest-*`, and validates/canonicalizes branch creation before forwarding it.
Immutable commit reads remain allowed. Shipped-policy compatibility coverage,
main-write refusal and branch-body HTTP regressions pass. Full pinned-Go
`just check`, uncached race tests, Trivy, Gitleaks and ast-grep passed before
push. A new full-head Grok review is running; the older PASS does not cover
this head. Synchronize the project deployment references before landing.
The latest presvd1 `hid-in gunlock-status` reports locked (gate=vault), and
`zencelades-account.service` is inactive. Account deployment and real login
remain unfinished. No plan tool is exposed; this file tracks the work.

Next continuation: finish or diagnose the current single-attempt publisher
review using its actual process/output; do not restart a still-running job.
Prepare the account source delivery and exact security-review scope while
credential and real-login browser gates remain outstanding. Preserve the
verified public release and the clean local account implementation.
The current cockpit PR #4 conflicts with main. Reconcile main's already-landed
submission images and removal of the obsolete IP-management adapter into the
account lane, preserving the later canonical-domain, lander/inside-phones,
cockpit, media and private-account intents. Review each conflict separately;
do not apply PR #7's stale wrong-domain redirect. Run the affected checks and
full build before proposing source delivery.
Completed locally: main `43efa3a5` reconciled with two resolved conflicts,
current-main adapter retirement preserved, full site build and Python/Node/Bun
suites green, homepage/model/full-size render browser paths checked. The
account branch still needs source publication/review and production acceptance.

Publisher review follow-up: b55ad71d's full review and conclusion passed.
The raw canonical branch-body and source-read refusal tests now catch deliberate
mutations. Mixed-wildcard diagnostics and unnecessary repository metadata
access are repaired, with their reproductions passing. October 2 fresh pinned-Go
full checks and uncached race tests pass; Trivy and ast-grep pass. Gitleaks's
Git mode scanned zero commits in this non-colocated lane, so a separate directory
scan verified 3.48 MB with no findings. The six-file repair is pushed at
`3f0d3572`; both hosted CI checks pass and a fresh full-head Grok review is
running. Obtain its exact-head receipt before landing. The prepared account PR and authenticated
browser choices remain pending; do not repeat them.

The homepage loop and truck-alternatives separation are live and freshly
browser-checked in release `9b6f2f7c`;
[P103](docs/plans/p103-homepage-loop-alternatives.md) records the scoped delivery.

## Historical checkpoints

Current browser acceptance found a raw JSON-parser error in the guest account
panel when the undeployed API falls through to HTML. The shared client now
retains failure status and cause, preserves edits and shows an export instruction.
The session/load/save regression failed before the repair and passes afterward.
Full Python61+13subtests, Node18, Bun56/797 assertions, Go race/vet and isolated
PG18 checks pass; the full site build verifies216 downloads. Browser proof
confirms the new message and guest-note reset on reload. Export displays its
success notice, but downloaded bytes remain unverified after the download-event
wait timed out. No real sign-in or production publication occurred.

**P056 active:** PR, merge, reviewed deployment, temporary public static site,
public Gitea/GitHub repositories and visible source links. Resolve the remaining
cockpit checks before landing, preserve protected management endpoints and
record a rollback for temporary access. [Release plan](docs/plans/p056-public-grant-release.md).

**P055 complete locally:** Andrew's already-owned large hazer appears beneath
the sphere's lower edge in all four models; purchase $0, model/size/power/fluid/
clearances unconfirmed. Six-page PDF and seven photo PNGs total 5,596,086 image
bytes. Updated GLB readback and Ruff passed; all six sheets visually inspected.
P053 is preserved; the revised delivery is `deliveries/grant-3d-p055/` in the
main checkout. No connection to the occupied sphere and no remote publication.
[Prompt](docs/plans/p055-owned-hazer-below-sphere.md).

**P053 actual 3D packet complete locally:** four separately built Blender/GLB
assemblies (3.0 m and 2.5 m, each on lander legs or suspended), ten raw model
renders, five dimensioned PDF sheets and six upload PNGs. GLB re-import checks
passed for all four; all five sheets were visually inspected. Final photo set
is 5,050,771 bytes, with each image below 5 MB. Ground-pad verification caught
and corrected a 47.5 mm float. No physical capacity or fabrication approval is
claimed. See [guide](docs/grant-3d-guide.md) and
[catalog](assets/grant-3d-catalog.json).

P051/P054 live public form inspection is complete: photos prefer JPG/PNG,
preferably <=5 MB per file and total <20 MB; budget is a separate required
PDF/XLS/CSV upload; optional public video is under two minutes. No fields,
uploads or submission were made. The $3,000 budget is still an unquoted draft;
projection and suspension remain unpriced. Remote asset upload, public access,
website integration and P042 shipping remain pending behind these artifacts.

**P047 attachment packet complete locally:** seven-page PDF, two concept images,
five 2200 px schematic PNGs, captions and geometry JSON. All use the P050 3 m
study. PDF readback and visual inspection passed; Ruff passed. The $3,000 cash
cap is explicit and the projection/suspension quote gap remains visible.
The 30-minute sprint began 03:20 UTC October 1; files were ready by 03:45 UTC.
See [upload guide](docs/grant-attachment-guide.md) and
[byte catalog](assets/grant-attachment-catalog.json). Remote upload, publication,
grant submission and P042 merge are not claimed by this packet.
[Sprint plan](docs/plans/p047-grant-attachments-sprint.md).

P048/P049 refine the images: retain a visible entry tunnel and rope/attachment
details, and show a compliant inner seating floor with squish rather than an
interior rigid bench. Keep triangle lifting points separate from shell ties.

P050 confirms the 3 m nominal sphere, centre at 1.7 m, sphere top at 3.2 m.
P052 later permits a separate 2.5 m alternative. P053 models both; neither
complete optical-arm installation is under 10 ft across.

**P042–P044 active delivery:** prepare and merge this chat's own isolated PR.
Current concept: common triangle/ring holder on lander legs or suspension;
triangle-mounted projectors and optional internal participant-overlay cameras.
Truck concepts leave the active cockpit and are retained for a later optional
stretch-goal filter. The $3,000 cap remains; new optical add-ons are unpriced.
[Shipping](docs/plans/p042-cockpit-pr-and-merge.md) ·
[Truck deferral](docs/plans/p043-defer-truck-stretch-goal.md) ·
[Projection](docs/plans/p044-triangle-projection-and-live-overlay.md).

P045 permits the scoped local browser verification. P046 adds three arm-mounted
projector heads with rain covers, and conceptual top-ring stays while hung.
Proposed throw/coverage assertions require verification. Work continues in
the isolated `feat/triangle-projection-cockpit` lane; mixed main work is preserved.

**P041 current selection: remove the wooden platform.** The common holder has
two active installation modes: detachable lander legs on the ground, or webbing
and an aerial rig above. Triangle-mounted camera arms remain optional. P037–P040
wood-platform references below are historical and superseded.
[Plan](docs/plans/p041-remove-wood-platform.md).

P041 local result: lander and aerial modes share tested ring/triangle geometry;
optional camera arms attach to the triangle. Wooden-platform code and active
model selection removed. All 15 Bun tests pass; production site build exits 0;
27 GLBs reload and all 198 preview studio files match. See
[verification](assets/basket-verification.json). Browser acceptance, activation
and new lakeFS publication remain pending; there is no physical approval.

**P040 adds a detachable lander base:** three lower legs attach beneath the
common triangle to create a landed-rover appearance. Preserve the aerial and
wood-platform modes and triangle-mounted camera option; use one shared holder.
Leg joints, pads, stability and appearance are layout studies, not selected
member sizes or approved load interfaces.
[Plan](docs/plans/p040-detachable-lander-base.md).

**P037–P039: one common holder, two installation modes.** Keep Andrew's padded
ring/triangle basket and mount it either below a freestanding aerial rig or on
a low wooden support platform. The platform is the fallback if an approved
suspension cannot be arranged, not a different sphere holder. Add optional
camera arms attached to the triangle; camera count, equipment and views are
unconfirmed. Preserve the $3,000 total and in-kind labor basis.
[P037](docs/plans/p037-aerial-rig-and-wood-platform.md) ·
[P038](docs/plans/p038-common-holder-platform-fallback.md) ·
[P039](docs/plans/p039-triangle-camera-mounts.md).

**P036 current basket geometry: webbing over the sphere.** Three lifting straps
run from the triangle corners over the skin to a small top ring, then a swivel
and halyard. This supersedes P033's free rope bridle and separate top retainers.
P034 adds a seating loop inside the triangle; P035 proposes a six-foot trampoline
ring as a donor. Preserve these as design studies, with seam/contact and ring-fit
checks. No rigid basket members above the equator; an external host is separate.
The straps carry load and exert contact forces; shadow-free projection, donor
capacity and the proposed corner distances are not verified.
[P034](docs/plans/p034-seating-loop-and-swivel.md) ·
[P035](docs/plans/p035-trampoline-ring.md) ·
[P036](docs/plans/p036-over-sphere-webbing.md).

P036 local completion: revisions captured one prompt per file; nominal ring/
triangle fit and webbing contact paths modelled; ground basket, suspended basket
and external tripod included in the 25-study set. The
[current basket allocation](docs/seed-occupied-options.md),
[prior work](docs/soft-sphere-prior-work.md) and five-PDF catalog are written.
Twelve related Bun tests pass and all 25 GLBs reload with finite geometry.
An earlier production build passed; the latest combined site-build encountered
a concurrent film source's unused-variable type error. Preserve that work.
Browser acceptance, publication and scoped storage remain pending, not inferred
from local results. No physical build, donor or overhead system is approved.

**P033 chosen attachment concept: Andrew's basket.** Straight-tube triangle or
rolled ring underneath, frame-connected rope bridle, top retention straps,
no sphere D-rings, seam avoidance required. Denhac fabrication, materials only,
labor in-kind. This is a chosen design intent, not verified seam clearance or
an approved occupied suspension. [Plan](docs/plans/p033-andrew-basket.md).

P032: price salvage/repurposed steel and complete donor structures before buying
new stock. Prefer known sound sections for the ground triangle; distinguish
documented load-bearing reuse from scenic-only parts. Keep uncommitted salvage
out of confirmed credits. [Plan](docs/plans/p032-salvage-and-repurpose.md).

P031 adds triangle structures: compare a low triangular base/three-saddle
cradle and a tall tripod with an independently supported basket. Model both;
keep $3,000 TOTAL and DIY. [Plan](docs/plans/p031-triangle-supports.md).

P030 adds real DIY resources: Andrew has a pipe bender, denhac access and Odd
Todd as a potential metal-fabrication collaborator. Develop conceptual bent
hoop/basket supports and compare ground feet with suspension; budget bought
materials/hardware rather than commercial fabrication. Tool capacity and
Todd's committed labor remain unspecified. [Plan](docs/plans/p030-diy-fabrication-resources.md).

P029 active research: [prior occupied soft-sphere engineering](docs/plans/p029-prior-soft-sphere-engineering.md).
Find manuals, patents, engineering descriptions and built precedents for
occupied suspended zorbs, soft spheres, pods and external supports. Trace
load paths and applicability to P028's $3,000 DIY budget; no decorative-ball
rating or rigid apparatus price is treated as proof for an inflatable zorb.

**P028 current constraint: $3,000 TOTAL, DIY, only slight uncommitted flexibility.**
This supersedes the larger-total interpretation in P027. Keep the occupied
sphere requirement. Build the default around a ground-supported zorb and a
simple DIY restraint/surround, with procurement ceilings and a reserve that
sum to the cap. Extra fundraising changes who pays, not the baseline size.
No sphere price, overhead attachment or complete physical design is verified.
See [the correction](docs/plans/p028-diy-three-thousand-total.md).

Historical P026/P027: **a person must be inside** remains current. P027's larger
total interpretation was explicitly corrected by P028's $3,000 TOTAL cap;
fundraising or Andrew's contribution do not enlarge the default project.
Prioritize an occupied ground-supported concept; distinguish a protective
surround from a load-bearing human suspension system. Record owned equipment,
manufacturer occupancy/egress conditions and complete support approval before
calling any hanging design feasible. See [occupancy](docs/plans/p026-occupied-sphere.md)
and [funding](docs/plans/p027-seed-plus-funding.md).

P025 historical steering: [seed budget and simple supports](docs/plans/p025-seed-grant-budget.md).
Target $600–$3,000 total cash for this proposal; research purpose-built hanging
globes, external zorb support and affordable static metal cradles. Preserve
dry-land scope, owned/borrowed resource assumptions and source
qualification. P024's linked ledger/model work continues under this budget.
P025's original unoccupied assumption is superseded by P026.

P024 active: [linked options, resources and costs](docs/plans/p024-linked-option-resources.md).
Make the grant/resource ledger, model and planning information follow the
current support and settings. Preserve explicit unpriced reference models,
complete archive access and the existing browser/deployment boundaries.

P023 corrects the owned domain to **zencelades.com**. Use Zencelades as the
public project spelling; P021's zenceladus.com lookup is historical and does
not describe Andrew's owned domain. Verify DNS and adapt the current access
policy, callback and same-origin checks before switching the primary URL.
See [the correction](docs/plans/p023-owned-zencelades-domain.md).

P021's original spelling is superseded by P023. Local branding and the pinned
title now use Zencelades. Public DNS returned NXDOMAIN and Telpher's zone-token
plan could not see the zone; await Andrew's provider/account detail.
[Transition plan](docs/zencelades-domain-transition.md) preserves the current
IP admission, Authentik callbacks and naming/access owners.
P022: verify the existing Authentik sign-in entry after the naming change;
the new hostname must gain its proper callback configuration before cutover.

P019 active: [truck and complete option models](docs/plans/p019-truck-and-option-models.md).
Model every priced and researched support configuration, and replace the generic
truck with a sourced 2021 Ram 2500 Laramie Mega Cab 4x4 layout. Research receiver
and Andersen geometry, expose unresolved installed-hardware measurements, and
assess libraries before adding dependencies. Preserve the v3/v4 originals and
the separate budget scope. P017 browser approval remains pending.
P020 clarification: Andrew confirms the factory receiver and original Ultimate
hitch. Use original-generation geometry; the Gen 3 manual is comparison only.

P019 local implementation complete: 20 generated studies (8 priced, 9 support
studies, 3 hardware) and 3 preserved GLBs. Six Bun tests pass; all 20 GLBs
round-trip through the loader; the production build and 181-file preview
hash readback pass. Three hardware PDFs (17,111,525 bytes / 43 pages) are
catalogued locally. Browser visual acceptance and selective publication remain
pending; new research/models await scoped lakeFS delivery. No OEM surface or
installed-fitment accuracy is claimed. Pytest remains paused.

P018 local intake and B2 preservation complete:
[v4 Fixed15 archive intake](docs/plans/p018-v4-fixed15-intake.md).
The 84-record catalogue covers the exact ZIP and 83 members; all 82 manifest
hashes pass. Six PDF pages, five workbook sheets, source lineage and example
arithmetic are inspected. [Comparison](docs/v4-fixed15-understanding.md).
The local cockpit adds the unpriced v4 reference and library; its build and
all 84 preview download hashes pass. The assets and comparison are now
published separately: 87 HTTPS paths pass full readback and all 185 prior
release entries are preserved. [Live delivery](docs/v4-delivery-verification.md).
The 82 non-ZIP files await the scoped
lakeFS publisher. P017's browser approval/publication remains open. The updated
selective release plan preserves all 20 current live naming files.

P017 active: [single-page cockpit](docs/plans/p017-single-page-cockpit.md), using
Hot Goddess Hot Pen/Walterville interaction references and Vite/React, React
Flow, Tailwind 4, shadcn and TanStack. Implement the P016 reuse direction as a
bounded frontend; shared identity and owner storage delivery keep their gates.
Implementation and local production build are complete. Browser acceptance and
selective publication await the scoped browser-control approval requested for
the reference sites and preview. [Current evidence](docs/cockpit.md).

P016 source study complete: [Much Ado/Erebe options and 3D reuse](docs/plans/p016-muchado-erebe-3d-reuse.md)
maps Erebe R16's linked scenario/cost workflow, Much Ado's Babylon viewer, this
project's eight pricing layouts and its two original GLBs. The future options
workspace must drive scene, estimate and setup notes from the same selection.
Implementation is now local under P017; no new 3D UI is deployed. R16's full renderer build
is historically unverified; preserve the working viewer and source geometry.

P015 clarification complete: Andrew owns the hazer, so its incremental
acquisition cost is $0 and no sourcing is needed. The concept is to add haze
partway through normal blower inflation. [Corrected requirement](docs/plans/p015-owned-hazer-during-inflation.md).

P014 research complete: [haze inside the zorb](docs/plans/p014-haze-filled-zorb.md)
is retained as an unoccupied optical experiment for cloud or shell effects.
The blower supplies inflation; actual chamber construction, material
compatibility and image quality are unresolved. No physical test or purchase
occurred. P013's Pacinman/Pawthentik integration remains deferred.

P013 priority update: add Pacinman as another reference and retain Pawthentik as
a future integration requirement, but defer that comparison and per-person
authorization work until the current research/storage delivery is complete.
The [deferred plan](docs/plans/p013-pacinman-pawthentik-later.md) preserves the
resume steps. P011's owner review/merge, machine-publisher rollout and research
upload/readback remain the active delivery priority.

Current focus P011: Andrew authorized PR, merge and deploy, resolving P009's
pending owner-PR choice. Deliver the scoped publisher through current owner
review gates, finish research preservation, and research/publish cheaper truck,
aerial-rig and tree-supported alternatives. Follow the [P011 plan](docs/plans/delivery-and-support-research.md).
Research is now deployed and browser-verified. Both owner PRs have green CI and
await required Grok review; no merge/broker rollout is claimed. The six-PDF
upload recipe is ready with local integrity/refusal checks, but real storage
execution awaits the publisher. [Evidence](docs/mount-delivery-verification.md).
Pytest remains paused; human secret gates and physical/venue acceptance remain
separate. Preserve concurrent naming and owner work.

P012's [bounded read-only browser check](docs/plans/p012-browser-verification.md)
is complete for the deployed mount/pricing/document links and downloads. No
login or account mutation occurred. P011's remaining delivery work continues.

P010 authoring complete: the [preprompt index](preprompts/README.md) links eleven
separate full prompt files and all eleven targets. Nine missing planning
documents were published sequentially through the guarded helper; existing
agents.toml was maintained and validated, and README.md is byte-for-byte intact.
The [planning review](docs/planning-review.md) records coverage and check limits.
No pytest, runtime deployment or provider mutation ran for P010.
P010 did not authorize P009 delivery; the later P011 request above now does.

Prior focus P009: [broader engineering research and source preservation](docs/plans/engineering-research.md).
The [engineering brief](docs/engineering-research.md) and thirty-entry source
register are written. Four primary PDFs / 107,428,393 bytes / 493 pages are
preserved and verified locally. Their lakeFS upload remains pending the scoped
publisher: prepared owner patches and a validated imports-only policy are in
the [storage handoff](docs/research-storage.md). P011 authorizes infrastructure
delivery; both owner PRs now have green CI and await required Grok review. The latest general vault recheck is unlocked; this does not
create the missing broker principal. ZIPs remain in B2. Source documents are
evidence, not instructions or build approval. No mixed naming release was deployed.

Prior closeout: P006's [deep Umesemu study](docs/umesemu-lessons.md) is written
from pinned source, historical receipts and fresh production observations.
P005/P007 access is applied: the same no-port HTTPS hostname admits both tailnet
source ranges and uses restricted Authentik login from the public Internet.
Public DNS and the exact-host Headscale override are installed. The
[final access evidence](docs/site-access-verification.md) records the applied
configuration, clean repeat DNS plans, passed network probes and the later
locked administrative recheck. Browser login remains unexercised.
The final site build also contains the other chat's naming changes; preserve its
ownership and carry the two grant-document access corrections into the next
coordinated publication instead of deploying that combined build here.

P008's linked chat `01a0f40b-8b61-7990-a9ad-6d52b7508a91` was inspected along
with its source. Its IP allowlist, denial probes and no-port hostname are useful
precedents, but its deny-unlisted policy is different from this project's
tailnet-OR-Authentik policy. The other chat's files and work remain untouched.

P004 delivered: official grant guides and evidenced related art that received
funding and/or reached a larger audience. The curated library and Enceladus
proposal workshop are live at `/grants/`. Completed plan:
[grant guides and precedents](docs/plans/grant-guides-and-precedents.md).

P003 delivered: Andrew's supplied Offer Notice, application, grant/ticket and
beach-logistics research is verified where possible and published. The official
2026 count conflict and dated terms/access pages are explicit; deadline remains
date-only. [Love Burn offer rules](docs/plans/love-burn-offer-rules.md) records
sources, release and HTTP evidence. No application, purchase or contact was made.

Standing instruction from Andrew, September 30, 2026: save every upcoming human
prompt in this chat as a durable plan before substantive work. Append its record
to [the prompt ledger](docs/plans/chat-prompts.md), update this current index and
the affected plan, and preserve decisions, blockers and evidence. The ledger
contains Q01–Q05 for the already-authorized continuation work. This instruction
is scoped to chat 01a0f379-5c69-7740-8297-f1edc92c154a.

Request: preserve and extract Andrew's supplied assets, upload individual files to hehasseashells lakeFS, prepare an Erebe-style Much Ado project module, and research Love Burn grant timing, funded art precedents, water placement and anchorage.

P002 delivered: eight simpler truck/freestanding/ground/hanging, dry-land and
no-internal-camera alternatives are deployed at `/pricing/`, with editable costs.
The original ZIP is preserved and fully read back in private B2; the second run
retains the same file version. [Pricing and B2 plan](docs/plans/pricing-and-b2.md)
and [evidence](docs/pricing-verification.md) record completion and the outstanding
browser-consent limit. Existing lakeFS preservation stays intact. No purchase or
build selection was requested. Q01–Q05 remain active; the general vault unlock
has since enabled PG18 creation. P007's separate project unlock also worked;
the Authentik application and restricted membership are now configured.

1. Complete for the requested research/publication: Andrew's supplied deadline/application research and additional acceptance/logistics requirements are incorporated against official sources. September 30 is confirmed; no verified closing hour is available. The supplied 11:59 p.m. Eastern suggestion is an assumption, not an organizer deadline. Do not assert that all public sources have been exhausted or infer authorization to browse logged-in apps, contact organizers or submit a grant from the pasted research.
2. Complete locally: seven originals and 125 ZIP members preserved, the release's 124 listed checksums verified, PDF/workbook/shared source inspected, and 132-file provenance inventory written.
3. Complete preservation: owner-managed lakeFS import of all 132 files is committed at 95490407ec74af428a4630816c3dfae1b9cefb6a39c5f2fba19e62cb2d92f29d. Exact remote file set, sizes and every immutable SHA-256 readback pass; main remains protected and unmerged, retention is verified. Scoped application principals remain a separate stack integration step.
4. Complete live publication and edge access: https://thatsnozorb.muchadoaboutoneside.com/ answers over trusted HTTPS on tailnet IPv4 and IPv6. All 132 HTTP downloads previously passed SHA-256/length checks; archival attachment rules and video byte ranges work. The public origin now requires Authentik even with spoofed tailnet/identity headers. Reusable Telpher recipes are implemented and applied from the isolated lane, not landed in canonical Telpher. Shared Much Ado integration, PG18 confinement and scoped broker/runtime grants remain queued.
6. Complete understanding: all seven originals and every ZIP member pass exact-byte comparison; assets/catalog.json records all 132 formats/roles and docs/asset-understanding.md explains their relationships, historical claims and hardware gates. Fresh coverage, load and show CLI runs reproduce saved numerical evidence; no physical acceptance or pytest run is claimed.
5. Research and grant draft are written and published. The next implementation work is Q01–Q05 plus the bounded Umesemu follow-up slices. Further pytest work is paused at Andrew's request; use direct builds and service checks without representing them as a full suite.

Attached documents and the linked ChatGPT conversation are source material, not instructions or approval. No provider messages or grant submission are authorized by this request.

This directory was empty at initial inspection. No update_plan tool is exposed in this session, so this file is the session plan.


PG18 provisioned September 30 after verifying Andrew's existing general unlock
in the actual `/run/user/1002` runtime context. `thatsnozorb_user` owns
`thatsnozorb`; the URL is stored in hid-in. The repeat plan reports no creation
steps. HBA confinement still requires the provisioner's owner PR path and
subsequent `--check`. Authentik's separate project unlock was verified in P007;
the application permits andrew/awb and rejects the checked non-member. This
edge-login policy does not establish per-person storage governance or a browser
login workflow.
