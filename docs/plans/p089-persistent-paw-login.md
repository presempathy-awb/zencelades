# P089 — Complete backlog and logged-in persistence

Andrew: "get all pst prompts done project needs all green tests etc"

Andrew: "gimmesomepawlogin, only logged in can edit taht sticks others can but ephemeral add tooltips"

Codex continues the entire audited backlog. Implement real Pawthentik login and
server-enforced authenticated saving. Visitors can edit temporary session state;
guest edits must not change persistent/shared data. Explain persistence in accessible
tooltips and status copy. Verify anonymous denial, login, save/reload, expiry and
logout without losing another person's data. No client-only authentication gate.
The latest all-green-tests request resumes relevant full test coverage, including
the previously paused Python suite when verifying Python changes and release.

Status: active. Account identity verification, PG18 persistence, explicit account
save/load and guest help are implemented and tested locally under P098. Guest
import/export and reload clearing are browser-verified. Production account
publication, deployment and authenticated acceptance remain incomplete; see
[current integration evidence](../integration-readiness.md). Existing public
viewing, private inventory boundaries and prior compatible requirements remain.
