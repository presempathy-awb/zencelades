# Account deployment packet — not active

The checked-in packet adds personal scenario/Naming saves to the public site.
It does not turn the homepage into a login wall or grant anonymous persistence.
The old-domain provider and the static release remain separate.

## Proposed artifacts

- `deploy/authentik-account.toml`: canonical `zenceladus.com` provider under app
  slug `zenceladus`; consumed by Telpher's existing forward-auth state tool.
- `deploy/zencelades-account.service`: standalone Go service, dynamic unprivileged
  user, loopback `127.0.0.1:18134`, exact canonical origin and the existing
  loopback Authentik outpost. The port was free during the October 1 check;
  recheck it at installation, since this observation does not reserve it.
- `deploy/account-Caddyfile.fragment`: account API and outpost callback/start/
  sign-out paths. These additions are deliberately not in the active Caddyfile.
- `account-service/migrations/20261001_account_drafts.up.sql`: additive private
  document table. Application startup never executes this migration.

The service binary is proposed at
`/srv/zencelades-account/current/zencelades-account`. Versioned releases and
the prior current target must be retained by installation, as with the existing
static service. The initial release does not exist on the host yet.

The database URL remains a hid-in secret (`telpher/thatsnozorb-database-url`).
The proposed installation handoff writes it to a root-owned 0600 file at
`/etc/zencelades-account/database-url` through the authorized owner workflow,
without printing it. systemd `LoadCredential` passes a private read-only copy
to the dynamic service user; only its path enters ExecStart. This follows the
[systemd credentials contract](https://github.com/systemd/systemd/blob/main/docs/CREDENTIALS.md).
No secret is included in this packet, environment file or compiled binary.

## Required installation order

1. **Codex prepares with operation-specific access.** Use existing supported
   credentials and project grants; do not require a global `gunlock` as a
   blanket prerequisite. Ask Andrew only when the actual operation reaches a
   human authorization gate. Read current
   Telpher app/provider state using the canonical contract; inspect existing
   access bindings and memberships before applying the intended account policy.
   A new Authentik app defaults open: do not silently choose memberships or
   enable sign-ups. Preserve the old `thatsnozorb` app and provider.
2. **Codex prepares validation evidence for required security review.** Build the Linux binary
   with `just account-build OUTPUT`, collect hashes, and verify the candidate
   unit with the host's systemd and the candidate Caddy configuration with Caddy.
   The recipe builds only; it does not install, start, migrate or obtain secrets.
3. **Codex installs through the reviewed deployment operation.** Provision the
   credential, verify PG18/database identity, run the explicit additive migration,
   install/start the service, and probe it on loopback. Preserve prior unit and
   release for rollback. The service-only installer below is implemented and
   tested locally; required review and production execution remain open.
4. **Codex publishes only after backing paths work.** Overlay the two proxy
   additions and account-enabled frontend onto the actual active release using
   compare-and-swap checks. Preserve Showtime, gallery, media and downloads.
   Validate anonymous browsing and denied saves before authenticated acceptance.
5. **Codex and Andrew verify the real account flow.** With browser scope approved,
   test sign-in, explicit save/load, reload, account isolation, concurrent edits,
   expired sessions and logout. Andrew handles passwords, MFA and Touch ID.

Rollback restores the previous public release and unit and stops the new
service if necessary. Keep the private draft table and credentials intact;
dropping data is a separate destructive action, never an automatic rollback.

## Current access and deployment evidence — October 5

Fresh read-only checks establish that the dedicated `thatsnozorb_user` role and
its owned `thatsnozorb` database already exist. The owner provisioner reports no
creation steps or errors. The six application-specific HBA isolation rules are
absent from both the owner source and the mounted live file. A targeted query
against the migration's actual table, `public.zencelades_account_drafts`, returns
NULL; no migration is claimed.

The account unit is not installed, its private credential file is absent, and
its loopback listener is absent. The canonical public `/account/api/session`
returns HTTP 404. The website remains on release `c9ca948ae710bd0fc342765a6151ad1c204c7bb1fa77450219dc0c14ff347988`.
Local race, vet and isolated PG18 checks passed earlier after updating the
existing `golang.org/x/text` dependency to v0.39.0 for
[GO-2026-5970](https://pkg.go.dev/vuln/GO-2026-5970). After the CI toolchain
repair, pinned Go race tests and vet passed again, but the PostgreSQL fixture
stalled at Docker startup and was interrupted with exit 137. That rerun does
not establish persistence on the repaired revision; hosted service-backed
PostgreSQL acceptance remains pending.

The minimal owner change adds the six rules generated by Telpher's existing
`pg18-app-provision` to `postgres18/tls/pg_hba.conf`; no new provisioner is needed.
After reviewed delivery, `pg18-hba --apply` reloads only matching, parse-clean
host/container copies. It does not write the file. Do not add `--restart` to
work around a stale mount without separately approving its connection impact.
Then verify scoped database isolation, perform the explicit additive migration,
install the reviewed service and activate the account/outpost route additions.

The remote hid-in vault remains locked and the examined local Telpher grants
are stale. Required access is operation-specific: the declared database URL,
the scoped publisher token, and the owner's existing Authentik workflow.
No secret value, grant refresh, HBA reload, SQL application or service activation
occurred in this continuation.

The refreshed Linux/amd64 build and local installer plan both exited 0. The
candidate digest is `8d786855772290b05efddd5163e73bb79bbecd9b603e0c5cb0b0416877302aa4`;
its binary hash is `a0b408c353ac697e3c7b9af383dd94997b6941b7d484ac14523af666b47db40a`
and unit hash is `6964d4b793553349f9d03fd7f813c41b681432f840f613da8d3656501c2ba302`.
This local plan reports `applied: false`. It is not host installation, a
fresh systemd/Caddy validation or authenticated acceptance. The owned candidate
is retained under the agent cache's `zencelades/p148-account-candidate/`.

## Preserved access checkpoint — October 2

Andrew reports the unlock complete and asks that `gunlock` not be generally
required (P110). The local live Gitea gates now read their credential successfully.
The actual presvd1 database-secret read still returns `locked (gate=vault,
scope=general)`. This refusal applies to that remote read; it does not block
local planning, tests or the now-working forge operations. Do not transfer or
recreate credentials merely to bypass the refusal. The account service is
inactive, and its loopback port refuses connections. No production login or
private-save acceptance is claimed.

## Earlier deployment evidence

The October 1 live read showed systemd 255 on x86_64, no account unit, and no
listener at 18134. The canonical route is public and forwards to Caddy 18131.
Direct outpost verification with canonical forwarded-host still returns 404.
The private database credential had not been read, and neither this provider
contract nor service was installed at that check.

Application tests are documented in [account-saves.md](account-saves.md).
They establish local behavior and isolated PG18 behavior, not production login.

## Candidate validation — October 1

The Linux/amd64 build completed successfully. Telpher's existing
`desired_from_contract` parser accepted `deploy/authentik-account.toml` offline;
this does not verify that the named flows or app exist in Authentik.

On presvd1, Caddy 2.6.2 validated the exact active configuration plus the two
candidate reverse-proxy routes, with exit 0. Its existing formatting and
disabled-inner-HTTPS warnings remain. systemd 255 verified the candidate unit
with exit 0 after changing only ExecStart's binary path to a private temporary
validation directory. The production path does not yet exist. Credential access,
DynamicUser startup and database connectivity were not exercised by this check.

The uploaded binary's SHA-256 matched the local build. Its `--migrate` plan
printed the source SQL exactly and exited 0 without a credential or database
connection. No SQL was applied. Initial validation found the temporary copy had
mode 0644; correcting that copy to 0700 resolved the execution failure.

The active release stayed `9b6f2f7c`. The detailed validation receipt, original
failure and per-artifact hashes are retained in the agent cache under
`p098-deployment-packet/`. Revalidate against the actual live release before
installation; this packet is not authority to overwrite a newer deployment.

Fresh application checks in this continuation also pass: `just account-check`
(Go race tests, vet and the entire suite in isolated PG18), 54 Bun tests / 780
assertions, 59 Python tests plus 13 subtests, 22 Node tests, Ruff check/format
and the grant-ledger check. The Go race invocation used valid cached results;
the isolated PG18 run executed its database and HTTP round trips again.

## Acceptance still open

| Boundary | Current proof | Missing proof |
| --- | --- | --- |
| Public homepage/media | Live browser loop/click/alternate-image checks on `9b6f2f7c` | Preserve these bytes in the account release |
| Guest scenario/Naming edits | Local behavior tests and legacy-storage preservation | Browser edit/reload against the account-enabled candidate |
| Account-owned saves | Real isolated PG18/HTTP round trips, separate document kinds and accounts | Production login, save/reload and database readback |
| Identity and conflicts | Negative tests for forged identity, expiry, cross-account and stale writes | Actual deployed Authentik session and concurrent browser workflow |
| Service installation | Built Linux binary, candidate unit/Caddy validation, SQL plan execution; installer behavior tests and host dry-run | Required installer review, credential handoff, migration and running service |
| Older project requests | Original receipts and prompt plans retained | Current scoped storage, Pacinman editing and source landing evidence |

## Service installer

`just account-install SOURCE --expected-current VALUE --expected-unit VALUE`
is plan-only. SOURCE contains the reviewed `zencelades-account` Linux binary
and `zencelades-account.service`. Each expected value is the exact prior release
or unit SHA-256, or `absent` for a verified first installation. The plan returns
the candidate release digest. Applying additionally requires `--apply --release
DIGEST`, root on the systemd host and the private owner-provisioned credential
file. This recipe does not grant root or obtain a secret.

The implementation is `scripts/account_install.py`; it uses the Python standard
library already present on presvd1. It checks regular files, hashes, private
credential metadata and current state, and serializes its own installers with
a file lock. It retains versioned releases and backs up the previous unit,
mode, release pointer, running state and enabled state before switching. The
candidate unit is verified with its binary path relocated to staging. A failed
start or anonymous-session health check restores the prior service state.
Detected concurrent changes refuse activation or automatic rollback rather
than overwrite another owner's work. If rollback itself fails, both failures
are reported together and the backup is retained.

The installer never reads the credential value, applies SQL, changes Authentik
policy, modifies Caddy/Traefik or publishes frontend files. Complete and verify
the explicit migration/provider prerequisites first. Its anonymous session
probe establishes service availability and the signed-out contract only;
production account saves still need authenticated acceptance.

Twenty-three local tests cover dry-run behavior, digest pinning, stale/linked/FIFO
inputs, changed active-release bytes, private credential permissions, successful
replacement, rollback of running/disabled services and unit modes, enable failure,
concurrent-owner preservation and a healthy HTTP response with an inactive unit.
Health responses must be private, anonymous JSON with the expected sign-in/out
paths. The credential-permission guard was removed
temporarily: the test failed because installation improperly succeeded; restoring
the guard returned the tests to green. Removing the health probe's no-store
check likewise made its cacheable-response test fail; restoring it passed.
The installer type check for the project's Python 3.12 target reports zero
errors and zero warnings.

After adding the installer, the complete Python suite passes 82 tests plus 13
subtests, with Ruff check/format and the grant-ledger check also passing.
The earlier Go, Node, cockpit and build evidence above is separately dated;
this installer-only change does not claim another frontend/browser test run.

An actual presvd1 CLI dry-run returned `applied: false` and confirmed no account
service root or unit was created. Candidate release:
`4ff2c9404a0e0154b3206a217c8180a3f11984f83330191f222450ac01554f50`.
This digest identifies binary/unit bytes, not security approval or installation.
The host plan and script hash are retained under the agent cache's
`p098-install-plan-pqge23_d/` receipt. Privileged installation and real rollback
on presvd1 remain unexercised; local service-state tests mock systemctl.
