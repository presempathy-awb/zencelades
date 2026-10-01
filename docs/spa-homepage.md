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
byte-verified. Existing large-bundle warnings remain.

Published October 1 from source `ac6f213f` to release
`1c12dda8383795d61e51190640000c5c5298e0be0931f13b1b4fd382fef0dc22`.
The scoped release verified all 907 prior manifest entries before overlaying
91 changed/new paths. Public HTTPS readback matched 130 checked files against
the resulting manifest; `thatsnozorb.service` is active. The preceding release
remains available for rollback. No route or authentication setting changed.

Visible live-browser checks confirmed the hero and render links, a full-size
aerial model image, homepage section navigation, and Home → Studio → Budget →
Home navigation. Returning to Studio retained the selected aerial model.
Lander and optional truck controls worked; hiding truck selected the aerial
holder. At 389 pixels wide, the canvas measures about 414 pixels high and the
homepage has no horizontal overflow. The main proposal still displays
$2,378–$5,242 including 20% contingency. Rendered-homepage Impeccable detection
returned an empty finding list (exit 0). Local-preview verification was not
completed; this browser evidence is from the deployed HTTPS site.

Account login and persistent account saves remain separate unfinished work.
Camera counts have geometry/export test coverage; changing all counts through
the live Parts interface was not included in this browser check.
