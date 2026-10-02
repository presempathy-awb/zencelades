> Preserved P059 planning source. Start with the [current build plan](README.md)
> for the selected Love Burn proposal. Dimensions, depicted equipment, LED
> allocations and delivery status below describe that earlier study; they are
> not current fabrication specifications or fresh supplier quotes.

# Zencelades — option plans and parts control

P058/P059, October 1, 2026. Build-planning pack; structural details are not
released for fabrication. Start with the ground configuration and carry the
same holder into a suspended version only after the additional gates pass.

## Choose one configuration, then its modules

Projector count is a separate choice: P1 (one head), P2 (two) or P3 (three).
One/two-head versions may use short-throw heads and are deliberate final
partial-view designs. See the [workbook intake and costs](../projector-workbook-options.md).

| ID | Configuration | Step-by-step plan | Selection rule |
|---|---|---|---|
| G25 | 2.5 m sphere, triangle and lander legs | [G25](g25-lander.md) | One sphere and one common holder |
| G30 | 3 m sphere, triangle and lander legs | [G30](g30-lander.md) | Alternative to G25; never buy both by default |
| S25 | 2.5 m sphere, same holder on aerial rig | [S25](s25-suspended.md) | Reuses G25 holder; legs retained for ground handling |
| S30 | 3 m sphere, same holder on aerial rig | [S30](s30-suspended.md) | Reuses G30 holder; greater height/fit demand |
| O30 | Open-entry scenic sphere surround | [O30](o30-open-surround.md) | Separate ground alternative; no inflatable or suspension |

Choose one visual module: L0 LEDs, P1 one projector, P2 two projectors,
P3 three short-throw heads, or P4 four-head coverage study. Choose zero or
one live-camera module (C1 one camera or C2 two cameras) and optional H external
hazer. These modules apply to either sphere size and support mode; the module
plan lists the additional checks for each. [Module plans](optics-camera-hazer.md).
P3 is the configuration shown by the current four detailed models; it is not
the funded $3,000 baseline. O30 requires a fresh optical fit trial.

The alternative holder material routes are new/identified steel, known remnants,
or a measured donor ring. [Material and host alternatives](materials-and-hosts.md).
Truck, wood platform and water are deferred. Tree, lighting stands and an
unidentified gantry are not interchangeable approved hosts.

## Clear front is a design requirement

The front is the entrance side, Blender -Y. Two legs flank an open front bay;
the third leg is at the rear. The shell opening faces that bay. Projector arms
follow the side/rear corners and the hazer is moved to the rear. Keep braces,
ballast, cases and cables out of the approach. The model checks a 1 m central
planning strip for selected hardware; this is not a code-compliant accessible
route or complete entry-system approval. The lower front triangle member
still exists beneath the sphere: entry height, transfer, support and rescue
must be resolved using the selected sphere. Do not remove a member for access
without a revised structural design.

## Work order and release gates

1. **Inventory and measure:** Andrew identifies actual sphere, host, hazer,
   available electronics and tools; record photos, manuals, condition, mass,
   serial/model and custody in Pacinman. Missing records remain unconfirmed.
2. **Select and mock up:** choose G25/G30 or O30, tape the complete footprint,
   check entry and seated space, test material optics without an occupant.
3. **Resolve design:** fabricator and competent engineer/rigger define material,
   joints, broad deflation support, stability, contact protection and the
   operation/retrieval envelope. An ordinary ring is not a floor if air is lost.
4. **Quote and commit:** issue a drawing-specific cut list only after step 3;
   reconcile delivered/taxed costs with $3,000 total, including reserve.
5. **Fabricate and inspect:** work from the accepted revision; log material and
   joint inspections, fit and actual completed mass. No load rating is inferred
   from the 3D member widths or a donor's former use.
6. **Integrate and test:** complete the applicable option/module steps, then
   carry out the reviewer-defined unoccupied tests and recovery rehearsal.
   Occupied rehearsal follows only the relevant approvals; do not use a person
   as an improvised proof load.
7. **Pack, install and operate:** follow the [field plan](field-operations.md),
   obtain venue acceptance, keep the entrance clear and record daily inspections.
8. **Strike and reconcile:** remove all material, inspect and dry equipment,
   return loans and close Pacinman inventory/tasks with receipts.

## Cost and evidence reconciliation

The current working cap is **$3,000 TOTAL**, not $3,000 grant plus unlimited
artist money. The ground LED planning allocation is $2,400 plus $600 reserve.
Its $1,200 sphere/blower and $350 holder/legs are ceilings, not supplier quotes.
See [budget control](budget-and-inventory.md). Adding projection or suspension
requires actual committed savings or a revised scope within that cap.

Earlier `grant-resource-ledger.md` describes purchased projectors on stands,
some equipment as owned, a range above $3,000, a rope bridle and a claim that
engineering is unnecessary. Those statements are not authority for this pack.
The latest brief uses arms on the triangle and over-sphere webbing; competent
review remains necessary. Confirm alleged owned rig/laptop/router against real
inventory. Only the hazer and pipe bender are directly confirmed owned in this
chat; Denhac access is confirmed but tools/time/material are not reserved.

## Inventory artifacts

- [Parts catalog](../../assets/build-parts.json): unique IDs, variant/module
  applicability, quantities or design gaps, acquisition status and provenance.
- Generated `Zencelades-Parts.csv`: one line per distinct part/resource.
- Generated `pacinman-import.json`: payloads for actual `pacinman_add_item` tools;
  remote item IDs and dependency links are assigned only after a real import.
- [Pacinman workflow](pacinman.md): workspace scope, deduplication and readback.

## Sources used

The measured geometry comes from the P059 Blender model and exported GLB
readback, not manufacturer certification. Andrew's prompts P025–P059 govern
scope. `assets/seed-options.json` supplies the allocation ceilings.

The [McLaren suspended-sphere account](https://www.mgmclaren.com/blog/eventi-verticalis-suspended-sphere-performance/)
documents full structural/rigging evaluation of an occupied aerial sphere;
it supplies precedent, not construction details for this holder.
[SpanSet's manual](https://www.spanset.com/uploads/default/PIMTree/manualbook-lifting-id-ena3.pdf)
informs inspection/contact/load-distribution questions; it does not approve
performer suspension. The [X-POLE height chart](https://xpole.com/wp-content/uploads/2025/06/A-Frame-Footfall-August-2024.pdf)
demonstrates why actual usable attachment height matters. These three primary
sources were reopened October 1. Denhac's equipment page failed the live fetch;
access remains Andrew-confirmed and equipment availability unverified.
