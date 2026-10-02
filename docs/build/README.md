# Zencelades build plans

The primary Love Burn proposal uses an occupied 2.5 m sphere in the common
triangle/ring holder, an aerial-rig configuration and detachable clear-front
lander legs. Two purchased HD146X projectors are the proposal's financial
baseline. The same holder carries the lander and aerial design studies; truck
mounts remain under Alternate designs. No wooden platform is selected.

This is the current entry to the earlier option-by-option planning documents.
It reconciles their scope with the later [budget correction](../budget-reconciliation.md)
and [current brief](../current-brief.md). It does not release a fabricated
occupied installation or turn nominal CAD dimensions into a cut list.

## Primary build: one holder, aerial and lander modes

1. **Andrew identifies the actual equipment.** Record the sphere model, inflated
   dimensions, entry and seam positions, intended stationary occupied use,
   inflation/ventilation instructions, mass and repair information. Identify
   the aerial rig, its usable attachment height and manual; inventory the two
   projector candidates, playback hardware and owned external hazer. Keep
   proposed ownership, loans and in-kind support distinct from confirmed stock.
2. **Builder checks the common holder fit.** Mock up the triangle and padded
   ring against the real sphere, including compliant seating, loss-of-inflation
   support, opening and transfer route. Keep the approach between the side
   legs; the third leg sits behind. Preserve the lower triangle member unless
   a revised structural design provides another load path.
3. **Fabricator and reviewer specify the assembly.** Resolve ring/triangle
   interfaces, material, joints, detachable leg retention, footing, padding,
   contact zones and full payload. For suspension, include the over-sphere
   webbing, collector, swivel, lifting/lowering and recovery system. A donor
   trampoline ring, nominal tube size or lyra swivel description supplies no
   capacity evidence by itself.
4. **AV lead validates two-head projection.** Test the actual lens and curved
   surface before fixing support positions. Preserve the entrance, ventilation
   and rain-cover clearances. Two heads give a deliberate partial wrap; do not
   assume complete coverage. Compare triangle arms with the proposal's priced
   independent stands and record the cost/load difference explicitly.
5. **Andrew reconciles the selected bill of materials.** Use the proposal
   ledger below as the budget baseline, obtain exact quantities and delivered
   quotes, and replace only the lines affected by the chosen mount. Do not add
   every alternative or count both stands and replacement arms automatically.
   Resolve a total over $3,000 before procurement; possible funding is not cash.
6. **Fabricator builds the accepted holder and legs.** Use the reviewed drawing
   and actual material schedule; inspect joints, contact protection and retained
   connections. Mark the entrance orientation and weigh the finished assembly.
   No person is used as an improvised proof load.
7. **Crew assembles and checks lander mode empty.** Fit the selected inflation,
   broad underside support, electrical protection and optics. Check feet,
   approach, cables, thermal behavior, empty optical coverage, stop controls
   and deflation/recovery under the accepted test procedure.
8. **Rigger checks aerial mode separately.** Verify the actual host's permitted
   use, ground restraint, loaded arm envelope, all carried mass, webbing
   contact, lowering and receiving arrangement. Complete its specified empty
   tests and recovery rehearsal. Retain lander mode if aerial requirements
   cannot be met; each mode still needs its own acceptance.
9. **AV lead adds optional cameras and haze only when selected.** Trial the
   participant overlay with informed consent and a clear stop/fallback. Camera
   placement must preserve entry and seating. The owned hazer stays outside,
   behind/below only as its actual manual and venue allow; include consumables
   and power. Do not put haze into occupied inflation air from this plan.
10. **Crew obtains operational and venue acceptance.** Confirm the installed
    footprint, power, supervision, weather limits, participant communication,
    entry/exit and retrieval procedure. Only then proceed to any approved
    occupied rehearsal. Follow the packing, operation and strike checklist.

## Budget baseline and selection boundaries

| Proposal layer | Low | High |
| --- | ---: | ---: |
| Two purchased HD146X heads, included in subtotal | $998 | $1,198 |
| All proposal lines, subtotal | $1,982 | $4,368 |
| 20% contingency | $396.40 | $873.60 |
| **Total** | **$2,378.40** | **$5,241.60** |

These are the recorded proposal estimates in
[the machine-readable ledger](../../assets/grant-resource-ledger.json), not
new quotes. Against the $3,000 total target, the low estimate leaves $621.60
of headroom and the high estimate exceeds it by $2,241.60. Tax, shipping,
actual owned/loaned equipment and unpriced changes still require reconciliation. The earlier
$2,400 LED allocation plus $600 reserve is an alternate design, not this
proposal's budget. The old rental package is also an alternate.

The financial proposal includes independent projector stands. Andrew's
triangle-arm direction changes that support arrangement; its brackets, arm
material, covers, stays and balance review need an explicit revised quote.
Changing a model's parts selection currently does not automatically reprice
the fixed proposal ledger. Do not describe an experimental model as an
item-for-item costed or approved assembly.

## Detailed option and module workflows

The following sources preserve the P059 step sequences and their original
geometry. Their historical labels matter: compare current model metadata and
the selected real hardware before applying a dimension or depicted head count.

| Choice | Detailed source | Relationship to primary proposal |
| --- | --- | --- |
| 2.5 m aerial | [S25](s25-suspended.md) | Primary support study; same holder as G25 |
| 2.5 m lander | [G25](g25-lander.md) | Detachable ground mode; preserve the open front |
| 3 m lander or aerial | [G30](g30-lander.md), [S30](s30-suspended.md) | Larger alternates; do not reuse smaller-study clearances |
| Open scenic surround | [O30](o30-open-surround.md) | Changes the experience; not an occupied inflatable |
| Optics, cameras, external haze | [Module steps](optics-camera-hazer.md) | Two heads are the primary purchase basis; other counts are alternatives |
| Steel, salvage, donor ring, host alternatives | [Materials and hosts](materials-and-hosts.md) | Select one accepted route; no automatic free-material credit |
| Packing through strike | [Field operations](field-operations.md) | Applies to the accepted installed revision |
| Inventory status and quote workflow | [Budget and inventory](budget-and-inventory.md), [Pacinman](pacinman.md) | Preserve unknown costs and actual custody; historical import evidence |

The [public parts catalog](../../assets/build-parts.json) and
[task catalog](../../assets/build-tasks.json) carry stable planning keys.
Private Pacinman IDs and unrelated Burning Man workspace content do not belong
in this public pack. Live authenticated inventory editing remains unfinished;
see [integration readiness](../integration-readiness.md).

## Print or export this plan

`just build-plans` generates the local planning PDF, parts CSV and reviewed
Pacinman import packet under `output/pdf/`. It does not upload, import, order
equipment or replace an archival grant attachment. The
[source and artifact verification](../build-packet-verification.md) records
what was preserved and checked. The [P059 overview](p059-overview.md) retains
the earlier planning context.
