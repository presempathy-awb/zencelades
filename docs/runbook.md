# Project operator runbook

Historical P010 runbook. Read the [October 1 current brief](current-brief.md)
and current release evidence before any operation; do not replay old deployment
or access assumptions against the public site.

Codex, September 30, 2026. This runbook separates existing local commands from
pending owner work. Command names and project paths were inspected on maxipaxi;
showing a command does not mean it was executed. No remote command below is
silently authorized by this document. Read [decisions](decisions.md) and use
[verifiers](verifiers.md) for the claim being made.

## Establish the current slice

**Actor:** Codex or the next project operator. Read PLAN.md, STATUS.md and
the human prompt ledger; append a new human request before substantive work.
Check current source/output ownership and active receipts. There is no forge
identity or Git/JJ repository established here, so do not invent one.

Use the installed preprompts helper to select a missing target. Draft outside
the project, read its full per-file prompt/inputs, and publish through the
helper's no-overwrite guard. P010 requests completing this whole pack;
ordinary later skill invocations retain their one-step default.
All existing targets must remain intact unless separately authorized maintenance
names them. agents.toml maintenance uses agents-sync, not helper overwrite.

The installed tool can inspect agent source without executing TOML commands:

```sh
# maxipaxi
A=~/code/pres/make/thatsnozorb
coroidinator validate --json "$A"
coroidinator check --json "$A"
coroidinator sync --json "$A"
```

Expected for the present projection-only source: valid, zero managed targets,
no generation changes. A nonzero result is evidence to inspect, not permission
to create AGENTS.md/CLAUDE.md or flatten user defaults. VER-12.

## Validate original material

**Actor:** Codex. **Prerequisite:** retained originals/extraction and inventory.
The release check reads the 124 entries in the supplied checksum list:

```sh
# maxipaxi
A=~/code/pres/make/thatsnozorb
just -f "$A/justfile" assets-check
```

It does not prove the full 132-occurrence inventory, remote lakeFS or B2.
Follow [asset understanding](asset-understanding.md) and the exact receipts
for those comparisons (VER-01). Preserve differing bytes and report the source
relationship on failure; do not reimport over them. `assets-import` and
`assets-catalog` are writers, not harmless substitutes for a failed read check.

For the original ZIP, use [B2 evidence and procedure](b2-archives.md).
The existing `archives-b2` recipe requires the actual Telpher owner path and
plans by default. Apply only through that owner's credential/approval route;
preserve the recorded version and compare full readback before claiming success.

## Prepare a coordinated static release

**Actor:** Codex, coordinating with the naming work owner.
**Prerequisite:** exact intended source scope and prior active release receipt.
The build writes site output and can include concurrent naming edits:

```sh
# maxipaxi
A=~/code/pres/make/thatsnozorb
just -f "$A/justfile" site-build
just -f "$A/justfile" deploy-site
```

The second command plans; it is not activation. Inspect its source manifest,
private-content exclusion, output hashes and destination before an authorized
apply. Keep the previous release and use VER-03/VER-08 for body, attachment,
range, access and recovery evidence. Start any preview as a background process
under the documented preview recipe; record its actual endpoint instead of
guessing a port. Browser control still requires its scoped consent.

If another owner changes the active release, stop and reconcile before rollback.
A failed copy/health check requires an actual active-version observation.
Restore only the selected prior release/config; never drop project data or
discard another chat's source. P010 performs no build or activation.

## Finish the separate research preservation batch

**Actor:** Codex after Andrew resolves the pending P009 infrastructure PR choice;
hesellsheshells/Telpher own their changes and privileged rollout.
**Prerequisite:** current owner instructions, reviewed/landed narrow policy and
credential wiring, valid hid-in ticket and project grant.

Follow the five bounded steps in [research storage](research-storage.md).
It links the exact proposed owner patches, principal binding and upload plan.
The hesellsheshells owner's runbook requires policy and Telpher changes landed
before its broker-only rebuild/recreation. Refresh that owner runbook and live
policy before execution; no broad stack reset or another project's credential.

The existing `assets-upload` recipe handles the original 132 objects and
existing receipt paths. **Do not use it unchanged for the four research PDFs.**
The required separate uploader must consume the research plan, retain staging
state, record commit before readback and produce its own verified receipt.

Verify current local hashes, then allowed imports scope and unrelated
repo/prefix/admin refusals (VER-04). Stage exactly the planned objects on a fresh
branch, commit and compare every immutable byte (VER-02). On interruption,
reconcile retained staging/commit; do not delete receipts to force a retry.
Update source status only after verified readback. Keep main protected/unmerged.

## Complete the shared application and access handoff

**Actor:** Codex with the Much Ado, Telpher and identity service owners.
Use [stack rollout](stack-rollout.md) for actual lane, PG18 and broker boundaries,
and [access evidence](site-access-verification.md) for the applied route recipes.
Those records are dated observations; recheck host facts and current owner
recipes before executing. Do not recreate the existing database or edge app.

First complete the owning build environment and project-specific runtime grants.
Then prove HBA/TLS isolation and scoped app operation (VER-07), establish the
actual person-authorization interface and fail-closed mutation behavior
(VER-06), and coordinate the backend replacement/recovery (VER-08).
The current loopback static catalog remains the recorded working presentation.

The desired hostname path is tailnet OR restricted Authentik. Replacing that
with deny-all-unlisted IP behavior would break the public login path.
VER-05 separates network probes from real browser login. Andrew supplies any
password/MFA/OS approval; no agent fills or bypasses it. Per-person storage
revocation is a separate seam from successful edge login.

## Preserve naming work and selected publication

**Actor:** the naming operator, coordinating with the active naming owner.
Use [naming recipes](naming-recipes.md) for explicit engine, palette and new
output directory. `naming-run`, `naming-resume`, `naming-preview` and
`naming-publish` exist; their required arguments are not optional guesses.
The publish recipe requires an explicit host and plans unless applied.

Before a run, inspect installed model identity and existing receipts.
On model mismatch/malformed output retain progress and diagnose; never install
or substitute silently. Resume the same experiment only by its documented path.
Preserve candidates, seeds and browser-local draft limitations (VER-11).
Naming API deployment and a whole-site release are separate operations.

## Prepare physical and grant decisions

**Actor:** Andrew selects scope/budget; Codex prepares evidence and comparisons;
qualified designers/manufacturers/venue authorities accept their actual scope.
Use [engineering research](engineering-research.md), [pricing alternatives](pricing-alternatives.md)
and [grant draft](grant-draft.md). Start with dry, stationary, unoccupied optics
as a recommendation, not a selected construction design.

Record actual material/geometry and failed observations before expanding claims
(VER-09). Reconcile selected primary/fallback budget and actual application
fields (VER-10). Keep date-only cutoff and Offer Notice conditions visible.
No application submission, organizer message, equipment order or occupied/wet
test follows automatically from completing these documents.

## Evidence and interruption handoff

Record host, revision/configuration, exact action, result and claim limit.
Keep failed/skipped checks visible. `just check` includes pytest and remains
paused at Andrew's request. No command in this runbook overrides that pause.

At interruption, save a durable checkpoint with changed files, current receipts,
the next bounded action and unresolved choices. Open gates belong in PLAN.md
and the ledger, not only chat prose. Recovery preserves all originals, owner
changes, retained releases and scoped authorization boundaries.
