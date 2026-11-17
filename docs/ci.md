# Continuous integration

Gitea Actions runs the repository's declared `just check` recipe, the cockpit's Bun source tests, and account-service race, vet, and PostgreSQL persistence checks on pushes to `main`, pull requests, and manual dispatches. Branch pushes rely on the pull-request event to avoid duplicate jobs. Cockpit dependencies are installed from `cockpit/bun.lock` with `bun install --frozen-lockfile`. The account job uses Go 1.26.5 and runs `just account-check`, the same recipe as a local run: it starts the disposable PostgreSQL 18 fixture in `account-service/test-postgres.sh` (no network, no published port, a 256 MiB tmpfs, a 600-second lifetime).

To start that fixture the job needs the runner's Docker daemon. It requires the host socket `/var/run/docker.sock`, which the presvd1 runner mounts into every job container, and downloads a SHA-256-pinned static Docker 29.8.1 client for x86_64. **Access to that socket is control of the host's Docker daemon, which is equivalent to root on the runner host.** So the account job runs only on pushes to `main` and on manual dispatch, never on a pull request (Andrew, 2026-11-16): only reviewed, merged code gets that access. Pull requests run the source and security jobs; run `just account-check` locally for a change to the account service. The fixture container itself has no network; the job does not have that limit.

The workflow and `mise.toml` pin the same Go, Ruff, Gitleaks and Trivy versions.
Run the recipes through `mise exec -- just ...`; the project enables
`activate_aggressive` so child shells retain those tools ahead of competing
system installations. This prevents a Go binary from one installation using
the compiler directory from another. The first hosted run exposed missing
Ruff/Gitleaks version selections and an unavailable Docker CLI; the pinned tools
and the job's own pinned Docker client address those failures.

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
