# Media cockpit — October 1 verification

Historical P099 receipt. P101 subsequently brings the remaining public pages
into the cockpit; see [current page behavior](cockpit-pages.md). Original page
content is retained under page-content, while old URLs now open cockpit views.

Andrew clarified that the cockpit itself should be the main experience, with
the artwork and all media inside it. P099 refines the previous SPA homepage.
The existing shell now remains visible across Overview, Media, Showtime, Model,
Workflow, Build board, Budget, Parts and Grants & resources. Overview retains the
complete artwork narrative and its four renders. Media includes both original
films, all ten gallery images, the four GLB/Blender assemblies and document links.
Existing standalone pages and download URLs are retained.

The first Showtime integration used an iframe. The live browser reproduced its
failure: the existing `frame-ancestors 'none'` policy rejects embedding. A
regression test failed for the frame, then passed after replacing it with native
cockpit content. No security header was relaxed. The independently published
Showtime page is retained and directly linked, including its current pitch status.
The native view labels the sequence as intended experience, not proven operation.

## Checks on maxipaxi

- `bun test`: 41 passed, 709 assertions. The earlier homepage landmark test failed
  before the shell integration. The Showtime regression also failed before its fix.
- `just check`: 58 Python tests plus 13 subtests passed; Ruff and ledger checks pass.
- `node --test tests/*.test.mjs`: 17 passed, zero failures.
- `just site-build`: passed, including TypeScript/Vite and 31 model checks,
  132 original plus 84 v4 byte-verified downloads. The final native-Showtime and
  poster changes additionally passed TypeScript and Vite. Bundle warnings remain.
- Rendered media DOM `impeccable detect --json`: empty findings, exit 0.

## Live checks

Final release: `71f3a502b0cf965b16a55c44864184cfd679c18f2d3b280bba0a21816354db87`.
Scoped activation verified all prior manifest entries and retained unrelated
gallery, Showtime, media and document files. Final public HTTPS readback through
curl matched 155 files against the active manifest, including both films.
The service is active and release identity was checked before and after readback.
Python urllib requests were rejected by Cloudflare with error 1010; no access
settings were modified. Deployment startup briefly retried while Caddy restarted,
then its bounded health check passed. Existing Caddy formatting warnings remain.

The visible in-app browser verified Overview → Media → Showtime → Model,
Showtime's pitch anchor, and Lander → Overview → Model retaining the selected
lander. Both Media films responded to play/pause and advanced their playback
times (12-second original; 44.27-second NASA-derived film). Their native metadata
loaded without errors. An unrelated geometry-sheet poster was removed so the
original film presents its own first frame. Desktop 1280-pixel and mobile
390-pixel layouts had no document-width overflow. Responsive overrides were reset.
The browser was left on the overview.

The local preview was not used; evidence is from the deployed HTTPS site.
Account login/saves and private Pacinman editing are not implemented by this UI
release. Andrew approved the Go/gimmesomepaw/pgx service in P098. Its identity
adapter is local work in progress, with six passing outpost cases, not a live API.
