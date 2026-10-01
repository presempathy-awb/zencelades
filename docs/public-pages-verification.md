# Artwork and open-source public pages

## Implemented source

- `site/about/index.html`: visitor-facing artwork description, aerial schematic,
  occupied 2.5/3.0 m studies, common triangle/ring holder, clear-front lander,
  conditional aerial alternative, one/two/three-projector choices, and $3,000
  total cash ceiling. Grant submission is explicitly Andrew-reported; no award
  or permission to operate is asserted.
- `site/open-source/index.html`: actual Codex/image-generation assistance,
  deterministic schematic geometry, original package license boundaries,
  scientific media and likeness rights, and all 22 direct cockpit dependencies
  with pinned versions and declared license identifiers.
- `site/about/pages.css`: scoped editorial layout using the existing site's
  ocean palette and local serif/sans font families. No scripts, dependencies,
  remote fonts or inline styles were added.

The design addresses visitors and grant readers first: a large serif story lead,
an aerial illustration, explanatory prose, and a technical definition list.
The disclosure page uses the same typography and readable tables with keyboard
focusable horizontal scrolling on narrow screens. The illustration links to its
full-size original; it is labeled as a conditional design study.

## Source basis

- `docs/love-burn-2027-form-draft.md`: current occupied installation narrative,
  unresolved procurement/engineering and one/two/three-head choices.
- `docs/build/budget-and-inventory.md`: $2,400 allocation plus $600 reserve;
  unquoted optics and aerial scope remain outside confirmed costs.
- Andrew's supplied submission acknowledgment: reported submission and separate
  theme-camp/Operations follow-up. The old draft's "not submitted" wording is
  not copied into the public page.
- `cockpit/package.json` and each installed direct package's `package.json`:
  pinned versions and license identifiers.
- `deliveries/enceladus_v3/LICENSE`, corresponding v4 license, and their
  `licenses/THIRD_PARTY.md`: scoped MIT terms and explicit exclusions.
- `deliveries/enceladus_v3/docs/ASSET_PROVENANCE.md`, `assets/catalog.json`,
  `site/name-concepts/index.html`, `docs/visual-prompts/`, and
  `scripts/grant_3d_models.py`: generated-image versus model-render provenance.

No root-level repository license was found. The disclosure therefore does not
extend the archived packages' MIT license to later website source or media.
It states that a full transitive license audit has not been performed.

## Checks run on maxipaxi

1. A Python standard-library HTML parser checked both pages' balanced element
   stacks, unique IDs, exactly one H1 each, image alternatives/dimensions,
   internal anchors and absence of inline styles: **passed, exit 0**.
2. Source-link resolution checked 32 local source targets across both pages:
   **passed**. Three `/studio/` links depend on the integrating build's requested
   studio route; they are deliberately deferred to integration verification.
   External HTTPS links were not requested or followed by this slice.
3. Every direct runtime/development package, pinned version and declared license
   identifier in the disclosure matched the manifest and installed metadata:
   **22 packages passed**. This validates the displayed inventory, not all
   upstream license notices or transitive redistribution requirements.
4. WCAG relative-luminance calculations for all four text tokens against both
   page and raised surfaces: **minimum 9.36:1**, above 4.5:1. The primary action
   reverses the ocean/accent pair, retaining 11.94:1 contrast.
5. `impeccable detect --json site/about/index.html site/about/pages.css
   site/open-source/index.html`: **exit 0, `[]` findings**.

## Integration and verification still required

The parent implementation must include both route directories and
`/about/pages.css` in the publishing build, add navigation to these pages, and
verify the complete output. This slice intentionally does not edit
`build_site.py`, the cockpit, deployment configuration or shared styles.

No browser control, deployment or VCS mutation was performed in this slice.
Source validation does not establish visual layout or live navigation. The
parent must check mobile/desktop rendering, click the principal page links and
image, expand the dependency disclosure, confirm keyboard focus and table
scrolling, and verify the actual released download paths and `/studio/` route.
