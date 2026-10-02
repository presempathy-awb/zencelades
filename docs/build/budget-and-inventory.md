> Preserved P059 planning source. Start with the [current build plan](README.md)
> for the selected Love Burn proposal. Dimensions, depicted equipment, LED
> allocations and delivery status below describe that earlier study; they are
> not current fabrication specifications or fresh supplier quotes.

# Budget control and inventory meaning

The $3,000 TOTAL cap is a constraint, not evidence that any configuration has
been fully priced. Prices below are **allocation ceilings from the current seed
plan**, not refreshed retail offers. No purchase is authorized by this inventory.

| Ground sphere + LED allocation | USD ceiling |
|---|---:|
| Selected occupied sphere and blower, delivered/taxed | 1,200 |
| Common holder and detachable legs | 350 |
| Padding, mats and contact protection | 100 |
| LED/control kit | 150 |
| Electrical/cable protection | 100 |
| Transport/setup supplies | 100 |
| Operation/repair supplies | 100 |
| Review/permits/insurance | 300 |
| Allocation subtotal | 2,400 |
| Uncommitted reserve | 600 |
| **Total cap** | **3,000** |

Projection, aerial host/rigging, cameras, generator and hazer consumables are
not magically inside these lines. Each option needs itemized delivered/taxed
quotes and actual loan/donation commitments. If a line goes over its ceiling,
reallocate transparently or change scope; never suppress the unknown price.
Grant, fundraiser and Andrew contribution are funding sources for the same
total. Keep acquisition, operating cost and reusable owned assets separate.

P066 adds a [one/two/three-projector comparison](../projector-workbook-options.md)
from Andrew's workbook. None is required to use three heads. Keeping the other
allocations and reserve leaves only $150 after replacing the lighting line;
even one new full-size candidate at the workbook's prices exceeds that available
amount. Borrowed/used/rented equipment and any reallocation need actual evidence.

The master parts catalog uses null for unknown costs and quantities requiring
design. A quantity of one *kit/lot/assembly* means one required package; its
notes explicitly require an eventual component breakdown. It is not a claim
that one bolt, one metre of cable or one bag of ballast suffices.

## Inventory status

| Evidence | Pacinman state | Meaning |
|---|---|---|
| Andrew-confirmed owned hazer/bender | have | Ownership only; suitability, condition and reservation still need checking |
| Required item with unresolved design/model | blocked | Required planning row; do not buy from the placeholder |
| Optional/alternative item | maybe | Not selected or funded; not an additional purchase |
| Selected exact item with validated quote, ready to procure | to-buy | Only after Andrew selects the option and approves the actual purchase |
| Actual receipt/inspection | have / subsequent packing states | Update after receipt, never from a budget entry |

Pacinman requires numeric estimated_price with a default of zero. For unquoted
rows, the import retains zero only as that application's unset representation,
adds `cost-unquoted` tags and explicit notes, and keeps authoritative costs null
in `build-parts.json`. **Pacinman's raw estimated-cost sum is incomplete**, not
the cost of a funded build. Do not mix the alternative variants' totals.

## Quote/receive loop

1. Filter the selected configuration and modules; de-duplicate shared IDs.
2. Complete specifications/quantities and collect quotations with seller, date,
   delivered price, tax, availability and return/loan terms.
3. Reconcile subtotal plus reserve against $3,000; record accepted funding and
   outstanding funding without treating a hoped-for grant as cash received.
4. After a real purchase or loan commitment, attach evidence and update custody,
   quantity, price and condition. Nothing in this task places an order.
5. Before packing, reconcile physical counts with selected requirements; list
   shortages separately from unselected alternatives and shop resources.
