# P023 — Owned domain spelling

Andrew's prompt, captured September 30, 2026:

> i have zencelades.com

This corrects P021's domain spelling. Codex will use zencelades.com and the
matching public name Zencelades, preserving source filenames and stable service,
database and storage IDs. Andrew owns the domain; no purchase is needed.

1. Verify the owned domain's public DNS and existing provider configuration.
2. Correct local branding and pinned task title without moving the checkout.
3. Prepare the existing Telpher route and Authentik callback/origin migration,
   keeping the old hostname usable and retaining the current IP access policy.
4. Apply only supported, authorized deployment steps and verify HTTPS and login
   redirects. Full browser sign-in remains a distinct approval and proof boundary.

P019 model work and P017 browser verification/publication remain active.

Local branding, agents.toml and the pinned title now use Zencelades. DNS NS/A
queries returned NXDOMAIN; the existing Cloudflare zone-token plan exited 1
because this zone is not visible to the bootstrap token. Codex asked Andrew
for the registrar/account. No DNS, token, route or Authentik change occurred.
[Detailed transition plan](../zencelades-domain-transition.md) identifies
the current host/callback/origin boundaries that need a reviewed migration.
