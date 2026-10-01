import { ACTIVE_MODEL_STUDIES } from "./models/model-spec";
import seedSources from "../../assets/seed-sources.json";
import { fundingSummary } from "./funding";
import { baseline, estimate, range, type Scenario, selectedOption, shortNames } from "./scenario";

interface RelevantSource {
  id: string;
  why: string;
}
interface Profile {
  requirement: string;
  precedents: string[];
  precedentReason: string;
  mountIds: string[];
  relatedModels: string[];
}
export interface ResourceRow {
  id: string;
  label: string;
  low: number | null;
  high: number | null;
  basis: string;
  href?: string;
}
export interface OptionContext {
  model: string;
  label: string;
  proposal: string;
  total: number[];
  rows: ResourceRow[];
  requirements: string[];
  grants: RelevantSource[];
  mounts: RelevantSource[];
  relatedModels: string[];
  seed: RelevantSource[];
  funding: ReturnType<typeof fundingSummary>;
}
const profiles: Record<string, Profile> = {
  "seed-surround": {
    requirement:
      "Quote an open-entry scenic frame carrying panels only, with the person on the ground. Resolve wind restraint, accessible entry, panel materials and venue acceptance; this changes the inflatable form and needs Andrew's selection.",
    precedents: ["nova", "shrumen-artist", "moon-form"],
    precedentReason:
      "Lighting, participation and spherical presentation as artistic precedents, not evidence of this project's price or approval.",
    mountIds: [],
    relatedModels: ["seed-zorb", "occupied-cradle"],
  },
  "seed-zorb": {
    requirement:
      "Identify the actual occupied sphere and obtain manufacturer's stationary-use, ventilation, exit and restraint requirements. Quote the full ground-supported arrangement; decorative hanging anchors and sealed water-walking balls are not a substitute.",
    precedents: ["moon-form", "sonic", "nova"],
    precedentReason:
      "Spherical immersion and participatory light as artistic precedents; no construction or occupied-use approval transfers.",
    mountIds: [],
    relatedModels: [
      "basket-aerial-rig",
      "basket-camera-arms",
      "basket-live-overlay",
      "basket-webbing",
      "basket-tripod",
      "occupied-cradle",
      "seed-surround",
    ],
  },
  "ground-light": {
    requirement:
      "Specify the low cradle, ground protection, wind restraint and LED power; no truck or overhead anchor is part of this option.",
    precedents: ["nova", "shrumen-artist", "shrumen-museum"],
    precedentReason:
      "Lighting-led participation and a legible nighttime experience; a precedent, not evidence of this project's funding.",
    mountIds: [],
    relatedModels: [],
  },
  "ground-half": {
    requirement:
      "Define the front viewing area, curved screen stability, one-projector throw and accessible circulation.",
    precedents: ["moon-form", "moon-funding", "nova"],
    precedentReason:
      "Moon imagery, presentation and lighting as grant storytelling references; their construction and funding do not transfer to this screen.",
    mountIds: [],
    relatedModels: [],
  },
  "ground-sphere": {
    requirement:
      "Quote a ground cradle and wind restraint; test two viewing sides, seams and shell diffusion before promising continuous coverage.",
    precedents: ["moon-form", "moon-funding", "moon-reach"],
    precedentReason:
      "A comparable moon form and touring presentation; these sources do not establish a Burning Man grant for Museum of the Moon.",
    mountIds: [],
    relatedModels: ["fixed-pedestal"],
  },
  "fixed-bed": {
    requirement:
      "Review the Ram's bed/frame interface, globe overhang, stationary operating setup and stabilization; obtain installed measurements.",
    precedents: ["moon-form", "whale-civic", "truth-civic"],
    precedentReason:
      "Large illuminated public sculpture and a clear presentation narrative; no cited project validates this truck attachment.",
    mountIds: ["M01", "M02"],
    relatedModels: ["ram-2021", "factory-receiver", "andersen-original", "bed-crane"],
  },
  "fixed-pedestal": {
    requirement:
      "Size and quote the ground-supported pedestal, ballast and mats, with wind and accessible viewing review.",
    precedents: ["moon-form", "moon-funding", "whale-civic"],
    precedentReason:
      "Large-form presentation and partner support examples; geometry and base approval remain this project's responsibility.",
    mountIds: [],
    relatedModels: ["ground-sphere"],
  },
  "existing-hang": {
    requirement:
      "Identify a real owner-approved host point and obtain reviewed load-path, wind, rigging and retrieval arrangements; no tree or neighboring art is assumed available.",
    precedents: ["moon-form", "moon-funding", "sonic"],
    precedentReason:
      "Suspended spherical experiences as concept and logistics comparisons; no anchor or personnel-lifting approval transfers.",
    mountIds: ["M05", "M06", "M07", "M08", "M09", "M10", "M13", "M15"],
    relatedModels: ["aerial-rig", "tree-single", "tree-highline"],
  },
  "fixed-cantilever": {
    requirement:
      "Resolve complete truck/chassis load paths, overturning, stabilization, wind and load-test scope. Towing ratings do not authorize this structure.",
    precedents: ["moon-form", "whale-civic", "truth-civic"],
    precedentReason:
      "Large illuminated art, delivery and public presentation comparisons; these do not validate a vehicle-mounted cantilever.",
    mountIds: ["M01", "M02", "M03", "M04", "M13"],
    relatedModels: [
      "ram-2021",
      "factory-receiver",
      "andersen-original",
      "receiver-crane",
      "chassis-short",
      "truck-portal",
      "fixed15-study",
    ],
  },
  "own-gantry": {
    requirement:
      "Obtain a complete outdoor gantry/ballast/rigging design and quote, including ground bearing, wind limits, inspection and retrieval.",
    precedents: ["moon-form", "moon-funding", "sonic"],
    precedentReason:
      "Spherical installations and delivery/partner examples; product comparisons are not a complete outdoor gantry rating.",
    mountIds: ["M05", "M06", "M07", "M08", "M09", "M10", "M13", "M15"],
    relatedModels: ["aerial-rig", "truck-portal", "trailer-portal"],
  },
};

/** Choose a priced support or inspect a reference without substituting its budget. */
export function chooseModel(
  scenario: Scenario,
  id: string,
): { scenario: Scenario; reference: string } {
  if (id === "scenario") return { scenario, reference: id };
  const model = ACTIVE_MODEL_STUDIES.find((item) => item.id === id);
  if (!model) throw new Error("Unknown model selection");
  return model.budget
    ? { scenario: { ...scenario, selected: model.budget }, reference: "scenario" }
    : { scenario, reference: id };
}

/** Derive the selected design's grant/resource ledger from its current cash scenario. */
export function optionContext(scenario: Scenario): OptionContext {
  const option = selectedOption(scenario),
    profile = profiles[option.id];
  if (!profile) throw new Error("Missing option resource mapping");
  const result = estimate(scenario);
  const funding = fundingSummary(scenario);
  const rows: ResourceRow[] = option.items.map((item, index) => ({
    id: `allowance-${index}`,
    label: item.label,
    low: item.low,
    high: item.high,
    basis: item.basis,
  }));
  if (option.id.startsWith("seed-"))
    rows.push(
      {
        id: "owned-tools",
        label: "Andrew's pipe bender / denhac access",
        low: 0,
        high: 0,
        basis:
          "User-reported available resources. Capacity, consumables and any access fees need confirmation; no new tool purchase assumed.",
      },
      {
        id: "volunteer-fabrication",
        label: "Denhac fabrication · in-kind labor",
        low: 0,
        high: 0,
        basis:
          "Andrew's materials-only basis; no paid shop labor. Odd Todd is a potential collaborator; actual availability and scope still need agreement.",
      },
    );
  if (option.id === "seed-zorb")
    rows.push({
      id: "common-holder-modules",
      label: "Alternative support modules and optional camera mounts",
      low: null,
      high: null,
      basis:
        "One shared holder: detachable lander legs are the ground mode, with no wood platform. The holder/leg materials share the existing allowance; it is not a found quote. Aerial rig/rigging and optional camera arms are unpriced additions. Reallocate within $3,000 after actual material and loan quotes.",
      href: "/studio-data/seed-occupied-options.md",
    });
  rows.push(
    {
      id: "projectors",
      label: `Projector hire · ${option.projectors} × ${scenario.settings.days} days`,
      low: result.rent,
      high: result.rent,
      basis: option.projectors
        ? baseline.projector_basis.caveat
        : "Excluded: this option uses lighting without projection.",
      ...(option.projectors ? { href: baseline.projector_basis.url } : {}),
    },
    {
      id: "capture",
      label: baseline.capture.label,
      low: result.liveCapture ? baseline.capture.low : 0,
      high: result.liveCapture ? baseline.capture.high : 0,
      basis: result.liveCapture
        ? baseline.capture.note
        : "Excluded from the selected scope; no internal cameras.",
    },
  );
  if (["fixed-bed", "fixed-cantilever"].includes(option.id))
    rows.push({
      id: "owned-truck",
      label: "Owned Ram · acquisition",
      low: 0,
      high: 0,
      basis: "Existing truck; operating costs and structural work remain in the allowances above.",
    });
  if (scenario.haze)
    rows.push(
      {
        id: "hazer",
        label: "Owned hazer · acquisition",
        low: 0,
        high: 0,
        basis:
          "Andrew already owns the large machine; external ground placement below the lower sphere edge. Its displayed size is provisional.",
      },
      {
        id: "haze-trial",
        label: "Haze trial consumables and effort",
        low: null,
        high: null,
        basis:
          "Unpriced and excluded from the cash total. Confirm fluid, power, operating clearances, protection and trial effort for the actual unit.",
      },
    );
  const grants = ["love-art", "love-portal", "love-criteria", "love-logistics", "love-date"].map(
    (id) => ({
      id,
      why: "Love Burn application, selection and delivery requirements for every option; an official Offer Notice is still required.",
    }),
  );
  grants.push(
    ...["nyfa-writing", "nyfa-budget", "cc-handbook", "bm-faq", "bm-loi", "bm-delivery"].map(
      (id) => ({
        id,
        why: "Proposal, budget and delivery guidance. Other programs' procedures and awards do not establish Love Burn eligibility or funding.",
      }),
    ),
    ...profile.precedents.map((id) => ({ id, why: profile.precedentReason })),
  );
  const mounts = ["M11", "M12", "M14"].map((id) => ({
    id,
    why: "Site permission and wind context for this outdoor installation; no site-specific approval is recorded.",
  }));
  mounts.push(
    ...profile.mountIds.map((id) => ({
      id,
      why: "Support/product or standard comparison relevant to this option. Confirm the complete assembly and exact current limitations; this is not approval of the proposed structure.",
    })),
  );
  return {
    model: option.id,
    label: shortNames[option.id],
    rows,
    total: result.total,
    proposal: `${option.description} ${result.liveCapture ? "One external camera supplies a live image; no internal cameras." : "No live external camera is included."} Current cash planning range: ${range(result.total)}. Draft grant request: ${range([scenario.funding.grantRequest])}; no application or award recorded. Possible owner/fundraiser money is separate from confirmed cash.`,
    funding,
    seed: option.id.startsWith("seed-")
      ? seedSources.sources.map(({ id }) => ({
          id,
          why: "Occupied basket research: compare documented support architecture, actual donor construction and component use. No precedent transfers its rating or cost to this installation.",
        }))
      : [],
    requirements: [
      "Confirm the placement/grant scope and obtain the official Art Committee Offer Notice; no authoritative cutoff hour is recorded.",
      profile.requirement,
      option.projectors
        ? `Test the selected ${option.projectors}-projector optical layout and obtain a lens-specific rental quote.`
        : "Test the LED/diffuser effect and accessible viewing arrangement.",
      "Confirm power, crew, transport, daily operation, insurance/permits and full removal; no shared resource reservation is recorded.",
      ...(scenario.haze
        ? [
            "Confirm the external hazer's model, clearances and suitable fluid; price its running and protection costs.",
          ]
        : []),
    ],
    grants,
    mounts,
    relatedModels: profile.relatedModels.filter((id) =>
      ACTIVE_MODEL_STUDIES.some((model) => model.id === id),
    ),
  };
}
