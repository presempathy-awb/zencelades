# P151 — Integrate the backlog delivery with current main

Continuation of Andrew's active objective: "get project goals all done".
The previous turn delivered the real PG18 startup repair in PR31. This turn
continues the original broad objective; source integration is one prerequisite.

Snapshot of October 7, 2026, kept as the plan was written. The revisions it
names are history: on 2026-11-16 the branch was rebuilt on main `90fe5fd5`
(see the pull request description for its current head).

1. Refresh PR28 and its owner chat, current main, source cleanliness and CI.
   On October 7 the owner chat was idle and its lane clean. PR28 was at
   `39d2d85f`; its account job had failed with a fixture connection refusal.
   Main `fc63ca6c` contained the readiness repair and the newer compact-header/Full-night
   features. Preserve all of both changes in a separate integration workspace.
2. Add current main as a parent, resolve conflicts hunk by hunk, and verify that
   the combined tree retains the current application/media behavior plus the
   backlog's asset restoration, scoped clients and security/CI work. Never
   overwrite the original owner workspace or force-push its branch.
3. Restore only catalog-verified retained build inputs if this clean workspace
   needs them. Run the source, complete account and relevant frontend/build
   checks. Record any fixture, hosted, browser, provider or source limitation.
4. Publish the descendant to the existing PR only after a fresh remote-head
   check and a forward-only dry run. Obtain the merge policy's review by another
   vendor on the current head and base, plus real hosted source/security checks.
   Older PASS receipts and local tests do not prove the new revision reviewed.
5. Land through the project's shipping gate when the configured requirements
   are met, then continue actual scoped preservation, account installation and
   authenticated inventory acceptance. Do not close the overall goal while
   those requirements remain missing.

This plan grants no new credentials, provider permissions, purchases, physical
test approval or unrelated runner operation. The website's current release and
all original asset/receipt bytes remain preserved throughout integration.
