# P106 — Restore the readable application view

Andrew: “cant see a lot on https://zencelades.com/#/application”.

1. Reproduce missing or illegible application content inside the cockpit;
   compare the published document and its styles with the imported view.
2. Fix the cause without dropping any proposal text, diagrams, attachments,
   navigation or the existing homepage and Showtime release.
3. Add a meaningful regression check, run the affected checks and build,
   then publish a scoped repair and verify the visible application view.

The canonical domain remains zenceladus.com. The linked zencelades.com domain
also responds with the project shell; inspect both delivery paths as needed.
Account publication and storage review remain separate unfinished work.

## Completed — October 2

The imported application document lost its inline head styles because
DocumentPages copies linked stylesheets and main content. The browser showed
six SVGs with stroke `none` and black text against the dark page. Moved the
schematic styles into `/application/application.css`, which the existing loader
and content security policy support. Scoped the drawings to light paper and
dark ink, including the sphere interior. Minimum measured label contrast is
5.59:1 across both diagram surfaces.

The live proposal body is byte-identical. Only these two paths were published:

- `site/dist/page-content/application.html`
- `site/dist/application/application.css`

Release `99dcd2810a664e5df76ba6614ee2cdf25f5116341cf1cdd94cbd62075858ba38`
replaces `9b6f2f7cc269a64aa17a166fde6d8e735fb3b16a8bed0e2af0195dec38b7252b`.
The compare-and-swap overlay checked all 1,331 prior manifest entries and
preserved unrelated files. Both domains return matching deployed file hashes.

Validation on maxipaxi: full Python suite 83 tests plus 13 subtests passed;
site build passed, including TypeScript/Vite and verification of 31 models;
Impeccable found no issues in the two authored UI files. Existing Vite bundle
size warnings remain. The first urllib HTTP check received 403; curl and the
visible browser successfully checked delivery. Activation's initial readiness
probe briefly refused connection during restart; subsequent delivery passed.

Browser red-to-green verification confirmed all six diagrams have visible
strokes and labels, and the concept image loads. The canonical tab initially
used a stale disk-cached application document; refreshed it with cache bypass
temporarily enabled, then restored normal browser caching. Visually checked
the aerial, tree and lander plates. No account or login interaction occurred.
Screenshots and release evidence are under maxipaxi's Codex cache at
`p106-application/`. Source is now preserved in both the account-drafts and
public cockpit-route-links lanes, so a later public build retains the repair.
The pending account PR and account service are not deployed.
