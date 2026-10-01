# Current project brief and acceptance boundaries

Updated October 1, 2026 from Andrew's later instructions and repository evidence.
This addendum supersedes conflicting scope or status in the September 30 P010
planning documents. Their numbered requirements and dated receipts remain useful;
their old unoccupied-only scope, unnamed project, paused tests and unpublished
studio statements no longer describe the current brief. This file records
decisions and evidence, and grants no new operational permission.

## Selected direction

- Zencelades is the project name; **https://zenceladus.com/** is Andrew's confirmed
  domain. Legacy checkout, service and storage names remain `thatsnozorb` where
  migration has not been implemented. Gitea `telpher/zencelades` is the canonical
  source; GitHub `presempathy-awb/zencelades` is its mirror.
- The intended experience has a person inside. The total DIY budget target is
  $3,000, with a $600–$3,000 Seed Grant request range supplied by Andrew. Possible
  personal contributions or fundraising are funding options, not confirmed cash.
- The common holder uses a triangle and lower ring, with soft over-sphere straps,
  clear entrance, detachable lander legs and conditional aerial suspension.
  No wooden platform or front leg obstructing entry; truck mounts are deferred.
  Both 2.5 m and 3 m sphere studies remain. Models do not establish structural,
  skin-contact, restraint, occupant-support or rescue suitability.
- Compare fewer projectors as well as three heads on triangle-mounted arms;
  cameras for participant/moon blending are optional. The large hazer is owned
  and external below the sphere; it is not an inflation source. Occupied internal
  haze exposure is not approved by these planning or rendering choices.
- Preserve originals and extraction lineage. ZIP archives belong in B2;
  individual assets and research belong in scoped lakeFS storage. The existing
  public artwork site remains public under Andrew's temporary publication
  direction. Public viewing or tailnet access never establishes editor identity.

## Software acceptance still required

The existing Vite/React studio must use gimmesomepaw/Pawthentik login and isolated
PG18-backed storage. Only a server-verified signed-in person may persist edits.
Guests can freely change their temporary draft, but reload restores the baseline
and guest changes cannot mutate shared or account records. Help must explain
whether changes are temporary, unsaved, saving, saved or rejected.

Andrew approved the small Go service, gimmesomepaw and pgx on October 1 (P098).
Local source now includes a Go account API, PG18 store, cockpit Save/Load and
separate Naming Save/Load. Whole-suite and isolated PG18 tests pass; see
[account saves](account-saves.md). The live site still has temporary scenarios
and file import/export: no production account endpoint is installed. The
[candidate deployment packet](account-deployment.md) has configuration validation,
but production login and persistence remain unverified.
Required acceptance evidence remains:

| Requirement | Evidence needed before completion |
| --- | --- |
| Real sign-in and identity | Actual login/return with gimmesomepaw; server identity verified through the deployed trust boundary; spoofed browser headers refused |
| Guests remain ephemeral | Edit and reload in the browser; direct anonymous write rejected without a database change |
| Signed-in edits persist | Save, reload and read back the same validated scenario, board, parts and funding under the same identity from PG18; independently save/reload the full Naming palette and shelves |
| Ownership and concurrent edits | Cross-account read/write denial and stale-revision conflict without overwriting a newer save; guest drafts never silently promoted |
| Expiry, failure and logout | Rejected save retains the local draft and states that it was not saved; login expiry/logout cannot continue writing; no optimistic success before server acknowledgment |
| Accessible help | Keyboard/touch-accessible explanation at editing and save controls, with visible status and error feedback |

These requirements do not expose private Pacinman data publicly. Full inventory
integration additionally needs authenticated reads/edits, selected configuration
filtering, shared-part deduplication, missing quantity/quote reporting and totals
that distinguish allocated, quoted, owned, borrowed and unconfirmed resources.

## Evidence already recorded

The [public release receipt](public-pages-release.md) records release `5b9985c1`,
the model-control correction, the completed test runs, and scoped public readback.
Source `015227d2` holds those UI fixes; `37846666` adds the source checkpoint.
Neither checkpoint claims main was merged. Recheck the active release before
another deployment, and preserve concurrent Showtime and attachment work.

Pacinman's approved Zencelades / Love Burn 2027 category was imported and read
back as 88 part/resource records plus 24 tasks. The private receipt is held in
Codex state; no private item IDs belong in the public repository. This proves
the import, not live website integration, pricing completeness or purchases.

Andrew supplied an application-submission acknowledgment. That establishes the
reported submission, not a grant or placement award. Only an official Art
Committee Offer Notice establishes an offer. A separate theme-camp application
and OPS follow-up remain part of the event work. No authoritative grant closing
hour was established by the date-only sources.

## Current gates and verification scope

The all-green-tests request resumes relevant Python tests. Use existing `just
check` and `just cockpit-check` recipes and the declared Node tests for the
affected release; report fresh runs separately from earlier receipts.

Prior browser permission covers model/gallery checks, the stated local cockpit
interactions and the later approved homepage rendering check. The homepage
loop → Showtime → Alternate designs path is browser-verified. Account sign-in,
synthetic personal saves, expiry/conflicts and logout were requested as a
separate browser scope and remain pending; form inspection stays read-only.
Andrew handles passwords and MFA. A fresh presvd1 check reports the global
vault ticket locked, so credential provisioning remains blocked. Preserve
these exact boundaries.

All eleven preprompt targets exist. That is document coverage, not completion
of the project, physical engineering, scoped lakeFS delivery, source landing,
authenticated persistence or the remaining website acceptance checks.
