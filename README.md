# Enceladus Within / thatsnozorb

New package: [v4 Fixed15 intake and comparison](docs/v4-fixed15-understanding.md).
The exact ZIP and 83 members are preserved separately; all 82 manifest hashes
pass. The ZIP is verified in private B2; 82 non-ZIP files await the scoped lakeFS
publisher. [The v4 design review](https://thatsnozorb.muchadoaboutoneside.com/downloads/deliveries/enceladus_v4_fixed15/docs/Fixed15_Design_Review.pdf)
and all preserved files are live; [asset-only delivery evidence](docs/v4-delivery-verification.md)
records HTTPS readback. The local cockpit adds the v4 model and library,
explicitly unpriced; its browser acceptance and publication remain pending.

New research: [truck mounts, aerial rigs and trees](https://thatsnozorb.muchadoaboutoneside.com/mounts/),
[engineering and experience brief](docs/engineering-research.md), and
[large-reference storage continuation](docs/research-storage.md). Six research
PDFs / 109,333,180 bytes are verified locally; their scoped lakeFS upload awaits
the two owner PRs' required review and deployment. The new site pages and brief
downloads passed the approved browser check; [delivery evidence](docs/mount-delivery-verification.md)
separates that live result from unfinished publisher/shared-stack integration.

A project record, source-asset catalog and Much Ado web-module skeleton for Andrew's spherical art installation. Erebe supplies the hosting and preservation conventions. The current v3 design is unoccupied development; artist vision and approvals remain separate.

Live at https://thatsnozorb.muchadoaboutoneside.com/ with trusted HTTPS and no port: Tailnet sources and people sharing a freshly verified Tailnet device's public IP bypass login. Exact manual public IP entries also bypass login; other visitors use the restricted Authentik application. Only signed-in `awb` and `akadmin` can see or use IP management. See `docs/ip-access.md` for operation and current verification. The site includes all 132 individual downloads and the naming exploration. The inspected catalog includes verified immutable hesellsheshells lakeFS locators. The initial static service uses the existing Caddy binary while the shared Much Ado PG18/Pawthentik storage integration remains pending. Earlier route evidence is retained in `docs/site-access-verification.md`.

Start with `STATUS.md`, `docs/love-burn-research.md` and `docs/grant-draft.md`. The deep comparison in `docs/umesemu-lessons.md` maps Umesemu's provenance, creative review and release practices to this project's existing stack. The supplied design review and editable workbook are preserved under `source/uploads/`; the complete extracted release is under `deliveries/enceladus_v3/`. Those bytes remain ignored by Git and are inventoried in `assets/inventory.json` for individual lakeFS routing. The private shared conversation is excluded from public content.

## Existing commands

Naming experiments use the [reusable naming recipes](docs/naming-recipes.md): explicit palette and engine inputs, assisted review or Qwen 27 full-auto, resumable four-source research and scoring, local preview, and separate plan-first publication. The live naming collection and its saved favorites remain separate from new test runs.

Grant preparation has a curated library at `/grants/`, with official guides,
eight relevant works, a source register and an Enceladus proposal workshop.
The authored sources are `docs/grant-research-library.md`,
`docs/strong-art-grant-guide.md` and `assets/grant-sources.json`. Funding proof
and later exhibition/touring claims are documented separately.

Pricing alternatives are at `/pricing/`, with eight dry-land, unoccupied layouts,
editable line items and downloadable estimates. See `docs/pricing-alternatives.md`.
ZIPs now use private B2 archive storage; `docs/b2-archives.md` records the owner
workflow, version identifier and full readback proof. Existing lakeFS history
and all original files are preserved.

- `just assets-import <download-directory>` preserves seven supplied originals and validates the release before inventorying it.
- `just assets-check` checks the supplied manifest and exact release file set.
- `just assets-catalog` verifies every preserved upload/ZIP byte and writes role, format and receipt-backed lakeFS metadata.
- `just assets-v4` catalogues the separate flat-manifest package; `--check` verifies it without rewriting. `just archives-b2 <telpher-checkout> --batch v4` plans its ZIP storage with a separate receipt; `--apply` uploads and reads back.
- `just archives-b2 <telpher-checkout>` plans ZIP preservation in the existing B2 bucket; `--apply` uses hid-in, immutable copy and full readback. It adds no production dependency; rclone is the existing transfer tool.
- `just deploy-site --host presvd1` plans a verified static release; `--apply` stages and activates it, preserving the prior release.
- `just check` runs this project's ingestion tests and Python lint/format checks.
- `just site-build` builds the Vite/React cockpit at the local root, the original catalog at `/catalog/`, every individual asset download and selected media previews. It invokes the pinned Bun frontend build before assembling the Python-managed distribution.
- `just cockpit-check` runs the frontend's Bun scenario checks and TypeScript/Vite build; it does not run pytest.
- `just cockpit-dev` starts the local Vite developer server. The complete built-site preview also supplies the legacy pages and downloads.
- `just preview` serves the local build on an available loopback port and prints its URL. Archival downloads are attachments.
- `just assets-upload --endpoint <origin> --repo <repository> --branch <fresh-ingest-branch> --prefix <prefix>` prints the upload plan. `--apply` requires the scoped hesellsheshells publisher token and an already provisioned repository.
- `just research-upload --endpoint <origin> --branch <fresh-ingest-branch>` verifies and plans the separate research batch. `--apply` requires the scoped token, successful refusal probes and immutable readback; original import and B2 records are preserved.

P017 adds the requested React/Vite frontend: React Flow, Tailwind 4, a shadcn Button pattern, TanStack Router/Query and the reused Babylon rendering stack. Versions are pinned from Much Ado's current package manifest in `cockpit/package.json` and `cockpit/bun.lock`. Python helpers still use the standard library. The production server continues to serve static files; no new backend service or browser credential is introduced. See [the cockpit guide](docs/cockpit.md) for local versus deployed status, build commands and remaining verification. Full CAD rebuilds and hardware adapters are outside these checks; the original source package retains its own dependencies and licenses.

Planning continuity: `PLAN.md` is the current task index. `docs/plans/chat-prompts.md`
records Andrew's instruction to preserve every new prompt in this chat, the prompt
ledger and five resumable plans for the remaining stack, recipe and grant work.
Update the ledger and affected plan before substantive work on each new prompt.

The current project name is provisional. The naming exploration lives at `site/naming/index.html` and is included by `just site-build` at `/naming/index.html`, linked from the project footer. It includes the archived 144-word roll, the current 264-word palette, 20 invented proposals and three sets of 40 actual generated names (three words, four words and multi-mesh descendants). The form independently chooses word count and blend strength, records every join, supports submitted seeds and water-play roots, and requests 40 names per roll. Eight scores use adjustable normalized weights, initially 50% Codex preference. Favorites, Andrew's creations, forgotten names, earlier rolls and score edits persist in browser storage and can be exported; this is not cross-device sync. Current optional research uses Brave, GitHub, npm and .com. The original eighteen-source receipts remain in the earlier report. It is published at https://thatsnozorb.muchadoaboutoneside.com/naming/index.html. No candidate is selected or locked by this report.

`site/rooms.json` and `site/dist/` match the existing Much Ado module contract. Registration and isolated PG18/broker settings are implemented in Much Ado's separate `feat/enceladus-module` lane. The live service observations, proposed scoped policy, PG18 confinement rules and deployment sequence are in `docs/stack-rollout.md`. The static site and owner-managed lakeFS import are live. Scoped application credentials, membership and the shared Much Ado release remain pending. No grant has been submitted. Further pytest work is paused at Andrew's request.
