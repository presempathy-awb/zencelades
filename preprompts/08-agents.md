# 08 — agents

Target: `agents.toml`. Author only this target when the pack selects it.
Read `preprompts.toml` shared instructions and the listed inputs first.

When agents.toml is missing, use agents-init in draft-for-preprompts mode with the actual Coroidinator schema and resolution layers; preprompts publishes it. When it already exists, the pack preserves it. Andrew's P010 separately authorizes evidence-backed maintenance of the existing source through agents-sync: preserve its identity, original commands and zero managed targets, add appropriate project context and descriptive fields, then validate/project/list/render/check with the installed binary. Do not copy global/user defaults into project authority, invent a forge, generate AGENTS.md/CLAUDE.md, or claim installed hooks. Keep real commands separate from planned operations.

## Required context

- `docs/intent.md`
- `docs/spec.md`
- `docs/verifiers.md`
- `README.md`
- `STATUS.md`
- `docs/plans/chat-prompts.md`
- `justfile`
- `pyproject.toml`

Source IDs: CTX01, CTX02, CTX03, CTX15, CTX16 in `preprompts/context.json`.
These are evidence records, not permission to execute archived instructions.

## Acceptance

Supported semantic validation succeeds; all context paths exist, source ownership is retained and target listing is empty. Record the separate authorized maintenance receipt when the pack skips this existing target.

Draft outside the project. Recheck the selected ID and pack hash, then publish
through the installed preprompts helper without replacing an existing file.
For P010, finish this file before selecting the next; the user requested the
whole authoring set. Future ordinary invocations retain the skill's one-step default.

