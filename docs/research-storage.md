# P009 research storage: prepared publisher and upload evidence

## Current delivery requirements — October 5

October 5 client correction: the prefix-restricted publisher refuses repository
metadata. The research uploader now verifies that refusal instead of requiring
a successful metadata read before ingestion. Its four scope probes and a
successful, prefix-limited object listing on `main` precede every execution
record and branch creation. The positive read distinguishes an authorized
publisher from a revoked token returning only refusals. Immutable object length
and SHA-256 readback remain required.
The loopback integration fixture follows the owner's denied-metadata contract.
This correction does not deploy the broker or complete an upload.

The separate `just batch-upload model` and `just batch-upload v4` entry points
now accept the fixed plans in `assets/`, with the same `--endpoint`, `--branch`
and optional `--apply` flags as research ingestion. Model inputs are confined
to `cockpit/public/studio-models/` and `imports/models/p041/`; v4 inputs are
confined to `deliveries/enceladus_v4_fixed15/` and `imports/v4-fixed15/`.
The v4 executor refuses ZIPs. Research ingestion retains its original scope.
Each batch creates separate staging and completion records, refuses existing
records, and verifies the exact object set and every object's bytes at an
immutable commit before recording success. No executor merges a branch.

Fresh local verification checked all **151 planned files**: 14 research PDFs,
55 model files and 82 v4 files. Their recorded sizes and SHA-256 hashes match
the retained originals. The model plan describes a frozen older build; newer
generated model bytes must not silently substitute for that preservation batch.
No remote upload or completion receipt exists for these three batches.

The verified execution packet on maxipaxi is
`~/.cache/codex/zencelades/p148-publisher-candidate`: 158 files / 235,090,949
bytes including the 151 objects, three plans and four Python modules.
`packet.json` records every included file's size and SHA-256. All three clients
pass plan-only validation within that packet. It preserves the frozen P041
model inputs separately; the current site's rebuilt model directory contains
newer bytes and is not a valid substitute for this immutable batch. Transfer
and credential-backed execution have not occurred. Revalidate the packet
against its receipt and plans before any owner-host execution.
The client module and its receipt entry were refreshed after Sonnet's
positive-permission-control finding; all 158 records were reverified.

Use the complete owner changes, not the historical config-only patch:
[hesellsheshells `feat/thatsnozorb-publisher` (#65)](https://git.telpher.stream/awb/hesellsheshells/pulls/65)
and [telpher `feat/thatsnozorb-publisher` (#554)](https://git.telpher.stream/awb/telpher/pulls/554).
The broker owner PR is merged. Its version-2 policy confines object access to
`imports/*` and writes to `ingest-*`, validates branch creation bodies before
forwarding them and retains immutable commit reads. Telpher #554 remains open
at head `c5106437`, base `fb78eccd`. Its earlier review does not establish a
review of that current pair. Repository metadata is denied to prefix-limited
clients; the new client tests retain that denial.
See [integration readiness](integration-readiness.md) for test and review evidence.

The actual REST broker is published only on presvd1 loopback at port 13330.
No declared laptop-to-broker route was found. The existing direct lakeFS tunnel
and the human-readable shelf are not publisher endpoints. October 5 plan-only
commands use the observed server endpoint as metadata, make no HTTP requests
and do not prove laptop connectivity, a fresh remote branch or publication.
Execution must use the scoped token on presvd1, or a separately reviewed
broker-only connection; no administrator endpoint is a substitute.

`deploy/research-publisher.toml` mirrors the selected principal for inspection;
it is not a standalone migration. The broker implementation, version-2 policy,
Telpher credential wiring and scoped provisioning must all be delivered before
uploads. Never append `write_refs` to an older broker policy: older binaries do
not enforce that field. The old owner patch and broader additions file are
explicitly historical and must not be applied.

Use a fresh, unshared ingest branch. A normal lakeFS commit includes all staged
changes on that branch; the broker does not establish branch ownership or filter
commit contents. Preserve upstream main protection and verify broker refusals
before using the provisioned identity. As of the latest check, presvd1's vault
is locked; this continuation made no production policy or storage changes.

## Preserved preparation checkpoints

P036 update: **14 PDFs / 138,490,200 bytes** now pass the uploader's local
path/size/hash validation in plan mode. Five new originals cover Fishpipe,
TreePod, a six-foot trampoline comparison and a swivel technical notice:
12,045,495 bytes / 128 pages. The
[catalog](../assets/soft-sphere-research-catalog.json) records actual reading
scope; a page count is not a claim of close inspection of every page. The
validation used `https://example.invalid` and `ingest-basket-plan-only` as
explicit inert placeholders with apply=false; no broker request or remote
branch was created. The three earlier hardware rows now carry source IDs
required by the uploader's progress metadata. No new upload receipt exists.

That checkpoint proposed tracking the generated model build at the time. The
current P041 plan identifies a frozen preservation batch; newer generated
bytes require a separate plan. Model and research uploads remain distinct,
and the research uploader's source-path boundary is unchanged. The P019 count
below is an earlier checkpoint.

P019 update, September 30: the prepared research batch now contains **nine
PDFs / 126,444,705 bytes**. Three added manufacturer documents are catalogued
in [the model research register](../assets/model-research-catalog.json);
their sizes, hashes and 43 PDF pages pass local verification. The earlier
six-document evidence below remains historical. Remote publication is still
unclaimed. Separately, [the model upload plan](../assets/model-upload-plan.json)
records 41 generated GLB/native/manifest files, 69,058,035 bytes, for immutable
lakeFS preservation through the scoped publisher. The existing research
uploader deliberately does not accept those generated paths; its boundary is
unchanged. Original ZIPs remain a separate B2 archive workflow.

**Historical P011 delivery checkpoint.** Andrew authorized delivery;
hesellsheshells `feat/thatsnozorb-publisher` (#65) and Telpher
`feat/thatsnozorb-publisher` (#554) are open with green CI and await required
Grok review. The owner change now also closes prefix-limited authorization
gaps found by regression checks; do not apply the old config-only patch as a
substitute. [Current delivery evidence](mount-delivery-verification.md) records
the exact heads and remaining gates. The expanded research plan contains six
PDFs / 109,333,180 bytes / 506 pages. `just research-upload` is implemented with
separate records and has passed its local plan and synthetic-loopback checks.
Its real execution, token provisioning and broker deployment remain pending.

## Historical P009 preparation record

Prepared on maxipaxi, September 30, 2026. **Four research PDFs are locally
preserved; their lakeFS upload is pending.** The original 132-object import and
B2 archive remain separate completed records. This document is the continuation
packet for the outstanding storage work.

## The material to preserve

[The source register](../assets/engineering-sources.json) records thirty primary
source entries, including access failures and edition limits. Four entries have
downloaded original PDFs. [The upload plan](../assets/research-upload-plan.json)
is machine-readable and contains source paths, destination keys, byte counts and
SHA-256 values. It deliberately contains no fabricated branch, commit or receipt.

| Original PDF | Pages | Exact bytes | SHA-256 |
| --- | ---: | ---: | --- |
| NASA/APL Orbilander concept study | 186 | 87,716,471 | `98730c0ed813ef8c8f65e3b452f249aaa89d66a9e8d987e50d8237929d1f239a` |
| FDEP Biscayne Bay management plan | 292 | 19,122,090 | `a71c8d8fb694ef2d7fe3b04f8f4c983d97a37b8ba2846378dd481955264d8219` |
| Rosco projection-screen guide | 6 | 346,676 | `8415e273e855fc31f52f93d8459c346e37d93cc2e4afa961f97a0a7138d4ad4b` |
| NEMA historical enclosure handout | 9 | 243,156 | `f55041b1ed0f5753d19a93d1208cc3bd42ef75a82b1baaae6f863abebfee90e2` |

Total: **4 files / 493 PDF pages / 107,428,393 bytes**. Local originals are in
ignored `source/research/2026-09-30/`; visual inspection renders are in its
`previews/` directory and are not original-source upload objects. No binary
was added to website inputs. The 518,340,175-byte USGS TIFF is a registered
candidate only, not downloaded or verified. The Christie manual returned HTTP
403 and has no local copy.

## September 30 broker observations (historical)

The running container's policy was read directly with Docker's copy-to-stdout
facility, because the distroless image contains no shell or `cat`.
The latest read includes the existing `pandrosetta` principal and the viewer's
`papers` shelf; these unrelated owner changes must survive onboarding.
**No `thatsnozorb-publisher` principal is present.**

The presvd1 general hid-in checks used the actual user runtime directory
(`XDG_RUNTIME_DIR=/run/user/$(id -u)`). The first returned exit **4**, locked;
a later recheck returned exit **0**, **unlocked**, with general coverage for the
vault/project/session gates. The later result supersedes the earlier lock.
An unlock alone does not add the missing policy, credential wiring or publisher
grant. Recheck the ticket immediately before an eventual mutation.

No other project's credential was used. No lakeFS administrator credential was
read or copied into this project, and no remote upload was attempted with an
unauthorized identity. No provider mutation occurred in this research step.

## Original P009 proposal (superseded)

These were the original prepared artifacts. The config-only broker patch is
superseded by the full owner PR above; this table is not an installation plan:

| Owner | Prepared artifact | Resulting change |
| --- | --- | --- |
| hesellsheshells | [historical research-publisher-owner.patch](../deploy/research-publisher-owner.patch) | Original config-only proposal; lacks required broker enforcement; do not apply |
| Telpher | [research-publisher-telpher.patch](../deploy/research-publisher-telpher.patch) | Declares the derived optional broker token in `hid-in.toml` and passes its environment name to the broker container |
| Project manifest fragments | [policy](../deploy/research-publisher.toml), [broker secret declaration](../deploy/research-publisher-secrets.toml) | Inspection aids only; current policy fragment requires the full version-2 broker implementation; no credentials |

P009 deliberately narrows the older proposed publisher fragment from
`imports/* + public/*` to **`imports/*`**. It does not activate the separate
web reader or change public publication policy. Treat P009's fragment as the
historical scope decision for this preservation step; do not apply duplicate principal
definitions. Public-release writing can be reviewed separately if needed.

The broker's existing `lake-writers` role is coarse: it includes branch and
commit operations as well as object writes. This is not a custom “upload only”
role. Preserve the existing protected main branch, create a fresh ingest branch,
and verify unrelated repository/prefix and administrative refusals. This proposal
does not change any group, person membership or default-deny rule.

The owner CLI derives:

- Environment: `LAKE_BROKER_THATSNOZORB_PUBLISHER_TOKEN`.
- hid-in name: `telpher/lake-broker-thatsnozorb-publisher-token`.

The shared Telpher manifest uses `required = false`, matching its other
optional broker consumers. The invoking publisher must require its token and
fail if unavailable. No token value was generated or displayed.

## September 30 validation record (historical)

The saved local audit `source/research/2026-09-30/verify.py` ran on maxipaxi
using bundled Python/pypdf through `uv run --no-project --python ... python`.
It exited **0**: all four original hashes and lengths match, all 493 PDF pages
parse, thirty source IDs are unique, and the then-current fourteen relative
document links resolve. No unexpected control characters or fabricated upload
receipt were found. Relevant PDF pages were visually inspected as recorded in
the source register. The 493-page total is an inventory count, not a claim that
every page received a close reading.

On **maxipaxi**, the existing owner `bin/lake-broker-policy-check` was invoked
with `LAKE_BROKER_POLICY` pointing to an ignored candidate consisting of the
fresh running policy plus the proposed publisher. **Exit 0**, default-deny and
never-broker-admin retained, correct project repository, new principal
`UNPROVISIONED`. All principals display unprovisioned in this local process
because credentials were deliberately not loaded; that is not a production
outage claim.

The same wrapper with `--provision` **exited 0** and printed the derived
credential binding. It prints suggested commands, not secrets, and those commands
were not executed. Only the new principal's binding is relevant; never rotate
all existing credentials from that output.

Both original owner patches passed `git apply --check`, **exit 0**, against
their September 30 owner checkouts. The broker patch is now archival; do not
apply it or use its old check result to establish current deployment readiness.
This was config/patch validation,
not a deployed access proof. No pytest, full owner test suite, broker rebuild,
service restart, PR, merge or remote object write is claimed.

## Resume in five bounded steps

1. **Codex completes the existing owner PR delivery.** Refresh both PR heads,
   finish the exact-head reviews, preserve existing changes, and follow the
   current infrastructure review/merge policy. Use the complete version-2
   implementation; do not reapply historical patches or create duplicate PRs.
2. **Codex completes scoped provisioning through hid-in.** Recheck the currently
   ticket; request Andrew's interactive unlock if it is still locked
   when execution is ready. Use the owner-derived
   binding, the publisher's declared grant and the shared Telpher manifest.
   Do not recover a token by reading another service's environment.
3. **Codex rebuilds and recreates only the broker after owner delivery.**
   hesellsheshells `docs/runbook.md` §2 explicitly requires the policy and
   Telpher changes landed before this step. The policy is baked into the image;
   a restart does not load a new policy or token environment. Follow its
   preservation/preflight instructions; do not run the broad local stack helper
   on presvd1.
4. **Codex verifies confinement and uploads the current planned objects.**
   Use the scoped REST broker, a fresh `ingest-*` branch and exactly the keys
   in the upload plan. Reject redirects, keep credentials server-side, verify
   local hashes again, commit, and record the returned immutable commit.
5. **Codex completes immutable readback.** Compare the new object set, lengths
   and every full SHA-256 by immutable commit; write
   `assets/research-upload-receipt.json`, then update the source register and
   plan. Do not merge main or delete retained local originals.

The existing `scripts/lake_upload.py` is hard-wired to the original 132-file
inventory and its existing receipt paths. **Do not run it against this research
batch unchanged or remove its receipts to make it proceed.** The uploader for
this batch must consume the separate research plan and use separate staging and
receipt paths. That execution work is pending the scoped principal.

The original ZIP continues to belong in B2. None of this requires creating a new
ZIP, migrating the original catalog, widening the public shelf, or redeploying
the other chat's naming application.
