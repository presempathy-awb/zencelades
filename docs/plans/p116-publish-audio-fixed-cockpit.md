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

Historical publication: release-manifest SHA256
`a1d372323fe59d831f617136932e19fffa7737936c1f48351e744cc4ef4414c0`
identifies the deployed asset manifest, not a Git commit. Its 53 changed or added
built URL paths were compared by content hash over public HTTPS; this is not the
number of source files changed in PR9. Source implementation was `80c132e0cea0`,
an ancestor of PR9's `030f6c14`; later documentation commits were not part of
that byte comparison. See [publication evidence](../audio/publication.md).
That release's browser proof covers the homepage only. P124 now integrates the
subsequent private-studio and visible-controls work through PR13, with fresh
checks before activation. PR8 is merged; PR9 remains open as source history.
