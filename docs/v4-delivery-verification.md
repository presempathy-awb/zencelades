# P018 v4 delivery evidence

Observed on maxipaxi/presvd1, September 30 local / October 1 UTC, 2026.

The exact v4 package is extracted, catalogued, verified in private B2 and
published as individual downloads on the existing HTTPS domain. The separate
interactive cockpit is built locally and awaits browser-scope approval.
The 82 non-ZIP assets still await the scoped lakeFS publisher.

## Live files

- [Six-page design review](https://thatsnozorb.muchadoaboutoneside.com/downloads/deliveries/enceladus_v4_fixed15/docs/Fixed15_Design_Review.pdf)
- [Original v4 ZIP](https://thatsnozorb.muchadoaboutoneside.com/downloads/source/versions/v4-fixed15/Enceladus_Within_v4_Fixed15_Project.zip)
- [Workbook](https://thatsnozorb.muchadoaboutoneside.com/downloads/deliveries/enceladus_v4_fixed15/budget/Fixed15_Demand_and_Parts.xlsx)
- [84-record catalogue](https://thatsnozorb.muchadoaboutoneside.com/v4-asset-catalog.json)
- [Inspected comparison](https://thatsnozorb.muchadoaboutoneside.com/documents/v4-fixed15-understanding.md)

## Preservation

`just assets-v4 --check` on maxipaxi exited 0: 84 records / 50,534,039 bytes,
83 exact ZIP members and 82 manifest checksums. The original still exactly
matches Downloads. The original 132-record v3 inventory is unchanged and all
124 v3 manifest entries still pass. Twenty v4 records share original v3 bytes.

`just archives-b2` with `--batch v4 --apply` exited 0 through the existing
Telpher/hid-in owner workflow. Full readback proved the new v4 archive and
the nested v3 reference; the latter retained its original B2 file ID. No
bucket, lifecycle, Object Lock or existing-v3 receipt changes were made.
See [the B2 receipt](../assets/v4-b2-archive-receipt.json).

The catalogue records every member's format, role, hash, length and matching
v3 paths. Six PDF pages were extracted and visually inspected, all five
workbook sheets read, and 13 demand cells/four JSON reactions/two historical
parts totals independently reconciled. No native Excel recalculation, bundled
script execution, pytest or physical acceptance is claimed.

## Additive release

Live release:
`09b9b6ffc2d3182d8736e07ff73efc7bbc5937c15cae872ab1f77b7df78b9bd2`.
Base:
`dda8a476bf7e616fd27ed70638da8b0ea2ab8c6fc6704d027b312de9721be465`.

The preflight verified all 185 base entries and admitted exactly 87 new paths:
84 downloads, the catalogue, the B2 receipt and the comparison. Every previous
entry remains unchanged, including current naming/access work from other chats.
The same exact-base check ran immediately before staging and activation.
No mixed local naming tree or local cockpit was published.

The first staging call stopped at the root-owned release directory with
PermissionError before creating its target. The retry used the existing
noninteractive sudo deployment path. It verified all 272 release entries,
validated the inherited Caddy configuration, retained the prior release and
unit backup, restarted only `thatsnozorb.service`, and passed its readiness
and homepage-integrity checks, exit 0. Caddy reported its inherited formatting
and loopback-HTTP warnings. The first readiness request was refused during
restart; the bounded poll then passed. No permission or security rule changed.

Trusted HTTPS readback matched all 87 additions, 20 existing naming files and
the homepage/pricing/mount pages. Downloads have attachment/nosniff headers.
The same no-port `.com` origin returns 200 over both IPv4 and IPv6, TLS
verification result 0. This verifies those two paths from maxipaxi, not every
tailnet machine or a fresh Authentik login. Existing access settings were
retained; another chat owns the ongoing login/IP-adapter work.

[Deployment receipt](../assets/v4-deployment-receipt.json) and
[release plan](../assets/v4-asset-release-plan.json) preserve the exact hashes.

## Local cockpit checks and pending work

On maxipaxi, `just site-build` exited 0, including TypeScript/Vite and verified
copies of 132 original plus 84 v4 downloads. Bun's complete cockpit suite
passed 4 tests / 23 assertions. The direct package-integrity unittest passed
valid, altered, extra and missing-file cases. Ruff and Biome passed. The new
test initially failed because its implementation did not yet exist.

The preview matched 139 studio files, six legacy routes and all 84 v4 downloads
over HTTP. These are byte/route checks, not browser-interaction proof. The
lazy Babylon scene retains Vite's 962.57 KB / 231.44 KB gzip chunk warning.
An optional fresh trimesh reload was unavailable in the bundled runtime;
no package was installed and no fresh CAD roundtrip is claimed.

The updated cockpit candidate is prepared against this asset-only live release
and keeps all 20 naming files. It remains unactivated. Andrew's supplied
AGENTS.md, “Computer control: explicit scope and go-ahead,” requires explicit
approval for the new reference-site/local-cockpit browser scope already asked.
No response has been received; this archive attachment is not that approval.

The owner publisher PRs remain open without review receipts:
[hesellsheshells feat/thatsnozorb-publisher (#65)](https://git.telpher.stream/awb/hesellsheshells/pulls/65)
and [Telpher feat/thatsnozorb-publisher (#554)](https://git.telpher.stream/awb/telpher/pulls/554).
The bounded Review Scout start exited 3 with Grok's one slot occupied. Complete
the required reviews, merge and broker rollout before executing the separately
prepared 82-file v4 and six-PDF research lakeFS plans. No broader credential,
review receipt, storage commit or merge was substituted.
