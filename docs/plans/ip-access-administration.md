# IP access and dashboard administration

Owner: Codex chat 01a0f3ea-ece8-71a0-80d9-3222db4ddfba.

Andrew requested automatic no-login access for addresses shared with Tailnet
devices, plus manual IP additions in the Nozorb dashboard. Pending clarification:
the conservative reading restricts management to authenticated `awb` or `akadmin`;
Tailnet membership and IP-based admission alone do not authorize management.

1. Keep the current site, naming service and Authentik fallback. Introduce a
   loopback auth adapter that consults live Tailnet peer state and exact manual
   IP records. Its cache expires; failures never reuse expired automatic grants.
2. Persist manual addresses and audit metadata separately from immutable site
   releases. Validate exact addresses, reject broad networks, and support removal.
3. Authenticate management against the existing Authentik outpost on every request.
   Do not trust browser-supplied identity headers. Require same-origin JSON writes.
4. Mount the controls only after the server confirms management permission. Reuse
   one small UI module on the currently published site and the pending React studio,
   preserving the other chat's unpublished studio and concurrent naming changes.
5. Test admissions, address changes, stale/unavailable peer state, spoofed identities,
   nonadmin/anonymous refusals, persistence, CSRF and removals. Use a selective
   release and the existing Telpher route renderer. Verify public-origin access
   and outsider fallback; browser verification awaits Andrew's scoped approval.

Applied October 1 UTC: automatic public-IP admission and the administrator-only
controls are deployed. Home public-origin GET is 200; outside-origin GET and
forged forwarded headers still redirect to Authentik. Anonymous list/read/write
requests are refused. Only the four intended live site files changed; 181 prior
entries were preserved. Full browser interaction and real administrator-session
CRUD remain pending the scoped browser approval. See ../ip-access.md.

Earlier account work added Jill, Daniel, Iani and Brysen to the restricted app;
akadmin was added for the requested administration role. Live Authentik checks
allow these members and awb, while refusing chipper. Bitwarden copies remain
pending its CLI login; the separate passwords are stored in hid-in.
