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

## September 30 implementation and evidence

Implemented 20 generated models: eight priced layouts, nine unpriced support
studies and three hardware views. P020 identifies the original Ultimate, so
the standard pre-Gen-3 #3220 drawing supplies its base and low ball setting.
Three original GLBs remain separate, unchanged references. Model surfaces and
unmeasured fitment remain approximate; no OEM CAD or physical validation.

The only new package is matching Babylon serializers as a build dependency.
No runtime rendering library was added. Generated binaries are ignored build
artifacts; source geometry, the source catalogue and verification recipes are
durable. The model manifest supplies independent GLB/native hashes.

On maxipaxi: `bun test` passes six tests, 78 assertions, zero failures.
`bun run verify:models` imports all 20 GLBs, retains every named component and
checks finite bounds and native/GLB SHA-256. `just site-build` exits 0 and
preserves all 132 original and 84 v4 download records. The HTTP verifier
matches all 181 studio files and six legacy routes. The build retains its
983 kB lazy 3D chunk advisory. No pytest ran.

Three preserved research PDFs pass size/hash/page checks: 17,111,525 bytes and
43 pages. The Gen 3 file is 16 pages (corrected during pdfinfo verification),
and remains comparison-only. See `assets/model-research-catalog.json`.

The selective release plan is prepared from the fresh live base, preserving
the concurrent naming/gallery/access work. Browser acceptance is awaiting the
project-only approval question. No cockpit activation or model/research lakeFS
publication is claimed. Domain spelling now follows P023: zencelades.com.

The durable [verification receipt](../../assets/model-verification.json)
records the final build/model manifest and selective release plan. The packet
retains 298 of 300 existing entries byte-for-byte, including 48 naming/gallery
files; only the old root and pricing module change, with the old root also
retained as the catalogue. Activation is pending browser acceptance.

The research upload dry-run now validates nine PDFs / 126,444,705 bytes, exit 0.
The separate model upload plan hashes all 41 generated model/manifest files,
69,058,035 bytes. It still needs a bounded uploader for generated model paths
and the scoped publisher; no storage execution occurred.
