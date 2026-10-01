# P022 — Authentik continuity

Andrew asks:

> the authentik login shoud still work right?

Captured September 30, 2026. Codex will verify the existing sign-in entry with
a read-only HTTPS request. P021 changes the public name locally; no existing
login or route has been changed. Preserve the same authorized members, IP
admission and Authentik fallback when the new domain becomes available. The
new domain needs an allowed host/callback and origin checks; old cookies alone
do not prove a cross-domain login-return journey. No account or MFA operation.

Verified September 30: the existing site's root returned HTTPS 200 and
`/access/login` returned 302 to Authentik's `/application/o/authorize/` endpoint.
TLS verification was enabled; redirects were not followed and state/query
values were not retained. This verifies the sign-in entry, not an authenticated
login-return journey. P023 subsequently corrects the target to zencelades.com.
