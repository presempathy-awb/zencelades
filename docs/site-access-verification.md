# Site access verification — September 30, 2026

Historical route checkpoint. The later shared-public-IP adapter, administrator
controls and fresh verification are recorded in [IP access](ip-access.md).
That update supersedes this document's statements that every public-origin
visitor must sign in. The earlier observations below are retained as evidence.

The applied site is https://thatsnozorb.muchadoaboutoneside.com/ on ordinary
HTTPS, without a port in the URL. Real sources in `100.64.0.0/10` or
`fd7a:115c:a1e0::/48` reach the existing site without login. Other sources must
pass the restricted Authentik application. This covers both complete configured
tailnet ranges; live probes exercised maxipaxi over IPv4 and IPv6, not every node.

## Applied changes and ownership

The Telpher lane is `/Users/andrew/code/branch/telpher/tailnet-site-access/main`.
It contains plan-by-default recipes `tailnet-site`, `tailnet-auth-site`,
`tailnet-dns-host` and `tailnet-auth-public-dns`. These are implemented and applied
from that lane, not yet reviewed/landed in canonical Telpher. The static site's
release bytes and loopback backend at `127.0.0.1:18131` were preserved.

1. After Andrew's P007 unlock, the owner Authentik runner created the exact app,
   proxy provider and embedded-outpost association from `deploy/authentik.toml`.
   It added `andrew` and `awb` before restricting the app to its writers group.
   Owner `check_access` results allowed both and refused the checked non-member
   `chipper`; signups were off. These checks succeeded during this session.
2. The reviewed `p007-ready-muchadoaboutoneside-thatsnozorb` packet was installed
   through `traefik-domain-route-apply`. Its higher-priority ClientIP router
   strips identity headers and bypasses forward-auth only for tailnet sources.
   The default route retains Authentik; outpost callbacks retain higher priority.
3. The Headscale exact-host override adds only this hostname's A and AAAA records.
   The helper preserves unrelated configuration, validates the candidate with
   the installed Headscale, backs up and atomically replaces the file, then
   restarts/checks the service. A repeat plan reports `already matches`.
4. The public DNS helper changed this hostname's DNS-only A record to the public
   edge and removed only its exact old tailnet AAAA. No public IPv6 address was
   invented. The ACME challenge delegation was retained. The repeat plan reports
   `ok: records and SSL settings already match`.

The site and downloads remain access controlled. The recovered private ChatGPT
transcript remains excluded. No anonymous public release, open signup or grant
submission was made. App login does not complete Pawthentik's per-person storage
authorization/revocation work or the pending PG18/Much Ado integration.

## Final observed network evidence

Commands ran on maxipaxi at **2026-09-30T21:56:37Z**, through Python subprocesses
calling `dig` and `curl`. The combined probe exited **0**. Curl used ordinary
certificate validation, no insecure flag, no cookies and no redirect following.
Only status, connected address, TLS verification result and redirect hostname
were retained; no login nonce, cookie or secret was saved.

| Probe | Result |
| --- | --- |
| Public resolver `1.1.1.1`, A | `216.128.155.62` |
| Public resolver `1.1.1.1`, AAAA | No record |
| MagicDNS `100.100.100.100`, A | `100.64.0.1` |
| MagicDNS `100.100.100.100`, AAAA | `fd7a:115c:a1e0::1` |
| Normal hostname GET | 200, peer `100.64.0.1`, TLS verify result 0 |
| Explicit tailnet IPv4 with correct hostname/SNI | 200, TLS verify result 0 |
| Explicit tailnet IPv6 with correct hostname/SNI | 200, TLS verify result 0 |
| Public origin with correct hostname/SNI | 302 to `authentik.telpher.stream`, TLS verify result 0 |
| Public origin plus forged X-Forwarded-For and Authentik username | Same 302; no tailnet bypass |

The peer read-only command exited **0**: Headscale was active and the preserved
loopback backend returned 200. The remote route hash and local rendered route
hash both equal
`0c09aef5602a4b198054b40b9676201659b8416710a4819961170a451f0442f7`.
The compact non-secret record is `assets/access-receipt.json`.

Tailnet clients need working mesh connectivity and its DNS override; clients
using public DNS reach the login path. A bare shared-server IP does not identify
this virtual host or carry its hostname certificate. No global default-site
takeover or bare-IP HTTPS shortcut was added.

## Checks, failures and limits

- Direct helper fixtures passed: five Headscale cases (add/preserve, idempotency,
  invalid IPv4, wildcard hostname, conflicting record) and three public-DNS cases
  (read-only plan, exact A/AAAA mutation, conflicting AAAA refusal). Earlier
  renderer checks exercised middleware/priorities and six invalid combinations.
  Ruff passed on the two new/modified DNS helpers; the new helper was formatted.
  Pytest and the full suite were not run, at Andrew's request.
- The first Headscale candidate was rejected before live mutation because its
  temporary filename lacked the `.yaml` suffix. The same valid config was
  reproduced failing without the suffix and passing with it; the helper now
  supplies the suffix, and installation/repeat planning succeeded.
- The route installer emitted macOS archive metadata warnings and could not
  read the unrelated `concierge.yml` during collision scanning. Its own route,
  backend, outpost and certificate checks passed. That scan does not establish
  a complete audit of all routes.
- A final attempt to repeat the Authentik owner check returned **exit 4**,
  `locked (gate=vault, scope=project)`. The earlier application/membership changes
  and allow/refuse checks succeeded while the project ticket worked. This later
  administrative lock did not remove the deployed route or app; the final HTTP
  probes above passed. No unlock bypass or further mutation was attempted.
- No interactive browser login or complete authenticated page retrieval was
  exercised. The evidence is the edge redirect plus the earlier Authentik
  membership decision, not a browser end-to-end claim. Browser control remains
  outside the approved scope. No new service release or all-file readback was
  needed for this route-only change; earlier delivery receipts retain that proof.

## Documentation build and concurrent publication

The grant-library and grant-guide source documents now describe the actual
tailnet-or-Authentik policy. A final `just deploy-site --host presvd1` **plan** on
maxipaxi exited 0: 132 byte-verified downloads, five media previews and 176 staged
files. Comparing its file hashes with the latest deployment receipt found the
two intended document edits plus concurrent naming-page changes owned by the
other chat. Therefore this chat did not activate that combined release or alter
its deployment receipt. The two served Markdown corrections await the next
coordinated site release; the local access/operations records are current.

A read-only peer check at this point observed active release
`0f8ea3ccbf08553572acd8a3f1f3afcf3239473c0fe97862787436f674789e1f`, matching
the updated shared deployment receipt. Earlier research release identifiers
remain historical checkpoints, not the current active-release assertion.

## Rollback references

The route's previous file is retained at
`/etc/traefik/backups/domain-route-muchadoaboutoneside-thatsnozorb-p007-ready/muchadoaboutoneside-thatsnozorb.yml`
on presvd1. Headscale's backup is
`/etc/headscale/config.yaml.bak-host-20260930T214730447123Z` on presvd1.
The lane's `.remember/thatsnozorb-p007-route-apply.json` records the successful
installer; DNS plan/apply/repeat outputs sit beside it. Recheck current state
before any rollback; preserve later changes and application membership. Public
DNS, mesh DNS and routing form one access change and need coordinated rollback.

## What the linked Telpher Things chat contributes

Andrew supplied chat `01a0f40b-8b61-7990-a9ad-6d52b7508a91`, titled
**telpher: Allow approved IPs without login**. Codex read its recent turns and
the current `bin/app-route-network`/justfile implementation in canonical Telpher
without editing its files, messaging the chat or assuming its PR had landed.

Its useful patterns are a normal hostname on 443, socket-source checks,
explicit denied and forged-header probes, plan/apply commands, atomic replacement
and rollback. Its route admits an IP allowlist and denies everyone else; its
helper preserves existing authentication. It does not itself implement a
tailnet bypass plus authenticated access for outsiders.

Applying that blanket allowlist to all of this project's routers would also
restrict the public Authentik route and callbacks, contradicting P005. Its
approved public IPs are not this project's authorization list. Keep the policies
distinct. Our exact-host MagicDNS override also ensures a normal tailnet visit
actually reaches the tailnet address instead of relying on a public DNS answer.
