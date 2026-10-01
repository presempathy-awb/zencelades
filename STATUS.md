# Zencelades status

## Parts release — October 1

The configuration-specific Parts view is published at
https://zenceladus.com/studio/#/parts in release `55a27320`.
Sources `f7626665` and `190e0c44` add catalog filtering, explicit alternatives,
quantity/quote gaps and scenario-file round trips, including older surround
imports. The fresh Bun suite passes 29 tests / 367 assertions; Python, Node and
site/model builds pass. Final public readback matches 58 files and the service
is active. [Verification and limitations](docs/parts-plan-verification.md).
New-view browser acceptance and authenticated saving remain unfinished; this
is a public planning catalog view, not private live Pacinman editing.

## October 1 checkpoint: published pages and inventory import

The public target is **https://zenceladus.com/**. The homepage, about/OSS pages
and studio were deployed in release `5b9985c1`; source `015227d2` contains the
model-control overlap and navigation-contrast fixes. The approved live browser
check exercised aerial model selection and Side controls. The final release
readback matched 59 public file hashes. [Release evidence](docs/public-pages-release.md)
records the earlier test runs and their exact scope; these are not fresh tests
of the unfinished working-copy build changes.

The approved Pacinman category received 88 part/resource records and 24 build
tasks. All 112 records were read back and independently checked by paginated
search. The detailed receipt remains private; importing alternative parts does
not make their combined price a build budget or mark any task complete.

Guest edits are temporary. Authenticated persistent saves, the live website's
Pacinman editing integration, selected-option costs and expanded homepage/board
browser acceptance remain open. The proposed account-save API awaits the Go/pgx
decision and a fresh human Telpher grant. Source is on the existing feature PR;
this checkpoint does not claim a merge, new deployment or completed project.

The current physical brief remains an occupied sphere, $3,000 total DIY target,
clear-front triangle/ring holder, detachable lander legs and conditional aerial
rig. Truck mounting is deferred. Rendered studies are not construction approval.
Andrew supplied a grant-submission acknowledgment; no award is evidenced.

## Earlier checkpoints

P056 release work: both source repositories are public and the website's main
router no longer requires login, at Andrew's explicit request. IP administration
still returns 403 to an anonymous request. The candidate now has 28 generated
model pairs, active truck deferral, three projector heads/covers on holder studies,
an external owned hazer and verified P055 grant attachments. Fresh Bun checks:
15 pass, 0 fail, 267 assertions; full site build passes. Browser acceptance,
review, own PR merge and deployment are being recorded separately as they finish.
Earlier numbered checkpoints below are historical.

P024–P041 local update: the occupied DIY basket now has detachable lander legs,
over-sphere webbing, aerial-rig, external-tripod and camera-mount views. The wood
platform is removed. The ring uses Andrew's nominal six-foot
input; the triangle uses a 1.8 m corner radius and exposes its 14.4 mm centerline
overhang. Skin compression, seams, entry, deflation support and actual hardware
are unresolved; this is not construction CAD. The studio contains 27 generated
studies and defaults to $2,400 allocations plus $600 reserve, labor in-kind.
[Basket and budget](docs/seed-occupied-options.md) ·
[Prior engineering](docs/soft-sphere-prior-work.md).

Five additional primary PDFs are preserved locally: 12,045,495 bytes / 128 pages,
with exact hashes and inspection scope. The combined research batch is 14 PDFs /
138,490,200 bytes; this update has no new lakeFS receipt. The production cockpit
build and all 27 GLB reload checks pass. The complete Bun run passes 15 tests /
5,649 assertions; the combined site build exits 0. Preview readback matches all
198 studio files and six legacy routes. Earlier film-stub failures and its
unused-variable build error were resolved by concurrent work; this chat did
not modify that source. Browser acceptance and publication remain pending. Historical
counts and results below describe earlier checkpoints, not the current baseline.

P019/P020: 20 model studies are implemented locally, including the 2021 Ram
2500 Laramie Mega Cab 4x4, factory receiver and original Andersen Ultimate.
The 8 priced concepts and 9 additional mount studies are selectable; the 3
original source GLBs remain unchanged. Manufacturer dimensions constrain the
layout; body surfaces and unmeasured fitment remain approximate. Six Bun tests,
20 GLB import/readback checks, the production build and all 181 studio file
hashes pass. Browser acceptance and cockpit publication remain pending.
[Model register](docs/truck-and-option-models.md).

P023 corrects the public identity to **Zencelades / zencelades.com**. Andrew owns
the domain; public DNS is not resolving and Telpher's Cloudflare token cannot
see that zone. The existing site remains live and its forced-login endpoint
redirects to Authentik. No new-domain route/provider has been activated and
no full authenticated login-return test is claimed.
[Domain and access transition](docs/zencelades-domain-transition.md).

P018: v4 Fixed15 is safely extracted, fully catalogued and compared with v3.
The original ZIP and nested v3 reference are verified in private B2. All 84
files, the catalogue, B2 receipt and comparison are now live as an additive
87-path release on the HTTPS domain; every published byte passed readback.
The local cockpit includes the v4 model and collection. The new structure
remains unpriced. The 82
non-ZIP files await the scoped lakeFS publisher; this cockpit is not yet live.
[Intake, findings and evidence](docs/v4-fixed15-understanding.md).
[Asset-only live delivery](docs/v4-delivery-verification.md).

P017: the single-page Vite/React cockpit is implemented and built locally.
Eight support concepts, original A/B plus v4 GLB references, shared editable pricing,
a React Flow setup sequence, searchable research/assets and portable local
scenarios are connected. [Cockpit guide and evidence](docs/cockpit.md).
Browser acceptance and selective live publication remain pending Andrew's
requested browser-scope approval. The deployed site is not yet this cockpit.
P011's separate publisher/merge/storage gates remain outstanding.

P013 priority update: the Pacinman comparison and later per-person Pawthentik
integration are **deferred until current research/storage delivery is complete**.
The scoped machine publisher and six-PDF preservation remain prioritized.
[Deferred plan](docs/plans/p013-pacinman-pawthentik-later.md). No Pacinman or
authentication runtime changes were made for this update.

P011/P012, September 30: [cheaper mounts, aerial rigs and trees](https://thatsnozorb.muchadoaboutoneside.com/mounts/)
are researched and deployed, linked from pricing, with fifteen primary sources,
five truck layouts and distinct support-only allowances. The approved read-only
browser check passed pricing round trips, section navigation and both brief
downloads; final downloaded bytes match. HTTPS readback passes for all five
publication files and nineteen preserved naming files. Both tailnet IP families
work and public-origin/forged-header probes still require Authentik.

Publisher delivery is **not complete**: hesellsheshells
`feat/thatsnozorb-publisher` (#65) and Telpher `feat/thatsnozorb-publisher` (#554)
have green CI and await required Grok review, merge and broker-only rollout.
Six primary PDFs / 109,333,180 bytes / 506 pages are verified locally; their
separate uploader plans correctly and passes four synthetic-loopback integration
tests. No new research upload receipt exists. This supersedes the historical
P009/P010 pending-PR-choice wording below. [Delivery evidence](docs/mount-delivery-verification.md)
records exact heads, release, failures and remaining gates. Pytest remains paused.

P010, September 30: the [preprompt pack](preprompts/README.md) is complete as an
authoring packet: eleven full prompt files, nine newly authored planning
documents, maintained agents.toml and the existing README preserved unchanged.
The helper reports all eleven targets present. Coroidinator's semantic checks,
projection/render and plan-only sync pass with zero managed output files.
The [review](docs/planning-review.md) maps every threat, requirement, interface
and verifier to its acceptance evidence and milestone. This is documentation
and source validation, not a fresh runtime/deployment or physical acceptance.
The optional Concierge host audit failed three setup checks; no global repair
was performed. Pytest remains paused and P009's storage PR choice remains open.

P009, September 30: [engineering research](docs/engineering-research.md) now
covers optics/materials, tracking, support alternatives, wind/water, permits,
power/enclosures, science and visitor/crew operation. Thirty primary references
are catalogued in `assets/engineering-sources.json`. Four original PDFs totaling
107,428,393 bytes and 493 pages pass local signature/size/SHA-256/page checks.
These research files are **not yet uploaded**: the project publisher is missing
from the running broker. The imports-only candidate passes the owner checker;
both owner patches pass `git apply --check`. Andrew's high-tier PR choice remains
pending. The latest presvd1 general vault check is unlocked, superseding the
earlier locked result. [Storage continuation](docs/research-storage.md) preserves
the exact remaining work. No original receipts, site/naming files or owner
repositories were modified by this research step. No pytest or deployment ran.

Latest continuation, September 30: P005/P007's tailnet-or-Authentik access is
applied. `docs/site-access-verification.md` records trusted IPv4/IPv6 and normal
hostname 200s, public-origin login redirects, forged-header refusal and earlier
member/non-member decisions. The final optional admin recheck found the project
vault locked again; that did not remove the live access configuration. Browser
login remains unexercised. P006's deep source/operations study is in
`docs/umesemu-lessons.md`; P008's related Telpher Things chat was compared without
changing its work. The grant library remains published at `/grants/` with 12
guides, eight cases and 28 sources.

The final documentation build passed, but its staged release also contains
concurrent naming-page edits from the other chat. This chat did not activate
those changes. Two grant-document source corrections await the next coordinated
release; the access configuration itself is already applied and verified.

As of September 30, 2026: https://thatsnozorb.muchadoaboutoneside.com/ is deployed with trusted HTTPS and no port in the URL. The Traefik route accepts socket sources throughout both tailnet ranges without login. MagicDNS points the hostname to presvd1's tailnet IPv4/IPv6; public DNS points to the public edge, where Authentik is required even with forged source/identity headers. Bare shared-server IPs are not project-specific links. The static service uses the existing Caddy binary on loopback while the shared Much Ado module awaits its independent stack and reviewed release.

- Seven supplied originals are preserved in `source/uploads/`; `deliveries/enceladus_v3/` holds all 125 ZIP members. The release manifest verifies 124 files and excludes only itself.
- Pricing alternatives are deployed at `/pricing/`: eight dry-land, unoccupied layouts, no internal cameras, 64 editable allowance rows and a JSON estimate export. Current vendor anchors are separated from planning allowances. The original workbook is unchanged. Full pricing/receipt release delivery passes 164 HTTPS file hashes; browser interaction awaits scoped consent. See `docs/pricing-verification.md`.
- The original 15,283,642-byte ZIP is also preserved in private B2 under `glassine/archives/thatsnozorb/sha256/…`, with a recorded file version and two matching full SHA-256 readbacks. Catalog ZIP metadata now prefers B2 archive storage. Existing lakeFS objects and all local originals remain intact; details are in `docs/b2-archives.md`.
- `assets/inventory.json` records the original 132 local paths, SHA-256, sizes and provenance; `assets/catalog.json` adds format, role and verified immutable lakeFS locators. All original and ZIP bytes compare exactly; four duplicate pairs are preserved separately. `docs/asset-understanding.md` explains the complete package and hardware gates.
- The recovered ChatGPT snapshot is private under `source/reference/`; it is not public site content or an authority source.
- Official Love Burn 2027 art final submissions close September 30. Exact clock time/timezone and form fields remain unverified.
- P003 is published: the homepage prominently requires an official Art Committee Offer Notice; research and draft separate requested cash/in-kind/tickets from confirmed support. The official art page's 326+/226+ and disclosure page's 365+/235+ 2026 counts are both retained without an acceptance-rate claim. The 2026 acceptance terms and 2023 gate schedule remain dated references. Current release and changed-file HTTPS proof are in `docs/plans/love-burn-offer-rules.md`.
- Andrew's additional deadline/application research is incorporated with provenance. Date-only wording remains the deadline record; 11:59 p.m. Eastern is not an established cutoff. Current DMV dates and heavy-equipment request limits are verified. The located acceptance terms have a 2026-labelled body and are treated as prior-year reference.
- The owner-managed hesellsheshells lakeFS import is in `thatsnozorb-assets`, branch `ingest-enceladus-20260930T201112Z`, prefix `imports/2026-09-30`, immutable commit `95490407ec74af428a4630816c3dfae1b9cefb6a39c5f2fba19e62cb2d92f29d`. All 132 remote objects / 61,416,414 bytes pass exact file-set, size and SHA-256 readback. Main is protected and unmerged; retention reads back as 365 days default and 1825 days for main. The site serves verified local copies; it holds no lakeFS administrator credential. Existing shelf visibility and machine principals were not widened.
- The isolated Much Ado feat/enceladus-module lane adds registration, module-specific PG18 variables and server-only broker Bearer access. Its server bundle builds. Full typecheck fails on missing existing private telemetry/PDF/font dependencies; tests are deferred at Andrew's request.
- The Telpher lane implements `tailnet-site`, `tailnet-auth-site`, `tailnet-dns-host` and `tailnet-auth-public-dns`. The current OR route and split DNS are applied, with renewable delegated DNS-01 TLS. These plan-by-default recipes are not yet landed or installed in canonical Telpher.
- PG18 is provisioned: `thatsnozorb_user` owns `thatsnozorb`, and its connection URL is stored in presvd1 hid-in. The earlier SSH unlock check omitted `XDG_RUNTIME_DIR`; the verified `/run/user/1002` context found Andrew's valid general unlock. Execute and subsequent idempotent plan exited 0. HBA confinement remains absent and must follow the provisioner's owner PR path before the login/confinement check. Scoped broker secrets, runtime grants and the reviewed Much Ado release remain pending. Authentik app login is configured and its policy was checked; live Pawthentik per-person storage membership/revocation is a separate unfinished step.
- P012's scoped read-only browser control verified the mount/pricing/document links and downloads; the full pricing editing workflow and Authentik login remain untested. Pytest remains paused at Andrew's request. Fresh evidence covers direct builds, complete asset inspection, numerical CLI replay, original immutable storage readback and HTTPS delivery. The rollout packet is `docs/stack-rollout.md`; live proofs and limitations are in `docs/verification.md` and `docs/mount-delivery-verification.md`.

The active design remains unoccupied. Artist vision, manufacturer suitability, engineering, site permission and grant selection are separate decisions. The supplied v3 review governs current limitations; historic image captions do not override it.
