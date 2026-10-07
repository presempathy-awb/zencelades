# Personal account drafts

Implementation status: local source and isolated PostgreSQL 18 verification.
This service is **not deployed**. The public site continues to serve the existing
homepage-loop release. The Go service and pgx were approved in P098.

The October 7 [fixture-readiness repair](plans/p150-complete-project-goals.md)
addresses a reproduced startup refusal in the persistence test. The test now
waits up to 60 seconds for a real connection, then still verifies the disposable
database name and PostgreSQL 18 before writing. A timeout fails with the final
connection error; it does not skip persistence or report success. This is test
infrastructure, not production account deployment or hosted CI acceptance.

## Cockpit behavior

The account control in the top bar checks sign-in without loading or changing a
working draft. Guest edits remain in memory. Export keeps a user-selected file;
there is no silent local-storage fallback for the scenario.

Signed-in users explicitly save model choices, settings, allowances, funding,
the build board, parts and the **applied** note together. Unapplied note text and
column/view layout are not included. Account drafts do not modify published
project data or Pacinman.

When an account already has a draft, the cockpit requires loading it before
subsequent saves. **Load saved · replace draft** replaces the working scenario;
export current work first. Save rejects a stale revision. After a conflict,
export current work, load the newer account draft, and reconcile/import before
saving again. Errors retain the working scenario. Sign-in and sign-out navigate
through gimmesomepaw's Authentik entry points, so export unsaved work first.

Naming has its own Save/Load controls and separate account document for the full
palette, shelves, weights, favorite selections and research receipts. Its guest
edits also remain in memory. Neither editor automatically reads or rewrites old
local-storage drafts. **Recover old browser drafts** exports their exact stored
bytes without deletion; explicitly import the recovery file to use it. Complete
Naming import validates both editors before replacement, and refuses replacement
while an editor request is in progress. Naming and scenario saves never overwrite
each other. Tooltips explain temporary edits, account saves and replacement.
If an account endpoint returns HTML or another unreadable response, both editors
keep the draft and explain that it should be exported before leaving. A malformed
response never becomes a successful save or a verified guest session.

## HTTP contract

Every response is private/no-store. Success uses `data`; failures use
`error: {code, message}` without database or credential details.

| Method and path | Behavior |
| --- | --- |
| GET `/account/api/session` | Verified user or null, plus gimmesomepaw sign-in/out paths. |
| GET `/account/api/scenarios/current` | Current verified account's snapshot or null; authentication required. |
| PUT `/account/api/scenarios/current` | Save `{expectedRevision, document}` containing the scenario; authentication required. |
| GET `/account/api/naming/current` | Current verified account's Naming snapshot or null. |
| PUT `/account/api/naming/current` | Save `{expectedRevision, document}` containing Naming's palette and shelves. |

Both document resources require `X-Account-Subject` matching the user currently verified
by the outpost. It is an account-switch guard, **never an owner selector**. The
SQL owner comes exclusively from the outpost's unique `X-authentik-uid` response.
Only the browser Cookie is forwarded to the configured outpost; caller identity
and Authorization headers are ignored. Outpost redirects are not followed.

PUT additionally requires exactly the configured Origin and JSON content type.
Cross-site fetch metadata is rejected. The request limit is 50,512 bytes and the
snapshot limit is 50,000 UTF-8 bytes. The service checks the schema-1 envelope,
required object sections, note and scalar types. It stores private opaque
snapshot content; the cockpit's `parseScenario` performs model/price/task-domain
validation before applying a retrieved snapshot. Naming documents have a 4 MiB
UTF-8 limit (plus 512 bytes for the request envelope); the published workbench
already contains more than 1 MiB of receipts. Naming checks schema and object
envelopes on the server and full editor data before client application. Stored
JSON is never executed. Save/read responses contain `{revision, document,
updatedAt}` under `data`.

Revision zero creates only if absent. Positive revisions update only the same
owner and document kind at exactly that revision. Concurrent/stale updates return 409; expired
sessions return 401; changed accounts return 409; auth/storage outages return
503. No request accepts an owner field. One parameterized SQL statement handles
each write atomically.

## Runtime and migration

`account-service` is a standalone Go binary with approved pgx v5.10.0 and
gimmesomepaw v0.3.0. It requires explicit `--listen`, `--origin`, `--outpost` and
`--database-url-file` arguments. Listen must be a loopback IP and port. URLs must
use HTTPS except explicit loopback addresses. The credential file must be a
private regular file, not readable by group or others; its value is never logged.
Provision it through the existing Telpher/hid-in owner workflow, not a checked-in
file or a command-line URL. The [deployment packet](account-deployment.md)
proposes loopback port 18134 and a systemd unit; neither is installed.

`just account-migration` prints the additive SQL and changes nothing. Execution
requires `--apply` and `--database-url-file`. The service never migrates on
startup. The paired down SQL drops the account table: use only after exporting
its data and obtaining explicit destructive-action approval outside fixtures.
The isolated test exercises down/up, not a live rollback. This initial migration
has never been deployed; it creates `zencelades_account_drafts` keyed by verified
owner and document kind. No existing production table is renamed or dropped.

## Verification

From the project lane:

```sh
# maxipaxi
L=~/code/branch/thatsnozorb/account-drafts/main
(cd "$L" && just account-check)
(cd "$L/cockpit" && bun test)
(cd "$L/cockpit" && bun run build)
```

`account-check` runs the Go suite with the race detector without a database URL,
go vet, then the whole suite in an isolated PG18 container. The persistence test
skips in that race pass. The fixture's cross-platform `CGO_ENABLED=0` test binary
is not race-instrumented; real database concurrency checks run separately.
The fixture requires the already
available `postgres:18-bookworm` image, never pulls it, publishes no port and has
network disabled. Test authentication is confined to that disposable container.
Its data volume is a bounded 256 MiB tmpfs at `/var/lib/postgresql`, the PG18
image's volume root. The tests exercise PostgreSQL persistence across pool
reconnects within that fixture, not disk durability or container-loss recovery.
Its database must be named `zencelades_account_test` and must report PG18 or the
integration test refuses to write. Readiness and the test connection use TCP on
the container's own loopback, so the image's temporary socket-only initialization
server cannot start persistence early. The fixture cleans up only its own
container and temporary binary, preserving a test failure if cleanup also fails.
PostgreSQL runs under a container-local lifetime limit of 600 seconds plus a
10-second TERM-to-KILL grace period. Docker's `--rm` removes the stopped
container even if the caller is killed before running its shell trap.

Coverage includes forged identity rejection, account isolation, origin/content/
size validation, expiry, outages, stale revisions, account switching, two
simultaneous writers, a full cockpit fixture after reconnect, the real HTTP
handler writing PG18 for both document kinds, a 1.2 MB Naming receipt round trip,
and migration rollback/reapply. Node tests exercise actual Naming controls,
conflict/expiry preservation, temporary guest edits and legacy recovery. Direct
server tests and the DOM test harness do not
prove an actual Authentik browser session.

## Deployment prerequisites observed October 1

October 2 local acceptance: an HTML response from the undeployed account API
previously leaked a JSON parser error into the guest panel. A regression covers
session, load and save with HTML responses at HTTP200 and502; it failed before
the shared-client fix. The revised message is verified in the visible preview,
and the original failure is retained as the error cause for diagnostics.
Guest note application and reset after reloading were exercised. The export
button reports success, but the downloaded bytes remain unverified: the
browser download-event wait timed out. Reconnecting to the same surviving tab
allowed the reload check to finish. No account session was entered.

Fresh checks after this repair: 61 Python tests and13 subtests,18 Node tests,
56 Bun tests/797 assertions, Go race tests(cached), vet, and the complete test
binary against a new isolated PG18 instance all pass. The full site build
passes and verifies132 original plus84 v4 downloads. Vite's existing large-chunk
warning remains. The rendered preview returns no Impeccable findings. A combined
Biome invocation spanning both the cockpit and site directories refused nested
configuration; the targeted cockpit formatter ran successfully from its own
directory. No formatter configuration was changed.

- The live homepage routing fix is release `9b6f2f7c`; account changes remain local.
- The existing presvd1 outpost listens on loopback port 19001. With the old
  subdomain it returns the expected anonymous 302; with `zenceladus.com` it
  returns 404. The canonical-domain provider binding needs repair using Telpher.
- presvd1 hid-in reports an expired unlock ticket; local hid-in is also locked.
  No production database credential has been read or copied for this work.
- A security review, reviewed service/route installation, and actual browser
  sign-in/save/reload/expiry acceptance remain required before publication.
  Browser account-control approval was requested separately; do not infer it
  from the earlier homepage/model-only approvals.
