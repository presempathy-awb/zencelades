# P118 — Protect the private studio

Andrew, October 2, 2026:

> ok get it fixed please use umesemu like model but with what needed for pawthentik, if thats not ready just have authentik standin with plan

Implement and deploy the public/private separation using Umesemu's private bench
pattern and Telpher's supported Authentik tools. The prompt workbench, downloads
and bundled prompt contents must not be retrievable through public aliases.
Use Authentik with explicit membership while Pawthentik is unavailable; record
the eventual membership handoff. Keep public artwork, models, gallery and
Showtime. Tailnet presence alone does not grant studio membership.

1. Inspect current providers, grants, routes and the Umesemu source pattern.
2. Isolate the private prompt build; add public-host and download regressions.
3. Provision restricted Authentik membership before the protected hostname.
4. Obtain the security review; deploy the additive overlay; prove anonymous
   denial and rejection of nonmembers, preserving other publishers' work.
5. Complete real-login acceptance within Andrew's browser approval and record
   the Pawthentik migration plan without claiming an inactive service works.

Status: implementation and local/isolated HTTP checks pass. Production is
unchanged. Andrew approved the private-studio browser scope. The Authentik API
read and real domain/route dry run now pass after the manifest grant. Required
security review and live acceptance remain pending. The account-service/PG18
rollout remains a separate unfinished item.
