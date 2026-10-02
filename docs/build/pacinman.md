> Preserved P059 planning source. Start with the [current build plan](README.md)
> for the selected Love Burn proposal. Dimensions, depicted equipment, LED
> allocations and delivery status below describe that earlier study; they are
> not current fabrication specifications or fresh supplier quotes.

# Pacinman inventory and task workflow

## Completed import — October 1, 2026

The approved Zencelades / Love Burn 2027 category now contains **88 part/resource
records and 24 build-task records**. Codex retained the earlier ZC-S25 row,
created the remaining 111 records and read back all 112. Task prerequisites use
the real returned item IDs. A second paginated search verified exactly 112 unique
IDs matching the import receipt, all in the requested category and group.
Workspace revision was 137 and the overall visible count was 428 at readback.

The failed importer expected `mutation.itemId`; the SDK actually returns
`mutation.item.id`. That mismatch is corrected in the scoped importer. The
previous row's inherited Amazon retailer was corrected with an expected-version
check; new records explicitly use Unspecified, Already owned, or Not a purchase.
Other existing inventory was preserved.

Every unset price remains explicitly marked unquoted, not free. The records
cover alternatives and must not be summed as one shopping list. Importing a task
does not mark it complete or approve engineering, purchases or occupied testing.
No source enrichment, cart, order, schedule or notification was requested.

The detailed receipt is private at
`~/.local/state/codex/zencelades/pacinman-import-receipt.json`; public project
documentation does not publish private item IDs or unrelated workspace content.
The website's authenticated live inventory connection, selected-option budget
aggregation and vendor quote reconciliation remain unfinished.

## Initial inspection

The real deployed producer-scoped MCP connector was read October 1, 2026.
It exposes `pacinman_get_workspace`, `pacinman_search_items`,
`pacinman_add_item`, `pacinman_update_item` and related inventory tools.
Its current shared workspace is `burning-man-2026`, named **Burning Man 2026**.
The initial read returned 316 visible items and revision 24. Searches found
no Zencelades/Enceladus, sphere, projector, aerial rig, bender, laptop or UniFi
records. One old hazer entry exists with status `maybe`; it was not overwritten
or treated as the confirmed owned unit.

Andrew explicitly selected a clearly labeled Zencelades category inside that
shared workspace. All new rows identify Love Burn 2027 in their notes/tags;
the existing workspace is not renamed or repurposed.

## Supported import sequence

Regenerate the reviewed packet with `just pacinman-packet`. The durable generator
now sets sourcing explicitly, preserves ownership independently from recorded
price, and maps line acquisition amounts to Pacinman's per-unit price field.
See [packet verification](../pacinman-packet-verification.md). Regeneration does
not reimport records or overwrite the existing workspace.

1. Read the live workspace and tool definitions. Match the chosen workspace;
   stop if the connector's scope differs. Never reuse arbitrary browser cookies.
2. Search `Zencelades` and each stable part key `[ZC-...]`. If a prior row exists,
   compare it; never create a duplicate or overwrite other edits blindly.
3. Add one group-scoped item per part/resource through `pacinman_add_item`.
   Titles contain the stable key; category is `Zencelades / <module>` and notes
   preserve quantity basis, alternatives, ownership evidence and price gaps.
4. Keep source URL blank for unselected items, avoiding automatic enrichment
   of a guess. Exact source/manual links belong in notes until a real SKU is chosen.
5. Add sequenced task records with `task_enabled=true`; map stable task keys to
   the actual returned item IDs. Add prerequisite IDs only after they exist.
6. Read back every created item and compare names, quantities, status, scope,
   notes and task dependency IDs. Store a receipt without credentials/private
   unrelated inventory. Stop on conflicts and leave existing rows preserved.

Alternatives are tagged, not all marked essential. Only one sphere and one
visual package is selected at a time. Pacinman's raw sum includes alternative
and unset-price rows, so the variant-aware BOM and budget control remain the
authoritative planning view. No retailer cart, order, schedule or notification
is created by this import.

The connector reads its own protected runtime through its documented launcher;
Codex does not export tokens. Pacinman and its inventory stay private even
though the art project's generic plans and models are public.
