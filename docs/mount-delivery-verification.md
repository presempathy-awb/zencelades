# P011/P012 delivery evidence — September 30, 2026

The [mount comparison](https://thatsnozorb.muchadoaboutoneside.com/mounts/),
linked from [pricing](https://thatsnozorb.muchadoaboutoneside.com/pricing/), is
deployed. Both infrastructure PRs are open with green CI; required Grok review,
merge, broker deployment and research upload remain outstanding. This is not
a claim that the shared Much Ado/PG18/Pawthentik stack is complete.

## Research and preservation

The [technical brief](mount-options-research.md) covers five truck layouts,
aerial-rig geometry, attachment/load paths, tree assessment, wind sensitivity,
standards editions, support-only costs and a bounded quotation brief. The
[register](../assets/mount-sources.json) has fifteen primary references and
explicit edition, currency, price and access limitations. Numerical examples
were recomputed; they are explanatory scenarios, not structural acceptance.

Two newly preserved manufacturer PDFs have 13 pages and 1,904,787 bytes.
Their signature, page counts, lengths and SHA-256 values were checked; the
crane load-chart page and receiver-kit drawing were visually inspected.
The three X-POLE original-file requests returned HTTP 403. Search/web reads
are source evidence but do not create preserved originals. No bypass was used.

Together with P009, the separate upload plan now contains **six PDFs,
109,333,180 bytes and 506 pages**. Every planned local digest was rechecked.
This is an inventory count, not a claim of close reading of every page.
The original 132-object lakeFS import and private B2 ZIP receipts are intact.
No research commit or successful-upload receipt has been fabricated.

## Site deployment

Final release:
`f3da87689653ea2bfcdfbe2ef0f05e913fe522c5c8a3cc5185d9a9e850dd6b4a`.

The ordinary full-site recipe would have included concurrent local naming
changes. Instead, a bounded operational overlay started from the verified
current immutable live release, checked all 182 base entries, and allowed
exactly five publication paths: the mount page, mount source register, two
technical briefs, and the single new pricing link. Its source release was
rechecked immediately before activation. All 177 other entries remained equal.
The pricing page was accepted only if its entire difference was the new link.

The existing `deploy/activate.sh` verified all staged hashes, validated Caddy,
activated the content-addressed release and confirmed service/homepage health.
It retains the previous release and unit backup for rollback. The loopback
listener briefly refused the first readiness probe while restarting; the
bounded readiness check recovered and activation exited **0**. Existing Caddy
formatting and loopback-HTTP warnings were recorded; public TLS terminates at
the existing edge and was separately verified. No other service was restarted.

Final HTTPS reads matched the complete bytes of all five publication files
and all nineteen existing naming files. Both tailnet IP families returned
trusted HTTPS 200 on the no-port hostname. Public-origin requests, including
forged tailnet/identity headers, returned 302 to Authentik. This is not a fresh
browser login or a test from every tailnet node. Receipts:
[deployment](../assets/mount-deployment-receipt.json),
[access](../assets/mount-access-receipt.json).

## Browser acceptance

P012 explicitly approved a visible in-app browser for this site's read-only
mount/pricing/document check. Codex opened the deployed page without a login
prompt, clicked through to pricing and back through its new mount link,
followed the aerial-rig and tree section links, and visually inspected the
narrow browser view. Both technical links downloaded their Markdown files;
they are downloads, not rendered document pages. Full byte comparisons of the
browser downloads passed after the final publication. The mount page remains
open as the deliverable. No account, form, estimate, favorite or other project
state was changed. Authentik login remains outside this check.

`impeccable detect --json site/dist/mounts/index.html` ran on maxipaxi, exited
**0**, and returned `[]`. This advisory result is not a responsive-device matrix.

## Publisher delivery

- [hesellsheshells `feat/thatsnozorb-publisher` (#65)](https://git.telpher.stream/awb/hesellsheshells/pulls/65)
  at `5fd906586bd4b08c8e07f9d19fa57b155e0553b5`: scoped principal plus a
  fail-closed prefix-limited REST surface. The old path-only policy was shown
  to permit body-selected and unfiltered operations, so the patch includes
  behavioral policy/broker regressions. Full owner `just check`, race checks,
  and both forge CI contexts passed. Local full checks required the repo's
  Go 1.26.4 binary/GOROOT and a short TMPDIR; environment failures before that
  successful run are not suppressed code failures.
- [Telpher `feat/thatsnozorb-publisher` (#554)](https://git.telpher.stream/awb/telpher/pulls/554)
  at `ba8876c43bc667ac9490d0611b58106ef9767b96`: optional hid-in declaration and
  explicit broker-container environment binding. TOML and uninterpolated
  compose validation passed; all thirteen forge CI contexts passed. The local
  fully interpolated example config lacked an existing required Huly password,
  so it is not reported as live-secret validation.

Both changes are queued through review-scout for required Grok review, using
the official subscription CLI and bounded context. No review verdict, merge
or broker rollout is claimed. A probe of the peer host found its review slot
occupied as well; the requests remain in the original host's queue. The app's
PR-attachment tool rejected these Gitea URLs, so the verified links are retained
in the documents and PR bodies rather than falsely claiming app attachments.

## Research uploader readiness

`just research-upload` consumes the separate research plan and writes separate
staging/success records. Plan mode verifies local bytes and does not connect.
Apply mode requires the named scoped token, refuses redirects, probes three
policy refusals, creates a fresh ingest branch, records staging, uploads exact
bytes, commits, checks the complete listed object set, and reads every object
back by immutable commit before issuing a success receipt. It never merges
main and refuses an existing execution record rather than overwriting history.
Partial execution requires inspection of its retained staging record.

On maxipaxi, the declared recipe's plan exited **0** for all six originals.
Ruff check and format check passed. `python -m unittest discover -s tests -p
test_research_upload.py` under Python 3.12 exited **0**, four integration tests
covering success/retry, six refusal/readback variants, five local-tampering
variants, and plan-without-token behavior. These use a synthetic loopback
server; they are not live broker evidence. Pytest and the project-wide suite
remain paused at Andrew's request.

The root-directory-symlink fixture first failed, exposing that resolving the
allowed root itself could admit a redirected research directory. Comparing the
source's real path to the fixed research directory beneath the real project
root corrected that boundary; the same fixture then passed with the others.

After review/merge, the next steps remain owner-scoped token provisioning,
broker-only recreation, real policy probes, six-PDF upload and immutable
readback. A general hid-in unlock does not manufacture a durable project grant.
No token was printed, copied from another service or substituted with an admin
identity. The prior shared-stack and physical/venue approval gates stay open.
