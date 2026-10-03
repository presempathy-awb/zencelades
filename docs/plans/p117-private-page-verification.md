# P117 — Verify private page access

Andrew, October 2, 2026:

> are the private pages done and confirmed private. without pawthentik login?

Inspect deployed routes without cookies or authorization, distinguishing public
prompt pages from a functioning private studio. This request authorized a status
check, not changing access rules.

Observed: homepage, /studio/, /audio/ and the audio README returned HTTP 200.
Account session and scenario endpoints returned 404; studio.zenceladus.com did
not resolve. The account service was inactive and the inner Caddy configuration
had no account/API authentication route. No browser login was exercised.

Outcome: private access was incomplete. P118 authorizes the repair.
