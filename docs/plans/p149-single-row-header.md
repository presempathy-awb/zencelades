# P149 — Single-row desktop header

Andrew: "can top be even thinner? like one row"

1. Fit the usual one-column cockpit header into one compact desktop row,
   keeping section/page choices, column choices, account and import/export.
2. Preserve 44-pixel controls and all accessible labels. Wrap on narrower
   screens and retain independent selectors when multiple columns are shown.
3. Verify desktop, narrow and multi-column navigation in the approved browser;
   run the existing cockpit checks and publish through the scoped release flow.

Trivial: CSS-only presentation refinement. Existing cockpit-layout tests cover
column fitting and independent route selection; browser interaction verifies
the affected layout. No new behavior, dependency or interface is introduced.
