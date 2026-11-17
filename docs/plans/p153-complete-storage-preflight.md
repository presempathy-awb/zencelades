# P153 — Continue delivery and close ingestion preflight gaps

Continuation of Andrew's active objective: "get project goals all done".
Zencelades `feat/backlog-completion` (#28) remains reviewed at head
`a20f93daa74169ec44dfb49098612a8cb4f70c46` against main
`fc63ca6c024876e1fb26563efafc7edaf40a412c`. Hosted source and security checks
passed, but its account fixture timed out; landing remains blocked. Its source
and original owner lane must remain stable. This separate
lane addresses Sonnet's two operational findings before real owner-host ingestion:

1. Require research aggregate count/byte metadata and reject malformed totals
   before any network request. Preserve v4's explicit optional-total contract.
2. Require an empty, well-formed scoped main-prefix listing before execution
   records or remote branch creation. Preserve final exact immutable readback.
3. Observe meaningful red/green loopback regressions, run the full applicable
   source checks and obtain independent review before publication and landing.
4. Continue actual account, scoped storage and authenticated inventory delivery
   after exact owner/credential prerequisites; audit the entire original scope.

The public website already matches the verified build. The private studio again
redirects to Authentik; authenticated account saves remain unproven. No shared database or
runner restart, broadened access, credential creation, purchase or physical
occupied test is authorized by this planning record.

Verification on maxipaxi, October 7: the new cases produced seven failures before
the production repair. `mise exec -- just check` then exited 0 with 95 tests and
37 subtests passing, Ruff check/format passing and the grant-resource ledger
matching the published pricing table. This is the pre-review test count.
No real storage upload, account service activation or new site release occurred.

Grok's complete eight-file review returned PASS and was posted verbatim at
https://git.telpher.stream/telpher/zencelades/pulls/32#issuecomment-18239 for
published head `1566b1c9fa1c61e566d45111375f64d93bd5680b`. Its should-fix test
and plan-reference findings are addressed in a separate child revision. The
strengthened loopback tests enforce the exact scoped prefix/amount and reject
numerically equal floats/booleans and supplied invalid model/v4 totals before
network access. Temporarily weakening the integer guards produced eight
expected failures; the original guards were restored. The first full rerun
passed 94 tests/47 subtests but two unchanged fixture-harness cases timed out
at their 10-second child limit. Both passed unchanged on focused rerun. The
subsequent complete `mise exec -- just check` exited 0 with 96 tests and 47
subtests, Ruff check/format and the grant-resource ledger check passing. No
timeout was relaxed. The published PASS does not review this new child revision.

Rebased onto main as zencelades #48, 2026-11-16, measured by Claude on that tree
with `pytest -q -rf tests/test_research_upload.py`. Relaxing the totals guard to
`isinstance(..., int)` reports `8 failed` and removing it reports `16 failed`. Each
total counts two outer `subTest(batch=...)` blocks that fail because a case inside
them failed, so the distinct failing cases are 6 and 14.
