# Private studio verification and review response

October 2, 2026. This is source/build and isolated HTTP evidence, not a claim
that the private origin has been deployed or that a human login has passed.
Production remains on `a1d372323fe59d831f617136932e19fffa7737936c1f48351e744cc4ef4414c0`.

## Historical checks at `bd3cbb6070be`

The following ran in the `private-studio` lane on maxipaxi:

```sh
# maxipaxi
just private-studio-check
just check
```

- `private-studio-check`: exit 0; 59 Bun tests, zero failures; public and private
  Vite builds succeeded; all 24 prompt markers absent from the public build and
  present privately; eight Python boundary tests passed.
- `check`: exit 0; 69 pytest tests and 18 subtests passed; Ruff check/format passed;
  grant ledger matched the authored bill of materials and pricing options.
- Separate `ruff check` on `deploy/private-studio-overlay.py` passed. The common
  check recipe covers scripts/tests, so this installer check is recorded separately.
- Before the path/host fix, the new rejection tests failed in six cases because
  the planner attempted a further remote operation instead of rejecting input.
  After the fix the same tests passed. The overlay fixture proves hash rejection,
  cleanup after a partial copy, successful retry, prior-image preservation and
  unchanged live pointer; an existing target is never overwritten.
- Removing the new public-content rejection produced one expected assertion
  failure (`ValueError not raised`); restoring it passed all eight boundary tests.

The historical real-Caddy fixture ran on presvd1 (Caddy 2.6.2). Its retired fragment was
generated on maxipaxi by production `scripts.private_studio.retired_config`,
then copied with the probe and production private-host fragment to `/tmp`.

That earlier invocation at `bd3cbb6070be` passed `--retired` to the isolated
fixture. Its exit was 0: Caddy validation and all ten historical HTTP cases
passed. Public artwork
returns 200; `/studio/` and `/audio/` redirect; existing private downloads,
encoded paths and an existing retired JavaScript file return 404 on public/IP
hosts despite forged identity/forwarded-host headers. The private Host serves
its separate directory with private/no-store. This inner-server test does not
test edge authentication. Earlier removal of the production guard failed the
redirect case; restoring it passed. No production Caddy process was changed.

At `14efe517`, the replacement probe generated its deny fragment internally,
used distinct public/private fixture bodies and passed twelve HTTP cases on
presvd1. It was run as `uv run --no-project python -m
tests.private_studio_http_probe --fragment deploy/private-studio.caddy`, the
command declared by `just private-studio-http-check`; no `--retired` argument
was used. Later checks are recorded in [round two](private-studio-round-two.md).

Vite cleanout was separately verified by creating an owned sentinel
`cockpit/private-dist/removed-prompt-sentinel.md`, running the full build and
checking the sentinel no longer exists. The check exited 0. No source file was
deleted. Explicit `emptyOutDir: true` already implements this behavior.

The additive release dry run (`just private-studio-release --host presvd1`)
exited 0 against the current live manifest. The candidate retains every prior
manifest entry, retires ten prompt-bearing public URLs and overlays 57 paths.
The generated public bundle contains no current prompt markers. Retired files
remain on disk behind 404 rules to preserve immutable history, not as public
downloads. Prior deny rules are retained when prompt text later changes.

## Review round 1 disposition

The full Grok HOLD was posted verbatim on zencelades `fix/private-studio` (#11),
[comment 14255](https://git.telpher.stream/telpher/zencelades/pulls/11#issuecomment-14255).

1. **Caddy ordering: disputed with runtime and primary-source evidence.**
   The review says `file_server` precedes `respond`; Caddy's actual default
   order places `respond` before `file_server`. See the official
   [directive order](https://caddyserver.com/docs/caddyfile/directives#directive-order).
   The deployed Caddyfile has no `try_files` or custom ordering. Both the real
   fixture and planned full config keep the outer `file_server`. Existing
   denied files on disk returned 404 in the ten-case test. No handler rewrite
   is needed to correct a behavior that is already proven.
2. **Marker drift and contaminated build: fixed.** Build/release share
   `private-markers.ts`, which calls the actual studio parsers. The planner
   scans public bytes and rejects prompt content before creating a release.
3. **Paths, archive race, partial staging and timeouts: fixed.** Canonical
   relative paths are validated before remote reads; uploads use a unique
   private directory; parsing uses the same bytes whose hash was verified;
   incomplete copies clean only their owned temporary directory. SCP, SSH and
   activation have bounded timeouts. Completed release material is preserved.
4. **Membership: an operational gate, not a missing TOML field.** Telpher's
   `desired_from_contract` reads provider/name/host/flow fields only. Its
   supported access tool is separately responsible for groups and bindings.
   Adding fictional group keys to this TOML would do nothing. Apply provider,
   copy approved crew through `app-users`, run `app-access ... restrict --apply`,
   then require `app-access-check` success and signups-off state before adding
   the domain route. Implicit consent is not authorization. This is the existing
   Telpher app-access protocol, not a new project permission system.
5. **HTTP test linkage: fixed.** The probe now consumes the actual generated
   retired fragment, validates the combined Caddyfile and makes real requests.
   A separate declared recipe exposes this test without silently requiring a
   remote host in the local build check. Preserved historical bytes are tested
   as denied; only newly built public files must be free of prompt markers.
6. **Evidence and approval: clarified.** Commands and results are separated
   above. P119 records Andrew's exact browser approval and its bounded scope;
   P120 records the approved existing crew. Neither authorizes human MFA/grants
   on Andrew's behalf.
7. **Marker counts/filter: fixed.** Markdown files only; eight music prompts,
   sixteen effects required; the missing-content error names both categories.
8. **Vite cleanout: disputed and experimentally verified.** Vite honors explicit
   `emptyOutDir: true` outside root; the default is conditional. See
   [Vite build.emptyOutDir](https://vite.dev/config/build-options.html#build-emptyoutdir).
   The sentinel check above passed. A redundant manual deletion is unnecessary.
9. **SSH-option host input: fixed.** Only a hostname/SSH alias is accepted;
   leading dashes and option strings fail before any remote command.

## Operations chronology — October 2, 2026

The clean Telpher `studio-private-ops` lane uses source `645d97fd`. Initially, read-only
`app-status thatsnozorb` confirmed restricted crew membership and signups off.
The provider-state read via `authentik-forward-auth-state state` succeeded;
the studio application did not yet exist. The actual
`domain-add-subdomain zenceladus.com zenceladus studio` dry run with target
`http://127.0.0.1:18131` and `--forward-auth` passed using the existing zone token.
No provider or DNS mutation occurred during those initial reads. The unrelated
`concierge.yml` read-permission warning did not fail the target route preflight.

Later the same day, P122 applied the supported provider contract, attached the
outpost, copied the seven approved crew members with `app-users`, and restricted
the application with `app-access`. `app-status zenceladus-studio` and
`app-access-check zenceladus-studio` then confirmed restricted membership,
signups off, all seven members allowed and the checked nonmember refused.
P125 freshly repeated both reads after Andrew's project unlock. These are live
identity-provider changes. DNS, the website route and the asset release have
not yet been activated by this task. The earlier absent-provider observation
is historical and must not be used as the current application state.

The real live activation script accepts `RELEASE --apply EXPECTED_BASE_PATH`,
locks `/srv/thatsnozorb/activation.lock`, validates the complete immutable
release, checks the expected pointer and has rollback. Its SHA256 was
`3b5b317d6ffda8bea9efcc315ed134c66c9cd385d4a2e70e8d30708aa6c4dae1`.
The overlay retains and calls that script; it does not deploy the older
activation script in this source lane. No one may treat isolated Caddy tests
as proof of this live authentication boundary: anonymous HTTP, membership
policy and the approved browser flow still need post-deployment verification.
