# Verification contracts

Codex, September 30, 2026. VER numbers match [REQ numbers](spec.md).
These are behavioral acceptance procedures, not a claim that tests ran.
Andrew paused pytest. Browser control and owner/provider work retain their
separate authority gates. No new test framework or fake API is required.

## Recording results

Use **fresh pass/fail** only for an executed procedure with date, host, exact
revision/config, command/action, exit/result, observations and limitations.
**Historical** identifies an earlier receipt and its source. **Not run**
means absent evidence; **blocked** additionally names the missing prerequisite.
A partial pass never closes a broader contract.

Record redacted evidence in the indicated document or its linked receipt,
including expected/actual body, version and hash when relevant. Never record
credentials. Destructive/denial fixtures belong in disposable scope, not the
production main branch or another person's records. A control proves something
only if it would fail under the relevant broken behavior.

## VER-01 — Original integrity and archive boundaries

**Fixture/prerequisite:** seven retained originals, extracted occurrence inventory
and original ZIP; disposable malformed/traversal/conflicting archives for future
ingestion behavior checks. Owner B2 read authority is separate.
**Procedure/pass:** compare all 132 occurrences by path, length and SHA-256;
validate the release's 124 checksums as its own subset. Restore the recorded B2
version and compare every byte. **Negative:** escaping entries, excessive
expansion or an existing different file are refused without changing originals.
**Side effects/recovery:** local reads only for current validation; negative
fixtures confined to scratch. B2 read incurs ordinary provider reads; never
delete archive versions.
**Status/evidence:** historical positive inventory and B2 readback in
[asset review](asset-understanding.md), [verification](verification.md) and
[B2 record](b2-archives.md). Negative controls not rerun in P010.
**Limit:** parsing a PDF or ZIP is not close reading or a restore proof.

## VER-02 — Research batch and interruption recovery

**Fixture/prerequisite:** four exact objects in
[research plan](../assets/research-upload-plan.json), original hashes, separate
batch uploader and deployed scoped publisher. Owner delivery/PR choice pending.
**Procedure/pass:** recheck local bytes, stage exact batch on a fresh branch,
record returned commit before readback, compare exact committed set and every
length/hash. Retain separate staging and verified receipts.
**Negative:** interrupt after commit/before final readback in a controlled batch;
resume by the saved commit without losing it, duplicating the original import
receipt or announcing success. A missing/corrupt object prevents verified state.
**Side effects/recovery:** authorized remote writes and retained branch/commit;
reconcile partial results, never erase local sources to “retry.”
**Status/evidence:** local positive evidence historical in
[storage handoff](research-storage.md); remote blocked. Future receipt target
`assets/research-upload-receipt.json` is deliberately absent today.
**Limit:** the old importer handles 132 original objects, not this batch.

## VER-03 — Served-set and active-content isolation

**Fixture/prerequisite:** approved audience/selection, exact build manifest,
private-source sentinel and archived active HTML/SVG plus normal binary/video.
Use scratch fixture content; authorized deployment required for live changes.
**Procedure/pass:** compare candidate/deployed served set; download expected
objects and compare hashes/lengths, attachment/nosniff behavior and video ranges.
**Negative:** direct and encoded traversal/private paths fail without leakage;
active archive opens as a download rather than same-origin executable content;
missing upstream object does not become empty 200.
**Side effects/recovery:** build writes local output; live probes read.
Browser execution proof needs the scoped control approval. Reject a leaking
candidate before activation, retain previous release.
**Status/evidence:** historical HTTP positives in [verification](verification.md);
full candidate/browser controls not rerun here.
**Limit:** HTTP headers alone do not prove the complete browser behavior.

## VER-04 — Publisher and broker confinement

**Fixture/prerequisite:** reviewed owner policy, scoped hid-in principal, existing
repository/main protection, controlled ingest branch, explicit allowed and
disallowed object paths. Never acquire another project's credential.
**Procedure/pass:** permitted read/write in the declared imports scope, immutable
readback and expected protected-main state.
**Negative:** unrelated repository, wrong prefix, admin operation and direct
protected-main write are refused. A controlled redirect cannot receive the
Bearer token or cause an authenticated follow-up. Inspect redacted output for
accidental credential exposure.
**Side effects/recovery:** authorized bounded object writes; denied operations
must have no effect. Preserve branches and existing principals; roll back only
the reviewed broker change through its owner.
**Status/evidence:** candidate policy/patch validation historical in
[storage handoff](research-storage.md); deployed principal/control proof blocked.
**Limit:** role permits branch/commit operations; locally “UNPROVISIONED” is not
a live outage, and successful policy parsing is not confinement proof.

## VER-05 — Hostname, tailnet and restricted login

**Fixture/prerequisite:** actual hostname/TLS, enumerated tailnet IPv4/IPv6
clients, public path and allowed/refused Authentik users. Browser consent pending.
**Procedure/pass:** normal HTTPS hostname without custom port; expected content
over exercised tailnet paths; successful authorized public login returns content.
**Negative:** public requests with spoofed forwarding/identity headers still
require login; refused member cannot reach the protected content.
**Side effects/recovery:** read probes and browser session state. Leave passwords,
MFA and permission prompts to Andrew. Stop on unexpected access; owner restores
the bounded route/policy, not a blanket auth bypass.
**Status/evidence:** dated network and policy positives/negatives in
[access record](site-access-verification.md); browser not run.
**Limit:** configured full ranges are not a test of all tailnet nodes or bare-IP
virtual-host access. A 302 is not a completed sign-in.

## VER-06 — Named edit authorization and conflicts

**Fixture/prerequisite:** actual owner-defined shared mutation interface,
two authorized actors, non-member, revoked actor and controlled unavailable
membership service; isolated disposable records. Interface remains unimplemented.
**Procedure/pass:** a named member edits, persisted actor/revision is correct,
another reader observes the result, stale updates are explicitly reconciled.
**Negative:** forged headers, machine-token identity, non-member/revoked writes
and membership outage deny mutations; stale revision cannot silently overwrite.
**Side effects/recovery:** only disposable records/sessions, owner-controlled
outage fixture; restore fixture without modifying actual membership or history.
**Status/evidence:** blocked, track [stack rollout](stack-rollout.md).
**Limit:** network read access and browser-local edits cannot satisfy this test.

## VER-07 — Shared runtime and PG18 isolation

**Fixture/prerequisite:** complete owner dependency/build environment, reviewed
module/config, project role/database/TLS, HBA and runtime grants.
**Procedure/pass:** owner's build and full startup succeed; real project
operation reaches the correct isolated database and scoped asset broker.
**Negative:** missing required config, wrong TLS identity and cross-project
database access fail explicitly; no inherited Erebe administrator fallback.
**Side effects/recovery:** bounded project data fixture and authorized startup;
preserve created database/role and prior release. Never drop a database as cleanup.
**Status/evidence:** database creation and bundle success historical; complete
typecheck/startup/confinement blocked as [stack rollout](stack-rollout.md) records.
**Limit:** role existence, health alone or bundle exit 0 cannot close this verifier.

## VER-08 — Coordinated activation and restore

**Fixture/prerequisite:** exact candidate source/output manifest, current active
release receipt, retained previous release and coordination with naming owner.
Exercise failure in an isolated candidate or approved maintenance scope.
**Procedure/pass:** intended manifest activates; health plus actual body/version
matches; retained release can be restored with its bytes verified.
**Negative:** interrupted staging/failed health cannot be called successful
activation; changed active owner release stops a stale rollback.
**Side effects/recovery:** local staging first; runtime activation only with its
authority. Reconcile actual active service before restoring; keep database,
lakeFS/B2, source and another chat's edits.
**Status/evidence:** earlier release probes in [verification](verification.md)
and [naming evidence](naming-verification.md); failure/restore not run here.
**Limit:** copying files is not activation; two services are not automatically atomic.

## VER-09 — Physical and scientific claim checks

**Fixture/prerequisite:** actual selected dry unoccupied optics material/geometry,
recorded conditions and primary science references. Any later support/occupancy/
water activity needs its own configuration-specific professional/site acceptance.
**Procedure/pass:** record optical observations, brightness/contrast/occlusion
limits and mismatch against the ideal model; reproduce illustrative calculations
only as mathematical checks with stated input assumptions.
**Negative:** intentional wrong material/geometry or unavailable live media
produces an explicit failed observation/calm media state, not a claim of safe
rigging. Occupied/wet render cannot pass a physical-acceptance check.
**Side effects/recovery:** no physical action in this authoring task; controlled
unoccupied trials later within accepted scope; preserve failed results.
**Status/evidence:** model/CLI history in [asset review](asset-understanding.md);
real configuration acceptance not run. Sources in
[engineering research](engineering-research.md).
**Limit:** this is an evidence contract, not construction instructions or certification.

## VER-10 — Proposal, cost and official decision audit

**Fixture/prerequisite:** primary grant sources/form revision, alternatives,
selected scope/amount when chosen, budget and actual correspondence if any.
**Procedure/pass:** reconcile line items/totals/contingency and inclusions;
differentiate estimate/quote/owned/in-kind; preserve date-only deadline and
explicitly identify official Offer Notice and venue decisions when received.
**Negative:** remove offer notice or supporting quote/permission; the corresponding
claim must become pending/estimate rather than remain confirmed.
**Side effects/recovery:** document review only; submission/contact/purchase
requires separate authorization and actual completion receipt.
**Status/evidence:** research/draft historical in [grant draft](grant-draft.md)
and [pricing](pricing-alternatives.md); final scope/amount/offer pending.
**Limit:** a complete application draft is not a submission, award or permit.

## VER-11 — Naming provenance and recovery

**Fixture/prerequisite:** real engine/palette/run directory, installed documented
model identity for full-auto, selected output and existing naming API.
**Procedure/pass:** retain family/candidate lineage and seeds, resume the same
run without overwriting it, retain explicit publication selection; inspect
actual UI workflow only with control approval.
**Negative:** unavailable/changed model or malformed output fails with saved
progress and no heuristic-score substitution; lost browser-local state cannot
be reported as durable shared PG18 state.
**Side effects/recovery:** bounded new experiment/output, possible model compute
and explicitly selected publication; never reset another chat's run/release.
**Status/evidence:** other-chat evidence in [naming verification](naming-verification.md)
and procedures in [naming recipes](naming-recipes.md); not rerun here.
**Limit:** availability is dated observation, not final name/legal clearance.

## VER-12 — Pack, source and continuation validation

**Fixture/prerequisite:** final pack, eleven prompt files, nine created planning
targets, maintained existing agents.toml, preserved README and original hash.
**Procedure/pass:** helper selects complete; no empty/missing targets/inputs;
TOML/JSON parse; local links/IDs/coverage resolve; semantic Coroidinator validation
passes, context paths exist and project/list/render/check/plan-sync report zero
managed outputs. Save durable continuation and actual check receipt.
**Negative:** helper refuses existing-target overwrite; ordinary invocations
cannot silently republish; unresolved paths/IDs or invented forge/managed targets
fail the audit. Validate no personal worktree defaults were copied into source.
Use disposable fixture if exercising an overwrite attempt.
**Side effects/recovery:** authored docs/source and ignored external drafts only;
no AGENTS.md/CLAUDE.md/hooks or global changes. Preserve an existing file on failure.
**Status/evidence:** fresh results belong in [planning review](planning-review.md)
when executed after the packet is complete.
**Limit:** schema/document coherence is not deployment, independent review or
physical readiness. Optional host audit failures remain separately reported.

## Interface failure coverage

| Interface | Verifiers |
| --- | --- |
| IF-01 | VER-01, VER-02, VER-03 |
| IF-02 | VER-02, VER-03, VER-04 |
| IF-03 | VER-01, VER-04 |
| IF-04 | VER-05, VER-06, VER-08 |
| IF-05 | VER-04, VER-06, VER-07, VER-08 |
| IF-06 | VER-03, VER-08 |
| IF-07 | VER-06, VER-08, VER-11 |
| IF-08 | VER-09, VER-10 |

Each material interface has both a success observation and a failure path.
The [roadmap](roadmap.md) schedules required evidence without treating this
procedure list as completed execution.

