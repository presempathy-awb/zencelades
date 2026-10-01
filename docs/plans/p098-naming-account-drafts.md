# P098 continuation — Naming persistence

The preceding goal turn implemented and tested account-owned scenario storage.
Publication, browser-account control and presvd1 unlock inputs remain pending.
This continuation fixes the independently actionable Naming persistence gap.

1. Introduce a Naming draft lifecycle shared by palette and ranking editors.
   Fresh visits use authored data; guest edits remain in memory. Existing
   browser-local drafts are preserved and offered as explicit export-only
   recovery, never silently deleted or loaded into an anonymous session.
2. Give Naming a separate authenticated, versioned PG18 document containing its
   palette and shelves. Preserve complete personal edits, names, weights and
   receipts. Use the same verified account, origin and revision guards as the
   scenario service; never accept an owner selector from the browser.
3. Add explicit Naming Save/Load with replacement/expiry/conflict help, keeping
   scenario saves and Naming saves clearly identified. No guest localStorage
   fallback, and no hidden auto-save during initialization.
4. Prove fresh guest reset, legacy recovery preservation, account isolation,
   complete Naming roundtrip, stale revisions and rejected writes. Run affected
   whole suites and build. Browser acceptance still requires the pending scope
   approval; production publication remains gated on review and human unlock.

October 1 local implementation: both editors now keep guest edits in memory;
the recovery action exports legacy browser bytes without changing them. Naming
Save/Load uses its own verified-account document and revision, with explicit
replacement and expiry/conflict help. The API and shared browser client agree
on `{expectedRevision, document}`. Initial, undeployed SQL now keys documents by
owner and kind; no live migration was changed.

Fresh verification: 59 Python tests + 13 subtests, Ruff and ledger pass; 22 Node
tests pass; the actual published Naming fixture (1,118,372 bytes) round-trips
through the editor lifecycle. Go race tests, vet and golangci-lint pass. The
whole Go suite also passes inside isolated PG18, including separate scenario
and Naming persistence, a 1.2 MB Naming HTTP write, owner isolation, conflicts
and rollback/reapply. TypeScript, Vite, 31 model checks and the complete site
build pass. Vite retains its existing large-chunk advisory.

The Naming control regression was mutation-checked: removing the disabled-save
guard fails the guest test, and restoring it passes. These DOM harness tests
are not browser acceptance. The previously deployed cockpit route-preservation
fix is carried into this lane so later account publication cannot undo it.

Still open: required security review/PR decision, presvd1 credential unlock,
canonical Authentik provider binding, service installation and actual account
browser verification. No account changes were deployed in this continuation.
