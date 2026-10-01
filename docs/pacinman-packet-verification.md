# Reproducible Pacinman inventory packet

`just pacinman-packet` exports the public parts/task catalogs to
`output/build-plans/pacinman-import.json` and `Zencelades-Parts.csv`.
It requires only Python's standard library and never calls Pacinman, orders
equipment, enriches product URLs or changes the shared workspace.
Inventory generation can run independently of the PDF rendering toolchain.

The generated arguments now include explicit sourcing state: Already owned for
Andrew-confirmed equipment, Unspecified for unselected procurement, and Not a
purchase for build tasks. This preserves the correction previously made in the
live importer instead of depending on a cache-only script to add the missing
field. Ownership comes from the ownership evidence, not from whether a price
has been recorded. Denhac access does not imply owned equipment.

The catalog's incremental purchase amount is a line amount; Pacinman's shopping
totals multiply estimatedPrice by quantity. A known line amount is therefore
divided by the catalog quantity in the import payload and retained in its notes.
Unquoted amounts remain a zero placeholder required by the target schema, with
COST UNKNOWN in the notes and a cost-unquoted tag. That placeholder is not a
claim that procurement is free. Confirmed owned equipment retains its separate
owned-confirmed tag. No actual vendor prices were added by this change.

Stable part/task keys and prerequisite keys remain unchanged; remote item IDs
must still be obtained by the scoped importer. The packet contains no private
Pacinman IDs or credentials. Existing live rows must be compared by stable key
and version before a future synchronization; regeneration is not authorization
to overwrite their later edits.

## Verification

The initial extraction reproduced the previous CSV and JSON byte-for-byte.
Two behavioral tests then failed for the intended reasons: missing sourcing
fields and a synthetic $125 two-piece line discarded as zero. After the fix,
the same tests passed, including $62.50 per unit without an ownership claim,
owned/unselected/task sourcing, retained prerequisites and blank product URLs.

The command generated 88 part/resource records and 24 task records. These are
alternatives across configurations, not one shopping list. Current source
costs remain unquoted except the two confirmed owned acquisition amounts.
No live import, supplier quote refresh or website-account persistence is claimed.

`just check` exited 0 after the fix: 57 Python tests, 13 subtests, Ruff checks,
formatting and resource-ledger validation passed. The canonical build-plan link
on zenceladus.com returned HTTPS 200. The two new tests exercise generated payload
behavior, not string matching against the implementation. The current generated
packet retains every catalog key and task prerequisite.
