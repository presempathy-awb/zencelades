# Integrated controls and private-studio verification

October 2, 2026, maxipaxi. These historical checks cover PR13 source
`a4583d881611ebbb8489824bd6a96fb4b011ec30`, before its first integrated review.
They do not claim production activation or authenticated browser access.

## Navigation and parsing repairs

`cockpit/tests/navigation-browser.html` exercises production `mountTopics`,
`TopicPane` and viewport CSS in a real browser. Before the fixes, four cases
failed: an early heading lost its selector title, a deep anchor across a shadow
root stayed out of view, that target did not take focus, and native reading
panels disallowed user scrolling. All seven cases passed at `a4583d88` after the fixes;
both settings controls stayed together and the outer page stayed fixed.

Build the fixture with the existing Bun toolchain from `cockpit/`:

```bash
# maxipaxi
D="$HOME/.cache/codex/zenc-navigation-check"
bun build tests/navigation-browser.tsx --outdir "$D"
cp tests/navigation-browser.html "$D/"
```

Serve that disposable directory on a local loopback preview and open
`/navigation-browser.html`, then press **Run navigation checks**. It is outside
all publication outputs. The amended fixture injects its shadow CSS, displays
errors, and adds initial query/fragment focus cases. The later ten-case run at
`14efe517` passed; current repairs and later counts are in
[the round-two record](private-studio-round-two.md).

The audio parser tests first failed for trailing Suno controls and an extra
pipe that silently discarded effect text. Both passed at `a4583d88`. The suite also reads
all eight authored songs and all sixteen authored effect cues.

## Historical checks at `a4583d88`

- `just private-studio-check`: 61 Bun tests, zero failures; TypeScript and both
  Vite builds succeed; public-bundle privacy check succeeds; eight Python
  release-boundary tests pass.
- `just check`: 69 Python tests plus 18 subtests pass; Ruff and the grant ledger
  check pass. `node --test tests/*.test.mjs`: 18 pass, zero failures.
- `just site-build`: succeeds with 132 original and 84 v4 byte-verified downloads.
- Approved browser on the rebuilt local site: scenario settings retain Planning
  inputs and Experience together; Discount, credit & tax expands; build board
  exposes all 24 tasks. The homepage render link selects and focuses its render
  section. Every hidden sibling computed to `display: none`; adding an
  `!important` override was unnecessary. `/about/` redirects to the cockpit
  overview by the existing routing contract, rather than serving a second page.

The homepage source includes explicit `.project-page .home-visuals` stacking;
the cockpit adds its viewport-sized image rows. The requested heading stays
between the two images. Earlier readbacks of an old preview build are excluded
from evidence for these repairs. Remaining live checks follow release activation.

## Review context and limits

PR13 integrates PR9's audio/viewport source and PR11's repaired privacy boundary.
The old review's public eager AudioView import and stale public-audio-copy
findings are resolved by the separate private entry and cleanup in this
integrated source. `columns.css` already declares inline-size containment.
No new production dependencies were introduced. The account service is not
installed by the static publisher; actual PG18 saves remain a separate rollout.
Browser download-event capture timed out; the scenario file import/export round-trip
is covered by automated tests, not a completed browser round-trip. Copy feedback
was observed, but clipboard byte readback was not established.
