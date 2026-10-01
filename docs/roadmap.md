# Delivery roadmap

Historical P010 roadmap. The [October 1 current brief](current-brief.md) and
[working plan](../PLAN.md) record later selections, deliveries and remaining work.

Codex, September 30, 2026. Milestones describe evidence gates, not calendar
promises. No staffing estimate, final budget, physical layout, forge identity
or new authorization is invented. Read [decisions](decisions.md) and
[verifiers](verifiers.md). Prior dated evidence is reusable at its actual
revision/scope; a later milestone does not imply it was rerun.

## M-01 — Evidence and document foundation

**Owner:** Codex for project records; Andrew for new human direction.
**Entry:** retained originals and current prompt ledger.
**Outcome/deliverables:** traceable original inventory and receipts; eleven
separate full preprompts; complete ordered planning targets; valid maintained
agents.toml with zero managed outputs; preserved existing README and checkpoint.
**Acceptance:** REQ-01/REQ-12 through VER-01/VER-12. Original positive
preservation evidence is historical; document/source checks are fresh P010.
Malformed archive controls remain future ingestion acceptance, not implied by
the completed authoring packet.
**Status:** P010 authoring and validation close in the planning review.
**Blocker/dependency:** none for local authoring. This gate does not release a
new extraction implementation or close unrelated runtime evidence.

## M-02 — Scoped research storage

**Owners:** hesellsheshells/Telpher own policy and credential delivery;
Codex owns the bounded upload/receipt; Andrew resolves pending P009 PR choice.
**Entry:** locally verified four-PDF batch, reviewed owner delivery, valid
project grant and deployed imports-only principal.
**Outcome/deliverables:** exact research manifest, separate staging record,
returned immutable commit and complete byte-verified research receipt; original
132-object lakeFS import and original B2 ZIP remain intact.
**Acceptance:** REQ-02/REQ-04 through VER-02/VER-04, including interruption,
unrelated repo/prefix/admin refusals and protected main.
**Status:** prepared locally, remote upload pending. Owner patches passed local
checks; they have not been applied/landed. No research commit is fabricated.
**Blockers:** PR choice, owner delivery, scoped credential wiring/broker-only
recreation and research-specific uploader. Do not use the old importer unchanged.

## M-03 — Access and owner delivery

**Owners:** Telpher and Authentik owners; Codex records bounded evidence.
**Entry:** recorded no-port hostname, current owner route/DNS/TLS state,
appropriate lane review/landing and scoped browser authorization.
**Outcome/deliverables:** canonical owner delivery for existing applied recipes,
trusted hostname on exercised tailnet IPv4/IPv6 paths, restricted public login,
spoof-negative results and real allowed/refused browser evidence.
**Acceptance:** REQ-05 through VER-05; repeat VER-04 only if broker policy
changes. Preserve the tailnet-OR-Authentik contract.
**Status:** earlier network and membership-policy checks passed; recipes applied
from a lane rather than landed; browser login unexercised.
**Blockers:** owner landing and browser consent. This stage can progress
independently of research bytes once its own authority is available.

## M-04 — Shared application and named identity

**Owners:** Much Ado, PG18/Telpher, Pawthentik and hesellsheshells owners.
**Entry:** complete owning dependency environment, reviewed module/runtime
configuration, isolated database confinement and actual person-auth contract.
**Outcome/deliverables:** full shared-app startup, scoped data/asset operation,
correct per-person edit/review identity, denied unauthorized/revoked/outage
writes and explicit concurrent-edit behavior.
**Acceptance:** REQ-06/REQ-07 through VER-06/VER-07, with VER-04/VER-05 evidence
reused only where exact configuration still applies.
**Status:** shared module lane/bundle and database creation exist; full startup,
HBA confinement, runtime grants and person-storage seam remain pending.
**Blockers:** missing existing private build packages, owner delivery and the
unimplemented identity/mutation interface. Static read access is not substitute
acceptance. No new password/membership database is proposed.

## M-05 — Select and prove the physical/grant scope

**Owners:** Andrew selects creative scope and budget; qualified designers,
manufacturers and venue/agency/Art Committee own their decisions.
**Entry:** reviewed science/engineering sources, eight pricing alternatives,
actual optical material/geometry and a bounded unoccupied trial scope.
**Outcome/deliverables:** recorded real optical observations; selected primary
concept and priced fallback; reconciled request and truthful application draft;
configuration-specific written decisions when obtained.
**Acceptance:** REQ-09/REQ-10 through VER-09/VER-10. Any occupied/water/support
expansion has its own professional/site acceptance before that activity.
**Status:** research and alternatives exist; scope/amount not selected; physical
performance/acceptance, application submission and official offer unproven.
**Blockers:** physical observations, choice of configuration/budget and actual
authority responses. Preparation can proceed alongside digital work; no date
or presumed midnight is supplied as a guarantee.

## M-06 — Integrated publication, continuity and recovery

**Owners:** project/naming operators coordinate; platform owners own activation.
**Entry:** exact intended candidate manifests, selected audience, retained prior
releases, applicable earlier gate evidence and authority for this activation.
**Outcome/deliverables:** selected preserved assets served safely, coordinated
naming/site/API version, retained creative lineage/local-state limits and a
demonstrated bounded restore with active bytes reverified.
**Acceptance:** REQ-03/REQ-08/REQ-11 through VER-03/VER-08/VER-11. Reassess
VER-01–VER-07 and VER-09–VER-12 only for changed scope; do not claim any rerun
without its execution record.
**Status:** historical static/naming releases exist; integrated new release and
failure/restore acceptance are not claimed by P010.
**Blockers:** concurrent release coordination, approved served selection and any
new shared-runtime dependencies. Digital release does not certify the artwork.

## Required verifier ownership

| Required verifier | Primary milestone | Later integration use |
| --- | --- | --- |
| VER-01 | M-01 | M-06 when intake/preservation changes |
| VER-02 | M-02 | M-06 if research is selected for serving |
| VER-03 | M-06 | Every changed served selection |
| VER-04 | M-02 | M-03/M-04/M-06 when storage authority changes |
| VER-05 | M-03 | M-04/M-06 when edge/backend changes |
| VER-06 | M-04 | M-06 for shared mutation delivery |
| VER-07 | M-04 | M-06 for shared runtime delivery |
| VER-08 | M-06 | Every coordinated activation/recovery |
| VER-09 | M-05 | Reassess on actual physical configuration change |
| VER-10 | M-05 | Reassess on proposal/price/permission change |
| VER-11 | M-06 | Every selected naming publication |
| VER-12 | M-01 | Every document/source continuation update |

## Next bounded delivery

Andrew's pending P009 infrastructure PR choice is the next decision for research
storage; P010 does not answer it. After that choice, Codex refreshes owner state,
follows its reviewed delivery path, provisions the narrow principal and completes
the separate four-object upload. The completion result must be an actual
immutable commit plus exact-set/full-hash readback, recorded in the research
receipt and source register. Until then, the four PDFs remain **local only**.

Evidence links: [research handoff](research-storage.md),
[stack rollout](stack-rollout.md), [access](site-access-verification.md),
[grant draft](grant-draft.md), [human ledger](plans/chat-prompts.md),
[agent source](../agents.toml) and [planning review](planning-review.md).
