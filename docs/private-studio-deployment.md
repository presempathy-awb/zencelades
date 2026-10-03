# Private studio deployment — October 3, 2026 UTC

Zencelades `fix/visible-controls` (#13) merged at
`c5bf9f468252a3c4d7e63ff772bb5880de3dec87`; both Gitea and GitHub main refs
were verified at that commit. The final source repair is `7a3e564d15f4`.
Two full Grok reviews held medium; the configured two-round merge gate allowed
landing after the documented repairs and responses. No PASS is claimed.

The active additive release is
`dfecc13fcfbd66b0ef5cf58f427bb118c0548fa6d53f2ceec015d4cee6cd6100`, replacing
`a1d372323fe59d831f617136932e19fffa7737936c1f48351e744cc4ef4414c0`.
The previous release remains available for rollback. The protected route was
installed before activation. All 1,715 manifest entries match their deployed
sizes/hashes; the static service is active and bound only to `127.0.0.1:18131`.
All 55 media/attachment entries are byte-identical to the previous release.
Showtime's SPA entry updates its JavaScript/CSS references; no other HTML
content changed in that entry.

## Live evidence

- Telpher `app-status` and `app-access-check`: restricted studio membership,
  seven crew accounts allowed, sampled nonmember refused, signups off.
- `domain-add-subdomain` planned and applied successfully: DNS resolves,
  studio certificate is issued, anonymous HTTPS request redirects to Authentik.
- `route-auth-probe`: HTTPS redirect, login required, forged identity refused,
  outpost healthy. All four checks passed.
- Forty URL checks passed across zenceladus.com, zencelades.com, the legacy
  muchadoaboutoneside hostname and the private studio. Private JS/download
  requests redirect to login even with forged identity headers; all ten old
  prompt URLs return 404 on each public hostname.
- Visible browser: both hero images load at native width 1,536; both schematic
  images load at 1,600. The homepage film is ready, muted, looping and has no
  controls; the outer page does not scroll. The render deep link focuses its
  section. Showtime content opens. The private studio reaches Authentik's
  named application sign-in screen; credentials/MFA are left to Andrew.

## Cache cleanup follow-up — P128

Canonical-domain cache eviction succeeded for all ten retired prompt URLs.
No zone cache rules override the private no-store headers. The old alias's
first replacement attempt hit the 50-token quota. At the authorized cleanup,
the count had independently fallen to 46. Codex verified the canonical
replacement active and identical on both hosts, then revoked only Andrew's
approved superseded token ending `6529d` (count 45 after revocation).

On maxipaxi, Telpher's `cloudflare-zone-token-plan` and
`cloudflare-zone-token-mint zencelades.com zencelades --with-edge-cache --mirror`
both exited 0. The alias replacement ending `9ebf9` is active and identical in
local hid-in and presvd1's encrypted credential. `edge-cache-purge` planned and
applied the ten retired alias URLs with exit 0; Cloudflare accepted the purge.
Only the exact approved canonical token was revoked.

Fresh post-purge verification on maxipaxi: the 40-case live URL probe exited 0
with zero failures; `route-auth-probe studio.zenceladus.com` exited 0 with all
four checks passing. The remote active release still resolves to `dfecc13fcfbd`.
This checks current responses and records Cloudflare's accepted purge; it is
not an independent observation of every edge cache worldwide.

## Remaining boundaries

An authorized human browser session, clipboard byte readback and browser file
round-trip are not yet verified. Pawthentik/gimmesomepaw integration and the
account-service/PG18 runtime remain separate future work. Public source history
and copies downloaded before protection are outside this website boundary.
