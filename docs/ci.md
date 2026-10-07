# Continuous integration

Gitea Actions runs the repository's declared `just check` recipe, the cockpit's Bun source tests, and account-service race, vet, and PostgreSQL persistence checks on pushes to `main`, pull requests, and manual dispatches. Branch pushes rely on the pull-request event to avoid duplicate jobs. Cockpit dependencies are installed from `cockpit/bun.lock` with `bun install --frozen-lockfile`. The account job uses Go 1.26.5 and a job-owned PostgreSQL 18 service container; it connects through `ZENCELADES_TEST_DATABASE_URL` and requires no Docker CLI or host socket access.

Local `just account-check` retains its disposable Docker-managed PostgreSQL 18 fixture. CI instead runs the shared `just account-service-check` recipe against its isolated service container, so the integration test executes in the ordinary Go test process.

The workflow and `mise.toml` pin the same Go, Ruff, Gitleaks and Trivy versions.
Run the recipes through `mise exec -- just ...`; the project enables
`activate_aggressive` so child shells retain those tools ahead of competing
system installations. This prevents a Go binary from one installation using
the compiler directory from another. The first hosted run exposed missing
Ruff/Gitleaks version selections and an unavailable Docker CLI; the source
configuration and service-backed account job address those failures.

A separate job runs Gitleaks over repository files up to 5 MB and Trivy's
dependency scan, configured to fail on high or critical vulnerabilities. The
Trivy configuration command has the same severity threshold but currently
recognizes no configuration targets in this repository: exit 0 is not proof
that deployment configuration was checked. The first hosted run stopped before
these scans, so hosted scan execution must be established separately. Gitleaks
uses the default detector set with exact path-and-value exceptions for a
published release digest and two verified recording source digests; these scoped
exceptions are in `.gitleaks.toml`. The workflow uses read-only repository
permissions and needs no repository secrets.

The cockpit production build and tests that load ignored GLB files are not part of this clean-checkout workflow. `bun run build` runs `cockpit/scripts/prepare.ts`, which copies original GLB files from ignored `deliveries/` directories; those files are not available in a fresh checkout. Package installation skips lifecycle scripts so it does not invoke that asset-dependent preparation. The test command skips `src/showtime/projection-sphere.test.ts`, `src/showtime/projection-haze.test.ts`, `src/showtime/installation-sway.test.ts`, and `src/showtime/installation-access.test.ts`, which read those same files. CI therefore reports the remaining cockpit source-test coverage only and does not claim a production build or model verification.

The PostgreSQL fixture waits for loopback TCP readiness before running TCP
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
