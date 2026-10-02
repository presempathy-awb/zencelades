# Enceladus Within stack and rollout

Andrew authorized deployment and tailnet access. The static catalog is live at
https://thatsnozorb.muchadoaboutoneside.com/ with trusted TLS. Both full tailnet
ranges bypass login through the exact-host MagicDNS override; public DNS reaches
the restricted Authentik route. See [access verification](site-access-verification.md).
All 132 files are
preserved and verified in owner-managed hesellsheshells lakeFS. The shared Much
Ado module, PG18 confinement and Pawthentik per-person storage integration below remain pending;
this document separates the applied catalog/storage from that remaining work.

P013 sequencing: the Pacinman comparison and per-person Pawthentik integration
are deferred until the current research/storage delivery is complete. Keep the
scoped machine publisher and its preservation/readback work ahead of that
follow-up. [Deferred scope and resume steps](plans/p013-pacinman-pawthentik-later.md).

## What is implemented locally

The project builds a static module, with archival downloads, selected raster
and film previews, a searchable file catalog, source research and grant draft.
Python build/ingestion helpers use only the standard library. There is no new
frontend framework, database driver or production dependency.

An isolated Much Ado lane, `feat/enceladus-module`, adds the second module
registration, module-specific database variables, scoped Bearer broker access,
redirect refusal and a 20-second asset request deadline. New modules cannot
inherit Erebe's old administrator copy. The module name and SQL table prefix
are `thatsnozorb`; production startup requires the database URL, CA, TLS server
name, broker URL and broker token. The source directory is configured by
`THATSNOZORB_DIR`, with an explicit `THATSNOZORB_HOST`.

`scripts/lake_upload.py` defaults to a plan. Apply creates a fresh `ingest-*`
branch from `main`, stages all 132 files, commits once and reads each file back
at the immutable commit to verify SHA-256 and size. A staging record preserves
the commit before readback starts; it remains distinct from the verified receipt.
It never creates a lakeFS
repository, merges main, deletes a branch or reuses an existing receipt. Failed
uploads leave their branch intact for recovery. A valid final receipt is
written only after every committed object verifies. Its transport has a
60-second socket timeout and refuses redirects; no secret is logged.

## Live observations on September 30, 2026

| Component | Current observation | Remaining work |
| --- | --- | --- |
| Much Ado | Existing presvd1 service active; `/api/health` returns `{"status":"ok"}` | Land the separate host change and build/package through its own release recipe |
| PG18 | `thatsnozorb_user` owns `thatsnozorb`; provisioner execute and repeat plan exited 0; URL stored only in presvd1 hid-in | Owner PR for HBA lines, reload and provisioner `--check`; app runtime grant remains pending |
| hesellsheshells | Loopback broker `127.0.0.1:13330/healthz` reports healthy REST; viewer edge unit active | Add project-scoped principals, provision through hid-in, rebuild/recreate only the broker |
| lakeFS | `thatsnozorb-assets` contains all 132 files at a verified immutable commit; main protected/unmerged, retention 365/1825 days | Scoped consumer principals and shelf visibility remain pending |
| Authentik edge login | Exact app/provider/outpost created; restricted policy allowed andrew/awb and refused the checked non-member; public origin redirects to login | Browser login unexercised; optional final admin recheck returned project-locked after successful setup |
| Pawthentik | Broker health reports `crew_ask:false`; no Pawthentik unit found in the live unit inventory | Establish the existing person's authorization path before claiming live crew governance |

The S3 gateway is unavailable on the current broker because the single lakeFS
access key exceeds its gateway's length limit. Use its working REST surface;
this project does not rotate platform keys or change the gateway.

## Storage and access

`hesellsheshells` is the broker's name, not a repository named
`hehasseashells`. It owns lakeFS's single credential; consuming applications
get scoped machine principals. The early `deploy/lake-broker.additions.toml`
is retained as history, not an installation input. The current preservation
publisher is restricted to `imports/*` and writes on `ingest-*`, requiring the
complete version-2 broker implementation in
[hesellsheshells publisher PR #65](https://git.telpher.stream/awb/hesellsheshells/pulls/65).
See [research storage](research-storage.md) for both owner PRs and the rollout
sequence. The separate public reader remains proposed; its presence in an
archived fragment grants no access. Token names are derived from principals.

Preservation writes go under `imports/2026-09-30/`. The public reader reaches
only `public/`, so uploading originals does not itself publish them. The authorized
tailnet-or-Authentik catalog serves verified copies of all 132 files in
`downloads/`, with archival attachment headers. Anonymous public requests receive
the login route. A future anonymous public release needs a separate file selection. A public release manifest must pin an
immutable commit and contain only approved public paths. The recovered shared
conversation stays private and excluded from every public build and upload.

Protect lakeFS main from direct writes/commits before ingestion; keep the
Telpher retention default of 365 days and main at 1825 days. The app gets no
manager capability. The publisher gets no admin operation. Existing principals
and shelf visibility are not silently widened. Repository creation belongs to
the broker owner; the project upload helper accepts only an existing repository.

People's crew membership belongs to Pawthentik. The lake broker's per-person
ask uses `system=lakefs`, `resource=thatsnozorb-assets` and `read`/`write`/`admin`
rights, with deny on outage and the next request reflecting revocation. The
current wire is repository-grain. A machine token skips that ask by design and
must never be represented as a person's authorization. The existing shelf
viewer itself uses a machine token; granting the project to that token alone
would not establish this per-person path. Resolve that seam with its owners.

The static project currently accepts tailnet network trust or the restricted
Authentik application; this establishes read access, not a named review author.
Future review/edit operations need a verified individual identity.

The planned shared Much Ado module presents the artwork. Its Authentik seam
gates `/crew` and supplies trusted identity only on those routes; public routes
strip caller-supplied identity headers. The current static service has no crew
API or membership workflow. No new password form, open enrollment or duplicated membership
database is proposed. Pawthentik's `web` projection and Much Ado authority seam
remain designed rather than live; this project does not claim those are built.

## Remaining shared-app deployment sequence

1. Land the small Much Ado module change with the appropriate review. Its full
   typecheck currently fails because installed private telemetry, font shaping
   and PDF dependencies are missing. The fresh Bun server bundle passes; that
   does not establish a release or authenticated workflow. Andrew paused pytest
   work, and no further behavior suite is claimed.
2. Preserve the role/database already created by `pg18-app-provision thatsnozorb`
   and its generated connection URL in `telpher/thatsnozorb-database-url`. Land
   `deploy/pg18-hba.additions.conf` through Telpher, reload and run the
   provisioner's `--check` to prove confinement. Do not share Erebe's database.
3. Provision the two scoped principals through hesellsheshells' `policy-check`
   and `provision` flow. Add only their derived names to Telpher's secret
   manifest and broker service environment. Rebuild/recreate just the broker
   with its existing dependency profiles and rollback image; prove allowed
   project requests, denied unrelated repositories and denied admin endpoints.
   Preserve the already-created repository, protected main and verified retention.
4. Initial preservation is complete through the owner's existing lakectl
   management path; no administrator credential was handed to the app. The
   receipt records commit 95490407ec74af428a4630816c3dfae1b9cefb6a39c5f2fba19e62cb2d92f29d,
   132 files and 61,416,414 byte-verified remote bytes. Future application writes
   use the project uploader with its narrow publisher grant. Choose any later
   public file set and pin a release manifest/asset prefix. Membership grants
   and private lake access stay separate from this public content capability.
5. The tailnet-or-Authentik route and split DNS are already installed through
   the isolated Telpher lane's one-shots. Change only its loopback backend when the reviewed shared module
   is ready, and establish the separate crew access route. Reuse Much Ado's existing
   loopback service at port 18130, TLS, runtime and release packager. Add the
   module directory to its sandbox and source non-secret configuration after
   `hid-in run`, as the host unit already does. Changing its secret manifest
   requires Andrew's TTY host-secret grant; no agent bypass is allowed.

Rollback restores the previous Much Ado release/configuration and broker image,
withdraws only the new route, and preserves all source files, ingestion branches
and receipts. Do not drop a database, erase a lakeFS branch, reset an unrelated
checkout or recreate PG18/SeaweedFS as an incidental rollback.
