# Personal account drafts

Implementation status: local source and isolated PostgreSQL 18 verification.
This service is **not deployed**. The public site continues to serve the existing
homepage-loop release. The Go service and pgx were approved in P098.

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

The legacy Naming page still has its earlier browser-local editor/ranking
storage. It is not part of this scenario contract and remains an explicit gap
against the broader requirement that only signed-in edits persist. Do not call
the full account-persistence goal complete until that path is reconciled without
destroying existing local drafts.

## HTTP contract

Every response is private/no-store. Success uses `data`; failures use
`error: {code, message}` without database or credential details.

| Method and path | Behavior |
| --- | --- |
| GET `/account/api/session` | Verified user or null, plus gimmesomepaw sign-in/out paths. |
| GET `/account/api/scenarios/current` | Current verified account's snapshot or null; authentication required. |
| PUT `/account/api/scenarios/current` | Save `{expectedRevision, scenario}`; authentication required. |

Scenario GET/PUT require `X-Account-Subject` matching the user currently verified
by the outpost. It is an account-switch guard, **never an owner selector**. The
SQL owner comes exclusively from the outpost's unique `X-authentik-uid` response.
Only the browser Cookie is forwarded to the configured outpost; caller identity
and Authorization headers are ignored. Outpost redirects are not followed.

PUT additionally requires exactly the configured Origin and JSON content type.
Cross-site fetch metadata is rejected. The request limit is 50,512 bytes and the
snapshot limit is 50,000 UTF-8 bytes. The service checks the schema-1 envelope,
required object sections, note and scalar types. It stores private opaque
snapshot content; the cockpit's `parseScenario` performs model/price/task-domain
validation before applying a retrieved snapshot. Stored JSON is never executed.

Revision zero creates only if absent. Positive revisions update only the same
owner at exactly that revision. Concurrent/stale updates return 409; expired
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
file or a command-line URL. No production port or service installation is yet
committed by this slice.

`just account-migration` prints the additive SQL and changes nothing. Execution
requires `--apply` and `--database-url-file`. The service never migrates on
startup. The paired down SQL drops the account table: use only after exporting
its data and obtaining explicit destructive-action approval outside fixtures.
The isolated test exercises down/up, not a live rollback.

## Verification

From the project lane:

```sh
# maxipaxi
L=~/code/branch/thatsnozorb/triangle-projection-cockpit/main
(cd "$L" && just account-check)
(cd "$L/cockpit" && bun test)
(cd "$L/cockpit" && bun run build)
```

`account-check` runs the whole Go suite with the race detector, go vet, then the
whole suite in an isolated PG18 container. The fixture requires the already
available `postgres:18-bookworm` image, never pulls it, publishes no port and has
network disabled. Test authentication is confined to that disposable container.
Its database must be named `zencelades_account_test` and must report PG18 or the
integration test refuses to write. The fixture cleans up only its own container
and temporary binary.

Coverage includes forged identity rejection, account isolation, origin/content/
size validation, expiry, outages, stale revisions, account switching, two
simultaneous writers, a full cockpit fixture after reconnect, the real HTTP
handler writing PG18, and migration rollback/reapply. Direct server tests do not
prove an actual Authentik browser session.

## Deployment prerequisites observed October 1

- The live site was active at release `90891ed1` during this check.
- The existing presvd1 outpost listens on loopback port 19001. With the old
  subdomain it returns the expected anonymous 302; with `zenceladus.com` it
  returns 404. The canonical-domain provider binding needs repair using Telpher.
- presvd1 hid-in reports an expired unlock ticket; local hid-in is also locked.
  No production database credential has been read or copied for this work.
- A security review, reviewed service/route installation, and actual browser
  sign-in/save/reload/expiry acceptance remain required before publication.
  Browser account-control approval was requested separately; do not infer it
  from the earlier homepage/model-only approvals.
