# Nozorb IP access

The deployed site accepts direct Tailnet clients, people sharing a freshly
verified Tailnet device's public IP, exact manually allowed public IPs, or an
authorized Authentik account. Sharing a home, office or other public address
therefore grants site access to everyone using that address, as Andrew requested.

Only an Authentik session whose verified username is exactly `awb` or `akadmin`
can read or change the IP list. Tailnet/IP admission alone does not grant that
permission. The **IP access** button is mounted in the site's header only after
the server confirms permission; other visitors receive no controls or list.
The API independently authenticates every request with the existing outpost.

## Using the controls

If IP admission means the browser has not signed in, open
[administrator sign-in](https://thatsnozorb.muchadoaboutoneside.com/access/login).
After Authentik completes, that endpoint returns to the site root. Sign in as
`awb` or `akadmin`, then select **IP access**. Enter one public IPv4/IPv6 address
and a label; **Remove** deletes the manual entry. Networks/CIDRs, private IPs,
invalid addresses and duplicate entries are refused. Removing a manual entry
does not override automatic admission if a Tailnet peer still uses that IP.
The dialog's **Refresh** rechecks the list and current administrator permission.

The shared script serves both the current static site and the pending React
studio. This change did not publish the other chat's studio or naming work.
The studio build includes the loader; `site-build` copies the shared assets.

## Runtime and trust boundary

`thatsnozorb-access.service` binds only `127.0.0.1:18133`, runs as a systemd
dynamic user, and reads local tailscaled state without an administrator token.
Its code lives under `/srv/thatsnozorb-access/current`. Manual entries and an
add/remove audit live in `/var/lib/thatsnozorb-access/ips.sqlite`, outside
immutable releases, with systemd directory protection and mode 0600.

Every refresh sends bounded authenticated Tailnet pings to online peers. An
automatic entry needs a direct reply matching tailscaled's `CurAddr`, membership
in the current network map, an unexpired peer, a public address and a handshake
within 180 seconds. Peer-advertised `Addrs` and relay addresses never grant access.
Refresh runs again after 20 seconds; cached grants expire after 45 seconds.
Refresh failure clears automatic grants; no stale grant survives cache expiry.
An offline, relay-only or otherwise unverified device falls back to Authentik.
Manual entries persist until an administrator removes them. The current home
address is admitted automatically; no permanent home exception was needed.

The existing higher-priority direct Tailnet and outpost callback routes remain.
The public router uses the adapter with `trustForwardHeader: false`, so Traefik
constructs the client address from its socket peer. The adapter accepts one
exact address, never an arbitrary forwarded chain. It relays the Authentik
fallback and verifies management cookies directly against the outpost, ignoring
caller-supplied identity. Writes require same-origin JSON requests. No outpost
administrator token, password, cookie or login URL is written to runtime logs.

## Deployment recipe

The verified `deploy-access` recipe plans by default. It requires `--host`,
`--telpher` (a checkout with the adapter-compatible `_domain_route.py`) and a new
`--output` packet directory. `--apply` installs the service and overlays only
the live homepage, `access.js`, `access.css` and Caddy's two access proxy routes.
It does not build/publish the mixed local site distribution. The remote
installer checks the expected live release, homepage/Caddy hashes and route
hash before activation, retains backups, and checks service/site health.
Telpher's existing renderer, dry-run and guarded route executor own the edge
change; no DNS or unrelated route is changed.

The service/code switch retains the old site and service on activation failure.
Telpher separately rolls back a failed route application. A route failure after
service installation is reported explicitly: it does not imply that IP admission
is active. Recheck concurrent deployments before using any retained rollback.
The SQLite database is not erased by a code/site rollback.

This implementation used Telpher lane `feat/shared-ip-access` at
`/Users/andrew/code/branch/telpher/shared-ip-access/main`; its renderer change is
not yet landed. Plan/apply receipts are in
`/Users/andrew/.cache/codex/nozorb-access-apply/` on maxipaxi. No source PR or merge
is claimed; the Nozorb directory has no Git/JJ metadata.

## Verification — 2026-10-01 UTC

On maxipaxi, the Python suite passed: **54 tests plus 13 subtests**, exit 0.
The focused access suite passed again after the SQLite connection-lifetime fix:
**22 tests**, exit 0. Node DOM fixtures cover hidden controls, add/remove state,
literal label rendering and disappearance after revocation: **4 tests**, exit 0.
The complete Node suite passed **17 tests**, exit 0, after deployment.
Studio `bun test` passed **4 tests / 23 assertions**; its TypeScript/Vite build
exited 0 with the existing large-chunk advisory. The Telpher renderer suite
passed **83 tests**, exit 0. Ruff checks passed on the new Python files;
`impeccable detect --json site/access.js site/access.css` returned `[]`, exit 0.

Live evidence from maxipaxi and presvd1, using ordinary certificate verification:

| Boundary | Result |
| --- | --- |
| Home public-origin naming URL, no cookies, explicit public DNS resolution | 200 |
| Outside public-origin naming URL from presvd1 | 302 to Authentik |
| Same outside request with forged home X-Forwarded-For and awb identity | 302 |
| Anonymous Tailnet session API | `canManage: false` |
| Anonymous manual-list GET | 403 |
| Forged awb manual-list POST | 403; persisted row count remains zero |
| Forced sign-in endpoint from the admitted home IP | 302 |
| Authentik application check | awb, akadmin and all collaborator members allowed; chipper refused |
| Access service and existing Caddy site service | Both active |

The live release is
`dda8a476bf7e616fd27ed70638da8b0ea2ab8c6fc6704d027b312de9721be465`.
All **181** prior file entries outside the two modified files were preserved;
the only file changes/additions are the homepage, Caddyfile, access.js and
access.css. Service source hash:
`0a8cdcc6163dd2259d97e7573fc04f7f8bae4c9cc066ee1c2cc90a7b9e1b783a`.

The route dry-run could not inspect unrelated `concierge.yml` without root;
this does not establish a full route collision audit. This site's route, backend
and auth endpoint checks passed. Browser control remains unapproved: no real
administrator cookie, interactive add/remove workflow, responsive rendering,
or complete Authentik login-return journey was exercised. The DOM fixture and
HTTP checks are not browser end-to-end proof.
