# P111 — Open the account and cockpit pull request

Andrew, October 2: “do a pr”.

Codex publishes the prepared `feat/account-drafts` branch to the canonical
Gitea repository, `telpher/zencelades`, and opens a PR against main. This resolves
the earlier pending choice about creating the account PR. Include the actual
accumulated cockpit scope, source validation and deployment gaps in its body.
Required security review precedes merge; creating this PR does not install the
service, apply SQL, change routes or prove authenticated production saves.

The separate Telpher PR #554 mirror decision remains pending. Preserve all
other active work and do not merge the wrong-domain redirect in PR #7.
