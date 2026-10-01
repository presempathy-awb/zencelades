# Complete pages in the cockpit

P101 gives every existing public page a destination within the same application.
The Overview keeps its artwork layout, four renders and narrative. Media, the
model tools and Showtime remain selectable views. The section/view selectors reach the
complete grant application, mount studies, grant workshop, historical pricing
calculator, asset catalog, naming workbench, 22 name-concept sheets, and open
source / AI disclosure.

P102 replaces the long navigation strip with section → view selectors for each
column. The top-bar Columns control requests one to four columns, fitting fewer
on narrow screens while retaining the other selections. One column is the
default so the Overview retains its immersive layout. Selecting an already open
view swaps it into that column instead of duplicating its controls. The first
column follows the URL and browser history; ordinary page links open there.
Design → Design options and Build → Scenario settings retain the former sidebars.
All columns edit the same temporary scenario; this layout does not save it to an
account. Column preferences last for this visit and reset on reload.

The Overview includes a small muted, looping **Above the ice** preview without
player controls; clicking or keyboard-activating it opens Showtime. Reduced
motion preferences pause the preview. Design → Alternate designs contains the
two original truck concept boards, the two hitch/chassis drawings and the
original cinematic previsualization. The default Media and Showtime film areas
show the moon footage; original assets and download URLs are retained.

Reference patterns: Walterville's local `WalterWorkspaceShell.tsx` supplies the
idea of individually selected workspace panes. The recorded Hotgoddesshotpen
cockpit patch supplies its top-bar column count and width fitting pattern. No
reference-site account, source dependency or browser state was imported.

The site build retains authored HTML under `/page-content/<page>.html` before
publishing the cockpit entry at the old page URLs. Downloads and source files
retain their paths. Old page bookmarks enter the corresponding app route; section
links carry their target as `?section=` in the hash route.

Published content is read from an explicit page list. Each document has a shadow
root so its original typography, layout and controls cannot restyle the cockpit.
Only the existing naming, pricing and catalog modules are initialized. Their
selectors and events are scoped to that document. Visited pages stay mounted
while hidden, retaining filters and drafts across navigation. Naming's existing
browser-storage behavior is retained; it is not an account save.

The proposed support model now accounts for the displayed 55 mm padding envelope
when seating a sphere in the six-foot tube-centreline hoop. Padding is concentric
with the steel; support interfaces meet the hoop centreline. Both 2.5 m and 3 m
sizes retain the same triangle and clear-front leg layout. These are display
envelopes, not specified member sizes or structural approvals. Historical
downloaded Blender/PDF packets are preserved as historical snapshots.

The homepage uses the new versioned AI hoop-fit concept. The original remains
available; generation intent and limitations accompany the new source image.
PG18 account-owned saves are separate P098 work and are not delivered by this
presentation change.

## P103 current release

Live release `90891ed11a4b898b23ef0e1194d0c98acb909f4a45361fab9f7ed902f68f72a1`
adds the homepage loop and truck archive. The [P103 delivery record](plans/p103-homepage-loop-alternatives.md)
records its checks and live playback verification.

## P102 column release

Live release `abf60491f6c65d6ec74504f0d4bcba535ad978d937b0cd2e78bd73ed1e216bb6`
contains the column controls. The [P102 delivery record](plans/p102-cockpit-selectors-columns.md)
records 162 verified HTTPS files, the full checks and browser interaction evidence.
The document-control approval boundary below remains unchanged.

## P101 release evidence (before the P102 selectors)

Live release: `479564312e531bb58d664ddfb64923a8a1186cc514d5fe80d32b8cc897e6e282`.
The overlay retained the actual prior published HTML in page-content, preserving
concurrent Showtime, media and attachment files. 161 public HTTPS file readbacks
matched the manifest; the service was active and the release identity unchanged
before and after readback. The first staging attempt hit an SSH banner timeout;
batching page retrieval into one tar stream succeeded. Startup checks retried
briefly during the service restart and passed. Existing Caddy formatting warnings
and Vite's large-chunk warning remain.

Fresh checks on maxipaxi:

- `bun test`: 44 pass, zero failures, 730 assertions.
- `just check`: 59 Python tests and 13 subtests pass; Ruff and ledger pass.
- `node --test tests/*.test.mjs`: 17 pass, zero failures.
- `just site-build`: exit 0, including TypeScript, Vite, 31 model checks,
  132 original and 84 v4 byte-verified downloads.

The route-preservation test and both sphere/padding fit cases failed before the
fix and pass afterward. The visible in-app browser exercised Overview → Media,
the lander and aerial controls, and both sphere sizes. All four homepage images
loaded. A reproduced narrow-width header overflow (337 px in a 325 px viewport)
was fixed and measured again at 325/325; the normal viewport measured 389/389.
Responsive overrides were reset. No browser console errors or warnings were
reported in the final overview inspection.
The rendered overview's Impeccable design check returned no findings (exit 0).

Additional browser approval for the new document-page controls was requested
and remains pending. Their search, filter, naming and pricing interactions are
not claimed as browser-verified. Saved naming shelves were not edited. The
remaining P098 account service is not part of this static-site release.
