# Configuration-specific parts plan — October 1, 2026

The studio's Parts view uses the existing 88-record public catalog. It selects
one build configuration, zero to three projector heads, zero to two cameras,
holder arms or independent stands, and one candidate per ring/host/projector
alternative group. Optional node, generator and surround-seat records are
included only when selected and applicable. Haze follows the existing scenario
choice and includes unquoted fluid/protection alongside the owned machine.

Shared part IDs appear once. Nominal head and arm counts follow the selected
optical package; hardware kits keep their catalog quantity basis. A camera count
is a procurement study, not a capture implementation or approved mounting point.
Suspended configurations retain the catalog's ground receiving/lander resources.
The open surround uses independent projector stands, not nonexistent holder arms.

An unselected alternative is an explicit decision gap rather than a zero-cost
line. Unknown costs remain null, and a complete acquisition total stays null if
any selected record is unquoted or an applicable alternative is unselected.
Known acquisition amounts are a partial subtotal only; operating costs, loans,
tax, freight and contingency still need reconciliation against the $3,000 target.
No source prices or purchases were invented.

Known occupied model choices update the parts configuration and depicted
projector/camera counts; unrelated historical studies preserve it. A changed
parts plan does not resize or regenerate the model. Both this distinction and
temporary-save behavior are explained through keyboard/touch-accessible details.
The existing scenario export/import retains the parts plan, validates incoming
choices and preserves a baseline for earlier exports with no parts field.
The view has no direct Pacinman write or private record access.

## Fresh checks on maxipaxi

Before implementation, the new parts module was absent. The integration tests
then reproduced missing model-derived parts and discarded imported parts: two
failures with nine existing tests passing. After implementation, the complete
Bun suite passed **29 tests, 365 assertions, zero failures**. It covers size and
module exclusion, alternatives, per-head quantities, ownership versus quote gaps,
conditional extras, immutable model selection and rejected/round-tripped imports.

TypeScript and formatter checks exited 0. `just check` exited 0 with **55 Python
tests and 13 subtests**, Ruff/formatting pass and a matching resource ledger.
`node --test tests/*.test.mjs` exited 0 with **17 tests, no failures or skips**.
`just site-build` exited 0, including TypeScript/Vite, **28 native/GLB models**,
132 original + 84 v4 byte-verified downloads and eight media previews. The
approximately 986 kB SceneView chunk warning remains.

A React server-render smoke produced nonempty markup with the selected parts
heading, nine labels and 51 unquoted entries for the default plan. The documented
dev server started on loopback; root and Parts module returned HTTP 200. These
checks do not establish browser interaction or layout acceptance. The new-view
browser permission is pending; rendered-browser Impeccable is consequently not
run. No guest reload, control interaction or import/export browser pass is claimed.

The broad listener diagnostic stalled in macOS uninterruptible I/O and was
cancelled; the preview URL came from Vite's actual startup log instead. This did
not affect build or test results. Login and authenticated saving remain unfinished.
