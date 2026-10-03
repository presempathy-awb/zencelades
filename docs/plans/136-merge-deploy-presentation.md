# P136 — Merge and deploy presentation

Andrew: "pr merge dep". Follow-up approval: "Approve capture, merge and deploy".

1. Run the existing recorder in visible Chrome for one 60-second local synthetic
   Showtime capture; no accounts, camera, microphone or external requests.
2. Verify the movie/poster, source receipt, full frontend tests and build.
3. Verify homepage click-through and raised viewing presets in the approved browser.
4. Finish zencelades feat/showtime-presentation (#17), merge under current policy,
   then deploy using the additive private-studio release and verify live assets.

Preserve existing content, media, private studio access and active-release locking.
Do not substitute an old video or bypass the recording receipt check.

Capture completed October 3, 2026: 59.933333 seconds, 1280×720 H.264,
1,400,775 bytes, no audio. Movie SHA256:
`0e5e7b59560db1b3d196445e2609e8b30727b4d2a4762df25ed8f85c415d7adc`.
The recorder verified unchanged input bytes, advancing show time, dimensions,
duration and codec before writing its receipt. `just cockpit-check` then passed
141 tests with zero failures, TypeScript, both SPA builds and privacy checks.
