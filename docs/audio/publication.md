# Audio prompts and fixed cockpit publication — October 2, 2026

This is the historical public-release receipt. P118 now moves prompt delivery
into a restricted studio; see [the access contract](../private-studio-access.md)
for implementation, deployment prerequisites and current verification limits.

Published at https://zenceladus.com/#/audio and https://zenceladus.com/#/.
Source PR: [zencelades `feat/cockpit-audio-fit` (#9)](https://git.telpher.stream/telpher/zencelades/pulls/9),
stacked on `feat/account-drafts` (#8). PR #9 remains open; the static release is live.
The same source bookmark was pushed to the GitHub mirror.

## Release evidence

- Source implementation: `80c132e0cea0da6fab6b63c4a0042c8094222efa`;
  this receipt is a subsequent documentation-only change.
- Prior release: `88d5059f2ca4285b1f5936324c15f56cc08e0d5edf1d0556ca7343aed9632bde`.
- Release at that check (manifest SHA256, not a Git commit):
  `a1d372323fe59d831f617136932e19fffa7737936c1f48351e744cc4ef4414c0`.
- All 1,631 prior manifest entries retained. There are 53 changed or added
  cockpit/audio files and 1,672 total entries. Existing media, gallery, film,
  Showtime, page-content snapshots, backend and route configuration are unchanged.
- The existing shared activation lock and expected-base check completed. The
  full release manifest and file hashes were validated before switching; the
  previous release is retained. All 53 changed paths subsequently matched over
  public HTTPS, with zero mismatches.

## Verification

On maxipaxi, `bun test` passed: 59 tests, zero failures, 807 assertions across
14 files. `bun run build` exited 0, including TypeScript and Vite. Existing
large-chunk warnings remain. Static Impeccable inspection of the two new CSS
files returned no findings. This is not a complete accessibility audit.

The visible browser first reproduced an inherited grid sizing rule that put
the aerial render below the viewport. After the correction, both images loaded
and the homepage main pane had equal client and scroll height. Local checks
covered desktop and phone widths. At the live desktop check the viewport and
body were both 1280 × 720; the main pane was 579 px high with 579 px scroll
height. Both images were loaded and ended above the viewport bottom.

At that publication, browser proof covered the homepage only. Wider route/audio
checks had not yet been exercised; the fixed-shell and section-selector design
was not proof of every route. Later approval and integrated checks are tracked
by [P124](../plans/p124-resume-authorized-landing.md). No login or account
operation was performed for this historical receipt.

The initial deployment staging attempt lacked filesystem permission and made
no release. Re-running through the authorized noninteractive sudo path succeeded.
Python urllib was refused by the public edge; ordinary curl readback succeeded
for all changed files. No service/security configuration was altered to pass.
The desktop PR attachment tool rejected the Gitea URL; the PR itself exists at
the link above.

Audio has not been generated, auditioned or wired into Showtime. The protected
Pawthentik studio and account-service deployment retain their separate plans.
Pytest and Go suites were not run for this frontend-only delta.
