# P069 — Confirm target domain

Andrew answered the exact-domain clarification: “zenceladus.com”.

Use this spelling for the P068 repair deployment. Freshly inspect registration,
DNS, existing Telpher routes and certificate state, then plan and activate the
existing site's route through Telpher if its prerequisites are satisfied.
Preserve the current working hostname and access policy. This corrects P068's
target spelling; it does not rename historical source or service identifiers.

The Cloudflare zone is active with apex/www proxied records. Telpher preflight
passed, but apply refused because a concurrent actor had installed a newer route
with an ACME challenge router. That working route was preserved. A separate
concurrent Caddy redirect away from this domain was corrected in P068's exact-
base release. Trusted HTTPS via the authoritative Cloudflare address now returns
200; ordinary Mac DNS remained negatively cached at verification. No global DNS
settings were changed and no new registration was attempted.
