# Preprompt and agent-source reconciliation — October 1, 2026

The current pack now reads [the current brief](current-brief.md) alongside its
original dated evidence. Its eleven individual prompt files remain separate;
target paths and dependency order are unchanged. Historical source hashes in
`preprompts/context.json` were preserved. Later occupied-build, public-site and
authenticated-save requirements explicitly supersede conflicting September 30
statements, with notices on each original planning target.

`agents.toml` now records the canonical Gitea identity, current project phase,
current-brief/release/login-plan context and existing check commands. Its
deployment-plan command includes the required host argument. The `python` stack
selection and inherited user defaults remain unchanged; the project still
declares zero managed targets. No generated AGENTS.md/CLAUDE.md, global settings,
hooks or remote infrastructure were changed.

## Fresh maxipaxi verification

The installed Coroidinator version is
`99e854c804fffdb5d155c6d916878c57d7f9b440`. Its `validate`, `merge`, `project`,
`list`, `render`, `check` and non-executing `sync` commands all exited 0 with
valid command-specific JSON envelopes and no findings. Check and sync both
reported zero total/current/drifted/missing/non-file targets. Execution was
unnecessary because no outputs are owned.

Resolution now identifies `git.telpher.stream/telpher/zencelades`. The user
generic defaults and repository document remain separate applied layers. The
optional Python defaults, repository template and project-specific user overlay
are absent; none was invented. The source SHA-256 is
`e593283d3ffa821831612afec67370bea096bc5d7edd31a4caa4352c2bfa94db`.
All 27 context paths exist.

The installed preprompts helper's `inspect --root .` exited 0: all eleven
targets exist, none is empty, and no target needs creation. Pack SHA-256:
`8a9e73e03745a5c4c4438bc2b76118b7c17153917f012dc7fb4134dcf83ee983`.
All prompt input paths and referenced CTX IDs resolve. This proves document
coverage and pack validity, not implemented acceptance requirements.

The following checks ran on the current lane, including its preserved pending
build/model work, rather than only the earlier committed parent:

| Command | Result |
| --- | --- |
| `just check` | Exit 0: 55 tests + 13 subtests; Ruff pass, 35 files formatted; grant ledger matches |
| `just cockpit-check` | Exit 0: 20 tests, 298 assertions, no failures; TypeScript/Vite pass; 28 native/GLB model checks |
| `node --test tests/*.test.mjs` | Exit 0: 17 tests, zero failures or skips |
| `just site-build` | Exit 0: 132 original + 84 v4 byte-verified downloads and eight media previews |

The existing approximately 986 kB SceneView chunk warning remains. No website
behavior was edited in this reconciliation, no new browser acceptance was run,
and no deployment was performed. The account-save implementation, its security
and browser tests, and the broader project acceptance work remain open.
