# P148 — Close the consolidated Zencelades backlog

Andrew, October 5: “get the backlog done”; use Luna for routine CI and review coordination.

## Execution plan

1. Preserve main `007e5b92981ff1eaa0607992d0c3f04796a47ed6`, deployed defaults and historical dirty work. Work in the isolated backlog-completion/main lane.
2. Close reproducible asset, source-check, security and scoped upload-client gaps. Luna handles bounded CI and PR reconciliation; Codex verifies integration.
3. Prepare account deployment and immutable preservation candidates. Activate through owner recipes and scoped human credential approvals.
4. Research a free skeletal character without replacing Andrew with an unrelated body. Distinguish rig proof from visual acceptance.
5. Reconcile remaining source, physical equipment, private integrations and event/provider gates. Keep unfinished work explicit.

## Completed local work

| Area | Result and evidence boundary |
| --- | --- |
| Retained assets | Catalog-driven restoration validates paths, sizes and hashes before copying; refuses links, changed destinations and conflicting records; stages and publishes exclusively. 201 missing files restored into this lane; originals untouched. Sonnet's checkout-name and malformed-record findings reproduced before repair, including a one-byte boolean length. Fresh plan validates 628,432,773 bytes with zero missing files. Publication is per file and retry is idempotent. |
| Scoped clients | Research metadata is a required denial probe. A scoped successful listing on main now precedes records and mutations, so a revoked token cannot strand a retry record; regression observed red/green. Separate model/v4 executors enforce fixed scopes, separate records and full immutable readback; v4 ZIPs and invalid inputs fail before HTTP. Loopback integration passes; no real upload. |
| Publisher packet | `~/.cache/codex/zencelades/p148-publisher-candidate` contains 151 frozen objects, three plans and four modules: 158 files / 235,090,949 bytes individually verified after refreshing the repaired client. Plan-only clients exit 0: research 14 / 138,490,200 bytes; model 55 / 83,269,533 bytes; v4 82 / 13,257,184 bytes. Frozen models remain separate from the newer runtime build. |
| CI and security | Gitea workflow covers Python, asset-independent cockpit checks, secret/vulnerability scans and isolated PG18 persistence. Existing Go advisory GO-2026-5970 repaired with x/text v0.39.0 and required x/sync update. Hosted run 15206 failed on missing Ruff/Gitleaks tool selections and Docker CLI; scans did not execute. The repair pins those tools in mise, keeps pinned tools ahead of competing binaries in child shells, and uses a job-owned PG18 service instead of requiring a Docker CLI. Repaired hosted execution remains pending. Four asset-dependent cockpit files are explicitly excluded in clean-checkout CI. |
| Secret detection | Exact documented digests are allowed only by the generic-api-key detector at their exact paths. Real CLI fixtures reject other values and paths. Failing fixtures exposed a global path bypass and a component-prefix near miss; detector-specific and path-boundary repairs pass without disabling detectors. |
| Full build and serving | Native model/SPA/privacy and static builds exit 0; homepage recording matches current source. 145 native tests / 41,237 assertions; 31 models verified; 216 downloads byte-verified. HTTP verifier confirms 309 studio files and six legacy routes at concurrency six. Default 256-request burst failed with refused connections; cap-six retry passed. No interactive browser check. |
| Account candidate | Linux/amd64 binary and unit prepared; installer and SQL migration plan run without applying. A fresh persistence rerun exposed socket readiness accepting the temporary initialization server before its shutdown. A cold-initialization regression failed before the fix; loopback TCP readiness now waits for the final server. Fresh race, vet and isolated PG18 checks pass. Candidate hashes and live gates recorded in account-deployment.md. |
| Rig research | Free CC0 Quaternius original and packed 65-bone GLB retained. Native Babylon AnimationGroup demonstrates finite CPU deformation and exact reset with materials skipped. No clips, personalized likeness, seated-fit acceptance or runtime replacement. Original, model and license also copied into the declared Codex volume. |
| PR reconciliation | Fresh forge/source snapshot records absorbed, diverged and stale residuals. No existing PR closed, merged, commented on or provider-reviewed. |

Fresh `mise exec -- just check` exits 0: **93 tests plus 30 subtests**, Ruff and grant-ledger validation. The pinned Go race tests and vet pass; the latest local PG18 fixture stalled at Docker container startup and was interrupted, so its earlier successful persistence run is not a rerun of this revision. Trivy finds zero high/critical vulnerabilities in three dependency manifests; its configuration command exits 0 but recognizes no targets. Gitleaks fixtures and integrated redacted scan pass with the documented 5 MB file ceiling. Existing large Vite chunk warnings remain visible. No UI code changed in this delivery.

## Remaining gates

| Work | Current state and required evidence |
| --- | --- |
| Source delivery | Andrew authorized publication and Sonnet review on October 5. [zencelades feat/backlog-completion (#28)](https://git.telpher.stream/telpher/zencelades/pulls/28) is open. Sonnet returned PASS at 2aa6123f and again at 30fdebb0 / base 007e5b92; the latter review is posted verbatim at comment 17032. Recovery and catalog findings were repaired with red/green checks. Subsequent CI repairs require a new full exact-head review and hosted checks; Luna coordinates both. Gitea recovered after an HTTP 502/SSH timeout outage. Policy-compliant landing remains pending. |
| Storage owner delivery | Broker PR65 merged; Telpher PR554 open at head `c5106437`, base `fb78eccd`. Older PASS names a different base. Needs exact-current review including credential-manifest behavior, owner delivery, narrow hid-in provisioning and broker recreation. Excluding hid-in.toml yields a partial review, not full security acceptance. |
| Immutable preservation | Broker bound only to presvd1 loopback; no declared Mac-to-broker route. Vault locked and examined grants stale. Needs scoped owner-host execution or reviewed broker-only transport, confinement probes, fresh branches and full immutable readback for three batches. Direct lakeFS/S3 tunnels are not publisher routes. |
| Production accounts | Actual table, six app-specific HBA rules, credential, unit and listener absent; public session returns 404. Needs owner HBA change/reload, scoped credential, migration, install/routes/Auth provider delivery and authenticated save/readback. Existing role/database must be preserved. |
| Visual and character acceptance | Existing procedural Andrew retained. Needs approved browser inspection, accurate likeness/clothing asset, natural clips/retargeting, fit and three-camera visual acceptance. Native skeletal clips do not require another animation plugin. |
| Older PRs | Source snapshot in pr-backlog-reconciliation.md. Residual intent requires hunk review before closing or landing; divergent blobs alone do not prove unique intent. |
| Sound and private inventory | Prepared prompts and historical inventory receipt retained. No Pacinman connector callable; no generation or purchases. Needs provider/billing and private-account scope where required, asset/licensing proof, current inventory readback and vendor quotes. |
| Physical installation/event | Concept and application acknowledgement are preparatory. Needs measured hardware, structural/electrical/access acceptance, quotes, fabrication and actual event decisions. Rendered geometry cannot establish these. |

## Status

Software preparation is published for review; repaired CI execution and the corresponding final-head review remain pending. The consolidated backlog remains open at production owner/credential delivery, visual acceptance, personalized character, provider/private-integration and physical evidence gates. No credential, upload, authenticated account save, fabrication, placement or award outcome is claimed.
