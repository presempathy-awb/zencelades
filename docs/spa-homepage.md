# Render-led SPA homepage

Andrew clarified that the website remains a single-page application, with the
renders, hero and description as its homepage. The root entry now serves that
SPA. `/#/` presents the complete existing artwork narrative and all four render
images; `/#/model` and `/#/budget` open the model and budget in the same app.
Temporary scenario state survives those in-app navigation changes. `/studio/`
still opens the model for existing links, and `/about/` retains the standalone
artwork page. Gallery, Showtime, original documents and downloads keep their URLs.

HomePage imports only the reviewed repository-owned artwork HTML. It extracts
the existing body and remaps the artwork, studio and budget links to SPA routes.
It does not accept uploaded/user HTML. Local section links scroll within the
homepage without confusing the hash router. Styles are confined to that home
container; the studio retains its work surface.

Verification: the publishing regression test failed while the build overwrote
the SPA entry with the static artwork page, then passed after correction.
39 Bun tests / 686 assertions, 58 Python tests plus 13 subtests, 17 Node tests,
Ruff, ledger reconciliation, TypeScript/Vite and all 31 model exports pass.
`just site-build` completes with the original 132 and v4 84 download records
byte-verified. Existing large-bundle warnings remain. Publication and visible
browser proof are recorded after activation; no login implementation is claimed.
