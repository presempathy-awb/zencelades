# P019 — Truck, hitch and complete option models

Captured September 30, 2026, from Andrew in this chat:

> get all the options in as 3d models. make a super accurate version of the
> RAM 2021 MODEL YEAR
> RAM 2500 LARAMIE MEGA CAB 4X4
> truck hitch
> anderson 5th wheel hitch
> see if any other libraries etc we need.

Status: in progress. Actor: Codex. Continues P016/P017/P018.

1. Enumerate eight pricing options plus truck, aerial-rig and tree research
   configurations. Map each to a selectable model and its budget relationship.
2. Research manufacturer drawings for the 2021 Mega Cab and Andersen hitch.
   Record units, datum, source, model year and uncertainty per dimension. Ask
   Andrew which Andersen model/generation and receiver are actually installed.
3. Implement the truck, receiver, provisional Andersen and support models in
   the existing Babylon cockpit, with useful views and clear accuracy limits.
   Preserve original source GLBs. Do not imply a rigging or upfit approval.
4. Assess existing libraries first; add none without a concrete need and
   applicable approval. Exercise geometry and state behavior, build and inspect
   output. Pytest remains paused. Browser control awaits the pending P017 scope.
5. Update model/source documentation and evidence. Replan publication against
   the current live release before any bounded overlay; preserve naming/access
   owners. Do not overwrite the live release with the mixed local tree.

Acceptance: every documented concept can be selected; manufacturer dimensions
drive the truck layout, unknown fitment remains explicit; source and unit
provenance are inspectable; no unlicensed third-party meshes are distributed;
budget selection cannot silently change when viewing unpriced research models.
An accurate manufactured surface/CAD model requires appropriate reference data,
and exact installed hardware requires Andrew's identification or measurements.

Evidence will be recorded in docs/truck-and-option-models.md and this plan.
