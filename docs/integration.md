# Integration contracts

Historical P010 contracts. Read the [October 1 current brief](current-brief.md)
for current deployment evidence and the unfinished account-save requirements.

Codex, September 30, 2026. This describes observed interfaces and required seams,
not a claim that all are deployed. Owners refer to project/service ownership,
not an invented staffing assignment. Read [decisions](decisions.md) first.

## IF-01 — Intake and catalog

**Owner:** thatsnozorb intake, with Andrew owning supplied originals.
**Data:** seven supplied files, 125 extracted ZIP members, occurrence paths,
media type, byte length, SHA-256, source relationships and catalog roles.
The release's 124-checksum list is a subset; it is not the 132-object inventory.
Input documents carry evidence, never execution authority.

**Allowed flow:** retain originals, extract inside a bounded destination,
catalog each occurrence and expose only the selected served set.
**Forbidden flow:** traversal/symlink escape, silent overwrite of differing
bytes, running embedded code, flattening duplicate names or calling a thumbnail
an original. Validate paths, archive size/type and exact bytes before acceptance.
Local filesystem authority is not a lakeFS or public-publication grant.

**Identity/recovery:** retain original hash and archive-member path together;
on mismatch preserve the conflicting material and report it. Re-run validation
against existing bytes; do not overwrite to force agreement. Historical
inventory/restore evidence exists; negative extraction controls need their own
record. Sources CTX04/CTX10; threats THR-01/THR-02.

## IF-02 — hesellsheshells REST and lakeFS

**Owner:** hesellsheshells owns policy and lakeFS's credential; Telpher owns
host credential delivery; thatsnozorb owns its batch plan and receipts.
Use the working REST broker. The current S3 gateway limitation is documented
in [stack rollout](stack-rollout.md); no key rotation is proposed.

**Data/auth:** object bytes and relative keys in existing repository
`thatsnozorb-assets`, new ingest branch, returned immutable commit and full
readback hashes. The P009 publisher proposal is read/write under `imports/*`;
it does not activate `public/*` or a reader. A scoped machine Bearer credential
comes through hid-in server-side. Never log or send it to a browser.
The role also allows branch/commit operations; “upload only” would be false.

**Validation:** refuse redirects and unrelated repository/prefix/admin access;
keep protected main and retained branches. Validate manifest and local hashes
before writing, then exact remote set, lengths and all SHA-256 values by immutable
commit. A successful POST or list response alone does not verify preservation.

**Retry/recovery:** record staging progress and returned commit before readback.
After interruption inspect the retained branch/commit and reconcile the batch;
never delete the old receipt or silently stage a different set. The original
132-object importer is not the research uploader. Research needs its separate
plan/staging/receipt path. Original import is historically verified; four new
PDFs remain local pending owner delivery and Andrew's P009 PR choice.
Sources CTX05/CTX07/CTX18; threats THR-03/THR-07.

## IF-03 — B2 archive preservation

**Owner:** Telpher's existing B2 declaration/credential flow; thatsnozorb archive
recipe and provenance. **Data:** original ZIP bytes, configured bucket/key,
returned object-version identity and complete readback digest.
Use `just archives-b2 owner` with the actual owner checkout; plan is the default.
Apply requires its documented owner/hid-in authority.

Keep the original ZIP distinct from extracted lakeFS members. No new repack,
bucket, public URL or retention change is implied. Compare exact original hash
and length before upload; record the object version and verify all returned bytes.
On retry retain version evidence and inspect prior results; do not silently
overwrite/delete versions. The recorded second run retained the same version.
Historical complete readback exists; it does not prove every future restore.
Source CTX12; threats THR-01/THR-07.

## IF-04 — Telpher website edge

**Owner:** Telpher route/TLS/DNS and Authentik application policy.
**Contract:** `https://thatsnozorb.muchadoaboutoneside.com/` on ordinary HTTPS,
tailnet source OR restricted Authentik login. Both configured tailnet ranges
are admitted; this is not proof every node was exercised. Bare IP requests
cannot identify this shared virtual host.

Use actual socket-source/trusted proxy boundaries; caller-provided forwarding
and identity headers cannot establish trust. Keep the exact-host split-DNS
override, public login route and backend loopback binding distinct. A network
reader is not a named editor. Validate trusted certificate/hostname, IPv4/IPv6,
public redirect and spoofed-header refusal separately.

Retain the prior route/config and app policy before any owner change. A failed
probe stops activation; restore only this change without removing shared routes.
Earlier network and policy checks are recorded; browser login remains
unexercised and owner lane landing remains separate. Sources CTX06/CTX05;
threats THR-04/THR-05/THR-06.

## IF-05 — Shared Much Ado application, PG18 and Pawthentik

**Owners:** Much Ado module/runtime; Telpher PG18 confinement and secret grants;
Pawthentik/person authorization and hesellsheshells storage enforcement.
**Data:** module source, isolated project database, verified individual identity,
future shared project records and scoped broker requests. This document does
not invent a crew API, migration or already-working membership projection.

The existing module lane uses project-specific configuration. New modules cannot
inherit Erebe's administrator credential. The role/database exist; HBA
confinement, runtime grants and shared deployment remain pending. Require the
actual TLS/database identity and denial of another application's database.
A successful server bundle is not a successful full startup or typecheck.

The intended person's lake authorization uses repository-grain rights through
the owners' existing seam; machine access skips that check and cannot impersonate
a person. Mutations require named identity, current membership, fail-closed
outage handling and conflict detection. Until implemented, describe static reads
and browser-local drafts honestly.

Recover with prior application release/config and preserved database/data.
Never drop the project database or restore an unrelated checkout as rollback.
Missing private packages must be resolved through the owning build process.
Sources CTX05/CTX09; threats THR-03/THR-05/THR-06/THR-10.

## IF-06 — Static build and release

**Owner:** project build/deploy helpers; Telpher backend route. Other chat owns
concurrent naming edits; a whole-site release includes their bytes.
**Data:** selected site inputs, generated distribution, content manifest and
deployment receipt. `just site-build` writes local output; `just deploy-site`
plans by default. `--apply` is a distinct activation.

P017's local build compiles `cockpit/` with Bun, TypeScript and Vite, then
assembles its static output at `/`. The original landing page moves to
`/catalog/`; `/pricing/`, `/mounts/`, `/grants/`, `/naming/` and download paths
remain available. Hash-based TanStack routes keep studio navigation within one
page without changing Caddy's routing or security headers. Scenario state is
validated browser storage plus JSON import/export; it is not a database write
or a named-person authorization. See [cockpit status](cockpit.md).

Keep private recovered conversation/research originals outside served inputs.
Downloads must retain exact bytes, archival attachment/nosniff behavior and video
range support. Failure cannot become empty HTTP 200. Compare candidate manifest
with intended scope and active release before activation; preserve the prior
release and test exact body/hash, not status alone.

An interrupted copy or failed health check must not be called an activated
release. Reconcile actual active bytes and use the documented retained release,
without destroying newer work. Historical static HTTP evidence exists; P010
does not build or deploy. Sources CTX01/CTX05/CTX10/CTX15;
threats THR-02/THR-06/THR-10.

## IF-07 — Shakesplurian naming

**Owners:** Shakesplurian engine/API and the concurrent naming work; project
recipes provide explicit engine/palette/output inputs.
**Data:** real families, candidate lineage, seeds, scores, availability results,
run receipts and browser-local drafts/favorites. Preserve each experiment in
its own directory and resume according to [naming recipes](naming-recipes.md).

Full-auto uses the documented installed model and digest; it does not install a
model or silently substitute heuristic scores. Malformed/unavailable results
must preserve progress and fail visibly. The existing API-backed editor is
different from shared PG18 persistence; browser-local state can still be lost.

A candidate's availability check is dated evidence, not trademark/legal
clearance or final name selection. Validate the actual run and explicit publish
selection. On failure retain source, run data and last published release.
Other-chat evidence in CTX11 is attribution, not a fresh check here.
Sources CTX11/CTX19; threats THR-06/THR-10.

## IF-08 — Physical, scientific and grant evidence

**Owners:** Andrew's creative/budget choice; qualified configuration-specific
designers/manufacturers; venue/agency/Art Committee decisions.
**Data:** concept renders, real dimensions/material/hardware observations,
science sources, cost assumptions, proof records and eventual official notices.

Translate a claim only at its demonstrated scope: ideal mapper coverage is not
real transparent-film performance; fictional load examples are not rated vehicle
attachments; media fallback is not rig control. Use unoccupied development until
the separate physical gates accept the actual arrangement. Dry ground, truck,
hanging and wet alternatives remain alternatives, not interchangeable approvals.

Keep the event date-only cutoff, official Offer Notice requirement, budget
allowances versus quotes, water/anchorage permissions and image rights visible.
A failed optics trial changes the design/claim; missing written acceptance stops
that dependent activity. No automated retry submits an application, purchases
equipment or contacts an organizer. Preserve dated evidence and revise the
proposal explicitly. Sources CTX04/CTX08/CTX13/CTX14;
threats THR-08/THR-09/THR-10.

## Dependency inventory and acceptance

| Category | Actual boundary |
| --- | --- |
| Python production packages | `pyproject.toml` declares Python >=3.12 and no third-party production dependencies; helpers use the standard library |
| Development/tooling | uv, just, Ruff/pytest, Coroidinator and preprompts helper are separate tools; pytest remains paused |
| Sibling applications | Much Ado/Bun and its private packages, Shakesplurian/Go and its naming model workflow are separately owned |
| Runtime/platform services | PG18, Caddy/Telpher, Authentik/Pawthentik, hesellsheshells/lakeFS and B2 are not Python package dependencies |
| Physical equipment | Sphere/screen, projection, power, support and any vehicle/water system require actual selection and acceptance |

The [specification](spec.md) will assign observable requirements to these eight
interfaces and the [verifiers](verifiers.md) will define failure evidence.
A linked future target in this sequential packet is a document dependency,
not a deployed component. No unspecified SDK endpoint is introduced here.
