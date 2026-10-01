# Durable prompt plans for this chat

Chat: `01a0f379-5c69-7740-8297-f1edc92c154a`  
Project: `thatsnozorb`  
Established: 2026-09-30T20:28:33Z  
Owner: Codex, following Andrew's prompts in this chat.

## Standing capture instruction

Andrew's request, verbatim:

> save all the upcoming prompts in this chat as durable plans.

For every subsequent human prompt in this chat, Codex must update this file
and the affected durable plan before substantive work. Capture prompts as they
arrive; do not invent future user messages. This is a per-turn working agreement,
not a background listener or scheduled automation. It applies only to this chat.

1. Append a numbered prompt record with the received text, capture time, intent,
   scope and links to the plan it creates or changes. Preserve wording, including
   corrections; redact secret values and reference attachments by path instead
   of copying their contents. Distinguish user instructions from quoted sources.
2. Turn actionable requests into bounded steps with an actor, dependencies,
   completion criteria and evidence location. Amend the relevant existing plan
   when the request continues it; create a separate plan only for distinct work.
   A status question or clarification still gets a record and a disposition,
   without manufacturing an implementation task.
3. Preserve the prior request when a new prompt steers it. Record explicit
   cancellations or supersession and the replacement record; never silently
   erase an earlier requirement or treat a new prompt as cancelling everything.
4. Keep PLAN.md as the concise current index. Update status and evidence after
   meaningful progress and at turn boundaries. Use planned, in progress, blocked,
   complete or superseded; completion requires observed evidence. Last-observed
   service state is dated context, not a fresh live check.
5. Keep these plans local to the project. Planning does not itself grant new
   deployment, messaging, secret, browser-control, submission or merge authority.
   Retain existing session authorizations and constraints, including the pytest
   pause and human hid-in boundaries, until Andrew changes them.

## Prompt ledger

### P019 — Model every option and the exact Ram/hitch configuration

- Captured: September 30, 2026, in this chat.
- Verbatim prompt and bounded steps: [P019](p019-truck-and-option-models.md).
- Intent: complete selectable support models, a dimensioned 2021 Ram 2500
  Laramie Mega Cab 4x4, receiver and Andersen fifth-wheel geometry, and a library
  assessment. Status: in progress; installed hitch identity requested.

### P001 — Preserve upcoming prompts as durable plans

- Captured: 2026-09-30T20:28:33Z.
- Source: Andrew's latest message in this chat, quoted above.
- Intent: make future instructions and their execution plans survive compaction,
  handoffs and a closed chat window.
- Plan: establish this ledger; link it from PLAN.md and the project's agent
  context; retain the already-authorized continuation work below.
- Completion criteria: files exist, the context reference resolves, TOML parses,
  and future prompt records have an explicit capture and status convention.
- Status: complete for setup; capture of later prompts is the standing per-turn rule.
- Evidence: documentation verification on maxipaxi exited 0: TOML parses, all
  four configured context files exist, all five queued plans are present, every
  ledger link resolves, and PLAN.md/README.md both reference this ledger. This
  documentation-only change did not run pytest or repeat deployment checks.

### P002 — Price simpler installations and archive ZIPs in B2

> make some pricing alternatives, liek fully fixed truck mount, plain mount no truck think other ways even ground, no water, just hanging, no gopros inside, etc. zips go to b2

- Captured: September 30, 2026, in this chat.
- Intent: compare materially simpler ways to deliver the artwork and place ZIP
  archives in the existing B2 storage system.
- Plan: [pricing alternatives and ZIP storage](pricing-and-b2.md).
- Scope: current sourced component-price anchors, explicit allowances and
  like-for-like tradeoffs for fixed truck, freestanding, ground and hanging
  installations; dry-land and no-internal-camera variants; preserve originals
  and use the existing authorized B2 workflow with remote integrity proof.
- Status: pricing and B2 delivery complete; browser interaction verification
  awaits Andrew's scoped consent. Eight alternatives are deployed at `/pricing/`,
  with 64 editable allowance rows and current price anchors. The one original
  ZIP has a verified private B2 receipt; existing lakeFS history is retained.
- Evidence: [pricing and B2 verification](../pricing-verification.md) records
  arithmetic execution, exact asset preservation, repeatable B2 readback, all
  164 served-file hashes and IPv4/IPv6 HTTPS/public-origin checks.
- Constraints: comparison does not select a build or authorize purchases; no
  fabrication/performer approval is implied by a budget. Preserve existing
  lakeFS commits and ZIP bytes; B2 placement does not authorize deletion.

### P003 — Incorporate Love Burn offer rules and deadline research

- Captured: September 30, 2026, in this chat.
- Source: [Andrew's supplied research](p003-supplied-research.md), retained with
  normalized whitespace and source provenance.
- Intent: make the official Art Committee Offer Notice/application boundary and
  logistics explicit; incorporate the broader date-only deadline research.
- Plan: [Love Burn offer and application requirements](love-burn-offer-rules.md).
- Status: complete for research integration and publication. Offer Notice rule,
  application route, in-kind/ticket distinctions, dated terms and conflicting
  official counts are documented and deployed; no assumed deadline hour added.
- Evidence: the linked plan records release `50fb39f2dd366a4142d303a53a26d589966c502a329a8ada670e215adf1eab64`,
  successful build/deployment and exact HTTPS readback of the three changed
  outputs plus retained pricing/B2 records. Browser interaction and pytest
  remain unrun under the standing constraints.
- Constraints: reported outside browsing is source material, not a record of
  Codex's own verification. The suggested 11:59 p.m. Eastern fallback cannot
  establish an official or safe-to-wait cutoff; no timer is needed. No organizer
  messages, ticket purchases, application submission or acceptance is authorized.

### P004 — Gather grant guides and successful related art

> gather loveburn like art submission guides burning man great art grants that got big especially similar ones, guides to great art grants.

- Captured: September 30, 2026, in this chat.
- Intent: gather useful application guidance and relevant funded-art precedents,
  especially projects that grew into larger public, touring or museum work.
- Plan: [grant guides and precedents](grant-guides-and-precedents.md).
- Status: complete for research/publication: `/grants/`, twelve guide entries,
  eight cases, a proposal workshop and 28-source register are deployed.
  [Evidence](../grant-library-verification.md) records build and HTTPS readback.
- Constraints: distinguish confirmed grants from exhibition/commission history;
  unknown award amounts remain unknown. No submission, contact or purchase is
  authorized. Preserve date-only Love Burn deadline and the Offer Notice rule.

### P005 — Tailnet, direct IP or Authentik access

> tailnet or tailnet ip or authentik login

- Captured: September 30, 2026, during P004.
- Intent: provide alternative access paths without requiring tailnet visitors
  to log in; authorized visitors outside the tailnet can use Pawthentik.
- Plan: [site access paths](site-access-paths.md).
- Status: applied and directly verified for the hostname's network and app-policy
  paths. Normal hostname and both tailnet IP families return trusted HTTPS 200;
  public-origin and forged-header requests reach Authentik. Browser login remains
  unexercised; bare shared-server IPs do not select a project virtual host.
- Evidence: [access verification](../site-access-verification.md) and the
  non-secret `assets/access-receipt.json`; Telpher recipes remain in the isolated
  lane and are not claimed landed.
- Interpretation: preserve no-port domain access; test direct tailnet IP routing
  separately from hostname/SNI routing. Keep authentication for public access.
  This does not authorize anonymous public access, unrestricted signups or
  browser control. P004 research/publication continues.

### P006 — Learn deeply from Umesemu

> can we learn anything from umesemu? go kinda deep here

- Captured: September 30, 2026, in this chat.
- Plan: [Umesemu lessons](umesemu-lessons.md).
- Status: complete for the read-only study and durable implementation plan.
- Evidence: [deep comparison](../umesemu-lessons.md) covers ten areas with 24
  revision-pinned source links, all verified against Git objects. It distinguishes
  inspected main `053b2cf5ae46`, installed release `db5b7600add2`, current HTTP
  probes and historical asset readback/restore receipts. No Umesemu mutation,
  browser acceptance or new deployment is claimed.
- Scope: asset provenance, media and creative workflows, product presentation,
  access boundaries, data, release and operations. Umesemu inspection is read-only.

### P007 — Telpher unlock reported

> unlocked

- Captured: September 30, 2026, during P006.
- Plan: continue [site access paths](site-access-paths.md).
- Status: completed the authorized access setup while the project unlock worked.
  The owner runner created/restricted the app, checked allowed and refused users,
  then the route and split DNS were applied. The later optional admin repeat
  returned project-locked exit 4; installed access still passes fresh HTTP checks.
- Evidence: [access verification](../site-access-verification.md). No credential,
  session or successful browser login is inferred from the unlock message.
- P006 comparison continues independently. Existing browser consent and pytest
  pause remain in effect.

### P008 — Compare the linked access chat

> see if this helps  codex://threads/01a0f40b-8b61-7990-a9ad-6d52b7508a91

- Captured: September 30, 2026, during P006/P007 closeout.
- Plan: read the linked chat, identify reusable source-IP/access patterns,
  compare them with the route now installed, and record any remaining gap in
  [site access paths](site-access-paths.md). Preserve the Umesemu study.
- Status: complete for read-only comparison. Read the chat titled **telpher:
  Allow approved IPs without login** and its current route helper. Recorded the
  shared no-port/socket-IP/probe patterns and its different deny-unlisted policy
  in [access verification](../site-access-verification.md). Its public allowlist
  was not copied, its files were not changed and no message was sent to it.

### P009 — Broaden engineering research and retain large sources in lakeFS

> other general research relating to the project engineering etc. dont forget big thinks in lake over hes...

- Captured: September 30, 2026, in this chat.
- Plan: [engineering research and source preservation](engineering-research.md).
- Status: research and local source preservation complete; scoped remote upload
  pending. The [brief](../engineering-research.md) cites thirty source records.
  Four PDFs / 107,428,393 bytes / 493 pages pass local integrity checks. The
  [storage handoff](../research-storage.md) contains validated owner patches.
  Andrew's infrastructure PR choice is pending; the latest general vault check
  is unlocked, but no project publisher exists in the running broker.
- Interpretation: broaden the project's practical engineering/scientific
  research; put acquired large research assets in lakeFS through hesellsheshells,
  retaining the prior ZIP-to-B2 instruction. Small source registers and analysis
  stay in the project. Record this assumption rather than inventing another system.
- Scope: authoritative references, project-specific implications, evidence gaps,
  bounded prototype/approval questions and immutable source-storage receipts.
  No hardware purchase, fabrication approval, organizer contact, grant submission
  or authentication bypass is implied. Preserve the existing original collection.

### P010 — Fill the project preprompts and agents

> do the projects preprompts file, and one at a time like one prompt per file. fill out the agents and rest of preprompts

- Captured: September 30, 2026, in this chat.
- Status: authoring complete. The [pack index](../../preprompts/README.md)
  links eleven separate full prompts and all eleven targets. Nine missing
  documents were published sequentially; existing agents.toml was maintained
  through agents-sync and existing README.md was preserved byte-for-byte.
- Interpretation: Andrew requests the whole authoring set in this turn, one
  file at a time, including schema-valid agents.toml. This overrides the skill's
  default stop after seeding or one target, without changing normal autonomy.
- Scope: project context, metadata, plans and verification documentation.
  Preserve existing targets and concurrent naming work. Existing research,
  durable prompts and measured receipts supply evidence; proposals stay proposals.
- Preserve P009's pending storage PR choice and broader stack work. This request
  does not authorize those provider mutations, physical fabrication or grants.
- Evidence: [planning review](../planning-review.md); helper reports done,
  Coroidinator validates with zero managed targets, and document/ID/link checks
  pass. The optional Concierge host audit has three failures, recorded separately.
  No pytest, browser control, application code or deployment occurred in P010.

### P011 — PR, merge, deploy and cheaper support research

> pr n merge deploy. go deep researching the project more. other types mounts from the truck, cheaper. etc. how would hang from arial rig. or even tree. etc

- Captured: September 30, 2026, in this chat.
- Status: in progress. Andrew authorizes the pending owner PR/review/merge and
  deployment path plus deeper project research and publication. This resolves
  P009's pending PR choice; applicable review/merge, human secret and provider
  gates still apply. No purchase, fabrication, human trial or grant submission.
- Deliver scoped research publisher changes through hesellsheshells and Telpher,
  then preserve the separate acquired-source batch with immutable readback.
  Refresh owner state and preserve concurrent changes before any mutation.
- Research cheaper truck support geometries, freestanding aerial rigs, suspended
  display arrangements and tree options using primary manuals, real costs and
  venue rules. Distinguish unoccupied display from person-bearing equipment;
  identify which dimensions, load data and approvals remain missing.
- Publish the research through the project's existing site workflow, preserving
  the other chat's naming work and recording exact release/readback evidence.
  Plan: [P011 delivery and support research](delivery-and-support-research.md).
- Delivered: the mount research/site publication, exact-byte HTTPS checks,
  scoped browser checks and six-PDF local preservation plan. The separate
  research uploader has direct loopback evidence. Both owner PRs have green CI
  and await required review; merges, broker rollout and real research upload
  remain outstanding. [Evidence](../mount-delivery-verification.md).

### P012 — Read-only browser check approved

> Andrew approves this read-only browser check

- Captured: September 30, 2026, during P011.
- Scope: visible in-app browser; this project's mount, pricing and document
  pages only. Stop at login, MFA or another account. No page or account mutation.
- Plan: [P012 browser verification](p012-browser-verification.md).
- P011's authorized merge/deployment and research preservation remain active.

### P013 — Pacinman reference and Pawthentik work deferred

> pacinman also. also like pacinman will need to use pawthentik. but like shelve this for after other stuff done

- Captured: September 30, 2026, in this chat.
- Decision: add Pacinman as another reference and retain the requirement for
  later Pawthentik integration; defer the comparison and per-person integration
  until current research/storage delivery is complete.
- Current scoped machine-publisher PR/review/rollout and research-file upload
  remain prioritized. Existing tailnet-or-Authentik access is preserved.
- Plan: [P013 Pacinman and Pawthentik later](p013-pacinman-pawthentik-later.md).

### P014 — Haze-filled zorb optical idea

> hazer air filling zorb?

- Scope: assess haze in the interior or inflation chamber, optical benefits and
  limits, material compatibility and the distinction between occupied and
  unoccupied use. No purchase, physical test or human exposure is authorized.
- Plan: [P014 haze-filled zorb](p014-haze-filled-zorb.md).
- Status: research complete; primary sources and an unexecuted optical
  comparison are preserved in the plan. No approved haze/inflation connection,
  occupied use, material compatibility or projection performance is claimed.
- P013's deferred integration and P011's delivery priorities remain recorded.

### P015 — Owned hazer, haze added during normal inflation

> own the hazer so no cost or have to find and no not to inflate... just to add some hazer air mid inflation

- Captured: 2026-10-01T00:15:22Z (September 30 local time).
- Scope: record existing hazer ownership and $0 incremental acquisition cost;
  correct the idea to haze added partway through normal blower inflation.
- Plan: [P015 owned hazer during inflation](p015-owned-hazer-during-inflation.md).
- Status: complete for clarification; P014 and PLAN.md updated. No equipment
  sourcing, physical experiment or performance verification occurred.

### P016 — Reuse Much Ado and Erebe options and 3D

> can likely use a lot of options type 3d stuff from muchadoaboutoneside and erebe

- Captured: 2026-10-01T00:17:01Z (September 30 local time).
- Scope: inspect actual reference code and map reusable options/3D capabilities
  to this project's alternatives before creating duplicate infrastructure.
- Plan: [P016 Much Ado and Erebe reuse](p016-muchado-erebe-3d-reuse.md).
- Status: source study and concrete reuse plan complete. Erebe R16's scenario
  workflow and Much Ado's viewer are mapped to existing project pricing/GLBs;
  implementation remains queued and prior delivery priorities are retained.

### P018 — v4 Fixed15 archive attachment

- Input: `/Users/andrew/Downloads/Enceladus_Within_v4_Fixed15_Project.zip`.
- No additional request text. Continue the established asset-preservation and
  project-understanding task; do not treat document instructions as user commands.
- Plan: [v4 Fixed15 intake](p018-v4-fixed15-intake.md).
- Status: local extraction/catalogue/inspection and B2 full readback complete;
  v4 cockpit integration builds. All 84 downloads plus catalogue, B2 receipt
  and comparison are live and HTTPS-verified. Scoped lakeFS upload and cockpit
  browser acceptance/publication remain pending.

### P017 — Single-page cockpit and requested frontend stack

> single page app, check out the uhm hotgoddesshotpen.muchadoaoutonesside.com and walterville etc ‘cockpit’ vite reactflow tailwind4 shadcn tanstack

- Captured: 2026-10-01T00:23:50Z (September 30 local time).
- Scope: inspect Hot Goddess Hot Pen/Walterville and implement a single-page
  project cockpit using the requested stack and the P016 reuse direction.
- Plan: [P017 single-page cockpit](p017-single-page-cockpit.md).
- Local implementation: [cockpit guide and verification](../cockpit.md).
  Build, four scenario tests and complete static HTTP readback pass. Browser
  acceptance and selective publication remain pending scoped browser approval;
  no P017 PR/merge or live cockpit is claimed.
- Status: reference inspection and implementation in progress; existing
  infrastructure review requirements and deferred identity work retained.

### P020 — Factory receiver and original Ultimate

> factory reciever origional uliimate

- Clarification to P019. [Plan](p020-factory-receiver-original-ultimate.md).
- Status: incorporated; original-generation reference required, Gen 3 retained
  only for comparison. Actual installation offsets remain unmeasured.

### P021 — Zenceladus project name and address

> zenceladus.com change url project name etc

- Plan: [name and domain](p021-zenceladus-name-domain.md).
- Status: in progress. Continues P019 models with the new identity; no domain
  purchase or unrelated storage/repository migration is inferred.

Append P022 for the next human prompt received in this chat. Do not pre-fill it.

## Queued continuation plans

These are Codex-authored resumable prompts derived from the existing request,
not messages Andrew has already sent. Their status is carried forward from the
September 30 delivery receipt. Recheck live state before executing. Each plan
remains subject to its existing human and repository gates.

### Q01 — Provision and confine the independent PG18 database

**Resume prompt:** Preserve the already-created thatsnozorb database/role and
hid-in URL. Complete owner-controlled HBA confinement, reload and run the
provisioner's TLS and denial checks. Recheck necessary secret gates without
rotating or recreating the existing role.

- Actor: Codex; Andrew performs the interactive vault unlock and any required
  human runtime-secret grant.
- Status: database/role and hid-in storage complete after observing the general
  unlock in presvd1's verified `/run/user/1002` context. HBA confinement and the
  provisioner's final `--check` remain pending; Q01 is not complete.
- Steps: follow [continuation.md](../continuation.md); use the existing provisioner
  and [HBA additions](../../deploy/pg18-hba.additions.conf); land/reload confinement
  through its documented owner path; then prove the intended TLS login and
  refusal of plaintext, wrong hostnames and unrelated database access.
- Complete when: the app has its own LOGIN-only role/database, its connection
  URL is stored only in hid-in, and the confinement checks have fresh evidence.
- Evidence: [verification record](../verification.md) and [stack rollout](../stack-rollout.md).

### Q02 — Complete scoped storage and Pawthentik integration

**P013 sequencing:** keep the machine publisher and research preservation in
the active delivery lane. Defer per-person Pawthentik membership/revocation
integration and the Pacinman comparison until that priority work is complete;
resume from [P013](p013-pacinman-pawthentik-later.md). The combined scope below
remains recorded without making the deferred portion an immediate dependency.

**Resume prompt:** Provision only the reviewed project-scoped publisher and
reader capabilities, connect the existing authorization path, and verify
membership and revocation without broadening unrelated storage access.

- Actor: Codex; Andrew handles human secret-grant steps when required.
- Status: planned; initial preservation is complete, while scoped consumer
  principals and per-person governance remain pending.
- Steps: validate the [broker additions](../../deploy/lake-broker.additions.toml)
  and [hid-in references](../../deploy/hid-in.additions.toml) with the owners;
  provision narrow machine grants; prove allowed project operations and denied
  unrelated/admin operations; verify the actual per-person Pawthentik path,
  including denial during outage and after revocation.
- Complete when: the application's restricted storage access and people's
  authorization have independent live proof. A machine token alone is insufficient
  evidence of a person's membership.
- Preserve: all 132 files already committed in thatsnozorb-assets, the verified
  immutable receipt, protected main and retention policy. Do not repeat ingestion
  or widen existing viewer principals merely to make the shelf appear.
- Evidence: [stack rollout](../stack-rollout.md), [verification record](../verification.md)
  and the existing assets/upload-receipt.json.

### Q03 — Release the shared Much Ado module

**Resume prompt:** Complete the existing feat/enceladus-module lane using the
Erebe/Much Ado conventions, connect the independent database and scoped broker,
and replace the temporary static service only after the shared release works.

- Actor: Codex; human approval remains necessary for interactive credentials or
  browser control where the existing scope has not been approved.
- Status: planned; the external-package server bundle passes, but full startup
  and typecheck have missing existing dependencies. Q01 and Q02 are dependencies.
- Steps: inspect the current lane and installed dependencies; use the declared
  runtime/release path; verify the module's independent settings and access;
  stage a rollback-capable shared release; verify the real hostname, file hashes,
  video ranges and authorized workflows before replacing the static backend.
- Complete when: the shared module is live at the existing no-port hostname,
  the app's independent services work, tailnet confinement remains proven, and
  the static-service SHORTCUT can be retired without losing assets or access.
- Preserve: unrelated Much Ado/Erebe changes and the project-local naming work
  owned by another active chat. Do not absorb that chat's prompts or approvals.
- Evidence: [hosting](../hosting.md), [stack rollout](../stack-rollout.md) and
  [verification record](../verification.md).

### Q04 — Review and land the reusable Telpher recipe

**Resume prompt:** Finish the review and owner-repository delivery of the applied
tailnet-site recipe, preserving its plan-by-default behavior and verified access.

- Actor: Codex; Andrew supplies any high-tier PR approval required by the current
  repository policy after the complete change is reviewable.
- Status: planned; the recipe is implemented and applied from the isolated
  feat/tailnet-site-access lane, but not landed in canonical Telpher. The prior
  review helper failed on an unsupported model and supplied no review verdict.
- Steps: inspect the latest complete diff; obtain a valid bounded review through
  the established review path; resolve findings; preserve direct checks for
  IPv4/IPv6, DNS-01 renewal, long challenge names, non-loopback refusal and forged
  source headers; follow current PR/merge gates and verify the installed recipe.
- Complete when: the canonical owner change is reviewed and landed, and the
  installed recipe and documentation match the verified behavior.
- Evidence: the Telpher lane's docs/runbooks/tailnet-site.md and this project's
  [verification record](../verification.md). Do not infer canonical installation
  from the already-working one-host deployment.

### Q05 — Close remaining grant and venue questions

**Resume prompt:** Continue the sourced Love Burn grant preparation and the
water/truck/anchor feasibility record; preserve the distinction between concept,
engineering evidence, organizer decisions and an actual application.

- Actor: Codex researches and drafts; Andrew selects the proposal scope and
  authorizes any organizer contact or submission separately.
- Status: planned; the date-only deadline record, funded-art research and draft
  exist. No verified closing hour/timezone or official approval has been obtained.
- Steps: check new authoritative evidence when available; keep September 30 as
  the published date without inventing midnight; finish the chosen scope and
  budget from documented gates; record exact water placement, truck interface,
  shared-anchor, electrical, environmental and performer requirements with their
  responsible approval bodies and unresolved decisions.
- Complete when: the research has attributable sources and explicit unknowns,
  and the selected proposal has a coherent scope, budget, schedule and permission
  register. Submission and an award are separate outcomes requiring evidence.
- Evidence: [research](../love-burn-research.md), [proposal](../grant-draft.md)
  and [technical asset review](../asset-understanding.md).

## Already completed work to preserve

The seven originals, 125 extracted members and catalog are verified. All 132
lakeFS objects passed immutable readback. The no-port HTTPS site and selected
naming page were deployed; all 132 downloads, both IP families and public-origin
spoof rejection were checked. The [status](../../STATUS.md) and
[verification record](../verification.md) contain the receipts and limits.
These are carry-forward observations, not checks rerun by this planning-only edit.
