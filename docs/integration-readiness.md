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

The original lane and archival delivery copies remain unchanged. The earlier
`scripts/build_option_packet.py` still awaits separate source integration and
PDF verification. No reconstructed PDF or live attachment replacement is
claimed. Source recovery does not mean the account branch has been pushed,
reviewed or landed; preserve the remaining unrelated dirty work.
