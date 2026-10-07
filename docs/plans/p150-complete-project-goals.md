# P150 — Complete the remaining project goals

Andrew's active objective: "get project goals all done". Preserve the full scope
of the earlier prompts; later explicit design choices win conflicts. Completion
requires current evidence for every deliverable, not a green website build alone.

## Current execution plan

1. Audit the canonical forge, current merged source, open lanes and actual
   runtime. Preserve the shipped single-row header, Full night, automatic
   random motion/fading, gallery and homepage media.
2. Resolve the newly observed account CI failure before treating account
   persistence as verified. PR28's head `39d2d85f` has successful source and
   security checks, but its account job failed connecting to its PostgreSQL 18
   fixture. Reproduce startup/routing separately; fix only the established cause
   and prove both success and bounded failure. Preserve PR28's independent lane.
3. Continue actual account deployment, scoped research/model/v4 preservation
   and authenticated Pacinman integration from their recorded contracts. Recheck
   each operation's exact consumer/credential readiness before asking for human
   authentication. Existing provider, security-review and browser scopes still
   apply; fixture acceptance is not a production-login result.
4. Reconcile the current brief/plan and record authoritative receipts as each
   delivery completes. Audit UI/media, inventory and costs, private studio,
   account identity/persistence, asset lineage/storage, grants/research and
   physical-design deliverables individually before closing the overall goal.

## Fresh observations

On maxipaxi, October 7:

- The previous goal turn only reconfirmed an already shipped deployment; it
  made no new progress toward the outstanding broad objective.
- Main is `e0e5526b`; PR30 is merged. Both public domains and the stylesheet
  match the approved build. A repeat visible browser attachment timed out.
- Review requests #4 and #10 are addressed to Grok; #27 is addressed to Claude.
  There is no queued review addressed to Codex. Other work remains available.
- PR28 `feat/backlog-completion` is open at `39d2d85f`. Hosted run15243 job50205
  failed with a PostgreSQL TCP connection refusal. Earlier "queued" statements
  are historical. No failed check is waived or replaced with a local status.
- The exact-lane source index is absent; use direct reads and `rg` rather than
  treating a missing graph as evidence of absent callers.

No purchase, grant submission, physical occupied test, new access permission or
unrelated runner restart is authorized by this planning record.

## Account fixture repair and evidence

The local act replay reached a healthy PG18 service but stopped before repository
checks: local act does not accept Gitea's absolute action URLs. It is not a passed
workflow. Hosted logs do not show a service-health wait before the account test.

A direct probe created an owned, network-disabled PG18 container with a four-second
startup delay and immediately ran the compiled persistence test over loopback TCP.
Before the repair it failed with the same TCP connection refusal as the hosted job.
After the repair it passed, including real persistence, reconnect, ownership,
concurrent-revision and Naming-document operations, after 23.73 seconds in the
test. A separate fixture delayed beyond the readiness deadline failed after
60.05 seconds, retaining the original connection refusal and deadline in its
error. The probes removed only their own containers.

The repair adds a bounded real-connection wait in the integration test and makes
the local fixture use loopback TCP for both readiness and persistence. Production
code, authentication, database-name/version guards and runtime retry behavior are
unchanged.

Fresh checks on maxipaxi completed with exit 0:

- `just account-check`: complete Go race suite, go vet and the full compiled
  suite in a new network-disabled PostgreSQL 18 fixture. The real persistence
  test passed in 7.89 seconds; the fixture was cleaned up by its own script.
- `just check`: 73 Python tests and 22 subtests passed; Ruff check/format and
  grant-ledger validation passed.
- `sh -n account-service/test-postgres.sh` passed; gofmt reports no differences.

Publication and hosted acceptance remain open. Production accounts are still
inactive on presvd1; this source repair does not establish deployed login or
private saves. The resource API had no current sample, so no load diagnosis is
inferred from the compilation time.
