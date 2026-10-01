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

1. **Codex prepares; Andrew supplies required unlock/approval.** Read current
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
   release for rollback. This operation still needs implementation/review.
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

## Current blockers and evidence

The October 1 live read showed systemd 255 on x86_64, no account unit, and no
listener at 18134. The canonical route is public and forwards to Caddy 18131.
Direct outpost verification with canonical forwarded-host still returns 404.
presvd1's global vault ticket is locked. The private database credential has
not been read, and neither this provider contract nor service is installed.

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
| Service installation | Built Linux binary, candidate unit/Caddy validation, SQL plan execution | Reviewed installation operation, credential handoff, migration and running service |
| Older project requests | Original receipts and prompt plans retained | Current scoped storage, Pacinman editing and source landing evidence |
