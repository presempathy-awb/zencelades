# P090 — One push before Andrew leaves

Andrew: "gotta get 1 push b4 i go"

Codex will test and push the bounded front-entry geometry correction on the existing
feat/triangle-projection-cockpit lane. Preserve unrelated dirty work. This priority
does not cancel P089's entire backlog or substitute a source push for deployment.

Local verification: the entrance regression failed on the original single front
corner, and the existing assembly test failed on the hazer's front-side position.
After correction, all 16 Bun tests pass (275 assertions); the production build
passes TypeScript/Vite and verifies 28 exported models with finite geometry.
The existing large-chunk warning remains. Fresh browser acceptance and live
activation remain pending; a source push is not a deployment.

Status: ready for the requested source push.
