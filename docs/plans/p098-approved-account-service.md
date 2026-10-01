# P098 — Approved account service

Andrew approved: “Approve Go service and pgx (Recommended)” in response to the
proposal to add a small Go service using gimmesomepaw and the pgx PostgreSQL
driver for permanent account-owned PG18 saves. This resolves the production
dependency question from P089/P097. It does not authorize collecting passwords,
bypassing hid-in/MFA, or exposing private Pacinman data.

Implement real verified identity, per-account scenario storage, optimistic
revision conflicts, anonymous temporary drafts, explicit save/load, expiry and
logout handling, and accessible help. Verify the whole scenario including board,
parts and funding, not only a test note. Preserve all deployed public content.
