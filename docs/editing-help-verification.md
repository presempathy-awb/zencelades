# Temporary draft help — October 1, 2026

The studio uses its installed Radix Tooltip primitive for import, export,
inspector, note application and model-view controls. Keyboard focus opens help;
Escape dismisses it. Tooltips render in a portal so the model viewport cannot
clip them. The existing expandable Temporary draft explanation remains available
to pointer, keyboard and touch users without requiring a hover interaction.

The note action now says **Apply note**. It includes the note in the in-memory
scenario and subsequent export; it does not imply account persistence. The note
field has a persistent accessible description explaining application, export and
reload. The export status explicitly distinguishes a downloaded draft from an
account save and warns that unapplied note text is not in the file.

## Verification on maxipaxi

- `bun test`: 29 passed, zero failures, 367 assertions.
- `bun run build`: exit 0, TypeScript, 28 native/GLB model checks and Vite pass.
- `just check`: exit 0, 55 Python tests and 13 subtests, Ruff and ledger pass.
- `node --test tests/*.test.mjs`: 17 passed, zero failures or skips.
- `just site-build`: exit 0. No new package or lockfile change.

The visible in-app browser exercised the approved local cockpit at port 5174.
Tab focused Rear and opened its explanation; the control's aria-describedby
referenced the tooltip. Escape removed it. The Rear action remained clickable.
A synthetic note enabled Apply note; applying it disabled the action and showed
temporary-draft status. Export displayed the explicit no-account-save message.
Reload reset the note to empty and restored the initial draft status.
This verifies those interactions, not authenticated saving or the new Parts view.

The tooltip measured 14 px, white on rgb(21,43,60), wholly inside the 1422 by 800
viewport. The screenshot and rendered DOM are retained in the task's edit-help
cache. Impeccable ran on that rendered DOM (exit 2, advisory findings): existing
small labels/body text, font/eyebrow styling, root foreground/background contrast
and a clipped positioned child in the workspace. The tooltip itself is outside
that clipping container. These broader design findings remain follow-up work;
the page is not represented as a complete accessibility audit.

Vite still warns about large SceneView and entry chunks. Login remains incomplete:
the fresh read-only Telpher grant status reports a stale manifest binding and a
locked project. Human grant renewal and the pending dependency decision are not
replaced by this UI change. No account-save endpoint was added or exposed.
