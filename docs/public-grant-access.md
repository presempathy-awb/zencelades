# Temporary public grant review — P056

Andrew authorized the site and both source repositories to become public, plus
the project PR, merge and deployment. No closing date was specified. No automatic
expiry has been installed; restore the previous access policy when Andrew ends
the review window.

Applied October 1, 2026 UTC on presvd1 using Telpher's existing `app-auth`
recipe for `muchadoaboutoneside-thatsnozorb`: the main router's forward-auth
middleware was removed. Identity stripping, compression, the tailnet router,
outpost and access service were retained. The website responds with HTTP 200;
anonymous `/access/api/ips` responds with 403. That local network observation alone
does not establish access from every external network.

Both canonical `telpher/zencelades` on Gitea and
`presempathy-awb/zencelades` on GitHub report public visibility. The homepage
metadata points to `https://thatsnozorb.muchadoaboutoneside.com/`.
The intended `zencelades.com` domain remains a separate DNS transition.

## Exact restoration boundary

The prior route is preserved on presvd1 at
`/etc/traefik/dynamic/muchadoaboutoneside-thatsnozorb.yml.pre-auth-toggle-20261001T041939Z`.
The active file is the same path without the `.pre-auth-toggle-...` suffix.
Before restoring, compare the saved and active route and preserve any intervening
legitimate changes. Restore the former main-router middleware list through the
Telpher guarded route workflow and verify Tailnet access, ordinary visitor login,
and anonymous management refusal. A blanket `app-auth ... on` also adds auth to
the tailnet router; it does not exactly restore this site's previous OR policy.
Repository visibility is independent of the website window.

## Publication audit

The full local Git history scan covered 82 commits (about 309 MB). Four reports
refer to the same verification-document line across four historical revisions;
each contains two published 64-character deployment SHA-256 identifiers, not
credentials. The scan's nonzero finding count is retained as an adjudicated
false-positive result, not described as a zero-finding scan.

Grant geometry is nominal concept documentation. Projector arms, heads, rain
covers, internal-camera overlay and suspension remain unpriced additions to the
$3,000 LED ground-build allocation and do not establish occupied lifting approval.
