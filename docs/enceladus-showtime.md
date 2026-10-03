# Showtime: Enceladus on the zorb

The native cockpit's `/showtime` view combines a looping 60-second Enceladus
film with a human projection on a spherical 2.5 m zorb. The homepage retains
its muted looping moon film and lander/aerial renders; its Showtime links open
the live stage inside the cockpit. The stage is loaded only when selected.
Installation context and the original films remain available through the
cockpit's section controls.

The imported steel/rig materials use Babylon.js's unmodified RGBD lighting
lookup as a same-origin PNG. The library's default embedded `data:` image is
blocked by the site's existing Content Security Policy, which otherwise leaves
the supports invisible. The local asset preserves that policy. Its provenance,
SHA-256 and Apache-2.0 notice are beside `environment-brdf.png` in the runtime
source; the stage's source notes link the bundled license.

The film uses public NASA, Cassini and Webb media alongside generated ice,
jets, ocean and Saturn scenes. The fixed moon surface is the unannotated 2024
Cassini global mosaic from
[USGS Astrogeology](https://astrogeology.usgs.gov/search/map/enceladus-cassini-global-mosaic-100m-schenk).
The 1024 × 512 map is equirectangular, north-up, with planetocentric latitude
and positive-east longitude from 0° to 360°. One map spans all three projection
sides, keeping geographic features in place as the movie and body layer move.
**Movie blend** starts at 35%; zero displays only the fixed map.

The outer wall, including the restored front section, receives the movie and
human layer with the same curved mapping and translucent projector lighting.
The physical front entrance stays open, and the inner front shell stays clear.
The inner chamber, spacer ties and structure remain visible through the shell.
The outer sphere stays 2.5 m across; the runtime expands the inner chamber to
2.0 m, leaving a 25 cm radial air gap. Spacer ties shorten and the inner entry
lip moves outward with its open tunnel while retaining the nominal 68 cm mouth.
This is a visual proportion adjustment; the selected product's measured inner
diameter must replace it before fabrication. The original GLB bytes are retained.
Three rear, left and right projector heads sit 1.65 m above the sphere center.
Their lenses are 2.5 m from the nearest shell surface along the beam axis; the
side heads turn 20° toward the rear. Extended arms support the heads in both
rigs. The upper cap is dimmer because there is no top projector. Transmission,
soft overlapping light and ground haze illustrate the transparent inflatable's
appearance; these are artistic approximations rather than measured optics.

**Ground lander** and **Aerial rig** import the two existing P059 GLBs. The
aerial bowl, optics and occupant turn together 50° within the fixed host, placing
the camera sightlines between its poles. That heading remains when motion and
effects are off. The assembly sways gently with movement; the host and hazer stay
fixed. Boarding steps turn to the aerial entrance when switching rigs, then stay
fixed on the ground during sway. Ground lander restores the original orientation.
A continuous padded bowl fills the inner bottom, with a depressed seat, raised
rounded sides and back, and a lowered front edge at the entrance. The same cushion
follows the holder in both rig modes. Boarding steps and soft base lighting
indicate the entrance. These elements are visual
concepts and do not certify a physical installation or structural loads.

The default human is a procedural jointed body using Andrew's supplied portrait,
with curly hair, glasses, a beard, a shirtless torso and dark navy shorts. Six
bounded routines switch automatically: Settle, Look, Reach, Stretch, Recline
and Tucked crouch. The capture cameras follow the animated body and blend it
with the moon on the shell. Their complete body feeds are mapped 35% larger
over the sphere, independently of capture framing, so the moving face and body
occupy more of the shell. The clear entrance and fixed moon geography remain.
This is a concept likeness, not a scanned rigged
human or inferred unseen anatomy. Optional camera/video input requires an
explicit user action; no camera is requested automatically.

The inner floor has a warm brown, softly lumpy futon with shallow tufts and a
stitched edge. A rounded sage-green stuffed cactus, approximately 1.5 ft wide
across its arms, sits beside the occupant for leaning. Both furnishings follow
the holder in lander and aerial modes, remain visible when the person is hidden,
and are excluded from the body-only projection capture. Their floor placement
follows the illustrated inner chamber size.

The show starts after its media and model are ready and loops indefinitely.
Reduced-motion preferences keep the procedural pose stationary. Pause holds
the film clock, and rig switching preserves the running scene and selected
input. Unmounting releases playback, input and rendering resources.

## Controls

Both content layers are enabled at full brightness by default. **Moon**,
**Andrew** and **Both** select content; a solo layer fills the available
projection area. Brightness and the content selection are separate controls.
Projection and the hazer can each be switched off.

**Realistic** starts at 22:00, **Dusk** at 18:00 and **Day** at 12:00. The
night scene retains a faint ground and environment fill. **See-through** keeps
realistic material detail while exposing the interior; **Full wireframe** shows
the meshes. Inspection modes retain the chosen time of day. The coastal Love
Burn environment can be toggled independently of the film clock.

Automatic routines are the default. Select **Controls** to use the optional
movement and direction controls shown beside the stage. **Left projection**,
**Rear projection**, **Right projection** and **Clear front** move the viewing
camera. Fullscreen is available as an explicit stage action.

## Asset hydration and build

Media, portrait bytes, delivery models and generated output are ignored by
version control. A clean source checkout must hydrate those inputs before
building or running the model integration tests. No downloader or authenticated
asset fetch is added by this change. Retrieve the archived public media using
the existing archive records, and restore the supplied portrait and delivery
models from their retained project originals. The catalog records are the
authority for paths, source attribution and exact SHA-256 bytes:

- [NASA/Cassini/Webb video sources](../assets/enceladus-videos/catalog.json)
  and [additional footage](../assets/enceladus-extra/catalog.json).
- [Andrew reference](../assets/enceladus-human/catalog.json).
- [Cassini surface map](../assets/enceladus-surface/catalog.json).
- [P059 projection models](../assets/enceladus-projection/catalog.json).

The film needs seven original MP4s listed in `cockpit/src/film/shots.ts`,
`andrew-reference.jpeg`, and `enceladus-cassini-global-2024-1024.jpg` under their
catalogued `source/research/<collection>/originals/` directories. It also needs
`deliveries/grant-3d-p059/zencelades-2p5m-lander.glb` and
`deliveries/grant-3d-p059/zencelades-2p5m-suspended.glb`. `prepare:film` checks
their catalog hashes before copying them into the film media directory.
Unknown model modes, paths, missing provenance and mismatched bytes fail the
preparation step. Existing cockpit preparation additionally needs its three
original v3/v4 GLBs, as listed in `cockpit/scripts/prepare.ts`.

The following commands run from the checkout root. The full
build retains the model-verification and private-studio gates. The separate
film build prepares its verified media and produces `dist/film` alongside
the cockpit assets for standalone/local previews.

```bash
# maxipaxi
(cd cockpit && bun test)
(cd cockpit && bun run build)
(cd cockpit && bun run build:film)
(cd cockpit && bun run dev:film)
```

The dedicated film development server supports `/showtime` and
`/enceladus-film.html`. The native built cockpit uses its existing routed
Showtime view and serves media from `/film/film-media/`. The scoped public
release overlays the new native runtime while retaining that existing media
subtree. It does not replace the older standalone `/film/showtime/` document;
the native stage's new-tab link opens the current cockpit route. Creating a
source PR does not publish the website or upload pending assets to lakeFS.

## Verification boundaries

The source tests exercise lifecycle, media preparation, joint poses, projection
capture coverage, sphere geometry, haze, environment, access and aerial sway.
NullEngine model checks establish geometry and import behavior. They do not
establish GPU appearance, real camera tracking, physical optics or a live
deployment. Browser interaction for the combined candidate is covered by
Andrew's existing project rendering-check approval and is recorded separately
in the current restoration plan. Archive records marked pending remain pending.
