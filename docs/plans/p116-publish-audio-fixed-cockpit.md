# P116 — Publish prompts and restore viewport-fitted cockpit

Andrew, October 2, 2026:

> make sure they are pred and deployed to the website.
>
> One moon. The same holder. put the image under this under the one on the top to balance it.
>
> lets move every page into being a no scroll experience again. no scrolling on the main view on any!

Interpret "pred" as PR'd: publish the P114/P115 audio prompt pack through a PR
and deployment. Rebalance the homepage image associated with "One moon. The
same holder." under the upper image. Restore a viewport-fitted main shell on
every cockpit route, retaining all content through subselectors and contained
panels. No page-level scroll, clipping away content or shrinking text to fit.
Showtime audio generation and runtime mixing remain deferred.

Steps: inspect active source/release and capture the layout failure; isolate
the change from shared work and the reviewed account PR; implement prompt
publication, home composition and shell fit; run applicable tests and approved
browser checks; PR, merge under policy, deploy preserving active media and
verify the live release. Existing account/access prerequisites remain separate.

Status: PR #9 open; deployed static release `a1d37232`. Homepage browser checks
passed locally and live, and 53 of 53 changed files match public HTTPS.
See [publication evidence](../audio/publication.md). Expanded route/audio browser
scope is still pending. Merge waits for the separate account base PR; this
release leaves that reviewed head untouched.
