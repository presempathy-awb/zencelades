# Enceladus Within: engineering and experience research

Prepared by Codex on September 30, 2026 for P009. **Recommended development
baseline: a stationary, unoccupied sphere on dry land, with no internal cameras.**
Prove the projected experience on real material before selecting a truck boom or
aerial support. This retains the moon/ocean transformation while making the first
meaningful prototype much easier to evaluate.

This is a decision brief, not construction documentation. It extends the
[v3 asset review](asset-understanding.md), [priced alternatives](pricing-alternatives.md)
and [Love Burn research](love-burn-research.md). Source IDs below match
[the research register](../assets/engineering-sources.json). Proposed experiments
and comparisons are Codex's engineering interpretation; a cited installation,
catalogue entry or laboratory result does not approve this installation.

## What changes the project most

| Finding | Consequence for Enceladus | Evidence still needed |
| --- | --- | --- |
| A transparent ball and a diffuse projection screen perform different jobs | Compare opaque, translucent and transparent samples before buying the final sphere | Actual surface, seams, opposite-wall ghosting, audience angles, ambient light |
| Four projectors do not establish complete or convincing coverage | Keep important imagery away from measured gaps; test a full orbit of audience views | Real lens/throw geometry, rig shadows, overlaps, brightness and focus |
| Moving projection is an additional tracking problem | Keep the first sphere stationary; separate surface tracking from human capture | End-to-end latency, occlusion/reacquisition and loss-of-tracking behavior |
| Removing the truck or water removes major integration work | Keep ground-supported and freestanding options as serious finished artworks | Placement footprint, accessible route, site-specific support design |
| Hanging above water may still trigger coastal review | Dry land and “over water without touching it” are different permission cases | Exact coordinates, tidal boundary, installation/removal methods and agency screening |

## 1. Design the optical object before its support

NOAA's Science On a Sphere is a strong reference for a spherical experience:
a rigid opaque surface, four projectors, controlled light and stable mounting.
Its roughly 1.7 m sphere is materially different from the supplied 3.4 m
transparent, moving concept. NOAA also describes polar gaps and the importance
of projector placement. This is a reference architecture, not validation of our
particular scale, optical material or outdoor setting.
[NOAA installation guidance — E01](https://sos.noaa.gov/sos/getting-sos/all/)

The existing mapper's 85.5755% area-weighted coverage is useful geometry evidence
for its saved configuration. Its model uses the first intersection with an
opaque diffuse sphere. It does not establish how a transparent near wall, far
wall, seams, reflections, a person or the support rig will look. Preserve the
14.4245% uncovered result as a design input; a cinematic board cannot replace it.

Three material directions deserve a small physical comparison:

| Direction | Artistic opportunity | Question the test must answer |
| --- | --- | --- |
| Opaque diffuse sphere or shell | Strong moon identity and controlled exterior image | Does the surface hold contrast under the planned surrounding light? |
| Translucent surface designed for projection | Interior glow and a softer, luminous object | Is transmission useful from the audience positions, or does the projector create a hot spot? |
| Transparent ball or partial transparent/diffuse construction | Visible person/object and reflections | Can the desired transparency coexist with a legible projected image without unacceptable ghosting? |

Rosco distinguishes front-reflective and rear-transmissive screens and notes
ambient-light and viewing-angle tradeoffs. Its flat theatrical screen guidance
does not certify a curved inflatable material. The guide's seam and handling
discussion is useful for sample selection; material gain figures are not a
brightness promise for a complete sphere.
[Rosco guide, 2018, PDF pp. 1–6 — E03](https://jp.rosco.com/sites/default/files/content/resource/2018-07/Rosco_Guide_to_Projection_Screens.pdf)

For the P0 bench, record the actual projector and lens, throw, image size,
surface product and finish, seam direction, ambient illuminance, viewing
positions, focus, visible overlap and photographs with fixed exposure. Use a
recognizable face, fine ice ridges, a gray ramp, a white patch and a dark scene.
Ask whether the audience can understand the transformation at the expected
distance, not merely whether any image appears.

A 3.4 m sphere has about **36.32 m² of surface** and **9.08 m² of projected
frontal area**. These are geometry, not a lumen specification. Doubling diameter
quadruples area; projector output, delivered light, screen reflectance, overlap
and ambient conditions must still be measured. Do not buy from the old boards'
unverified lumen/cost labels alone.

Physical alignment comes before fine image warping. NOAA's alignment workflow
progresses through coarse placement and test patterns before fine adjustment.
Give the crew a repeatable calibration pattern and fixed reference marks, so a
moved projector can be identified rather than silently compensated by a new
artistic edit.
[NOAA alignment manual — E02](https://sos.noaa.gov/support/sos/manuals/alignment/all/)

## 2. “No GoPros inside” is a useful architecture decision

There are three separate camera jobs: calibration of projector-to-surface
geometry, tracking a moving sphere, and capturing a human image. Removing
internal human cameras does not require abandoning all calibration tools.
Christie's camera-assisted alignment product is an example of the first job;
it is not evidence that a human reconstruction or freely moving ball is solved.
[Christie Mystique Pro Venue — E05](https://www.christiedigital.com/products/warping-blending/mystique/Mystique-pro-venue-edition/)

The University of Tokyo's VarioLight2 research uses high-speed projected markers
to track a rotating sphere. It specifically addresses ambiguous orientation and
recovery after occlusion; its page discusses all-around multi-projector coverage
as further development. A controlled laboratory demonstration is evidence of
the problem and one approach, not a ready beach system.
[VarioLight2 research — E04](https://ishikawa-vision.org/mvf/VarioLight2/index-e.html)

Recommended order for interaction:

1. **Pre-rendered moon/ocean loop:** the artwork works immediately without capture
   permission, network service or tracking.
2. **Simple opt-in control outside the sphere:** a visitor changes the moon/ocean
   balance or pace using an accessible control; an idle timeout restores the loop.
3. **Optional external silhouette or live image:** only if a physical comparison
   shows a better experience and the capture/consent behavior is explicit.
4. **Sphere movement:** only after stationary optics work and the team can
   measure tracking delay and recovery independently.
5. **Occupied development:** a separately engineered proposal, outside the
   current unoccupied build scope.

Useful acceptance measurements are visible misregistration during motion,
time from physical motion to correct output, and recovery after a marker or
camera is obscured. A calm fallback image is appropriate for a media fault;
the media process must not command or substitute for rigging safety controls.
The supplied v3 controller already states that separation.

## 3. Compare support systems by the complete load path

| Layout | What it offers | What must be resolved before fabrication |
| --- | --- | --- |
| Ground-supported sphere or low cradle | Smallest height and recovery complexity; good optical prototype | Anti-roll/restraint design, wind stability, contact stresses, accessibility and projector sightlines |
| Freestanding frame or truss on dry land | Clear separation from vehicle availability; reusable installation | Every connection, ballast/anchorage, sand support, guy-line footprint and assembly method |
| Stationary truck-supported structure | Transport and a visually coherent support object | Exact vehicle, chassis/upfit interface, axle loads, tire/ground support, load directions and recovery |
| Suspension from an existing approved structure | Potentially lower fabrication burden | Owner permission, documented point capacity/directions, other simultaneous loads and the full supporting structure |
| Water-adjacent or over-water rig | Strongest literal ocean connection | Coastal permissions, water-level/wave effects, corrosion, electrical separation, recovery and habitat impacts |

“Fully fixed truck mount” is simpler operationally than an articulating boom but
still transmits overturning moment, uplift and lateral force. A towing label is
not automatically a rating for an elevated cantilever or performer system.
Two connections are not automatically independent redundancy if both rely on
the same unverified chassis attachment or load path.

The saved load example uses fictional masses. Its support reactions and axle
transfer are **demands**, not evidence that the truck or hitch can resist them.
Obtain the actual VIN/configuration, axle labels and weighed condition, hitch
model, under-bed attachment, fabrication drawings and intended load directions.
A newer general RAM upfitter guide or a different Andersen rail-mount manual
cannot establish the suitability of Andrew's particular 2021 truck.
[RAM general body-builder reference — E11](https://www.ramtrucks.com/BodyBuilder/service/Image?imageId=MtQrP%2FFqLY5r%2Fest8MtGjGgHzAHGUTU0WB3rWuqSY7YmQ2vEhuBWBO5qk3wwiza%2F),
[Andersen model-specific reference — E12](https://help.andersenhitches.com/s/3200-Ultimate-RM-Installation-10-2018-Low-Res.pdf)

Ground support also needs design. Loose or saturated sand changes bearing and
anchor behavior; the proposed load direction, installation method and site
conditions matter. Ask the structural/geotechnical designer to define the
required site evidence, anchorage acceptance method and inspection record.
The event's generic staking advice is not an anchor capacity schedule.
Borrowing a neighboring camp's stake, tree, vehicle or rig requires both
permission and a demonstrated complete load path.

### Standards to put in the engineer's scope

These are **catalogue-level references**, not claims that full clauses were
reviewed or that every standard applies. ESTA's direct catalogue fetch failed;
its primary indexed listings supplied the edition/scope evidence.

| Reference found | Relevant question | Boundary |
| --- | --- | --- |
| ANSI E1.21–2024, temporary outdoor entertainment structures | How should the temporary outdoor support be designed and managed? | The older E1.21–2023 PDF is superseded; a design wind value is not an operating shutdown threshold |
| ANSI E1.43–2025, performer flying systems | What changes if a person is supported or flown? | Current unoccupied work does not establish occupied suitability |
| ANSI E1.53–2025, overhead mounting of portable devices | How are projectors and other overhead devices secured? | Does not rate the whole boom or its foundation |
| ANSI E1.56–2026, rigging support points | What information belongs with a rated support point? | Scope concerns stationary permanent facilities; not a general truck-anchor approval |

[ESTA published standards catalogue — E10](https://tsp.esta.org/tsp/documents/published_docs.php)

The sealed consumer water-walking-ball concept remains outside the baseline.
CPSC's warning identifies suffocation, drowning and escape hazards. Removing
internal cameras or adding a backup cable does not resolve those hazards.
[CPSC, 2011 — E13](https://www.cpsc.gov/Newsroom/News-Releases/2011/Consumer-Alert-CPSC-Warns-of-Deadly-Danger-with-Water-Walking-Balls?language=en)

## 4. Wind, water and weather are separate design inputs

For a preliminary comparison, sphere drag follows
`F_D = 0.5 × rho × C_D × A × V²`. NASA explains why the coefficient depends on
flow regime and surface roughness. At otherwise fixed conditions, doubling wind
speed quadruples drag. That relationship is useful; selecting a generic
coefficient and calling the result a safe wind limit would not be.
[NASA sphere drag — E14](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag-of-a-sphere/)

The full demand model also needs the boom, screen, cables and equipment, plus
gust/dynamic response, eccentricity, erection state and load combinations.
A protected storage state can have a different geometry from an operating
state. Have the designer define the measurable operating and shutdown limits,
the time needed to reach the safe state, and who can order that transition.

NOAA's Virginia Key station is a useful local water-level and wind reference.
Station data, astronomical tide predictions, local wave exposure and storm
effects are different inputs. Preserve datum and timezone when using levels;
a station observation or predicted tide is not a beach-specific design value
or a February 2027 forecast.
[Station 8723214 — E19](https://www.tidesandcurrents.noaa.gov/stationhome.html?id=8723214)

For a water-contact concept, the analysis expands to buoyancy, changing immersion,
drag and wave/slam loads, tether geometry, abrasion and retrieval. No wave limit,
tether strength, ballast mass or anchor size is established by this research.
Dry land avoids those particular water-contact loads but still requires wind,
rain, ground and public-access design.

Assign a crew member authority to monitor weather and stop operation. The
National Weather Service advises substantial shelter or a suitable enclosed
vehicle, and waiting at least 30 minutes after the last thunder before resuming
exposed activity. A beach canopy
is not lightning shelter. Plan the travel time and crowd route to real shelter.
[NWS outdoor lightning guidance — E21](https://www.weather.gov/safety/lightning-outdoors)

## 5. Water placement is an early permission decision

Miami-Dade's Class I guidance covers specified work **in, on, over or upon**
tidal waters and coastal wetlands, subject to exceptions. Accordingly, keeping
the sphere above water does not itself settle the permit question. The County
also notes that other agencies' permissions can be required. Exact applicability
belongs to the agencies reviewing the actual location and activity.
[Miami-Dade Class I guidance — E16](https://www.miamidade.gov/global/permit.page%3FMduid_permit=per1723653396938982)

The 2025 Biscayne Bay Aquatic Preserve management plan provides ecological and
management context, including Virginia Key, seagrass and submerged-land rules.
It does not identify our granted placement parcel. FDEP's resource-management
guidance emphasizes avoiding and minimizing habitat impacts.
[FDEP plan — E17](https://floridadep.gov/sites/default/files/Biscayne-Bay-AP-Management-Plan.pdf),
[FDEP resource management — E18](https://floridadep.gov/rcp/aquatic-preserve/content/resource-management-programs-biscayne-bay-aquatic-preserves)

Before paying for a water-specific rig, assemble a single site sheet: exact
placement coordinates and footprint; height and shoreline relationship;
foundation/anchor and vehicle positions; installation and removal method; all
water or bottom contact; cable/power routes; public access and recovery areas.
Ask Love Burn/landowner and the reviewing agencies to identify the applicable
approvals against that sheet. No outreach has been sent.

Miami's special-event process also flags building permits for relevant temporary
structures. Event placement, an Art Committee Offer Notice, landowner permission,
engineering acceptance and agency permits are separate records.
[City of Miami event permits — E15](https://www.miami.gov/Permits-Construction/Filming-and-Events/Get-a-Special-Event-Permit),
[Love Burn survival guide — E20](https://theloveburn.com/survivalguide)

## 6. Engineer the powered installation, including its enclosure

Make one load schedule from the **actual** projector/lens configurations,
computers, cooling, network equipment and any inflation hardware. Record voltage,
manufacturer input VA/current, startup behavior, cable distance, distribution and
the assigned source. Lumen output is not electrical consumption; a generator's
headline capacity does not allocate individual circuits.

OSHA's portable-generator guidance distinguishes grounding/bonding arrangements;
a ground rod is not a universal solution for every generator connection.
Have the event electrician specify the source topology, protective devices and
wet-location distribution. The fact sheet is a useful reference, not an
installation-specific wiring instruction.
[OSHA generator fact sheet — E22](https://www.osha.gov/sites/default/files/publications/grounding_port_generator.pdf),
[OSHA wiring methods — E23](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.305)

An outdoor projector enclosure must maintain its protection while dissipating
heat, passing the optical beam and accepting cables. Tempest's coastal and
Burning Man case studies are useful examples of the environmental problem;
they are manufacturer accounts, not independent qualification of our proposed
equipment.
[Coastal example — E06](https://tempest.biz/project/sheraton-waikiki/),
[Burning Man example — E07](https://tempest.biz/project/burning-man/)

The preserved NEMA handout is dated 2008 and summarizes NEMA 250–2003. It helps
distinguish 4X corrosion/splash protection from immersion-related enclosure types.
For procurement, the publisher store identifies EN 10250–2024; its scope
explicitly leaves internal condensation and thermal effects outside that
enclosure standard's protection requirements. A May 2026 ballot listing is not
proof that a 2026 edition has been published. Obtain current product/system
documentation rather than specifying from the old handout.
[NEMA historical handout — E08](https://www.nema.org/docs/default-source/products-document-library/nema-enclosure-types.pdf),
[NEMA publisher catalogue — E09](https://store.accuristech.com/standards/ansi-nema-en-10250-2024?product_id=2914175),
[NEMA standards action — E30](https://www.nema.org/docs/default-source/default-document-library/public/standards-actions/nema-standards-action-may-2026.pdf?sfvrsn=ec796e84_2)

Put the media computer's recoverable state and the physical installation's safe
state in separate operating instructions. If a computer restarts, use a known
local loop and saved calibration. If power or weather makes the physical
installation unsuitable, follow the independently defined shutdown procedure.

## 7. Make the science story stronger than the render

NASA's current Enceladus overview supports the ocean/ice/plume story. Cassini
data revealed phosphate in ice grains associated with the ocean; JPL explicitly
distinguishes ingredients for life from finding life. The projected narrative
can be compelling while preserving that uncertainty.
[NASA overview — E24](https://science.nasa.gov/saturn/moons/enceladus/),
[JPL phosphate finding, 2023 — E26](https://www.jpl.nasa.gov/news/nasa-cassini-data-reveals-building-block-for-life-in-enceladus-ocean/)

A useful content sequence is: observed icy exterior → mapped fissures and plume
activity → a clearly labeled interpretation of the hidden ocean → the visitor's
own ocean/body metaphor. Label each asset as observed data, scientific
interpretation or artistic transformation. An attractive procedural ice texture
does not become NASA imagery through its caption.

The 186-page Orbilander file is a **2020 mission concept study** for the
2023–2032 decadal survey, despite its later website upload path. Its science
traceability approach is a useful creative planning model: pair each question
with what the audience actually sees and the evidence behind it. It is not an
approved mission schedule or an art-project budget.
[Orbilander study, PDF pp. 1, 15–17 — E25](https://science.nasa.gov/wp-content/uploads/2023/11/enceladus-orbilander.pdf)

USGS identifies a Cassini global mosaic at 100 m/pixel, a useful candidate to
replace the package's currently absent real map. The identified TIFF is
518,340,175 bytes by HTTP metadata; it has **not been downloaded or hash-verified**.
Before converting it, verify projection, longitude convention, latitude
definition, seam orientation and credits against its metadata. Preserve the
master in lakeFS and keep reduced show textures as separately identified
derivatives. A source URL and a procedural substitute are not equivalent.
[USGS dataset record — E27](https://astrogeology.usgs.gov/search/map/enceladus-cassini-global-mosaic-100m-schenk)

Do not copy VarioLight demonstration videos into the show: that page explicitly
requires permission for video use. Publicly downloadable manuals also do not
automatically grant rights to distribute every embedded image. The acquired
research references remain private pending any publication-specific rights review.

## 8. The visitor experience and the crew experience

Keep a useful experience available from the accessible viewing area without
requiring a person to climb, enter a ball, be filmed or stand in water.
Plan firm, stable routes over the beach, seated sightlines, readable captions
and control placement, cable/guy-line separation and a clear way to leave.
The Access Board's accessible-route guidance supplies a design reference;
applicability to the final temporary site must still be established.
[US Access Board — E28](https://www.access-board.gov/ada/guides/chapter-4-accessible-routes/)

For the first field rehearsal, carry a short crew sheet: assembly checks,
calibration file revision, local playback start, media fault recovery, weather
authority, physical shutdown, daily inspection and pack-out inventory.
Preload show assets locally, retain a known-good loop and keep a tested spare
copy of settings. Remote website, PG18, Authentik and lakeFS access should support
preparation and provenance; the physical artwork should not need a festival
Internet connection to run its basic loop.

The cost comparison should include crew-hours, transport/handling, enclosure
cooling, power distribution, storage, engineering and permits, calibration time,
spares and removal. A cheaper bare mount can create a more expensive operating
system. Use the existing editable pricing page to compare **complete scenarios**,
rather than comparing only the fabrication line.

## Five decisions that unlock a credible build

| Order | Actor and bounded deliverable | Acceptance evidence |
| --- | --- | --- |
| 1. Material/optics | Andrew selects sample candidates; projection designer runs the dry P0 comparison | Recorded configuration and comparable images from the planned audience positions; decision on transparency |
| 2. Placement/layout | Andrew selects a preferred dry layout and an optional water concept; event/site contacts review a location sheet when contact is authorized | Written placement constraints and identified agency/landowner requirements |
| 3. Structure | Qualified designer evaluates the selected geometry, actual interfaces and ground conditions | Complete load path, component suitability, inspection and operating/shutdown plan |
| 4. Power/operation | Event electrician and crew lead reconcile the actual load schedule, distribution, shelter and recovery | Documented supply allocation and supervised installation/rehearsal records |
| 5. Integrated experience | Creative/technical team rehearses the unoccupied artwork with the final optical setup | Stable loop, legible transition, accessible interaction, media recovery and coordinated physical shutdown |

The occupied/water vision remains a separate future proposal with its own
manufacturer, professional, venue, insurance and recovery gates. The grant can
describe the dry unoccupied artwork as a complete experience and the larger
vision as conditional development.

## Preservation and outstanding storage work

Four original PDFs are downloaded and locally SHA-256 verified:
**107,428,393 bytes, 493 PDF pages** in total. The register records each source,
retrieval time, date limits, inspection scope and planned object path. The files
are in ignored `source/research/2026-09-30/`, outside website build inputs.

**These new references are not yet in lakeFS.** The existing 132-file import and
B2 ZIP receipt are separate completed records and remain unchanged. The running
hesellsheshells policy lacks a thatsnozorb publisher. The earlier locked presvd1
general vault check was superseded by a successful unlocked recheck. The
prepared imports-only policy passes the owner checker, but that is local
validation, not runtime authorization. Reviewed owner delivery remains pending.

[The storage handoff](research-storage.md) includes the exact owner patches and
required readback evidence. New PDF objects belong under
`thatsnozorb-assets/imports/research/2026-09-30/`; original ZIP archives remain
in B2. No new archive was created. The source register deliberately has no
invented lakeFS commit or successful-upload receipt.
