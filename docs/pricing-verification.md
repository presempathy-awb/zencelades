# Pricing and B2 delivery evidence

Observed on September 30, 2026, from maxipaxi. This records P002 delivery and
does not claim that the separate PG18/Pawthentik rollout is complete.

## Pricing and site

- Eight concept layouts and 64 editable allowance rows are in
  `site/pricing/options.json`. The page adds projector hire and optional external
  capture separately, handles credit/contingency/tax, and exports JSON.
- Direct Node execution returned exit 0: eight baseline ranges match worked
  literals; the built no-JavaScript table agrees with the browser module's
  arithmetic; five discount/capture/credit/tax scenarios and six invalid-input
  cases pass. This executes the calculator, not browser interactions.
- Ruff format/check for the three changed Python helpers passed, exit 0.
  `impeccable detect --json` over the bounded pricing HTML/CSS returned `[]`,
  exit 0. All text/accent colors against both dark surfaces have computed
  contrast of at least 9.72:1.
- `just site-build` and `just deploy-site --host presvd1 --apply` exited 0.
  All 167 staged release files passed hash verification. Release:
  `a5dcb62cf3cc736af9fceb6155810463b454add33b1ef0886230a248ed04ef87`.
- Independent trusted-HTTPS reads verified **all 164 served files**, totaling
  **77,487,910 bytes**, against the deployment manifest. This includes all 132
  original/extracted downloads, their attachment headers, pricing HTML/JS/CSS,
  baseline data, research Markdown, catalog and B2 receipt. The existing naming
  files were carried through unchanged by this pricing work.
- The pricing route returns 200 over IPv4 and IPv6, with TLS verification 0.
  The public origin returns 403 with spoofed X-Forwarded-For/X-Real-IP headers.
  The `.mjs` response has `text/javascript` and the existing CSP/nosniff headers.

## Archive and preservation

`just archives-b2 <verified-telpher-checkout>` planned without reading secrets.
Two `--apply` runs exited 0. The second retained the first B2 file ID; each
read back all 15,283,642 bytes and matched SHA-256. The bucket is private and
has no lifecycle rules. Object Lock visibility is unavailable to this key; no
enforced retention duration is claimed. The full receipt is
`assets/b2-archive-receipt.json`, and the storage explanation is
`docs/b2-archives.md`.

`just assets-catalog` exited 0 with 132 exact original/extracted files,
61,416,414 bytes, seven uploads and 125 ZIP members. Original PDF, workbook,
images, video, ZIP and individual extracted files retain their original bytes.
Only ZIP archive placement is added; no existing lakeFS version was changed.

## Limits

Browser interaction is pending Andrew's explicit scoped consent under the
supplied AGENTS.md. No screenshot, click-through, export-download or rendered
layout acceptance is claimed. Pytest remains paused at Andrew's request.
The Caddy activation logs include its existing formatting warning and an initial
connection refusal during the bounded restart poll; activation and subsequent
complete HTTPS readback passed. No source failure was hidden by that retry.

A fresh `hid-in gunlock-status` on presvd1 returned exit 4, locked at the vault
gate. Independent PG18 and Pawthentik provisioning remain separate pending work.
