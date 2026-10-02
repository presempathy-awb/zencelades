# Private asset studio and Pawthentik handoff

Implementation is prepared; production protection is not yet claimed. The
current live release is `a1d372323fe59d831f617136932e19fffa7737936c1f48351e744cc4ef4414c0`.
The production studio hostname was absent at the October 2 verification.

## Access contract

| Surface | Intended access |
| --- | --- |
| zenceladus.com, artwork, gallery, model cockpit, Showtime | Public |
| Public cockpit audio entry | Sign-in link; no embedded prompt contents |
| studio.zenceladus.com and every path beneath it | Authentik session plus explicit studio membership |
| Public /studio/ and /audio/ document URLs | Redirect to the protected studio |
| Public /documents/audio/, /private-assets/ and retired prompt bundles | HTTP 404, including direct IP requests |
| Account-owned PG18 saves | Separate account-service deployment; not delivered by this change |

Like Umesemu's private bench, the studio has a separate origin and a backend
host boundary. Traefik performs Authentik forward authentication. The inner
Caddy server remains bound to loopback and serves `site/private-studio` only
for the studio Host. Public hosts cannot select that directory through an
X-Forwarded-Host or identity header. The backend's Host check is not an
authentication system: preserving the loopback bind and gated edge route is
part of the deployment contract. Tailnet reachability is not studio membership.

The private Vite build has no public asset directory. It contains the eight
Suno songs, sixteen ElevenLabs effects and their source downloads. The public
bundle retains navigation only. A build-time scan rejects prompt content in
the public output. Old immutable release files are preserved for rollback;
their public URLs are denied by the generated Caddy fragment. Later releases
retain prior denied paths even when the current prompt text changes. Private responses
carry `Cache-Control: private, no-store` and `X-Robots-Tag: noindex`.

These prompt sources were previously published in the public website and public
Git repositories. Restricting this website cannot retract downloaded copies or
make that existing repository history confidential. Do not add secrets to the
source. Future private user content belongs in an authenticated storage service.

## Authentik fallback

Pawthentik was inactive on presvd1 at inspection. Use the existing Authentik
identity service now, with application `zenceladus-studio` and the desired
provider in `deploy/authentik-studio.toml`. The studio entry leads to Authentik's
forward-auth flow. It does not claim a running Pawthentik service or introduce
a second password store. Signups stay off. Resolve Andrew's existing identity
from the approved application membership; do not guess usernames or IDs.

Provisioning order is security-sensitive: create the provider/application,
copy the approved existing project crew, restrict the application, verify member/nonmember
policy, then publish the hostname. The provider TOML has no membership fields:
Telpher manages access separately through `app-users` and `app-access`.
Provider configuration alone is never evidence of restricted access.
Telpher's default application openness must
never become the deployed studio policy.

Use Telpher's existing `authentik-forward-auth-state`/`apply`, `app-users`,
`app-access`, `app-access-check`, `domain-add-subdomain`, `route-auth-probe` and
`edge-cache-purge` recipes. The domain route targets the existing loopback
server and uses forward authentication. Credentials remain in hid-in.
The clean Telpher operations checkout initially required Andrew's fresh
manifest grant. The subsequent Authentik API read succeeds, and the real
domain/route dry run passes with the existing zone token. This proves readiness
for those operations, not completed provider creation or route activation.

## Release and verification

`just private-studio-check` runs all cockpit tests, both frontend builds, the
public-content scan and the release-boundary unit tests. A real-Caddy fixture
in `tests/private_studio_http_probe.py` exercises public and private hosts,
download aliases, encoded paths, retired bundles and forged headers without
touching the live service. `just private-studio-http-check RETIRED_FRAGMENT`
runs this separate Caddy fixture on a host with Caddy installed, using the actual
`retired_config` output. It is not an implicit network step in the local recipe.
Fresh command-by-command evidence and review responses are recorded in
[private-studio-verification.md](private-studio-verification.md). These checks
are not live login proof.

`just private-studio-release --host HOST` plans from the actual live manifest.
Only `--apply` publishes. The overlay preserves every existing entry, media file,
service unit and unrelated route; it replaces the SPA entrypoints and generated
frontend code and adds the private build plus guard fragments. Activation uses
the live release's shared lock, expected-base comparison and rollback path.
Re-plan if another publisher changes the active release. Do not use the older
complete-site publisher to replace an active release assembled by other lanes.

The planner validates manifest paths before asking remote tar to read them,
uses the studio's own prompt parsers, and refuses contaminated public builds.
Upload staging uses a unique mode-0700 directory. The installer hashes and parses
one immutable archive snapshot, stages under an owned temporary directory and
publishes the release directory only after verification. Partial copies clean
themselves up; completed releases remain available after an activation failure.
Network and activation calls have finite timeouts. A timeout is an uncertain
activation outcome: inspect `current` before retrying, never delete its target.

Before activation, provision restricted Authentik and the protected route and
validate the complete staged Caddy configuration. After activation, purge the
retired public bundle and audio URLs through Telpher's cache helper. Verify
anonymous requests to the private index, JavaScript and downloads never receive
their contents; verify nonmembers are refused; verify the public aliases and
literal-IP paths are denied; verify the public gallery and Showtime still load.
An authorized browser session must separately exercise copy/selection controls.

Rollback restores the previous immutable release and configuration. Because
that previous release exposed prompts, rollback is service recovery rather
than a privacy-preserving success; keep the studio edge restricted and report
that public prompt exposure has returned until a repaired release is active.

## Pawthentik migration plan

1. Bring Pawthentik online through its own reviewed deployment and verify its
   existing Authentik-backed project/membership contract.
2. Register this studio as a project and compare the desired member set with
   the restricted Authentik application; retain the same studio origin.
3. Move membership authority to the supported Pawthentik projection only after
   member, nonmember, removal and expired-session tests pass. Keep Authentik as
   the identity provider; do not weaken the current policy during the handoff.
4. Integrate the existing gimmesomepaw account flow for future authenticated
   editing and account-owned saves after the separate account service is live.
   Provider generation and Showtime audio switching remain deferred.

The current studio provides selection and copy-ready prompts. It has no new
generation API, provider credentials, automatic music playback or saved editing.
