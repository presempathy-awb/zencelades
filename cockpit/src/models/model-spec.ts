/** Metres, Y-up; truck rear axle X=0, nose toward -X. See the source register. */
export const RAM = {
  length: 6.348,
  wheelbase: 4.074,
  height: 2.036,
  frontTrack: 1.745,
  rearTrack: 1.729,
  bedLength: 1.9385,
  bedWidth: 1.6869,
  bedDepth: 0.5111,
  wheelhouseGap: 1.2954,
  // Body-builder width is a different datum from the press sheet's 2.120 m at SgRP.
  // These layout values are provisional, not measured on Andrew's truck.
  bodyWidth: 2.0174,
  frontOverhang: 0.94,
  bedFloor: 1.0,
  tireDiameter: 0.8422,
  tireWidth: 0.275,
  wheelDiameter: 0.4572,
  receiverHeight: 0.55,
  receiverPinInset: 0.13,
  gooseneckAxleOffset: 0,
} as const;
export const REAR_END = RAM.length - RAM.wheelbase - RAM.frontOverhang;
export const BED_REAR = REAR_END - 0.14;
export const BED_FRONT = BED_REAR - RAM.bedLength;
export const RECEIVER = { aperture: 0.0635, wall: 0.006, length: 0.3 } as const;
/** Pre-Gen-3 #3220, Andersen's January 2022 drawing p5. Installed setting unknown. */
export const ANDERSEN = {
  length: 31.5 * 0.0254,
  width: 35.625 * 0.0254,
  baseHeight: 13 * 0.0254,
  lowBallTop: 16.5 * 0.0254,
  highBallTop: 18.3125 * 0.0254,
  ballDiameter: 2.3125 * 0.0254,
  ballOffset: 5.4375 * 0.0254,
  frontEdge: -14.0625 * 0.0254,
  rearEdge: 17.4375 * 0.0254,
} as const;
export interface ModelStudy {
  id: string;
  label: string;
  group: string;
  budget: string | null;
  note: string;
}
const research = "Unpriced research study; geometry and reactions require review. ";
export const MODEL_STUDIES: ModelStudy[] = [
  {
    id: "basket-lander",
    label: "Common holder · lander",
    group: "Common holder",
    budget: null,
    note: "The shared triangle and six-foot padded ring on three detachable legs: two beside the entrance and one behind. Same holder as aerial and truck modes. Arm-mounted projection is an alternate upgrade to the stand-based Love Burn budget. Joints, member sizes, restraint, ballast and occupied operation remain unverified.",
  },
  {
    id: "basket-truck",
    label: "Common holder · truck stretch goal",
    group: "Truck stretch goal",
    budget: null,
    note: "The same triangle, ring and over-sphere webbing hung beside the Ram from a schematic bed-mounted support. Hidden by default and excluded from the Love Burn budget. The visible mast, boom and braces are placement envelopes, not engineered members; no hitch load rating approves this assembly. Attachment, stabilization, wind, complete occupied load path and costs require separate design.",
  },
  {
    id: "love-burn",
    label: "Love Burn · main proposal",
    group: "Common holder",
    budget: "love-burn",
    note: "Current primary build: occupied 2.5 m zorb on the common triangle and padded ring with three lander legs, two purchased projectors on independent stands and two phones inside. The aerial rig and arm-mounted projection remain alternate designs. Product fit, support capacities, optics and operational acceptance remain to be verified.",
  },
  {
    id: "basket-live-overlay",
    label: "Common holder · internal portrait camera study",
    group: "Seed concepts",
    budget: null,
    note: "Landed holder with three arm-mounted projector witnesses and one optional internal camera. Optical equipment, arms, rain protection and live processing are unpriced additions; the $3,000 LED allocation does not cover this assembly. Camera mounting, consent, shell optics and entry need review; no live capture is implemented.",
  },
  {
    id: "seed-surround",
    label: "Occupied open-entry surround",
    group: "Seed concepts",
    budget: "seed-surround",
    note: "Person stands on the ground inside an open scenic sphere; not an inflatable zorb. 3 m nominal envelope, no member sizing, wind or structural approval. Proposed alternative pending Andrew's choice.",
  },
  {
    id: "seed-zorb",
    label: "Common holder · landed on detachable legs",
    group: "Seed concepts",
    budget: "seed-zorb",
    note: "Nominal occupied sphere, six-foot seating loop and low triangle with detachable lower legs and broad lander feet. Same holder as the aerial mode. 1.8 m corner radius leaves 14.4 mm centreline overhang; joints and contact are schematic. No approved member sizes, entry, deflation support, ground stability or construction detail.",
  },
  {
    id: "basket-webbing",
    label: "Andrew's basket · webbing over sphere",
    group: "Seed concepts",
    budget: null,
    note: "Chosen P036 attachment concept: loop → triangle → three webbing legs over the skin → top ring → swivel → halyard. Skin contact carries compression; no shadow-free or seam-clearance claim. Swivel and host unselected; no WLL, member sizes or hanging-system price. Deflation/fall-through support remains unresolved and is not drawn as a working floor.",
  },
  {
    id: "basket-tripod",
    label: "Basket + external tripod study",
    group: "Seed concepts",
    budget: null,
    note: "Same basket with an external tall tripod envelope. Only the basket's rigid parts stay below the equator; host legs remain outside and can cast shadows. Footprint, joints, stability, anchoring and member widths are unengineered; unpriced host is not included in the $3,000 ground allocation.",
  },
  {
    id: "basket-aerial-rig",
    label: "Common holder · aerial rig",
    group: "Common holder",
    budget: null,
    note: "Same triangle and padded ring under a schematic four-leg aerial rig, with over-sphere webbing. The Love Burn budget assumes an existing rig and two stand-mounted projectors; this configurable arm-mounted variant requires its own quotes. Rig model, height/span, complete occupied payload, lowerable suspension and outdoor stability remain to be confirmed.",
  },
  {
    id: "basket-camera-arms",
    label: "Common holder · camera mount study",
    group: "Seed concepts",
    budget: null,
    note: "Same ground holder with one optional external camera-arm witness attached to a triangle corner. Count, device and lens are unselected. Arm strength, retention, entry clearance, optics through the curved shell and added payload/cost need review; no internal camera or live feed is implemented.",
  },
  {
    id: "occupied-cradle",
    label: "Occupied external lifting frame",
    group: "Mount studies",
    budget: null,
    note: "Unpriced occupied research concept. Metal frame and cradle carry the complete assembly; no load is assigned to shell handles. No rated host, design, rigging, wind, rescue or product approval. Not construction CAD.",
  },
  {
    id: "ground-light",
    label: "Ground light · 2 m",
    group: "Budget options",
    budget: "ground-light",
    note: "Internal light; no projection or occupant. Cradle and wind restraint are conceptual.",
  },
  {
    id: "ground-half",
    label: "Curved half-screen",
    group: "Budget options",
    budget: "ground-half",
    note: "Open hemisphere on its own base; one projection stand. No enclosed occupant.",
  },
  {
    id: "ground-sphere",
    label: "Ground cradle",
    group: "Budget options",
    budget: "ground-sphere",
    note: "3 m unoccupied sphere; low cradle and separate projection stands.",
  },
  {
    id: "fixed-bed",
    label: "Fixed truck bed",
    group: "Budget options",
    budget: "fixed-bed",
    note: "The 3 m globe overhangs the 1.94 m bed. An elevated custom frame is shown; sheet metal is not an approved anchor.",
  },
  {
    id: "fixed-pedestal",
    label: "Fixed pedestal",
    group: "Budget options",
    budget: "fixed-pedestal",
    note: "3 m sphere on a custom pedestal; base and ballast are illustrative.",
  },
  {
    id: "existing-hang",
    label: "Existing host point",
    group: "Budget options",
    budget: "existing-hang",
    note: "Host structure unspecified. A floating reference point is not a verified anchor.",
  },
  {
    id: "fixed-cantilever",
    label: "Fixed truck cantilever",
    group: "Budget options",
    budget: "fixed-cantilever",
    note: "Short fixed chassis concept. Interfaces, member sizes and stabilization remain unengineered.",
  },
  {
    id: "own-gantry",
    label: "Freestanding portal",
    group: "Budget options",
    budget: "own-gantry",
    note: "Independent ground-bearing portal; ballast pads show space only, not a weight calculation.",
  },
  {
    id: "receiver-crane",
    label: "Receiver crane + ground leg",
    group: "Mount studies",
    budget: null,
    note:
      research +
      "SpitzLift category study with ground leg and a 4 ft boom envelope; not a full-size sphere support or personnel lift.",
  },
  {
    id: "bed-crane",
    label: "Bed-corner material crane",
    group: "Mount studies",
    budget: null,
    note:
      research +
      "HAUL-MASTER category, maximum 53⅜ in boom envelope. A small material load is shown; no full-size globe fit is claimed.",
  },
  {
    id: "chassis-short",
    label: "Short chassis mast",
    group: "Mount studies",
    budget: null,
    note:
      research + "Fixed mast with independent AV. This is a layout to quote, not a rated product.",
  },
  {
    id: "truck-portal",
    label: "Truck-adjacent ground portal",
    group: "Mount studies",
    budget: null,
    note:
      research +
      "Legs carry to ground; the displayed truck is parked independently. Any assisted connection needs design.",
  },
  {
    id: "trailer-portal",
    label: "Trailer-mounted portal",
    group: "Mount studies",
    budget: null,
    note: research + "Trailer and outriggers are generic envelopes. No trailer product selected.",
  },
  {
    id: "aerial-rig",
    label: "Tall four-leg aerial rig",
    group: "Mount studies",
    budget: null,
    note:
      research +
      "6 m high / 5.5 m footprint illustrative rig, not an exact JuggleGear or ACHILLE product. Globe-leg fit is visible, not certified.",
  },
  {
    id: "tree-single",
    label: "Single assessed tree",
    group: "Mount studies",
    budget: null,
    note:
      research +
      "Illustrative tree and protected attachment. Requires this tree's owner, arborist, rigger and venue approval.",
  },
  {
    id: "tree-highline",
    label: "Two-tree highline comparison",
    group: "Mount studies",
    budget: null,
    note:
      research +
      "Sagging line illustrates the span only; no tensions or tree capacity established. Not the budget baseline.",
  },
  {
    id: "fixed15-study",
    label: "Fixed15 with Ram layout",
    group: "Mount studies",
    budget: null,
    note:
      research +
      "15 ft (4.572 m) pin-to-suspension datum retained; source heights 4.60/5.20 m. This rebuild is separate from the untouched v4 GLB.",
  },
  {
    id: "ram-2021",
    label: "2021 Ram 2500 Mega Cab",
    group: "Hardware",
    budget: null,
    note: "Laramie Mega Cab 4x4. Manufacturer wheelbase, length, tracks and bed dimensions; white body styling, wheels, overhang split and installation datums are approximations.",
  },
  {
    id: "factory-receiver",
    label: "Factory rear receiver",
    group: "Hardware",
    budget: null,
    note: "Andrew confirms factory receiver. 2½ in aperture reference; crossmember, brackets, welds, pin datum and wall thickness are unmeasured. Not fabrication CAD.",
  },
  {
    id: "andersen-original",
    label: "Original Andersen Ultimate",
    group: "Hardware",
    budget: null,
    note: "Andrew confirms original Ultimate. Pre-Gen-3 #3220 reference from January 2022 manual, lower ball setting shown. Exact revision and installed height remain unconfirmed.",
  },
];

/** Show the shared-holder truck only when explicitly requested; old truck studies stay archived. */
export function selectableModelStudies(showTruck = false): ModelStudy[] {
  return MODEL_STUDIES.filter(
    (study) =>
      ![
        "fixed-bed",
        "fixed-cantilever",
        "truck-portal",
        "receiver-crane",
        "bed-crane",
        "chassis-short",
        "fixed15-study",
        "ram-2021",
        "factory-receiver",
        "andersen-original",
      ].includes(study.id) &&
      study.group !== "Hardware" &&
      (showTruck || study.id !== "basket-truck"),
  );
}
export const ACTIVE_MODEL_STUDIES = selectableModelStudies();
