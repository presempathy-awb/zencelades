# P009 research storage: prepared publisher and upload evidence

**P011 supersedes the preparation state below.** Andrew authorized delivery;
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

## Fresh broker observations

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

## The concrete proposed change

The patches are **prepared, not applied to the owner repositories**:

| Owner | Prepared artifact | Resulting change |
| --- | --- | --- |
| hesellsheshells | [research-publisher-owner.patch](../deploy/research-publisher-owner.patch) | Adds `thatsnozorb-publisher` with read/write only in `thatsnozorb-assets`, object prefix `imports/*` |
| Telpher | [research-publisher-telpher.patch](../deploy/research-publisher-telpher.patch) | Declares the derived optional broker token in `hid-in.toml` and passes its environment name to the broker container |
| Project manifest fragments | [policy](../deploy/research-publisher.toml), [broker secret declaration](../deploy/research-publisher-secrets.toml) | Reviewable final values; no credentials |

P009 deliberately narrows the older proposed publisher fragment from
`imports/* + public/*` to **`imports/*`**. It does not activate the separate
web reader or change public publication policy. Treat P009's fragment as the
proposal for this preservation step; do not apply both duplicate principal
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

## Validation already run

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

Both owner patches pass a read-only application check, **exit 0**:

```bash
# maxipaxi
P=/Users/andrew/code/pres/make/thatsnozorb/deploy
H=/Users/andrew/code/pres/web/hesellsheshells
T=/Users/andrew/code/pres/scaffold/telpher
git -C "$H" apply --check "$P/research-publisher-owner.patch"
git -C "$T" apply --check "$P/research-publisher-telpher.patch"
```

These paths and commands were checked locally. This is config/patch validation,
not a deployed access proof. No pytest, full owner test suite, broker rebuild,
service restart, PR, merge or remote object write is claimed.

## Resume in five bounded steps

1. **Codex prepares the owner delivery after Andrew's PR choice.** Refresh both
   owners and current policies, preserve existing changes, apply the reviewed
   additions in proper isolated lanes, and follow the current infrastructure
   review/merge policy. The high-tier PR choice is pending in this chat.
2. **Codex completes scoped provisioning through hid-in.** Recheck the currently
   unlocked ticket; request Andrew's interactive unlock only if it has expired
   when execution is ready. Use the owner-derived
   binding, the publisher's declared grant and the shared Telpher manifest.
   Do not recover a token by reading another service's environment.
3. **Codex rebuilds and recreates only the broker after owner delivery.**
   hesellsheshells `docs/runbook.md` §2 explicitly requires the policy and
   Telpher changes landed before this step. The policy is baked into the image;
   a restart does not load a new policy or token environment. Follow its
   preservation/preflight instructions; do not run the broad local stack helper
   on presvd1.
4. **Codex verifies confinement and uploads the four planned objects.**
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
