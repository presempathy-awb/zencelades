# Integrated review repair and evidence

October 2, 2026 (October 3 UTC). This is the repair of the integrated review at
`a4583d881611ebbb8489824bd6a96fb4b011ec30`, not a production deployment receipt.
The complete Grok review is preserved verbatim in
[zencelades `fix/visible-controls` (#13), comment 14480](https://git.telpher.stream/telpher/zencelades/pulls/13#issuecomment-14480).
The next review must read the complete updated PR against main, including that
earlier HOLD. The current PR head and its exact check results belong in the PR
body; historical counts below are explicitly scoped to their recorded revisions.

## Findings and disposition

| Review items | Repair or evidence |
| --- | --- |
| 1–4: status, authorization, counts | The verification document now separates the initial absent-provider read from later successful provider/membership apply. P114/P115 distinguish their original research slice from P118's implemented copy studio. Authentik is current; compose/edit/import and gimmesomepaw account integration are future work. Historical runs name `bd3cbb6070be`, `b8c4402e9454` or `a4583d881611`. P121/PLAN point at the already-open PR13. Browser file-round-trip and clipboard limits remain explicit. Andrew's P123 delivery request remains authorized, subject to its review and human-authentication gates. |
| 5, 24, 26: section navigation | `mountTopics` already invokes reveal on initialization and hash changes; reintroducing App-wide document queries would duplicate the per-pane owner and miss shadow roots. A shared parser now also handles native bare fragments. The real-browser fixture tests initial queries, initial native fragments, focus, shadow navigation and preserved controls. It injects its CSS and reports errors, removing the external stylesheet wait entirely. The button markup check now rejects disabled/hidden attributes. No new fake DOM dependency was introduced to duplicate real-browser behavior. |
| 6: privacy and HTTP evidence | The marker set now includes style, exclude, settings and effect excerpts; current duplicate excerpts are deduplicated. Every regular artifact under cockpit/dist is scanned, including common JS escapes. The separate live retirement scan skips known binary media suffixes; see the round-two record for the strengthened private-JavaScript check. A public Vite module-graph guard refuses AudioView/docs/audio imports. Logs explicitly describe marker coverage rather than universal confidentiality. Caddy fixtures use distinct root bodies and a public private-assets decoy; the production deny generator is called by the probe itself. Twelve host/path checks pass; they do not establish edge authentication. |
| 7: trust boundary and membership | Disputed as a missing inner-auth defect. Caddy is loopback-only. The supported Telpher route strips incoming identity headers, then invokes Authentik before forwarding to Caddy. The provider has restricted crew/superuser bindings; seven members passed and the sampled nonmember failed. Telpher's provider contract does not implement membership keys; fictional TOML fields would not enforce anything. Membership remains managed by its supported access helper. The route must be applied and tested before claiming live privacy. |
| 8: staging | Only manifest-listed base files are copied, with no-follow copying; all staged file lengths/hashes and current-base identity are rechecked under the shared activation lock before rename. Lock acquisition has a 30-second deadline. Cleanup after successful activation reports a warning without misreporting activation failure. The existing activator owns final CAS and rollback. A timeout still requires reading the live pointer before retrying; this does not claim general process-tree supervision. |
| 9: generated import | Already generated and included by both build paths. The real fixture now invokes the generator itself. Full candidate Caddy validation is an additional pre-activation gate. A generated ignored fragment is not supposed to appear as a source diff file. |
| 10: complete-site publisher | It now refuses `--apply` when any current release exists, before building/uploading, and requires the private index and generated guard. The local browser fixture lives outside site/dist. The additive publisher is the delivery path for this existing service. |
| 11–15: markers, files and retirement | Empty/malformed marker output is rejected explicitly. All non-media suffixes participate in retirement scans; known binary media remains excluded there. Paths receive the same canonical/control-character validation before archiving. Private build trees reject symlinks and special files, stage in a fresh directory, and replace stale output. Deny text is validated before copying and written by replacement. Republished clean paths are removed from the retired set. Conservative wildcard denial remains for retired hash URLs and path-info aliases; the studio's exclusive handle has a separate root and the fixture proves an old public bundle cannot fall through there. |
| 16–17, 21, 23 | Progress fieldset and focused buttons carry the constraint description; the selected model is named in the disclosure; zero heads says no projectors; the ResearchView import is at the top. |
| 18: Vite cleanout | Disputed with installed source and a runtime sentinel. Vite's `resolveEmptyOutDir` returns an explicit non-null setting before checking whether output is inside root. `emptyOutDir: true` is already configured. A disposable private-output sentinel was removed by a fresh build. [Official Vite documentation](https://vite.dev/config/build-options.html#build-emptyoutdir) distinguishes the conditional default from the explicit override. No duplicate deletion was added. |
| 19–20, 22, 25 | Toggle-button pressed state remains the established accessible control pattern. Column/section accessible names remain present. The additional node_modules ignore handles the lane's symlink, which the trailing-slash directory pattern does not cover. `choices.css` already wraps the topic bar and makes the disclosure full-width. These suggestions do not justify unrelated control/CSS rewrites. |
| 27–28 | The ledger now includes P119, P120, P124 and P125. P122 records membership count and outcome without listing personal account names. |
| 29–31 | Upload staging is disposable and completed releases are retained on failure; no broad remote deletion is introduced. Caddy teardown now kills after its bounded graceful wait. The ephemeral port fixture does not claim a general port-reservation service. No known links target the heading moved between hero images. Mode 0644 remains the static server's existing host-readability contract; website access is enforced at the network boundary, not by claiming local host users are excluded. |

## Observed regression evidence

The progress-description assertion failed before its attribute propagation and
passed afterwards. Invalid marker output, unsafe filenames, stale private
output and unmanifested-file copying failed before their respective repairs.
An escaped prompt was accepted before the Python scan repair and rejected
afterwards. The complete publisher reached its upload path before the guard;
the repaired test refuses an existing release before publication.

A deliberate `import "./AudioView"` in the public entry made Vite fail with
`Private prompt module imported into public bundle`. The temporary import was
removed immediately and the ordinary build passes. A disposable escaped excerpt
in public dist made the privacy check exit 1; the file was removed and the normal
check passes. No injected test content is part of a release.

In the visible in-app browser, all ten navigation fixture cases passed. Temporarily
removing production `focusSection` effects made three focus assertions fail;
restoring the implementation returned all ten to PASS. This is an actual browser
regression proof, not an unexecuted claim based on a Bun partition test.

The homepage browser check also exposed an entry-point mismatch: a fresh
`/#renders` URL became an unknown route instead of a section. Initial fragment
normalization now applies at the root as well as legacy paths, preserves encoded
section names, and tolerates malformed escapes. A fresh browser tab opened
`/#renders` as `/#/?section=renders` with the renders section focused.

The full live-tree audit of the previous release checked 1,669 public files,
609,335,194 bytes and every manifest hash, with no mismatch. It found exactly
the ten known prompt-bearing public files. The new release planner additionally
scans non-media suffixes omitted by the earlier planner. Its current retirement
set still contains those same ten files.

All deployment and authenticated-browser claims remain pending until the
reviewed revision is merged and the supported route/release procedures finish.
The account-service/PG18 runtime is a separate rollout. Existing public source
history and downloaded copies cannot be made confidential by a website gate.
