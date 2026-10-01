/** Metres, Y-up; truck rear axle X=0, nose toward -X. See the source register. */
export const RAM = {
  length: 6.348, wheelbase: 4.074, height: 2.036,
  frontTrack: 1.745, rearTrack: 1.729,
  bedLength: 1.9385, bedWidth: 1.6869, bedDepth: 0.5111, wheelhouseGap: 1.2954,
  // Body-builder width is a different datum from the press sheet's 2.120 m at SgRP.
  // These layout values are provisional, not measured on Andrew's truck.
  bodyWidth: 2.0174, frontOverhang: 0.94, bedFloor: 1.0, tireDiameter: 0.8422,
  tireWidth: 0.275, wheelDiameter: 0.4572, receiverHeight: 0.55,
  receiverPinInset: 0.13, gooseneckAxleOffset: 0,
} as const;
export const REAR_END = RAM.length - RAM.wheelbase - RAM.frontOverhang;
export const BED_REAR = REAR_END - 0.14;
export const BED_FRONT = BED_REAR - RAM.bedLength;
export const RECEIVER = { aperture: 0.0635, wall: 0.006, length: 0.30 } as const;
/** Pre-Gen-3 #3220, Andersen's January 2022 drawing p5. Installed setting unknown. */
export const ANDERSEN = {
  length: 31.5 * 0.0254, width: 35.625 * 0.0254, baseHeight: 13 * 0.0254,
  lowBallTop: 16.5 * 0.0254, highBallTop: 18.3125 * 0.0254,
  ballDiameter: 2.3125 * 0.0254, ballOffset: 5.4375 * 0.0254,
  frontEdge: -14.0625 * 0.0254, rearEdge: 17.4375 * 0.0254,
} as const;
export interface ModelStudy { id: string; label: string; group: string; budget: string | null; note: string }
const research = "Unpriced research study; geometry and reactions require review. ";
export const MODEL_STUDIES: ModelStudy[] = [
  { id: "ground-light", label: "Ground light · 2 m", group: "Budget options", budget: "ground-light", note: "Internal light; no projection or occupant. Cradle and wind restraint are conceptual." },
  { id: "ground-half", label: "Curved half-screen", group: "Budget options", budget: "ground-half", note: "Open hemisphere on its own base; one projection stand. No enclosed occupant." },
  { id: "ground-sphere", label: "Ground cradle", group: "Budget options", budget: "ground-sphere", note: "3 m unoccupied sphere; low cradle and separate projection stands." },
  { id: "fixed-bed", label: "Fixed truck bed", group: "Budget options", budget: "fixed-bed", note: "The 3 m globe overhangs the 1.94 m bed. An elevated custom frame is shown; sheet metal is not an approved anchor." },
  { id: "fixed-pedestal", label: "Fixed pedestal", group: "Budget options", budget: "fixed-pedestal", note: "3 m sphere on a custom pedestal; base and ballast are illustrative." },
  { id: "existing-hang", label: "Existing host point", group: "Budget options", budget: "existing-hang", note: "Host structure unspecified. A floating reference point is not a verified anchor." },
  { id: "fixed-cantilever", label: "Fixed truck cantilever", group: "Budget options", budget: "fixed-cantilever", note: "Short fixed chassis concept. Interfaces, member sizes and stabilization remain unengineered." },
  { id: "own-gantry", label: "Freestanding portal", group: "Budget options", budget: "own-gantry", note: "Independent ground-bearing portal; ballast pads show space only, not a weight calculation." },
  { id: "receiver-crane", label: "Receiver crane + ground leg", group: "Mount studies", budget: null, note: research + "SpitzLift category study with ground leg and a 4 ft boom envelope; not a full-size sphere support or personnel lift." },
  { id: "bed-crane", label: "Bed-corner material crane", group: "Mount studies", budget: null, note: research + "HAUL-MASTER category, maximum 53⅜ in boom envelope. A small material load is shown; no full-size globe fit is claimed." },
  { id: "chassis-short", label: "Short chassis mast", group: "Mount studies", budget: null, note: research + "Fixed mast with independent AV. This is a layout to quote, not a rated product." },
  { id: "truck-portal", label: "Truck-adjacent ground portal", group: "Mount studies", budget: null, note: research + "Legs carry to ground; the displayed truck is parked independently. Any assisted connection needs design." },
  { id: "trailer-portal", label: "Trailer-mounted portal", group: "Mount studies", budget: null, note: research + "Trailer and outriggers are generic envelopes. No trailer product selected." },
  { id: "aerial-rig", label: "Tall four-leg aerial rig", group: "Mount studies", budget: null, note: research + "6 m high / 5.5 m footprint illustrative rig, not an exact JuggleGear or ACHILLE product. Globe-leg fit is visible, not certified." },
  { id: "tree-single", label: "Single assessed tree", group: "Mount studies", budget: null, note: research + "Illustrative tree and protected attachment. Requires this tree's owner, arborist, rigger and venue approval." },
  { id: "tree-highline", label: "Two-tree highline comparison", group: "Mount studies", budget: null, note: research + "Sagging line illustrates the span only; no tensions or tree capacity established. Not the budget baseline." },
  { id: "fixed15-study", label: "Fixed15 with Ram layout", group: "Mount studies", budget: null, note: research + "15 ft (4.572 m) pin-to-suspension datum retained; source heights 4.60/5.20 m. This rebuild is separate from the untouched v4 GLB." },
  { id: "ram-2021", label: "2021 Ram 2500 Mega Cab", group: "Hardware", budget: null, note: "Laramie Mega Cab 4x4. Manufacturer wheelbase, length, tracks and bed dimensions; white body styling, wheels, overhang split and installation datums are approximations." },
  { id: "factory-receiver", label: "Factory rear receiver", group: "Hardware", budget: null, note: "Andrew confirms factory receiver. 2½ in aperture reference; crossmember, brackets, welds, pin datum and wall thickness are unmeasured. Not fabrication CAD." },
  { id: "andersen-original", label: "Original Andersen Ultimate", group: "Hardware", budget: null, note: "Andrew confirms original Ultimate. Pre-Gen-3 #3220 reference from January 2022 manual, lower ball setting shown. Exact revision and installed height remain unconfirmed." },
];
