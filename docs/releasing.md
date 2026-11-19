# Releasing to the live site

Written 2026-11-16 after the logo release. It records how a release reaches
https://zenceladus.com/ and what went live that day. Earlier releases have their own
records: [public pages](public-pages-release.md) and
[private studio](private-studio-deployment.md).

## Build from current main

**The release tool publishes the app as built in the folder it runs from.** A checkout
or lane that is behind main would put an older app live, so since 2026-11-19 the tool
refuses one: before any call to the host it reads the forge's `main` with
`git ls-remote origin` and stops unless that commit is in the folder's history (`HEAD` in
a git checkout, the working-copy commit in a jj lane). The plan names the main it checked
as `source_main`. A scratch copy with no git history is refused too, unless
`--unverified-source` is passed, and the plan then says `unverified`. The check covers the
folder's history, not the build output: `cockpit/dist` must still be rebuilt from it.

After 2026-11-16 this matters for the logo. A folder that predates
zencelades `feat/logo` (#39), `fix/logo-in-bundle` (#40) and `fix/logo-credit` (#41)
would remove the logo from the live site and return the open-source page to its old
text. On that day the main checkout on maxipaxi was five commits behind main, and every
remaining lane under `~/code/branch/thatsnozorb/` predated the logo.

Before planning a release:

1. Bring the folder up to `origin/main`, or rebase the lane onto it.
2. Install from the lockfile: `bun install --frozen-lockfile` in `cockpit/`. An old
   `node_modules` builds with old tools without saying so.
3. Run the plan and read `changed_paths` before applying. A plan that removes nothing
   can still replace the app with an older one: the paths are content-addressed, so an
   old build shows up only as changed bundle files.

## What a release carries

`just private-studio-release --host HOST` plans; `--apply` applies.
`just deploy-site --apply` refuses once a release exists on the host.

The overlay carries only:

- `site/dist/index.html` and each route's copy of it;
- `site/dist/studio-assets/*`, the cockpit's bundled code and assets;
- `site/private-studio/*`.

`deploy/private-studio-overlay.py` refuses anything else on the server. So whatever a
visitor needs has to be bundled by the cockpit build:

- A file under `cockpit/public/` is served at a fixed path and is not published.
  Reference assets from source so the build emits them into `studio-assets/`.
- Authored pages under `site/` are not published as files. The open-source and AI
  disclosure page is bundled for that reason (`cockpit/src/page-source.ts`). A page the
  build rewrites, such as Showtime, models, mounts, pricing or the proposal, cannot be
  bundled that way without also moving the rewrite.

## Running it

Two things did not work as the recipe assumes, from maxipaxi on 2026-11-16.

- **The plan timed out over the default ssh alias.** The tool pulls the live release's
  text files, 46 MB compressed that day, with a fixed 60-second limit. `--host presvd1`
  timed out. `--host presvd1-bulk`, the alias for bulk transfers, finished.
- **`--apply` cannot finish unattended.** It runs `sudo -n` on presvd1, and sudo there
  asks for a password. The server-side step was run by hand instead: the tool's archive
  and `deploy/private-studio-overlay.py` were copied into a
  `mktemp -d /tmp/zenc-private-upload.XXXXXXXXXX` folder on presvd1, and Andrew ran the
  overlay under sudo in his own terminal with the base, release and archive hashes from
  the plan. The overlay made the same checks it makes when the tool calls it.

A lane has no ignored assets. A scratch copy of the lane linked to the main checkout's
`source/` and `deliveries/` builds. On maxipaxi that day the main checkout had no
`source/research/enceladus-cinema/web/homepage-*` recording files, which the cockpit
build verifies; they were linked from the `backlog-completion` lane.

## Releases on 2026-11-16

| Release | Over | Built from | Changed | What |
|---|---|---|---|---|
| `d160379091d82154ef1505f76e6cfb97ffbfa0aac5615e6c687ae0977ce385b5` | `f796b7d93b79fdb5f64852c93a650e86b5f1e7603862416d110e83870a73ca58` | main `64dab25` | 82 paths: 14 shell pages, 65 bundle files, 3 private-studio files | The logo: icons, share card, header emblem, artwork lockup. Also the dependency pins from #35. |
| `de14478bc58a0cbe704c0e9bf073df86dcd28d7f6ae0ef255f2befa30a08e5d7` | `d1603790…` | main `1248f20` | 42 paths: 14 shell pages, 28 bundle files | The open-source page bundled, so its logo credit, AI note and licensing sentence are live. |

Neither release changed server configuration. Both prior releases remain on the host.

Checked after each: the live page head and the logo files over HTTPS, and the site in a
browser. After the second, `https://zenceladus.com/open-source/` showed the logo entry,
the NASA credit, the AI note and the licensing sentence.
