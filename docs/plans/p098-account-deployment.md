# P098 — Account deployment preparation

Goal: preserve public browsing and ephemeral guest edits while authenticated
users can explicitly save their own scenario and Naming documents in PG18.

1. Preserve the old-host provider. Add a canonical-domain Authentik contract
   under a separate app slug and inspect existing memberships before applying
   access policy through Telpher's owner one-shots.
2. Prepare the loopback Go service, a systemd credential-file handoff and the
   two Caddy routes needed for account API and Authentik callbacks. Keep these
   outside the active Caddy file until the backing service is verified.
3. Build the Linux binary and validate unit/config syntax. Package exact
   source, artifact hashes, additive SQL and rollback boundaries for review.
4. After required review and credential access, perform a fresh live-state
   compare-and-swap deployment, migrate explicitly, and verify guest access,
   login, private saves, reload, logout, expiry and concurrent-edit conflicts.

Observed October 1: the canonical Traefik route is public and forwards to
18131. It has no dedicated outpost route. The account service does not exist.
An Authentik forward-auth request with the canonical host returns 404. No
live route, provider, credential, migration or service is changed by this plan.

Validated October 1: Linux/amd64 build exit 0; Telpher's existing
`desired_from_contract` parser accepts the canonical provider; host Caddy
validation exits 0; host systemd unit validation exits 0 with the binary path
relocated to a private temporary validation directory. Running that exact Linux
binary with `--migrate` prints the checked-in SQL byte for byte, without a
credential or database access. The public release pointer is unchanged.

Initial remote validation refused the copied binary because scp created it with
mode 0644. Inspection confirmed the executable bit, not a noexec mount, was the
cause. Setting only that owned temporary binary to 0700 resolved validation.
The source unit and live installation remain untouched. Evidence and artifact
hashes are in the agent cache's `p098-deployment-packet/validation.json`.

Remaining: review the installation operation, obtain required review
and credential access, then perform real account acceptance. Configuration
syntax and migration-plan execution do not establish a running service.

Installation implementation scope: a service-only, plan-first operation taking
the reviewed binary/unit and exact expected current-release/unit hashes. It
must refuse stale or linked inputs, pin the candidate release digest, retain
the previous binary and unit, and restore the prior running/enabled state on
activation failure. Credentials must already be provisioned privately by the
owner. The installer never provisions credentials, applies SQL, edits provider
policy, changes Caddy/Traefik, or publishes the account frontend. Tests first
cover dry-run, successful replacement, stale/tampered input and rollback.

Implemented in `scripts/account_install.py` with the `account-install` recipe.
Twenty-three behavior tests pass, including private credentials, versioned artifact
retention, stopped/enabled state and unit-mode rollback, and refusal to overwrite
concurrent changes. Removing the credential permission check made its test fail;
restoring it passed. The real presvd1 plan-only entrypoint exits 0 and leaves the
account root/unit absent. No privileged application or live rollback was tested.
The provider, credential, migration, review and account browser gates remain.
Final whole Python check: 82 tests and 13 subtests pass; Ruff check/format and
grant-ledger validation pass. Installer type checking for Python 3.12 reports
zero errors and warnings. The exact final script was planned on presvd1 again.
