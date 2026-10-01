# Projector counts in common-holder models

The common-holder model controls and Parts plan share the same selected 0–3
projector count. The geometry builder now creates that number of heads, arms,
rain covers and, for suspended studies, arm stays. One/two-head layouts use the
flanking corners before the rear corner; the entry bay receives no new mast.
The ring, triangle, legs or aerial host and over-sphere webbing remain intact.

These are the existing 3 m arm-mounted studies. Size, camera, host and separate
stand selections in Parts remain procurement choices, explicitly identified as
not reflected in this model. The fixed gallery source studies remain available.
No total was repriced and no equipment ownership, optical coverage, load rating
or construction approval was inferred from a head count.

**Download current GLB** now exports a fresh geometry-only scene with the selected
count, a count-bearing filename and projectorCount metadata. It excludes the
viewer camera, ground and dimension guides. A separate export scene avoids
depending on the live viewer surviving a model switch. The exporter uses the
already installed Babylon serializer, loaded only when requested; no package
or lockfile was added. Error messages remain visible, and the button disables
while an export is running.

## Verification

The regression initially expected zero heads and received three. After the
geometry change, the same test checked all four counts on landed and aerial
holders, including covers/stays and retained triangle/ring geometry. A temporary
parameter name collision was caught by the test runner and corrected before
verification. The GLB test reads the exported binary header and JSON chunk;
it proves one head, one cover, retained holder, count metadata and no camera or
viewer ground. Full Bun suite: 31 passed, zero failures, 415 assertions.

The visible approved local cockpit check selected a one-head lander, a two-head
aerial rig and a zero-head aerial rig. Screenshots showed the corresponding
geometry. Clicking Download current GLB saved the one- and two-head files;
direct readback of those browser downloads verified 468,660 and 518,896 bytes,
one/two heads respectively, and two stays plus all three holder webbings for
the aerial export.

The first export attempt triggered Vite's one-time optimization of the lazily
loaded exporter and reloaded the dev page. Retrying produced the file. The
browser tool's download event wait timed out despite successful saving, so
file existence and binary readback supplied the download evidence instead.
There were no browser error/warning logs at the inspected point. Generated
status messages alone were not used as proof of a downloaded file.

Impeccable examined the rendered DOM and reported advisory findings; broader
small-type, color, eyebrow/font and clipping findings remain in the website
backlog. This change does not claim a complete accessibility or design pass.
Login, saved account edits, live Pacinman editing and remaining model coupling
are still unfinished.

## Published release

Both remotes independently returned source `fdf40b6cb4ee4cd2565f53b637825c93de01bce7`.
Release `d68a3d7b747ca3745a7359619cc9603738be87aebcc468aa7f27e1dc6c1d715f`
preserved all 747 prior entries, changed 119 allowed studio paths, passed Caddy
validation and activated successfully. Normal HTTPS readback matched 124 files,
including retained homepage, gallery, Showtime, pricing and grants; the service
was active. Previous release directories were retained. The initial restart
probe failed briefly before bounded readiness succeeded; existing Caddy
formatting and loopback-HTTP warnings remain.

The production browser selected the aerial rig and one head, then downloaded
`basket-aerial-rig-1-head.glb` without a page reload. Binary readback verified
509,472 bytes, exactly one head, all three holder webbings, and SHA-256
`4cf311f304b7939c904ae3ea2222f64029f78e615744e442755d82a6dbcf5fb8`.
The live screenshot is retained in the task's projector-count cache.

Fresh full checks passed: 57 Python tests plus 13 subtests, Ruff/format/ledger,
31 Bun tests, 17 Node tests and `just site-build` with 28 fixed source model
exports, 132 original plus 84 v4 byte-verified downloads and eight media previews.
The lazy exporter chunk is approximately 110 kB; existing entry/SceneView size
warnings remain. An incorrectly positioned formatter CLI argument failed before
execution; rerunning from the cockpit directory checked all nine files cleanly.
No repository package or lockfile changed.
