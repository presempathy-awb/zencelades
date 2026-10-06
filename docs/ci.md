# Continuous integration

Gitea Actions runs the repository's declared `just check` recipe, the cockpit's Bun source tests, and `just account-check` on pushes to `main`, pull requests, and manual dispatches. Branch pushes rely on the pull-request event to avoid duplicate jobs. Cockpit dependencies are installed from `cockpit/bun.lock` with `bun install --frozen-lockfile`; the account job uses Go 1.26.5 and requires a Docker-capable runner for its isolated PostgreSQL 18 fixture.

A separate job runs Gitleaks over repository files up to 5 MB and Trivy scans that fail on high or critical dependency vulnerabilities and configuration issues. Gitleaks uses the default detector set with exact path-and-value exceptions for a published release digest and two verified recording source digests; these scoped exceptions are in `.gitleaks.toml`. The workflow uses read-only repository permissions and needs no repository secrets.

The cockpit production build and tests that load ignored GLB files are not part of this clean-checkout workflow. `bun run build` runs `cockpit/scripts/prepare.ts`, which copies original GLB files from ignored `deliveries/` directories; those files are not available in a fresh checkout. Package installation skips lifecycle scripts so it does not invoke that asset-dependent preparation. The test command skips `src/showtime/projection-sphere.test.ts`, `src/showtime/projection-haze.test.ts`, `src/showtime/installation-sway.test.ts`, and `src/showtime/installation-access.test.ts`, which read those same files. CI therefore reports the remaining cockpit source-test coverage only and does not claim a production build or model verification.

The PostgreSQL fixture waits for loopback TCP readiness before running Unix-socket
persistence tests. The official image starts a temporary socket-only server during
initialization and then stops it before the final server starts; socket readiness
alone can release the test into that shutdown. The fixture retains its bounded
polling and isolated container. See the official
[image entrypoint](https://github.com/docker-library/postgres/blob/master/docker-entrypoint.sh).

## Verified generated-receipt hashes

The integrated local scan also encountered two renderer source SHA-256 values
in the ignored homepage recording receipt. Each was recomputed from its named
source file before adding a separate exception requiring both that exact value
and that exact receipt path. Other values in the receipt and the same values in
other files remain subject to the default detectors.

Each exception targets only `generic-api-key`. The initial global form skipped
the entire matched file before inspecting values; a different-value fixture
reproduced that gap. Using the documented
[`targetRules` option](https://github.com/gitleaks/gitleaks#configuration)
moves each exception into its named detector. The allowed hash passes, while
the same hash at another path and a different hash at the allowed path both
fail. No default detector is disabled.
