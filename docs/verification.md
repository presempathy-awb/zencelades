# Verification record — September 30, 2026

Andrew paused pytest work. The checks below are direct builds, format/lint,
configuration validation and live read-only observations. No new behavior suite,
browser workflow or full shared Much Ado/PG18/Pawthentik release is claimed.

## Current access update

P007 subsequently applied tailnet-or-Authentik access and split DNS. The
[access verification](site-access-verification.md) records normal hostname and
both mesh-family HTTPS 200s, public-origin Authentik 302 even with forged headers,
and earlier member/non-member policy checks. The later optional administrative
repeat found the project vault locked. PG18 creation is complete; HBA confinement
and per-person storage/shared-app integration remain pending. The older route
and unlock observations below are historical, not the current access policy.

## Initial applied catalog and preservation proof

The static catalog is deployed at https://thatsnozorb.muchadoaboutoneside.com/.
Trusted HTTPS returns the exact staged homepage over IPv4 and IPv6; DNS-only
A/AAAA point to the host's tailnet addresses. The public origin returns 403 even
with forged X-Forwarded-For/X-Real-IP values. The Traefik allowlist accepts the
full IPv4/IPv6 tailnet ranges using the socket source, plus loopback probes.
Every one of 132 HTTPS downloads passes expected size and SHA-256, totaling
61,416,414 bytes, with attachment headers and nosniff. Video ranges return 206;
encoded archival download aliases retain attachment headers. Earlier empty-body
200 responses were caught by content readback, fixed in Caddy's host matcher,
and followed by complete byte verification. No browser interaction is claimed.

Owner-managed lakectl created thatsnozorb-assets, applied and read back main
protection plus retention 365/1825 days, uploaded 132 individual files to
imports/2026-09-30 on ingest-enceladus-20260930T201112Z, and committed
95490407ec74af428a4630816c3dfae1b9cefb6a39c5f2fba19e62cb2d92f29d. Every immutable
object passed size/SHA-256 readback and the complete path set matched. Main was
not merged. The existing management credential stayed within the owner's
management process; neither website nor project upload helper received it.
assets/upload-receipt.json records the proof; catalog generation validates its
132 path/hash/size triples against the preserved local inventory.

Fresh direct inspection also decoded 31 PNGs, both 16-page PDF copies, both
seven-sheet workbook copies, all GLB mesh position arrays and the NPZ coverage
arrays. Coverage and load CLI JSON exactly match the saved release outputs;
the show CLI produces a 120-frame replay with stale-input fallback. Exact ZIP
comparison remains clean after removing only six bytecode files created by the
CLI check. No pytest, CAD rebuild, hardware acceptance or human trial ran.

The applied route/recipe is in Telpher's feat/tailnet-site-access lane, and the
static activator contains a documented SHORTCUT until shared Much Ado is ready.
The new recipe passes Ruff and default offline rendering; it is not installed
in canonical Telpher. Its shared renderer's five pre-existing lint findings
remain unchanged. At this checkpoint PG18 execution was blocked before SQL by
the human vault unlock; later creation succeeded as recorded above.

## Earlier observations below — superseded where noted

The remaining sections record the earlier local-only state. The initial absent
lakeFS repository, pending upload and pending DNS/TLS statements are superseded
by the applied proofs above. Shared app typecheck/startup and Pawthentik limits
remain current.

## Project build and asset integrity — maxipaxi

The fresh static build exits 0 and reports 132 byte-verified downloads and five
media previews. The ZIP extraction contains 125 files; its supplied manifest
checks 124 and excludes itself. The inventory totals 61,416,414 bytes across the
seven originals and 125 extracted files.

```bash
# maxipaxi
P=~/code/pres/make/thatsnozorb
(cd "$P" && uv run --no-project python -m scripts.build_site)
(cd "$P" && ruff check scripts)
```

Ruff exits 0 with all checks passed. Four authored TOML files parse through
Python's standard `tomllib`. Coroidinator draft validation, projection, target
listing and rendering exit 0; actual-project validate/check/plan-only sync also
exit 0, with zero managed targets. No generated files or global settings were
changed. Canonical forge identity is unavailable, so no identity-specific user
overlay was applied; no claim of full forge/CI onboarding is made.

The local preview is `http://127.0.0.1:49927`. Direct HTTP reads succeed: the
homepage answers 200, the film is `video/mp4` with 8,684,776 bytes, and an archival
HTML member downloads as an attachment with `nosniff` and its expected SHA-256.
The encoded `/downloads/` alias also retains the attachment rule. Browser
control was not exercised because Andrew's explicit go-ahead is pending.

The scoped publisher uploader's help and default plan exit 0. This application's
Bearer upload path has not run; its behavior tests remain deferred. The separate
owner-managed lakectl import has since completed and produced the verified
receipt described above. These are distinct credential and execution paths.

## Much Ado integration — maxipaxi

The isolated lane is `feat/enceladus-module`, at the path below. No changes were
made to Much Ado's dirty main checkout. A temporary link to its installed
dependencies was removed after the typecheck attempt; it is not in the diff.

```bash
# maxipaxi
L=~/code/branch/muchadoaboutoneside/enceladus-module/main
(cd "$L" && bun build server/index.ts --target bun \
  --packages external --outfile /tmp/enceladus-host-index.js)
```

This server bundle exits 0: 20 modules, 75.80 KB. It intentionally keeps
third-party packages external and does not prove those are installed. Biome
checks the five changed server files and exits 0.

The full `bun run typecheck` attempt exits 1 because existing installed
dependencies are missing: the private Telpher telemetry packages, PDF/font
packages and harfbuzzjs. Dependent implicit-type errors are also reported. No
error in the new module/broker/database lines was reported, but that is not a
passing full typecheck. An actual local host startup also exits 1 on the missing
`@telpher/zotel-js-elysia` import. No package was installed or replaced to hide
that limitation. The full release build and authenticated PG18/broker workflow
are unverified. The isolated lane remains local; no PR, push or merge occurred.

## Live read-only observations — presvd1

The existing Much Ado health endpoint answers `{"status":"ok"}` and its unit
is active. Both actual hesellsheshells viewer units are active. The broker's
REST health is healthy, with `crew_ask:false` and an unavailable S3 gateway due
to the platform access-key length. The viewer/broker health does not establish
Pawthentik per-person authorization.

```bash
# presvd1
T=~/code/pres/scaffold/telpher
(cd "$T" && bin/pg18-app-provision thatsnozorb)
```

The existing provisioner's dry run exits 0, reports no errors, confirms the new
role/database are absent and prints six HBA confinement lines. It made no
mutation. The declared recipe and domain/app-access recipes were verified in
the live `just --list`; the tailnet-site route is now applied; PG18 and authenticated crew access remain pending.

Read-only lakeFS discovery returned 14 repositories and complete pagination;
at that earlier point none was thatsnozorb-assets, which the subsequent owner-managed import created. No project-scoped broker principal exists in the
current policy. The remote hesellsheshells readiness wrapper could not run in
the non-login SSH environment because `go` was unavailable; its full readiness
gate is not claimed. A guessed unit name answering inactive was superseded by
the actual unit inventory; only the actual viewer units are reported here.

## Still unverified

Exact art-grant clock time/timezone and live form fields; browser layout and
interaction; the future scoped application upload path; PG18 confinement;
Pawthentik membership and revocation; public release selection; authenticated crew
routes; shared Much Ado production release. The design review is source evidence and does
not verify the real rig, projector coverage, occupancy or site permission.

## Review-helper limit

The peer-review skill's MCP calls failed before review because its process did
not detect a current vendor. The direct CLI with explicit Codex routing reached
the account but exited 1: its default deep model gpt-5.6 is unsupported. No peer
PASS/HOLD, PR or merge is claimed. The new route recipe's independent direct
checks pass: offline render, refusal of non-loopback and edge-loop targets,
long challenge-label bounds, trusted TLS on both IP families and public-origin
spoof rejection. A valid review remains needed before landing infrastructure.
