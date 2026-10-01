# Prior art, projector count and camera mounts for the Seed build

Researched September 30, 2026 for the Love Burn 2027 application. Sources are
linked; nothing here was tested by us. The point is to borrow what already
works for projecting onto a sphere outside, and to spend as little as possible
on the parts that only hold a phone.

## Prior work worth citing

**Science On a Sphere (NOAA).** The reference for external projection onto a
sphere: a 68 in (1.73 m) carbon-fibre sphere weighing 55 lb, hung from three
thin cables, lit by four projectors arranged in a square, each responsible
for one quadrant. Installed in museums worldwide since 2002. It proves the
layout we are using at a smaller radius, and that a hung sphere with
projectors around it is a solved problem.
[Getting SOS](https://sos.noaa.gov/sos/getting-sos/all/),
[floor plan](https://sos.noaa.gov/sos/getting-sos/floor-plan/),
[overview](https://en.wikipedia.org/wiki/Science_On_a_Sphere).

**Interactive projection sphere, Garbicz Festival 2019 (Intolight with
Kugelbliss.art).** An inflatable sphere at an outdoor festival, four
projectors mapped with VVVV, and a drum pad whose rhythm changed the visuals
live. The closest festival precedent to ours: inflatable, outdoors, mapped,
and driven by what the audience does. Dimensions and rigging are not
published on the page.
[Project page](https://www.intolight.de/en/portfolio-items/garbiczprojectionsphere/).

**Paul Bourke's spherical and dome projection work.** The standard reference
for how to warp an image so it lands correctly on a sphere, how two or more
projectors blend across a seam, and how to do dome projection on a budget
with a mirror. His pages document multiple projectors onto the outside of a
sphere and the warp-mesh method we would use to pre-distort the moon film.
[Dome projection on a budget](https://paulbourke.net/dome/mirrordome/),
[warp tools](https://paulbourke.net/dome/fishwarp/),
[spherical mirror paper](https://cdn.ymaws.com/www.ips-planetarium.org/resource/resmgr/pdf-articles/200512SphericalMirror-Bourke.pdf).

**Museum of the Moon and Sonic Sphere** are already in the
[grant library](grant-research-library.md) as sphere references; the Burning
Man precedents there (Shrumen Lumen, Pulse and Bloom, Firmament) cover the
one-clear-action, bodily-presence and place-to-linger lessons.

**Software on a small host.** The media host is a mini PC or the artist's
laptop (a Raspberry Pi 5 is the fallback). Low-latency phone-to-host
streaming is well trodden: phone camera apps stream over local Wi‑Fi;
GStreamer pipelines and WebRTC receivers exist for every platform; OBS and
the open-source projection mappers do the compositing and warping. Our
bench test decides the exact pipeline: two phone streams in, one pre-warped
moon film, a crossfade keyed to who is standing on the spot, two or three
HDMI outputs.
[Pi camera software](https://www.raspberrypi.com/documentation/computers/camera_software.html),
[low-latency UDP camera](https://github.com/owntheweb/raspberry-pi-udp-camera),
[open-source mapping tools](https://ones.com/blog/best-free-projection-mapping-software-7-open-source-options/).

## Two, three or four projectors

A projector whose lens is 4 m from the surface of a 2.5 m sphere sits 5.25 m
from its centre and lights the cap where the surface still faces it: a
half-angle of arccos(1.25 / 5.25), about 76°. The last 15° or so of that cap
is grazing light, dim and stretched, so call the useful cap about ±60°.

| Projectors | Spacing | Equator coverage | What it means |
| --- | --- | --- | --- |
| 2 | 180° | two faces of about 120° each, two dim gaps on the sides | The plan as drawn: viewing areas on the two lit faces, projectors' backs toward the gaps. Works. |
| 3 | 120° | continuous wrap, every point lit by at least one head, overlap for blending | The sweet spot: the moon reads from any direction and the seams can be blended. |
| 4 | 90° | continuous wrap with double coverage | Brightness and redundancy; the v3 four-head model covered 85.58% of an ideal sphere, the poles being the rest. |

The poles are never lit well from the sides; the top is hidden by the rig
and the bottom by the ground, which is fine.

**So yes, two or three.** The Seed grant buys two. The third head is the
first self-funded upgrade: one more Optoma HD146X ($499 to $599), a stand,
bracket and cover ($118 to $233), and because a Pi 5 has two HDMI outputs, a
second output kit ($135 to $289) synchronised over the private Wi-Fi: $902
to $1,345 with the ledger's 20% contingency. Four is Tier 2 in the ledger.

## Camera mounts: rigid but snaky, on a budget

The phones need to hold a pose at about 1.2 m, aimed at a marked spot, in
wind, all night, and come off in a second. Two kinds of cheap arm do this:

| Mount | Observed price | Behaviour | Verdict |
| --- | ---: | --- | --- |
| 11 in articulating "magic arm" with super clamp and phone holder | $15 to $22 ([TARION, Best Buy](https://www.bestbuy.com/product/tarion-magic-arm-11-with-super-clamp-adjustable-articulating-camera-mount-for-led-light-monitor-flash-phone/CLXXZL4HR5), [Niewalda, Walmart](https://www.walmart.com/ip/Camera-Magic-Arm-articulating-arm-11-Inch-Metal-Adjustable-Friction-Articulated-arm-Super-Clamp-Phone-Clip-Various-Action-Camera-DSLR-LCD-Monitor-LED/5941012081)) | Rigid when the centre knob is tightened, repositions in seconds, clamps to the projector stand or the rig leg | **Buy two.** The "rigid but snaky" answer. |
| Gooseneck phone clamp, 12 to 38 in | $7 to $13 basic, $30 to $50 heavy-duty ([Walmart](https://www.walmart.com/c/kp/gooseneck-phone-holder), [Arkon RoadVise](https://arkon.com/products/rv186-12-phone-clamp-mount)) | Bends anywhere, but sags under a phone and shakes in wind; long ones droop | Fine indoors; keep one as a spare or for the hazer-side service phone. |

Three places the arms can clamp, all with the same two $20 arms:

- **The triangle corners** (Andrew's pick). The basket's corners sit about
  1.3 to 1.7 m up and 1.5 to 2.2 m from centre, which is the right height
  and a short, clean look outward at a spot 3 to 4 m away; the projector
  stands stay clear and the cables run down the bridle. The trade: the
  basket hangs on a swivel, so if the moon turns the cameras turn with it
  and lose the spots. Cameras on the triangle therefore mean the two tag
  lines are on, holding the frame's heading; the sphere can still turn
  inside the loop. Lowering shifts the framing 25 cm, which the spots'
  margin absorbs.
- **The rig legs.** Static whatever the basket does, same height, and the
  legs are 2.75 m from centre on a typical rig. The fallback if the moon is
  meant to spin freely.
- **The projector stands.** The original plan, 4 m out; works, but puts the
  camera on the same pole as the projector's heat and vibration.

A rubber band around the phone holder's jaws stops it walking in vibration.
Both arms are in the Tier 1 cash list.

## Lowering the moon: the design

Andrew's next design priority is a good way to lower the sphere. The answer
is a sailor's, not an engineer's, scaled to the zorb's weight: tens of
kilograms, so rated rope, a rated swivel and a winch instead of a bare cleat:

1. **Halyard.** 8 mm static rope from the sphere's top ring up over a block
   shackled to the rig's top bar, down the leg to a horn cleat at about
   1.2 m. One person raises or lowers it; no mechanical advantage needed.
2. **Cradle always in place.** The padded cradle sits under the hung sphere
   all night, 0.25 m below it. Lowering is a 0.25 m ease, so the projectors
   barely need re-aiming (Plate 3 draws the lowered centre at 1.45 m).
3. **Safety sling.** A separate sling with a carabiner from the bar to the
   top ring, slightly slack while the sphere is up. It is for the hung state
   only: unclip it before lowering, clip it after raising.
4. **A swivel is fine, lyra-style.** Correction to an earlier note: on a
   plain white sphere the image is projected onto whatever surface faces the
   projector, so the sphere can turn freely under it and the picture stays
   put. Hang it like a lyra: a rated rotating swivel between the halyard and
   the sphere's top ring (lyra rigging kits with a 360° swivel and auto-lock
   carabiner sell for about $74), so the moon can be spun by hand and settles
   on its own. Two light tag lines are optional, only to damp swing in wind.
5. **Strap down when lowered.** Two straps from the lower rings to the
   sandbags; this is the overnight and high-wind state.
6. **Wind rule.** The rig manual's limit for the sphere's area, written on
   the operating plan; at the limit, lower; above a second limit, deflate.
   A crank-stand goalpost does the same job with its crank.

Parts, all inside the rigging-kit allowance: a block ($10 to $25), a horn
or cam cleat ($8 to $15), 15 m of 8 mm static rope ($15 to $30), a rated
swivel, carabiners, two tag lines, two straps. Plate 6 on the application
page draws it. Prove it at the October bench test: a timed lower-and-raise,
and a night left lowered and strapped.

**Bouncy, if wanted.** Andrew's porch-swing idea works: a pair of heavy-duty
porch swing springs (rated 300 to 700 lb each, $8 to $18 a pair at Menards,
Walmart or eBay) between the halyard and the swivel gives the moon a slow,
gentle bob when touched or in a breeze. The projected image moves a few
centimetres on the surface as it bobs, which reads as alive rather than
wrong. Leave the springs out if the bench test shows the bob fights the
camera framing. Andrew's "mariner hoist" is right for a zorb: a 50 to
100 kg lift is not a one-hand pull, so a hand winch with a brake (a
boat-trailer winch, rated well above the load) on the rig leg replaces the
cleat; the block at the top bar stays.

## How to attach the sphere: prior work

Three ways people hang big inflatables, cheapest and most proven first:

1. **Buy the sphere with the harness built in.** Advertising and event
   spheres are sold with "a harness at the north or south pole" for air or
   helium suspension, metal D-rings or plastic anchors placed at the top,
   bottom or sides to order, double-stitched seams with webbing
   reinforcement at the stress points, and a flying harness, tether line and
   repair kit in the bag. That is the product class if the moon were a
   light sphere. Andrew's moon is the zorb, projected onto, so items 4 to 6
   carry it and its skin must diffuse light (frosted, white or a liner).
   [Imagine Inflatables](https://www.imagine-inflatables.com/inflatable-helium-shapes/sphere-giant-balloon/),
   [Giant Inflatables](https://www.giant-inflatables.com/giant-inflatable-balls.htm),
   [LookOurWay hanging spheres](https://lookourway.com/products/custom-inflatable-hanging-balls).
2. **A net or crown over a plain sphere.** If the chosen sphere has no rated
   rings, a knotless cargo net or four webbing straps over the top meeting at
   a ring (a crown) spreads the load over the skin instead of a seam. The
   same trick carries weather balloons and helium blimps. It also gives the
   lower straps for the tag lines and the strap-down.
3. **A PVC frame around the sphere: no.** A full cage adds weight, wind
   area and shadows on the projection surface, and still has to be hung
   from something rated.
4. **Two rings: one under, one over, rolled at Denhac.** Andrew's idea,
   and the best one here because nothing attaches to the sphere's skin. A
   bought lyra (about 1 m) is too small: it would sit only 0.10 m above the
   bottom of a 2.5 m sphere. Roll bigger ones. Andrew has a pipe bender,
   Denhac has the shop, and Odd Todd makes metal. The geometry for a 2.5 m
   sphere:

   | Lower ring diameter | Sits above the sphere's bottom | Contact circle, up from the bottom |
   | ---: | ---: | ---: |
   | 1.6 m | 0.29 m | 40° |
   | 1.8 m | 0.38 m | 46° |
   | 2.0 m | 0.50 m | 53° |

   A 1.8 to 2.0 m lower ring cradles the sphere deep enough to hold it in
   wind; an upper ring of about 1.5 m sits 0.25 m below the top. Tie the
   two with three or four straps and the sphere is captured in a loose
   armillary: leave the straps slack and the moon still turns, cinch them
   for a blow. Three lines from the upper ring to the swivel and halyard;
   the whole basket lowers onto the cradle as one. Any cheap sealed sphere
   works, no D-rings needed, and the sphere can be swapped without
   re-rigging. Pad the rings where they touch the skin (pipe insulation) so
   they do not chafe or print a line in the projection. The rings read as
   an armillary around the moon, which is a gift rather than a cost.
   Weight: 1 in EMT is about 0.78 lb per foot, so a 2.0 m ring (20.6 ft)
   is about 7 kg and the pair about 13 kg; with the sphere the hang is
   under 20 kg, trivial for either rig. Use a ring roller for a true circle
   (a conduit bender makes a polygon); 3/4 in steel tube or 1 in EMT both
   work at this load. Materials are an allowance in the ledger; Todd's time
   is in-kind. Prior work: display globes on ring stands and hanging
   planters, scaled up; the look is the armillary sphere.
5. **A triangle instead of a ring: even better to build.** Three straight
   tubes and three corner welds (or bolted corner plates, so it flat-packs)
   need no ring roller, and the three corners are natural bridle points.
   The sphere touches each side once, at its midpoint; the seat depth is set
   by the triangle's inscribed circle, so a triangle seats like a ring of
   that inscribed diameter:

   | Inscribed diameter | Side length | Corner from centre | Seat above the sphere's bottom |
   | ---: | ---: | ---: | ---: |
   | 1.8 m | 3.12 m | 1.80 m | 0.38 m |
   | 2.0 m | 3.46 m | 2.00 m | 0.50 m |
   | 2.2 m | 3.81 m | 2.20 m | 0.66 m |

   Do not add rigid legs from the corners to an apex: straight legs from a
   base that tight would graze the sphere unless the base grows past 3.8 m
   a side, and rigid legs cast shadows across the projection. Use rope: a
   three-line bridle from the corners to the swivel (thin, no shadow), and
   three straps over the top meeting at a small ring to stop lift-out. The
   base sits below the lit band, so it throws no shadow. A 3.12 m triangle
   in 1 in EMT is about 9.4 m of tube, about 7 kg; it uses more tube than a
   1.8 m ring (5.7 m) but no special tooling. Transport: 3.1 m sides go in
   the truck bed with the tailgate down, or make each side two pieces with
   a sleeve joint. This is the version to build first with Todd.
6. **A lyra inside the triangle as the seat.** Andrew's refinement: weld or
   U-bolt a lyra (or any 0.9 to 1.2 m steel loop) at the centre of the
   triangle, in the same plane. The loop gives a continuous padded contact
   band instead of three point contacts, centres the sphere by itself, and
   lets it turn; the triangle stops being the seat and becomes the
   spreader that holds the loop and gives three well-separated anchor
   points. With a 1 m loop the sphere sits only 0.10 m above its bottom
   (contact 24° up). Andrew's call: the zorb seats itself in the loop and
   nothing goes over the top in normal use; the moon sits free and can
   turn. The loop must sit below the sphere's equator (a ring above the
   equator pushes a sphere down and out and cannot carry it), so loop size
   sets the depth: a 1 m lyra seats 0.10 m, a 6 ft trampoline ring 0.40 m,
   a 2 m ring 0.50 m; deeper is steadier in wind. The lift is a three-line
   rope bridle from the triangle corners to the swivel. For the lines to
   clear the sphere, the corners need to be about 2.2 m from centre
   (3.8 m sides) with the bridle apex about 2.6 m above the sphere's centre,
   which needs a 16 ft rig or a lowered sphere centre on 14 ft stands; with
   corners closer in, the lines rest lightly on the sphere, which marks the
   projection but does no harm. Keep two light straps in the kit for wind,
   clipped over the top only when the forecast says so. A 6 ft trampoline
   ring in the middle of a triangle does the same job as a lyra, deeper.

Reference rigs: NOAA's Science On a Sphere hangs a 55 lb carbon-fibre sphere
from three thin cables; Luke Jerram's seven-metre Museum of the Moon is
hung by certified riggers from multiple points with hoists and winches, with
an internal fan keeping it inflated. Ours is a zorb of tens of kilograms on
one bridle and a winch, which a rated sailor's kit and the aerial rig's
working load cover with margin; a 220 lb crank stand does not, so the
goalpost option needs the truss and stand ratings checked against the
zorb's actual weight.
[SOS](https://sos.noaa.gov/sos/getting-sos/all/),
[Museum of the Moon rigging notes](https://enlx.co.uk/luke-jerram-museum-of-the-moon/).

7. **Lander legs: the ground state becomes the design.** Andrew's idea:
   three detachable (or hinged, folding) legs pinned to the triangle's
   corner plates, each with a foot pad, so that when the moon is on the
   ground it stands like a landed probe. NASA's own Enceladus mission
   concept is the Orbilander, which orbits and then lands; the preserved
   NASA PDF is in `source/research/2026-09-30/`. Geometry: with a 3.12 m
   triangle (seat 0.38 m above the sphere's bottom), legs that put the
   triangle plane 0.85 m above the sand give a sphere centre at 1.72 m, the
   same sightline as the hung version, and a sphere top at 2.97 m, just
   under 10 ft. So the landed moon is a complete, rig-free version of the
   piece, not a compromise: same projectors, same cameras on the corners,
   same spots, nothing overhead. Splay the legs to about a 2.5 m radius
   and sandbag the pads; with roughly 100 kg of sphere and frame plus three
   20 kg bags, the restoring moment is about 1,960 N·m, against an
   overturning moment of about 440 N·m at 30 mph and about 1,210 N·m at
   50 mph on a 2.5 m sphere, using the research brief's illustrative drag
   formula (Cd 0.47, air 1.225 kg/m³, moment arm at the 1.72 m centre).
   Comfortable at 30 mph, only 1.6× at 50 mph, which is why the moon is
   deflated above the second wind limit regardless of configuration; a
   rigger checks the real numbers. Legs are the same tube as the triangle, about 1.2 m each,
   pinned so they go on in minutes; hinged legs that fold up under the hung
   moon read as a lander in flight, which is the better look if the hinge
   is simple. Show beat for "Showtime!": the moon can land each night at a
   set hour, winched down onto its legs with the plumes dying back as it
   touches down, and lift off again at dusk the next day.

8. **One unit: hangable, legs, triangle, projectors and cameras on it.**
   Andrew's direction, October 1: the triangle should carry the projectors
   as well as the cameras, so the whole piece is one rig that hangs, lands
   and keeps its own alignment. The arithmetic decides how:
   - A standard-throw Optoma HD146X (throw 1.47 to 1.62) needs about 4 m
     from the sphere's surface to paint a 2.5 m moon. From a triangle
     corner 2.2 m from centre the surface is only 0.95 m away, so a
     standard head on the corner paints a 0.6 m patch. The Seed projectors
     therefore stay on stands at 4 m this year.
   - A short-throw head such as the Optoma ZH350ST (throw 0.496, 3 kg,
     $1,499 in Codex's workbook) paints 2.5 m from 1.24 m, which is only
     0.3 m beyond the corner: a short outrigger, counterweighted by the
     opposite corner, carries it. Three corners at 120° give the continuous
     wrap, each head below the equator aiming up, which lights the band
     people look at and leaves the hidden top alone. Weight: three heads
     and arms add roughly 12 kg to the hang, still inside the rig's working
     load, and the lander legs carry the same unit on the ground. Heat and
     rain covers ride the arms. This is the one-unit upgrade: the same
     triangle, three short-throw heads instead of two standard ones, and
     the projector stands disappear.
   - Outward-angled mounts (Andrew, October 1): the corner plates can carry
     arms that angle up and outward from the triangle plane, stayed back to
     the top ring with a line, so a head sits farther out and aims up at
     the moon. From a 2.2 m corner, a 2 m arm puts a head about 2.75 m from
     the surface, where a standard-throw HD146X paints a 1.7 to 1.9 m
     patch; a 2.5 m arm gives about 2.2 m. Three such heads at 120° leave
     thin gaps at the equator, four at 90° close them, and a short-throw
     head on the same arm fills the moon with room to spare. The arms also
     give the cameras a higher, wider view of the spots. Counterweight or
     a stay to the opposite corner keeps the frame level; the rigger signs
     off the hang with the arms loaded.
   - Cameras inside the zorb (Andrew's call, October 1): two $25 phones go
     in before inflation on suction or strap mounts with a USB power bank
     each, look out through the clear TPU at the two spots, and talk to
     the mini PC over the private Wi‑Fi. The clear skin is their window,
     which is why the projection medium is haze inside the zorb, from the
     owned hazer during inflation (Codex's P014 and P015 research): the
     sphere glows as a volume rather than as a screen, the cameras keep
     their view, and a frosted inner liner with clear camera ports is the
     fallback if the bench test wants a denser surface. Phone heat and
     battery life inside a sealed sphere are the two things the bench test
     measures first.
   - Media host (Andrew, October 1): a cheap N100-class mini PC with two
     HDMI plus a DisplayPort or USB‑C output, so it can drive three heads,
     listed at about $150 to $200; the artist's laptop does the same job
     at $0, and a Raspberry Pi 5 is the fallback. HDMI cables run to the
     heads: the HD146X has no wireless input, cheap wireless projectors
     are too dim for a 2.5 m moon outdoors, and wireless HDMI kits ($65 to
     $150 a link) add 60 to 120 ms, which a live composite would show.
   - Layout jig: on the ground, a rope triangle from the lander feet to the
     projector stands makes the 4 m geometry repeatable in minutes.

## Scrap and repurpose: cheaper parts for the basket and the hang

No prices are claimed for second-hand items; Marketplace and Craigslist set
them, and "often free" means people give these away to avoid the dump run.

| Part | Salvage candidate | Why it fits | Watch out |
| --- | --- | --- | --- |
| Lower ring | A **6 ft kids' trampoline frame**: a 1.83 m ring of galvanised tube in curved segments that slot together | It is the 1.8 m ring already rolled; seats a 2.5 m sphere 0.38 m above its bottom; flat-packs into segments | Check the segment joints are tight (pin or screw them); a 7 ft frame (2.13 m) seats at 0.60 m, also fine; 8 ft (2.44 m) is too shallow, the sphere sits almost at its equator |
| Triangle sides | **Chain-link fence top rail** (1 3/8 in galvanised tube, 10.5 ft sticks) or bed-frame angle iron | Straight, cheap new and common used; top rail swages end to end so sides can be made from pieces | Angle iron is heavy and sharp at the contact points; pad it |
| Legs or stands | **Used DJ lighting crank stands**, old satellite-dish poles, scaffold frames | The crank-stand goalpost second-hand | Crank stands need the manufacturer rating label still on them |
| Hoist | A **boat-trailer hand winch** on the rig leg instead of a cleat | Andrew's "mariner hoist": a brake, a handle, a few metres of line, cheap new or free off a dead trailer | Winch the halyard only; the safety sling still goes on separately |
| Projector weather covers | **Plastic storage totes** with a lens hole and a vent, the common DIY outdoor-projector box | A few dollars each instead of $60 to $150 | Heat: leave a vent and run a small fan; test one hot night |
| Rigging | Andrew's own aerial slings, carabiners, swivel | He already rigs; a lyra kit's swivel and span sets transfer directly | Keep rated gear for the hang path, scrap for the frame |
| Ballast | Sandbags filled on site | Beach sand is free; bring the empty bags | Fill after placement is confirmed; empty before leaving |

The trampoline ring is the one to chase first: it removes the ring roller,
the corner welds and most of the tube bill, and a 6 ft frame with the mat
and springs gone is exactly a padded ring short of done. Pipe insulation
over the tube where it touches the sphere, three lines from the frame legs'
sockets to the swivel, three straps over the top, and the basket is built.

## What this changes in the application

Nothing in the ask. It adds three citations the committee may recognise
(Science On a Sphere, a festival inflatable projection sphere, Paul Bourke),
a clear answer on projector count, and two $20 arms to the parts list. The
ledger's third-projector line is the first thing a sponsor ticket would buy.
