# Remaining integration evidence — October 2, 2026

The account implementation is local at `96386f95`; public release
`9b6f2f7cc269a64aa17a166fde6d8e735fb3b16a8bed0e2af0195dec38b7252b`
is still active. This audit does not establish live account saving, inventory
editing, remote asset preservation or completion of the full prompt backlog.

## Account deployment

The service-only installer and acceptance packet are prepared in
[account deployment](account-deployment.md). A fresh presvd1 check reports
`locked (gate=vault)`. Andrew's interactive unlock, the pending high-tier
publication/review choice and account-browser scope remain outstanding.
No credential, provider, database, service or route was changed in this audit.

## Scoped storage publisher

The canonical repositories use the `awb` owner. Fresh forge reads found both
PRs open, mergeable and without a review receipt:

| PR | Head | Current base |
| --- | --- | --- |
| [hesellsheshells `feat/thatsnozorb-publisher` (#65)](https://git.telpher.stream/awb/hesellsheshells/pulls/65) | `5fd906586bd4b08c8e07f9d19fa57b155e0553b5` | `a504a17fd5f5ee873279c4830ad0c824c7164da1` |
| [telpher `feat/thatsnozorb-publisher` (#554)](https://git.telpher.stream/awb/telpher/pulls/554) | `ba8876c43bc667ac9490d0611b58106ef9767b96` | `645d97fdb061007316e9f7767b8c4ea5d7aa1e37` |

ReviewScout granted the existing hesellsheshells request a Grok slot. Its
review bundle was rebuilt against the current base, scanned without secret
findings and launched through the official read-only Grok runner with one
attempt. A started review is not an approval. Re-read the forge revisions
before posting or merging, and retain findings for verification.

The publisher lane's full `just check` passed on October 2: formatting,
`go vet ./...`, `go test ./...` and generated agent-guide parity all exited 0.
Some unchanged Go packages used cached test results. The initial invocations
failed because the `just` shim selected Homebrew Go 1.27.1 with the pinned
1.26.4 standard library. Direct inspection verified both pinned Go and its
compiler as 1.26.4; selecting the installed `just` executable directly with
that Go bin directory and GOROOT resolved the environment mismatch. No toolchain
pin or source was changed to obtain the passing result.

After the owner changes are reviewed and landed, provisioning and the broker
image rollout still precede project uploads. Follow
[research storage](research-storage.md); retain the original 132-object receipt
and create separate immutable readback evidence for later research, v4 files
and generated models. The vault unlock alone cannot supply the missing policy.

## Pacinman: supported connection and remaining authority

The existing private import receipt remains present. The earlier readback
documents 88 resources and 24 tasks in the approved Zencelades category of
Burning Man 2026. This audit did not re-read those 112 live records or mutate
them. The public variant catalog and scenario drafts are not live inventory.

Source inspection of `fas/pacinman` identifies these supported boundaries:

- `packages/pacinman-sdk/README.md`: use the framework-neutral SDK or its
  OpenAPI contract; avoid app, repository and retailer internals. A browser on
  another origin uses OAuth Bearer authorization and an exact allowed origin.
- `services/sync-server/packing-server.ts`: REST authorization verifies a
  bearer identity or the service's own trusted Authentik channel before
  establishing the tenant/user context. Workspace permissions remain in force.
- `services/sync-server/packing-mcp-auth.ts`: verification checks issuer,
  audience, expiry, scope, subject and required group through Authentik.
- `scripts/pacinman-mcp-server.ts`: the stdio import client is a producer
  identity with a workspace-bound token. It is not a visitor's authority.

The existing Zenceladus account verifier returns its authenticated subject and
username; it does not obtain a Pacinman OAuth access token. Merely signing in
to Zenceladus must therefore not enable a producer-backed inventory editor.
Private inventory must not be included in the public site build or anonymous
scenario response. Guest adjustments remain temporary scenario planning.

A bounded anonymous request to Pacinman's documented
`/.well-known/oauth-protected-resource/mcp` returned HTTP 403 on October 2.
That proves only that this request did not obtain public discovery metadata;
it does not diagnose the edge rule or prove authenticated Pacinman is down.
No alternative route, user cookie or producer credential was used to bypass it.

Next implementation needs the Pacinman owner to confirm the supported user
authorization handoff and permitted origin, then read only the authorized
project category and use version-fenced writes for selected records. Preserve
the current shared workspace, unrelated categories and other users' edits.
Installing the private TypeScript SDK is a separate production-dependency
decision; no dependency or owner configuration was changed here.

## Source preservation gap

The original triangle-projection lane had eleven authored `docs/build/` files
outside the committed account lane. They are now recovered in this lane with
historical banners, under a [current build-plan entry](build/README.md) that
keeps the later primary Love Burn proposal and common holder first. The old
overview is retained as `build/p059-overview.md`. Its LED allocation, modeled
dimensions and delivery claims remain explicitly historical.

The original lane and archival delivery copies remain unchanged. The recovered
`scripts/build_option_packet.py` now produces a separate local planning PDF and
inventory exports; [packet verification](build-packet-verification.md) records
the functional test, layout checks and boundaries. No live attachment was
replaced. Source recovery does not mean the account branch has been pushed,
reviewed or landed; preserve the remaining unrelated dirty work.

## Review outcome

Grok's [complete review](https://git.telpher.stream/awb/hesellsheshells/pulls/65#issuecomment-13965)
is posted verbatim: HOLD, medium, at the exact head/base above. The process has
finished; do not restart it as though its earlier empty output were a failure.
The reported documentation blocker comes from comparing the older head tree
with the advanced base: the fresh PR file list and merge-base diff contain
only seven feature files and exclude `docs/pnumbravow-papers.md` and
`docs/roadmap.md`. Those are not deletions in the PR's patch. Preserve the newer
base documentation when updating the branch for a full rereview.

The review also requests explicit path-normalization defenses, wildcard-scope
compatibility tests, extension/delete tests and clearer branch-protection
wording. Verify and resolve those findings in the broker owner's lane before
a new full-head review; no owner merge or broker deployment has occurred.

## Publisher review repair — October 2, 08:45 UTC

The broker lane now contains and has pushed `cc1367f9d8a9c76523a324f57625f3f05458ab6d`
to the same PR #65. It incorporates current main without changing the newer
pnumbravow or roadmap documentation. Prefix-scoped keys reject decoded dot
segments, backslashes and empty segments; listing prefixes retain one trailing
slash. Additional cases cover extension scopes, single-object deletion and
wildcard copy/merge/S3 compatibility without removing repo/ref/operation limits.
The runbook explicitly states that this principal has no ingest-only ref limit
and upstream main protection still applies.

The focused policy and HTTP tests failed before the fix and passed after it.
Full pinned-Go `just check` and fresh `go test -race ./... -count=1` exited 0.
Trivy and the three ast-grep policy tests passed. The security recipe's Gitleaks
step reported a missing `.git` directory and scanned zero commits, despite its
zero exit code; explicit shared-backend and complete-lane scans subsequently
passed, with 3.47 MB inspected by the directory scan. That recipe limitation is
recorded on the PR, not treated as a successful default scan.

Review Scout granted the rereview slot. The rebuilt full-head review bundle
passed Gitleaks; the prior HOLD was retained as `prior-blockers.md`. The new
single-attempt Grok runner started with PID 91084. No new verdict is available
at this checkpoint: `final-out.md` still belongs to the previous held head and
must not be mistaken for this review. No merge, provisioning or deployment has
occurred. Account approval and browser-scope decisions remain pending.

## Publisher rereview result — October 2

The full rereview and conclusion finished with PASS for head `cc1367f9` and
base `a504a17f`. Grok's verbatim report is
[posted on publisher PR #65](https://git.telpher.stream/awb/hesellsheshells/pulls/65#issuecomment-13969).
The helper freshly checked head and base before posting and closed the queued
review request. Two should-fix findings remain for source verification and
disposition: limiting publisher writes to an ingest ref, and regression coverage
for omitted-prefix scopes loaded from configuration. PASS is not a merge or
deployment receipt; neither owner PR has been landed by this continuation.

The current project release is `e0cbad5a`, the lander with inside phones.
[P108](plans/p108-lander-inside-phones.md) records its scoped publication and
browser checks; [P109](plans/p109-later-prompts-win.md) records that later Andrew
prompts take precedence. The application drawing repair is retained in the
public source lane as well as the account lane. Account installation and
authenticated browser acceptance remain outstanding.
