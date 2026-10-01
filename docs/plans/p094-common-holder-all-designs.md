# P094 — One holder across lander, aerial and optional truck

Andrew: “do common triangle, ring in all designs now” and “lander, aerial rig,
and truck but hide truck by default”.

All three current support modes reuse the same triangle, six-foot padded ring,
occupied sphere and clear-front entry. Only the external host changes. Keep the
existing Love Burn purchase budget primary; support experiments do not claim
that a truck host or projector-arm upgrade is priced in the grant ledger.

Acceptance: visible lander and aerial controls, truck absent until explicitly
enabled; disabling truck returns to aerial; fresh loads hide truck; shared
geometry matches across hosts and supports both sphere sizes and selected head
counts; optional truck GLB contains the common holder and actual selected count.
Preserve archived legacy truck research without promoting it to the main design.

Publish and verify after restoring the homepage renders. The truck attachment,
stabilization and occupied load path remain an unpriced concept, not fabrication
or operating approval. Broader login/inventory/backlog work stays active.

## Local verification and remaining publication

The three modes share identical triangle and ring geometry in the behavioral
test, across 2.5 m / 3 m studies and 0–3 heads. Default selection excludes truck;
the optional toggle exposes it without replacing the Love Burn budget.

Fresh October 1 checks: 36 Bun tests / 598 assertions, 58 Python tests plus 13
subtests, 17 Node tests; Ruff, ledger checks, TypeScript and Vite build pass.
All 31 native/GLB model exports pass geometry/import/hash verification.

The earlier local browser check reproduced a narrow-screen defect: wrapping
controls consumed most of the fixed 520 px scene height. The mobile scene now
reserves a minimum canvas row and allows the control rows to grow below it.
Fresh browser verification is pending: the browser tool rejected binding the
existing local preview tab under its URL policy. No workaround was attempted.
The main-site layout decision (P095) also remains pending. These new controls
and this responsive fix are not yet deployed.
