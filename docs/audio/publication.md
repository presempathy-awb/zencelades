# Audio prompts and fixed cockpit publication — October 2, 2026

Published at https://zenceladus.com/#/audio and https://zenceladus.com/#/.
Source PR: [zencelades `feat/cockpit-audio-fit` (#9)](https://git.telpher.stream/telpher/zencelades/pulls/9),
stacked on `feat/account-drafts` (#8). PR #9 remains open; the static release is live.
The same source bookmark was pushed to the GitHub mirror.

## Release evidence

- Source implementation: `80c132e0cea0`; this receipt is a subsequent documentation-only change.
- Prior release: `88d5059f2ca4285b1f5936324c15f56cc08e0d5edf1d0556ca7343aed9632bde`.
- Active release: `a1d372323fe59d831f617136932e19fffa7737936c1f48351e744cc4ef4414c0`.
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

Every page shares the fixed shell; its content remains accessible through
section selectors or contained reading panels. Expanded browser interaction
across all routes and the new audio copy controls has not been exercised:
Andrew's additional computer-control approval is pending. The approval already
given covered the homepage check. No login or account operation was performed.

The initial deployment staging attempt lacked filesystem permission and made
no release. Re-running through the authorized noninteractive sudo path succeeded.
Python urllib was refused by the public edge; ordinary curl readback succeeded
for all changed files. No service/security configuration was altered to pass.
The desktop PR attachment tool rejected the Gitea URL; the PR itself exists at
the link above.

Audio has not been generated, auditioned or wired into Showtime. The protected
Pawthentik studio and account-service deployment retain their separate plans.
Pytest and Go suites were not run for this frontend-only delta.
