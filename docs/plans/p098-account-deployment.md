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

Remaining: implement/review the installation operation, obtain required review
and credential access, then perform real account acceptance. Configuration
syntax and migration-plan execution do not establish a running service.
