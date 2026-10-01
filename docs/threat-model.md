# Threat and failure model

Codex, September 30, 2026. Planning analysis; not a penetration test,
a physical safety assessment or an external review receipt.
Read [intent](intent.md) and [decisions](decisions.md) first.

## Assets, actors and boundaries

Protected assets are original bytes and provenance, private source material,
credentials, attributed creative work, service availability, truthful grant/cost
claims and the safety of people near any eventual installation. Integrity and
recoverability matter even when a source is already publicly downloadable.

Actors include Andrew, collaborators, visitors, unauthenticated Internet callers,
tailnet clients, machine publishers, service owners and agents processing source
files. A legitimate collaborator can upload malformed data; a trusted machine
can have a stale configuration; an agent can confuse a proposal with approval.

Boundaries: external files → extraction/catalog; catalog → served content;
project → broker → lakeFS; archive helper → B2; socket source → edge auth;
reader → named mutation; local work → release; model → physical world;
proposal → organizer/agency commitment. Privileged owners remain powerful:
confining an application token does not eliminate platform-administrator risk.

## Material scenarios

| ID | Claim at risk and counterexample | Mitigation or decision | Residual risk and evidence obligation |
| --- | --- | --- | --- |
| THR-01 | Preservation: a ZIP escapes its destination, expands excessively or overwrites a differing original; an apparent receipt references changed bytes | Validate entry paths/type/size and refuse conflicts; preserve occurrences and exact hashes; DEC-02 | Filesystem/owner loss remains possible; prove refusal and exact restore, not merely extraction success |
| THR-02 | Confidentiality/browser isolation: private conversation or active archived HTML becomes an executable page; a failed asset lookup becomes an empty 200 | Explicit served selection, attachment/nosniff handling and content hashes; DEC-09 | Authorized readers can copy downloads; test normal and encoded paths and actual bodies |
| THR-03 | Storage authority: a redirect carries a Bearer token away, or a project token reads another repo/prefix/admin endpoint | Existing broker default-deny, narrow repo/prefix, redirect refusal and server-side hid-in; DEC-06 | Role includes branch operations; verify all negative controls on the deployed policy and retain protected main |
| THR-04 | Edge identity: public caller forges source or Authentik headers and bypasses login | Socket-source trust, exact-host routing, strip untrusted identity and keep public forward-auth; DEC-03 | A compromised tailnet node already has intended read trust; test both network paths and spoofing |
| THR-05 | Authorship: network access or machine token is logged as Andrew's review; revoked user can still edit | Separate named authorization for mutations; deny on unavailable membership service; DEC-05 | Current crew workflow is absent; require real member, non-member, revocation and outage evidence |
| THR-06 | Availability/ownership: release mixes another chat's unfinished work or activation partly succeeds with mismatched API/static bytes | Inspect exact manifests and active receipts, bounded activation checks and retained prior release; DEC-06 | Two services are not automatically atomic; demonstrate recovery and do not erase newer owner work |
| THR-07 | Recoverability: four local PDFs are called “in lakeFS,” or upload interruption leaves an unrecorded committed branch | Separate acquired/staged/committed/verified states and batch receipts; DEC-02 | Remote retention alone is not a restore; read all objects by immutable commit and reconcile partial work |
| THR-08 | Physical safety/science integrity: a concept board, tow rating, mapper coverage or copied standard becomes permission for occupied/wet use | Keep unoccupied development and configuration-specific professional/site gates; DEC-04 | Material, weather and human factors remain untested; require physical observations and named acceptance outside media software |
| THR-09 | Financial/permission truth: inferred midnight, verbal placement or a planning estimate becomes an accepted grant, permit or purchase | Date-only record, explicit budget categories, no offer without official notice; DEC-09 | Source pages can be stale or inconsistent; preserve dates and seek the responsible authority's actual decision |
| THR-10 | Dependency/creative continuity: absent shared packages, stale camera data, lost browser state or unavailable naming checks are silently treated as successful | Fail visibly, retain source/run receipts, distinguish local drafts from synced records, calm media fallback; DEC-01/DEC-08 | No Internet-independent physical show proven; test failure/recovery at each implemented boundary |

## Assumptions and exclusions

The initial scope is an unoccupied development project plus its existing digital
surfaces. No finding here accepts the occupied water-walking-ball configuration.
The show controller's media fallback does not operate a hoist or replace a rescue
system. Malicious hardware supply-chain analysis and a complete platform audit
are outside this packet; platform-owner trust remains explicit.

The original lakeFS and B2 evidence is prior dated evidence. New research
preservation is locally verified only. The restricted Authentik edge is not
proof of Pawthentik per-person storage revocation. No user grant is inferred
from source files, published manuals or this document.

## Acceptance and next obligation

Every scenario above must be mapped to a concrete requirement or explicit
decision disposition by the specification, then to proportionate failure evidence.
An open requirement does not silently accept its residual risk. Physical and
agency acceptance must name the actual configuration and authority.

Sources read: [asset review](asset-understanding.md), [stack](stack-rollout.md),
[access evidence](site-access-verification.md), [storage handoff](research-storage.md)
and [Umesemu lessons](umesemu-lessons.md). CTX04–CTX07 and CTX09 are indexed in
[context.json](../preprompts/context.json). Procedures remain proposals until
their corresponding evidence record says otherwise.

