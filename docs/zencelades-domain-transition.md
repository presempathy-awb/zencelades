# Zencelades domain and Authentik transition

P021/P022/P023, September 30, 2026. Andrew owns **zencelades.com**. The earlier
zenceladus.com lookup used the wrong spelling and says nothing about this
domain's ownership. Current public branding uses Zencelades; service, database,
storage and checkout IDs remain `thatsnozorb`.

Studio branding, `agents.toml` and this pinned chat title use Zencelades.
The native Codex project's sidebar label remains `thatsnozorb`; the available
project tools do not expose a project-rename operation. No app state database
or shared checkout path was edited to force that change.

## Verified state

- Public NS and A lookups for zencelades.com returned NXDOMAIN on maxipaxi.
- Telpher's existing `cloudflare-zone-token-plan zencelades.com` returned
  `zone zencelades.com not visible to the bootstrap token`, exit 1. It did not
  create a token, zone or DNS record. This does not disprove domain ownership.
- The existing HTTPS root returned 200; `/access/login` returned 302 to
  Authentik's authorize endpoint. TLS verification remained enabled; no
  redirect query, cookie or state value was retained.
- No new-domain route, certificate, provider or callback was applied.

Codex has asked Andrew which registrar/DNS account holds the domain. Proceed
through its API or existing Telpher recipes once that account is identified;
do not request another registration or substitute a guessed hostname.

## Concrete migration boundaries

| Boundary | Required before primary URL changes |
| --- | --- |
| DNS/TLS | Confirm zone ownership/access and authoritative nameservers; plan through Telpher, then install a trusted apex route on the existing loopback site service. Preserve source-address semantics of the current direct edge. |
| Authentik | Keep the existing restricted application and members usable. Prepare a provider matching the new external host/callback with the same effective access policy; verify member and non-member decisions before exposing it. A newly created application is not restricted automatically. |
| Access adapter | `scripts/access_server.py` currently fixes `SITE_HOST` to the old hostname for outpost requests, forwarded-host admission and same-origin writes. A route alone is insufficient. Support only the explicit approved old/new host pair, keeping outpost host, callback and origin checks consistent per request; review and test that security change before rollout. |
| Naming API | Its deployed allowed-origin setting and `deploy/activate-naming.sh` still name the old hostname. Verify actual service arguments and narrowly allow the new origin while preserving existing use. |
| Existing IP policy | Preserve direct Tailnet access, verified shared public IPs, exact manual entries, Authentik fallback, and verified `awb`/`akadmin` control-list permissions. A generic forward-auth replacement would lose this behavior. |
| Cutover | Verify the new root, login redirect/callback, user and administrator actions and saved naming operations. Then advertise the new primary URL; keep the old route available during transition. |

Existing supported operations are `domain-add`, `new-com`,
`cloudflare-zone-token-plan`, `app-status`, `app-users` and `app-access`.
The inspected Telpher lane with the adapter-compatible renderer is
`/Users/andrew/code/branch/telpher/shared-ip-access/main`; verify its current
owner, changes and recipe definitions before execution. The offline generic
domain plan is not an approval to replace this site's specialized access route.

## Acceptance and rollback

Before applying, record the live release, route, application policy, adapter
source and naming-service configuration. Use Telpher's plan/apply and rollback
mechanisms; keep manual IP records outside the release. Preserve any later
changes by the access/naming owners. A failed new-domain probe leaves the
working old address in place; never open the app globally to make a probe pass.

Full browser sign-in/return has not been exercised. The requested project-only
browser check stops at login/MFA and cannot substitute for an authenticated
journey. Account interaction requires its own explicit scope and Andrew handles
passwords/MFA. Ordinary HTTP probes do not establish cookie continuity.
