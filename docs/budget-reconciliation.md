# Love Burn proposal budget reconciliation

Andrew's October 1 direction makes Claude's application design the primary
website/studio option. The source is `assets/grant-build-bom.json`, through
`assets/grant-resource-ledger.json`; the BOM matched the grant-resource-ledger
lane byte-for-byte when inspected. No supplier prices were refreshed in this fix.

The base design is a 2.5 m occupied sphere in the common triangle/ring holder,
under the aerial rig assumed by the proposal, with lander legs for ground mode.
Two purchased HD146X projectors use independent stands. Two phones provide the
proposed capture inputs; the existing laptop performs compositing, with an
optional inexpensive output computer. The owned hazer stays outside.

| Budget layer | Low | High |
|---|---:|---:|
| 16 proposal line totals | $1,982.00 | $4,368.00 |
| 20% contingency | $396.40 | $873.60 |
| Total | $2,378.40 | $5,241.60 |

The projector line is **two purchases totaling $998–$1,198**. The old rental
study charged $495/day for six days per head: $5,940 for two heads, before any
other costs. That is a different scope, now collapsed under Alternate designs.
The former $2,400 LED-only allocation plus $600 reserve is also an alternate,
not the main projection proposal. Neither rental nor the separate external
capture package is added to the purchase budget.

$3,000 remains the total cash target. The low estimate fits with $621.60 of
headroom; the high estimate exceeds it by $2,241.60. Neither proposed grant
money nor an optional owner contribution becomes confirmed cash automatically.
Existing sphere/rig/laptop/network and in-kind labor are proposal assumptions;
replacement purchases and missing commitments require explicit quotes.

The source ledger includes old notes, including an unoccupied-load rigging
allowance and dated product/optical claims. These are provenance, not verification
of an occupied installation. No hardware selection, working load or operating
approval is established by displaying its allowance. The base model is a
concept witness; arm-mounted and short-throw variants need separate pricing.

The website and studio read the same ledger. Static table rows and totals are
generated; the interactive scenario permits temporary edits and export. Existing
exports acquire the new option without overwriting saved alternative selections.
Changing an experimental Parts/model configuration does not automatically reprice
the fixed proposal; the budget explicitly discloses that boundary.

## Verification

Fresh on maxipaxi: `just check` passed 58 Python tests and 13 subtests, Ruff
checks/format (37 files) and ledger reconciliation. `bun test --cwd cockpit`
passed 36 tests and 495 assertions; `node --test tests/*.test.mjs` passed 17.
`just site-build` exited 0, including TypeScript, generated model verification
and Vite; existing large-chunk warnings remain.

Regression coverage reproduces the wrong default/purchase handling and missing
proposal model before the fixes. Static budget rendering was red before adding
the renderer. Existing rental arithmetic is tested explicitly at its historical
25% contingency; the main proposal uses 20%.

Approved local browser check: the main option starts selected, Alternate designs
starts collapsed, changing the projector low total from $998 to $1,000 changes
the displayed low total from $2,378 to $2,381; selecting Ground cradle shows its
separate rental basis; returning and reloading restores the proposal defaults.
The 3D view visibly renders its 2.5 m sphere, aerial frame and two stand heads.
Published in release `6a28f515caca82d8834e9b4e4eba7c1f1b4d3130cbc1c82f15a1128110417eec`;
the homepage-render update then produced
`0c450899db662c84efb40f9120292d6a930127dda75cf4fe9376a59d4aab8039`.
An October 1 repeat readback confirms that latter release remains active,
its 907-entry manifest matches its release digest, and all 72 checked public
files match their manifest sizes and SHA-256 hashes. The checked set includes
the corrected pricing/studio, homepage renders, gallery and Showtime. The
`thatsnozorb.service` unit is active. These are delivery checks, not an
authenticated-save or physical-installation acceptance result.
