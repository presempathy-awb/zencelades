# Observable project specification

Historical P010 specification. The [October 1 current brief](current-brief.md)
adds current occupied-build scope and signed-in persistence acceptance; old
publication/scope statements below are dated evidence, not current policy.

Codex, September 30, 2026. These requirements describe acceptance, not a claim
that every behavior exists. The implementation slice is preservation, governed
digital access and honest planning. Human trials, physical construction
specifications, grant submission and unspecified external integrations are
outside this slice. See [intent](intent.md), [decisions](decisions.md),
[threats](threat-model.md) and [interfaces](integration.md).

## Asset state model

| State | Required evidence | Permitted next state / failure behavior |
| --- | --- | --- |
| Registered candidate | Source URL/title, access date and limits | Acquire exact bytes or retain an explicit access failure; no local/remote claim |
| Acquired | Original local bytes, length, SHA-256, provenance and classification | Stage a defined authorized batch; preserve local originals on failure |
| Staged | Batch plan, destination branch and successful object operations recorded | Commit exact set or reconcile partial work; not yet an immutable receipt |
| Committed | Returned immutable commit and object set recorded | Read all bytes by that commit; interrupted verification stays committed |
| Readback-verified | Exact set, every length/hash and immutable identity match | Independently select a served/public set; verification alone grants no publication |
| Published to stated audience | Approved selection, pinned source, release/access evidence | Verify served bytes; withdraw serving independently of preserved originals |

B2 archive state uses its returned object-version identity in place of a lakeFS
commit. “Published” must state the audience: the tailnet-or-Authentik catalog
is not anonymous public redistribution. Local build output is not published.
A failed readback cannot advance to verified. Repeating a command cannot erase
an earlier receipt. Corrections add evidence with explicit supersession.

## REQ-01 — Preserve originals and extraction provenance

INT-01; DEC-02; IF-01/IF-03; THR-01.
Retain all seven supplied originals and each of 125 extracted occurrences,
preserving parent ZIP/member relationships, byte length and SHA-256.
Positive example: an original ZIP and two identically named members in different
directories remain individually traceable. Rejected example: flattening members
or overwriting differing bytes to match a catalog.
**Pass:** exact inventory/byte comparison and safe refusal of escaping,
oversized or conflicting extraction; full archive-version readback.
Historical positive evidence exists; malformed archive controls are separate.
Acceptance procedure: VER-01.

## REQ-02 — Preserve acquired research as a separate batch

INT-01/INT-04; DEC-02/DEC-06; IF-01/IF-02; THR-01/THR-07.
Record the thirty-entry source register accurately. Only four acquired PDFs
(107,428,393 bytes) belong to the present upload plan. The undownloaded TIFF
and inaccessible manual remain candidates/failures.
Positive: a separate research plan, branch, commit and verified receipt.
Rejected: rerunning the 132-object importer unchanged, removing its receipt,
or calling local files “uploaded.”
**Pass:** local hashes reconfirmed, exact new remote set and every immutable
readback match; interruption retains enough state to finish verification.
Remote research acceptance remains pending. Procedure: VER-02.

## REQ-03 — Isolate preservation from serving

INT-01/INT-03; DEC-02/DEC-09; IF-01/IF-02/IF-06; THR-02/THR-07.
Preservation cannot automatically publish private sources or execute active
archive content. Serve a deliberate selection with correct download behavior.
Positive: verified archive bytes returned as an attachment to an allowed reader.
Rejected: recovered private conversation included in a build, archived HTML
executing as the application's own page, or a missing body returned as success.
**Pass:** candidate and deployed served sets match selection; private/encoded
path probes fail; normal downloads hash-match and video ranges work.
Any anonymous public selection requires separate authority. Procedure: VER-03.

## REQ-04 — Confine storage authority

INT-01/INT-03; DEC-02/DEC-06; IF-02/IF-03/IF-05; THR-03/THR-07.
Use owner-provisioned project credentials with no administrator or unrelated
project scope. The P009 publisher is imports-only in the existing repository;
retain main protection and existing principal policy.
Positive: permitted batch object operation on its ingest branch.
Rejected: wrong prefix/repository/admin operation, redirect following with a
Bearer token, credential copied into browser or an ad hoc administrator path.
**Pass:** deployed policy positive and negative controls, redacted provenance,
protected-main behavior and complete immutable readback. A locally parsed
policy or unlocked vault alone is insufficient. Procedure: VER-04.

## REQ-05 — Enforce the intended read-access paths

INT-03; DEC-03; IF-04; THR-04.
The normal .com HTTPS hostname admits configured tailnet source ranges or
restricted Authentik identity through the public path. No port is needed.
Positive: hostname/TLS success over exercised tailnet IPv4 and IPv6 paths;
authorized public login reaches the same content.
Rejected: a public caller's forged forwarding/identity header bypassing login,
or an unapproved member obtaining access.
**Pass:** route/TLS/body probes, spoof negatives and actual permitted/refused
browser workflow, with tested clients explicitly enumerated. Configuring all
ranges does not claim testing all nodes; bare IP is not the app hostname.
Network evidence exists; browser evidence remains open. Procedure: VER-05.

## REQ-06 — Attribute mutations to verified people

INT-03/INT-05; DEC-05; IF-04/IF-05/IF-07; THR-05/THR-10.
Future shared edits/reviews require a verified person, current authorization and
conflict-aware persistence; readers and machine tokens are not named authors.
Positive: authorized actor changes a record, another reader sees the persisted
revision, and stale edits are handled explicitly.
Rejected: forged identity, revoked/non-member writes, machine-token authorship,
or permitting writes when membership verification is unavailable.
**Pass:** permitted, unauthorized, revoked, outage and stale-revision observations
on the actual owner-defined interface. No endpoint is invented here.
The shared crew workflow is absent; current browser-local edits stay labeled
local. Procedure: VER-06.

## REQ-07 — Keep application and database boundaries real

INT-03; DEC-01/DEC-05; IF-05; THR-03/THR-05/THR-10.
The shared module uses the isolated project role/database and scoped runtime
grants, never Erebe's inherited administrator/database identity.
Positive: actual startup and a project operation through correct TLS and role.
Rejected: missing required configuration accepted silently, wrong TLS identity,
access to the other application's database, or bundle success called deployment.
**Pass:** owner build/startup evidence, confinement check and scoped real
operation plus meaningful denial controls. Role/database creation is recorded;
confinement and shared runtime acceptance remain pending. Procedure: VER-07.

## REQ-08 — Release and recover without destroying concurrent work

INT-01/INT-03/INT-05; DEC-06/DEC-08; IF-04/IF-05/IF-06/IF-07; THR-06/THR-10.
Identify exact intended source/output and active release before a coordinated
activation. Retain prior release and recover partial staging/activation without
dropping preserved data or erasing another chat's changes.
Positive: selected release manifest, verified activation and retained restore path.
Rejected: deployment of mixed unfinished work, silent partial success or
restoration over a newer owner release.
**Pass:** bounded failure/recovery exercise on disposable/candidate material,
then actual active version/body evidence when activation is authorized.
No P010 deployment is implied. Procedure: VER-08.

## REQ-09 — Bound scientific and physical claims by evidence

INT-02/INT-04; DEC-04; IF-08; THR-08/THR-10.
Preserve v3's unoccupied scope and label concept/model results by their limits.
Keep hardware/material/vehicle identifiers and observed performance separate
from illustrative diagrams and fictional loads.
Positive: documented dry, unoccupied optical sample observations with the
actual material and geometry. Rejected: 85.5755% ideal mapper coverage called
transparent-film performance, tow rating called a hoist rating, or media calm
mode called an emergency lowering system.
**Pass:** repeatable observations, honest failure record and the named authority's
configuration-specific acceptance before any dependent physical activity.
This specification supplies no human suspension or wet operating approval.
Procedure: VER-09.

## REQ-10 — Make grant, permission and pricing claims auditable

INT-04; DEC-04/DEC-09; IF-08; THR-08/THR-09.
Keep the Love Burn closing date distinct from an unverified hour. Only an
official Art Committee Offer Notice establishes its actual offer.
Show comparable alternatives, explicit inclusions/exclusions, contingencies,
owned/donated resources and whether numbers are allowances or quotes.
Positive: selected primary concept plus priced fallback and reconciled grant
request, checked against the actual form and venue decisions when submitted.
Rejected: inferred midnight treated as guaranteed, verbal placement accepted as
binding, estimated line items represented as vendor quotes.
**Pass:** dated source/form check, internal budget reconciliation and actual
written decisions for claimed permissions. No submission or contact occurs
merely because the draft passes. Final scope/amount remain open. Procedure: VER-10.

## REQ-11 — Preserve creative work and naming lineage

INT-05; DEC-07/DEC-08; IF-07; THR-06/THR-10.
Use actual project data and preserve candidate families, run inputs/seeds/model
identity and results. Distinguish browser-local drafts from shared persistence.
Positive: resuming a saved run retains its provenance and chosen output.
Rejected: silently substituting a model/heuristic score, overwriting an experiment
or treating availability checks as name ownership.
**Pass:** selected run/resume and visible error evidence, explicit publication
selection, browser/API behavior when authorized, and truthful persistence labels.
No final name or forge identity has been chosen. Procedure: VER-11.

## REQ-12 — Make continuation durable and source authority explicit

INT-06; DEC-07/DEC-08/DEC-10; IF-01–IF-08; THR-01/THR-06/THR-09/THR-10.
Record each new human prompt before substantive work; keep one full preprompt
per file and guarded sequential target publication. Preserve existing README.
Maintain valid agents.toml as project source without invented forge identity,
flattened personal defaults, managed outputs or installed hooks.
Positive: complete linked documents, valid context paths, supported consumer
validation and zero managed targets. Rejected: overwriting an existing target
or calling author self-review an external approval.
**Pass:** pack/target/input/ID/link audit, README hash preservation, semantic
agent-source checks and saved continuation with open gates. Procedure: VER-12.

## Coverage and acceptance boundary

Every THR appears in requirements above. IF-01 is covered by REQ-01/02/03,
IF-02 by REQ-02/03/04, IF-03 by REQ-01/04, IF-04 by REQ-05/06/08,
IF-05 by REQ-04/06/07/08, IF-06 by REQ-03/08, IF-07 by REQ-06/08/11
and IF-08 by REQ-09/10. REQ-12 preserves the whole packet.

A complete specification is ready to guide bounded implementation; it does not
close an unrun verifier or release a physical installation. Fresh documentation
proof and earlier runtime proof must remain separate in the final review.

Primary project evidence: [asset review](asset-understanding.md),
[stack](stack-rollout.md), [access](site-access-verification.md),
[research preservation](research-storage.md), [grant draft](grant-draft.md),
[pricing alternatives](pricing-alternatives.md) and
[research batch](../assets/research-upload-plan.json).
