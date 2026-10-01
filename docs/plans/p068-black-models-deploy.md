# P068 — Black 3D images and deploy each fix

Andrew: “cant see the 3d images all black :( keep push deploying after every fix make sure to https://zencleades.com/”

1. Reproduce the black images/viewer and inspect current serving bytes and routes.
2. Confirm the exact requested hostname against the configured and owned domain;
   earlier ownership is recorded as zencelades.com, a different spelling.
3. Fix the demonstrated cause, verify locally, then publish each verified fix
   through the existing deployment path while preserving concurrent releases.
4. Verify live assets and visible rendering; report domain or publication gates
   explicitly. Preserve all previous plans and keep pytest paused.

Deployment after each verified fix is authorized for this repair. No domain
purchase, unrelated route change or access-policy widening is implied.

## Current outcome

The repair was deployed again after a concurrent release removed the first fix.
Current repair release:
`59496114dbdc1205ad555b6ba8969c8103a4156022a004b4a2b01ac7e766aa6e`.
The exact-base overlay retained all 469 existing paths, restored the model
gallery/packet, updated the cockpit to the current occupied-holder build, and
removed the confirmed `zenceladus.com` hostname from a redirect to the older
spelling. 132 paths changed; all 131 public files passed HTTPS length/SHA-256
readback. Server-only Caddy config passed the activation manifest and validator.

Visible browser proof on the existing project hostname: current lander and
aerial-rig models render; switching models and Side/Reset work; gallery opens;
the previously broken size-options PNG visibly opens. Screenshots are
`~/.cache/codex/p068-rendering/live-aerial.jpg` and `live-size-options.jpg`.
The older deployed v4 archive selector produced a blank scene during diagnosis;
its underlying archive rendering issue is not repaired or claimed resolved.
The current active selector uses the occupied concept studies; original files
are preserved. Fresh `bun test`: 15 pass, 0 fail, 267 expectations.

The new domain returns HTTPS 200 through its authoritative Cloudflare address,
with certificate verification enabled and no redirect away. Ordinary Mac DNS
still returned a cached negative result. Browser navigation to the new hostname
returned ERR_BLOCKED_BY_CLIENT; no browser workaround or retry was attempted.
Visible browser proof above is on the existing hostname, not new-domain E2E.

P071 authorizes release coordination. The Showtime chat confirmed it had not
activated the intervening release, agreed to preserve the exact current base,
and received the verified repair release ID before its next scoped overlay.
The historical findings below describe earlier states, not the final domain.

## First repair deployed

The live `1e00037c` release had reverted to the older cockpit shell and omitted
`/models/` and the grant PNGs; both the gallery and size-options PNG reproduced
HTTP 404. The preserved P059 PNGs contain visible image detail locally.

Applied an additive repair through the existing release activation script:
`118acbb8496d543998d2b602b159025ba3b550387caabf04106bc91ba735e1d9`.
It preserves all 469 previous entries, adds/restores 50 explicit attachment,
gallery and teaser paths, and retains the previous release for rollback.
The activation checks validated the full combined manifest before switching.
Live HTTPS readback then matched all 50 repair files by length and SHA-256;
all PNGs decoded and had non-black image detail. Gallery and PNG both return 200.
Evidence and reproducible repair/readback scripts:
`~/.cache/codex/p068-rendering/` on maxipaxi.

This proves restored image delivery, not a resolution of an independently black
WebGL canvas. Expanded visible browser verification is awaiting Andrew's answer;
no login or account interaction is authorized by that scope.

## Domain findings

`zencleades.com`, as typed in P068, returns registry HTTP 404 and DNS NXDOMAIN;
Telpher's zone-token plan cannot see that zone. No purchase or route was made.

The previously confirmed owned `zencelades.com` now returns registry HTTP 200.
Google DNS returns Cloudflare nameservers rose/bjorn; the Cloudflare API reports
an active zone. Cloudflare's recursive resolver still returned cached NXDOMAIN.
Authoritative nameservers returned no apex A record. The earlier blanket
NXDOMAIN observation was incomplete because public resolvers disagree during
the transition. A public apex route to the existing loopback service was
rendered through Telpher's offline plan, but not applied pending the exact-domain
clarification. Existing public access and Authentik configuration were unchanged.

Deployment transport: configured SSH DNS failed, and the live tailnet address
timed out; the public origin address freshly read from DNS succeeded with the
existing presvd1 SSH identity. Certificate verification remained enabled for
public HTTP readback. No system DNS or SSH configuration was changed.

Pytest remains paused. Source PR/merge and the cockpit WebGL diagnosis are not
completed by this asset-only activation. Apply each subsequent verified repair
as requested, preserving the latest live release and checking for concurrent
deployment before activation.
