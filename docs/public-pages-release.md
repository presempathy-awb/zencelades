# Public artwork pages and studio release — 2026-10-01

The homepage, `/about/`, `/open-source/` and `/studio/` are published on
https://zenceladus.com/. The studio includes the 24-task board, the 88-part
catalog count, temporary guest drafts and explicit scenario import/export.
Authenticated saving is not implemented or claimed by this release.

## Release and preservation

- Initial page release: `44cfffd7d21381bac70f461e538b541c1dec1c80c7ff86db2dc6ef618d203764`.
- Current follow-up: `5b9985c116455128368c5e81f70c2d9cf448bb3bfc346404a83c92e2a0817c27`.
- The initial overlay validated all 576 prior manifest entries and changed 119
  explicitly scoped page/studio paths. The follow-up validated 659 prior entries
  and changed 50 studio paths. Existing paths were retained in both releases.
- Showtime, media, gallery attachments, pricing, grants and server configuration
  were outside the replacement scope. Previous release directories remain for
  rollback. No IP-management adapter or login wall was reintroduced.

Both activations on presvd1 passed manifest integrity, Caddy validation,
service readiness and the hosted homepage hash check. A first readiness probe
briefly failed during restart; the bounded polling then succeeded. Caddy reports
existing formatting and loopback HTTP warnings; external TLS remains at the edge.

## Verification

Fresh maxipaxi commands and results:

1. `just check`: exit 0; 55 tests and 13 subtests pass, Ruff passes, all 35 Python
   files meet formatting, and the grant resource ledger matches its sources.
2. `just cockpit-check`: exit 0; 20 tests, 298 assertions, zero failures;
   TypeScript/Vite build and 28 native/exported model checks pass.
3. `node --test tests/*.test.mjs`: exit 0; 17 tests, zero failures or skips.
4. `just site-build`: exit 0; 132 original and 84 v4 download records are
   byte-verified, plus eight media previews. The existing large-chunk warning
   remains. All 57 local link/asset targets in the four new entry pages resolve.
5. Public HTTPS readback: 125 file hashes matched the initial release; 59 matched
   the follow-up, including retained Showtime, gallery, pricing, grants and two
   attachment PNGs. Curl used normal DNS and TLS validation. Python's default
   urllib client received Cloudflare error 1010; no edge policy was changed.

In the approved visible in-app browser, Codex switched the local lander and
aerial models, exercised Top/Reset controls, then switched the live aerial model
and Side control at the confirmed domain. The original fixed-offset status box
overlapped controls by 36 pixels. The corrected grid reserves separate rows for
canvas, status and controls; live DOM measurement at 916 CSS pixels reports zero
overlap. Navigation-link contrast is now 9.43:1 against the dark shell.

Screenshots, activation output and complete per-file readback receipts are held
locally under `~/.cache/codex/p091-public-pages/`. These receipts are verification
artifacts, not the source of the application's state.

## Remaining acceptance and login work

Homepage/OSS/board browser interaction needs the pending expanded browser-scope
answer; only the previously approved model flow was exercised. Board tests and
HTTP checks do not substitute for that browser acceptance.

The existing Gitea PR carries source `4f7cc56d`; the follow-up source change
records the navigation-contrast and model-control layout corrections described
here. Main has not been merged by this work.

`just app-status thatsnozorb` from Telpher's clean checkout exited 1: the hid-in
manifest changed and its five-minute human grant request timed out. No identity
configuration was changed. A fresh interactive grant and the pending Go/pgx
dependency decision are needed for the proposed account-save API. Full login,
authenticated save/reload, expiry/logout and cross-account tests remain open.

The broader prompt audit and physical-build requirements remain active; this
release is not project completion or engineering approval.
