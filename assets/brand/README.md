# Zencelades logo

Masters for the Zencelades emblem and lettering. Nothing on the site uses them yet.

The emblem is the piece itself: the sphere carrying a frame of Enceladus, lit by three
projectors whose beams form the triangle of the holder. A curtain of jets rises from the
pole, drawn as the straight blue-white columns the footage shows, and the tiger stripes
under them glow teal. A seated figure is inside the sphere, with a small warm light at
the chest and a few motes drifting up towards the vents.

The lettering is heavy extended capitals cut from the moon's fractured surface, slanted
to the same angle as the jets, with jets rising from the letters. In the side-by-side
lockup it wears Saturn's rings in gold: the back arc passes behind the letters, the front
arc in front, and the ring's near tip is hidden behind the moon, so the moon sits on the
ring's edge as Enceladus does in the source frame.

| File | Use |
|---|---|
| `zencelades-hero.png` | Emblem and ringed lettering on a star field, 4800 px wide. Headers and cards. |
| `zencelades-lockup.svg`, `.png` | Emblem and ringed lettering side by side, transparent, for dark grounds. |
| `zencelades-lockup-stacked.svg` | Emblem above lettering, which spans the emblem's width. No rings. Transparent, for dark grounds. |
| `zencelades-emblem.svg`, `.png` | Emblem alone, transparent, for dark grounds. |
| `zencelades-emblem-plain.svg` | The emblem without the seated figure and its light. |
| `zencelades-wordmark.svg` | Lettering alone with its ring centred on the word, transparent, for dark grounds. |
| `zencelades-icon.svg`, `.png` | Emblem on a rounded dark tile. Use this one on light grounds. |
| `zencelades-emblem-mono.svg`, `zencelades-wordmark-mono.svg` | One colour, no rings. They paint in `currentColor`, so they take the ink of whatever embeds them. |

The colour files need a dark ground: the beams, jets and glow are light on dark. On a
light ground use the icon tile or the one-colour files.

## Colours

The colours follow the source footage: its pale blue jets, teal stripes and Saturn's gold.
The warm light is not in the footage; it is set to sit with the gold.

| Colour | Value | Where |
|---|---|---|
| Ground | `#050d17` | Space behind the hero and icon. |
| Ice blue | `#8fdcff`, jets `#d6f3ff` fading to `#79ccff` | Beams, jets, letter glow. |
| Rim white | `#f0fcff` | Letter outlines, sphere rim. |
| Tiger-stripe teal | `#7dfff0` to `#3fe6d6` | The stripes at the pole. |
| Saturn gold | `#f6e3b4`, `#d9b77a`, `#b98f52` | The rings. |
| Warm light | `#ffc869` | The light in the figure. |

Gold is the only warm colour and appears in two places only, the rings and the figure.

## The frames

Both pictures come from NASA's 4K master of catalog source E05
(`assets/enceladus-videos/catalog.json`), the complete ice, geyser and ocean journey:
`AssemblyCut_ProRes.mov`, 3840x2160 ProRes HQ, from the page credited below. The catalog
holds only the compact WebM of that cut, which is too compressed for close crops, so the
two frames were read from the master by byte range. The master is 6.6 GB and is not
stored in this project.

- The moon is the frame at 35.235 seconds, when the whole globe is first in shot,
  cropped to the disc (centre 1610, 1516, radius 626). It is 1252 px across.
- The lettering's ice is the frame at 30.297 seconds, the close pass over the tiger
  stripes, cropped to 3000x660 at 0, 1440.

Each is lightly denoised, sharpened, graded towards ice blue and embedded in the colour
SVGs that use it. The glowing stripes, the jets, the rings and the figure are drawn, not
photographed. The PNG exports are 4800 px (hero), 4000 px (lockup), 2048x2560 (emblem)
and 1024 px (icon).

The moon is the limit on size. It is 1252 px across at source and 1024 px across in the
emblem export, so it holds up to about 1.2 times that export, or roughly 4 inches across
in print at 300 dpi. Past that it softens. The beams, jets, rings and letter outlines are
vector and stay sharp at any size.

Credit: NASA's Goddard Space Flight Center Conceptual Image Lab,
<https://svs.gsfc.nasa.gov/20384/>. The catalog records the source as public domain under
the SVS policy, with the credit preserved. The frames are NASA's and anyone may use them;
only the arrangement around them is this project's. Using them does not imply NASA
endorses the project.

## Lettering and trademark

The letters are drawn from lines and arcs. No font is embedded or outlined, so the files
carry no font licence.

The logo is a trademark; see [TRADEMARKS.md](../../TRADEMARKS.md).
