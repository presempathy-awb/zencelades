# Nozorb IP access (retired)

**Retired October 1, 2026.** Andrew asked for the site to be plainly public with no
Authentik wall and no custom IP admission. The adapter service
(`thatsnozorb-access.service` on 127.0.0.1:18133) was disabled on presvd1, the
Traefik route for thatsnozorb.muchadoaboutoneside.com was re-rendered with
Telpher's plain `domain-add-subdomain` (no forward-auth, no outpost router), and
the adapter's code, service unit, Caddy routes, homepage loader, recipe and tests
were removed from this repository in the same change. The retired design is in
the repository history before that commit.
