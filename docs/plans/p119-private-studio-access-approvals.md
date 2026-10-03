# P119 — Private studio access and browser approvals

Andrew, October 2, 2026, answered the three pending questions:

> Andrew will unlock this workspace
>
> Andrew approves the private-studio browser check
>
> Andrew will grant this workspace

The exact operations workspace is the clean Telpher `studio-private-ops` lane
on maxipaxi. These replies do not authorize Codex to perform a human grant or
handle passwords/MFA. Verify real consumer readiness after Andrew's action.

Browser scope: visible `studio.zenceladus.com`, its Authentik redirect, the public
site's studio link and denied asset URLs. Codex may follow sign-in and inspect
an already authenticated authorized session. Andrew handles passwords, MFA and
permission prompts. No account changes, generation or purchases through UI.

Fresh evidence after the reply: the project ticket is ready; supported cache
warming exits 0; Authentik API reads and the real domain/route dry run succeed.
The helper still reports missing policy metadata for unrelated optional packing
sources, which is not evidence that these actual Authentik/DNS reads failed.
The visible public audio page still exposes its prompts before the repair.

The initial security review concluded with HOLD on the immutable PR11 head.
Its response and repaired-head evidence are in `docs/private-studio-verification.md`.
