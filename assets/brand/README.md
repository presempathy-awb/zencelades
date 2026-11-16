# Zencelades logo

Masters for the Zencelades emblem and lettering. Nothing on the site uses them yet.

## What is in it

**Emblem.** The sphere carrying a frame of Enceladus, with three projectors around it.
The projectors fire what the moon fires: straight blue-white jets, not light cones. A
curtain of the moon's own jets rises from the pole, where the tiger stripes glow teal.

**The figure.** A seated female Buddha is raised out of the moon's surface as lit relief:
smooth bright ice for her body, a crater rim for her halo, fracture lines for her robe,
braids and the folds at her knees, and ridges for the lotus she sits on. A warm light sits
at her chest and a few motes drift up from it towards the vents. She is drawn, not found
in the footage.

**Lettering.** Heavy extended capitals cut from the moon's fractured surface, slanted to
the angle of the jets, with jets rising from the letters. Three letters carry more:

- the C is a crescent moon;
- the L holds the sphere on its lander, standing on the letter's foot;
- the A is the aerial frame, with the sphere hung from its apex.

**Rings.** The lettering wears Saturn's rings. Their radial structure and colour variation
are taken from Cassini's own scan across the rings, so the C ring, the B ring, the Cassini
Division, the A ring with the Encke Gap and the F ring fall at their true proportions. The
moons Pan, Prometheus and Pandora are dots at their real radii. A faint blue haze outside
the gold stands for the E ring, which Enceladus's jets feed; it is not to scale, since the
real E ring lies much further out. In the side-by-side lockup the
near tip of the rings is hidden behind the moon, so the moon sits on their edge.

**Probe.** A Cassini-like spacecraft in gold floats above the rings in the side-by-side
lockup and the hero.

## Files

| File | Use |
|---|---|
| `zencelades-hero.png` | Emblem, ringed lettering and probe on a star field, 4800 px wide. Headers and cards. |
| `zencelades-lockup.svg`, `.png` | Emblem, ringed lettering and probe side by side, transparent, for dark grounds. |
| `zencelades-lockup-stacked.svg` | Emblem above ringed lettering. The rings are wider than the emblem. Transparent, for dark grounds. |
| `zencelades-emblem.svg`, `.png` | Emblem alone, transparent, for dark grounds. |
| `zencelades-emblem-plain.svg` | The emblem without the figure and her light. |
| `zencelades-wordmark.svg` | Ringed lettering alone, transparent, for dark grounds. |
| `zencelades-icon.svg`, `.png` | Emblem on a rounded dark tile. Use this one on light grounds. |
| `zencelades-emblem-mono.svg`, `zencelades-wordmark-mono.svg` | One colour, no rings. They paint in `currentColor`, so they take the ink of whatever embeds them. |

The colour files need a dark ground: the jets, rings and glow are light on dark. On a
light ground use the icon tile or the one-colour files.

## Colours

The colours follow the source material: the footage's pale blue jets and teal stripes, and
the gold of Saturn's rings. The warm light is not in the footage; it is set to sit with
the gold.

| Colour | Value | Where |
|---|---|---|
| Ground | `#050d17` | Space behind the hero and icon. |
| Ice blue | `#8fdcff`, jets `#d6f3ff` fading to `#79ccff` | Jets, projector outlines, letter glow, E ring haze. |
| Rim white | `#f0fcff` | Letter outlines, sphere rim. |
| Tiger-stripe teal | `#7dfff0` to `#3fe6d6` | The stripes at the pole. |
| Saturn gold | brightest `#ffd495`, glow `#ffd98a`, probe `#f6cf82` | The rings and the probe. |
| Warm light | `#ffc869` | The light in the figure. |

## Sources

**Moon and letter ice.** Both come from NASA's 4K master of catalog source E05
(`assets/enceladus-videos/catalog.json`), the complete ice, geyser and ocean journey:
`AssemblyCut_ProRes.mov`, 3840x2160 ProRes HQ. The catalog holds only the compact WebM of
that cut, which is too compressed for close crops, so the two frames were read from the
master by byte range. The master is 6.6 GB and is not stored in this project.

- The moon is the frame at 35.235 seconds, when the whole globe is first in shot,
  cropped to the disc (centre 1610, 1516, radius 626). It is 1252 px across.
- The lettering's ice is the frame at 30.297 seconds, the close pass over the tiger
  stripes, cropped to 3000x660 at 0, 1440.

Each is lightly denoised, sharpened, graded towards ice blue and embedded in the colour
SVGs that use it. Credit: NASA's Goddard Space Flight Center Conceptual Image Lab,
<https://svs.gsfc.nasa.gov/20384/>. The catalog records the source as public domain under
the SVS policy, with the credit preserved.

**Rings.** The ring structure is read from "Panoramic Rings" (PIA06175), Cassini's
natural-colour mosaic across the rings, along the row through the tip of the ring curve.
The scan is not embedded: it was reduced to 353 ringlets, each with a radius, a density
and a colour, drawn as vector bands and warmed towards gold. Radii were fitted to the
Encke Gap, the B ring's outer edge and the F ring. Credit: NASA/JPL/Space Science
Institute, <https://science.nasa.gov/photojournal/panoramic-rings/>.

The NASA frames and the scan are NASA's and anyone may use them; only the arrangement
around them is this project's. Using them does not imply NASA endorses the project.

**Drawn.** The figure, the jets, the glowing stripes, the projectors, the lander, the
aerial frame, the probe and the letters are drawn, not photographed.

## Size

The PNG exports are 4800 px (hero), 4000 px (lockup), 2125x2560 (emblem) and 1024 px
(icon). The moon is the limit on size. It is 1252 px across at source and about 970 px
across in the emblem export, so it holds up to about 1.3 times that export, or roughly
4 inches across in print at 300 dpi. Past that it softens. The jets, rings and letter
outlines are vector and stay sharp at any size.

## Lettering and trademark

The letters are drawn from lines and arcs. No font is embedded or outlined, so the files
carry no font licence.

The logo is a trademark; see [TRADEMARKS.md](../../TRADEMARKS.md).
