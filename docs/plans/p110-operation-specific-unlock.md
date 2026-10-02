# P110 — Use operation-specific access

Andrew, October 2: “done but dont generally require gunlock”.

Codex resumes the authorized release work after Andrew reports the unlock is
complete. Do not treat `hid-in gunlock` or a global vault status as a blanket
prerequisite. Try the declared operation with its existing supported access;
request only the particular unlock that an actual failure requires. Preserve
human-only authorization gates and never disable checks or expose credentials.

Current evidence: the supported Dustopo live Gitea Actions gate successfully
read its declared credential and returned ready for Telpher `c5106437` (13 green
contexts) and hesellsheshells `96b08eb4` (two green contexts). This clears the
previous local credential blocker for those checks. It does not establish a
presvd1 service deployment, account login, or persistent saves.

Next: Codex refreshes exact-head release evidence before landing and deployment.
Existing account publication and real-login browser choices remain separate.
