import { calculate } from "../../site/pricing/calculation.mjs";
import source from "../../site/pricing/options.json";
import seed from "../../assets/seed-options.json";
import type { FundingPlan } from "./funding";

export const deferredSupports = new Set(["fixed-bed", "fixed-cantilever"]);
export const baseline = {
  ...source,
  options: [
    ...seed.options,
    ...source.options.filter((option) => !deferredSupports.has(option.id)),
  ],
};
export type Settings = typeof baseline.defaults;
export type Option = (typeof baseline.options)[number];
export type Allowance = { low: number; high: number };
export interface Scenario {
  schema: 1;
  selected: string;
  settings: Settings;
  allowances: Record<string, Allowance[]>;
  haze: boolean;
  note: string;
  funding: FundingPlan;
}
export const shortNames: Record<string, string> = {
  "seed-surround": "Occupied surround",
  "seed-zorb": "Landed common holder",
  "ground-light": "Ground light",
  "ground-half": "Curved screen",
  "ground-sphere": "Ground cradle",
  "fixed-bed": "Truck bed",
  "fixed-pedestal": "Fixed pedestal",
  "existing-hang": "Existing rig",
  "fixed-cantilever": "Truck cantilever",
  "own-gantry": "Own gantry",
};
export function initialScenario(): Scenario {
  return {
    schema: 1,
    selected: "seed-zorb",
    settings: { ...baseline.defaults },
    allowances: Object.fromEntries(
      baseline.options.map((option) => [
        option.id,
        option.items.map(({ low, high }) => ({ low, high })),
      ]),
    ),
    haze: false,
    note: "",
    funding: { grantRequest: 3000, ownerPossible: 0, fundraiserTarget: 0, confirmed: 0 },
  };
}
export function selectedOption(scenario: Scenario): Option {
  const option = baseline.options.find((item) => item.id === scenario.selected);
  if (!option) throw new Error("Unknown support option");
  return {
    ...option,
    items: option.items.map((item, index) => ({
      ...item,
      ...scenario.allowances[option.id][index],
    })),
  };
}
export function estimate(scenario: Scenario): ReturnType<typeof calculate> {
  return calculate(selectedOption(scenario), scenario.settings, baseline.capture);
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a scenario object");
  return value as Record<string, unknown>;
}
export function parseScenario(text: string): Scenario {
  if (text.length > 50000) throw new Error("Scenario file exceeds 50 KB");
  const value = record(JSON.parse(text));
  if (typeof value.selected === "string" && deferredSupports.has(value.selected))
    throw new Error("Truck support is a deferred stretch goal; choose a ground or aerial study");
  if (
    value.schema !== 1 ||
    typeof value.selected !== "string" ||
    !baseline.options.some((option) => option.id === value.selected)
  )
    throw new Error("Unsupported scenario or support option");
  if (typeof value.haze !== "boolean" || typeof value.note !== "string" || value.note.length > 4000)
    throw new Error("Invalid haze choice or note (maximum 4,000 characters)");
  const settings = record(value.settings);
  for (const key of Object.keys(baseline.defaults) as (keyof Settings)[]) {
    if (typeof settings[key] !== typeof baseline.defaults[key]) throw new Error(`Invalid ${key}`);
  }
  const incoming = record(value.allowances);
  const allowances: Record<string, Allowance[]> = {};
  for (const option of baseline.options) {
    // Preserve older browser exports while adding the newly offered seed choices.
    const items =
      incoming[option.id] ??
      (value.funding === undefined && option.id.startsWith("seed-") ? option.items : undefined);
    if (!Array.isArray(items) || items.length !== option.items.length)
      throw new Error(`Missing allowances for ${option.name}`);
    allowances[option.id] = items.map((item) => {
      const row = record(item);
      if (
        typeof row.low !== "number" ||
        typeof row.high !== "number" ||
        !Number.isFinite(row.low) ||
        !Number.isFinite(row.high) ||
        row.low < 0 ||
        row.high < row.low ||
        row.high > 1000000
      )
        throw new Error("Allowances need 0 ≤ low ≤ high ≤ 1,000,000");
      return { low: row.low, high: row.high };
    });
  }
  const cleanedSettings = Object.fromEntries(
    Object.keys(baseline.defaults).map((key) => [key, settings[key]]),
  ) as Settings;
  const fundingInput =
    value.funding === undefined ? initialScenario().funding : record(value.funding);
  const funding = {} as FundingPlan;
  for (const key of ["grantRequest", "ownerPossible", "fundraiserTarget", "confirmed"] as const) {
    const amount = fundingInput[key];
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0 || amount > 1000000)
      throw new Error(`Invalid funding amount: ${key}`);
    if (key === "grantRequest" && amount !== 0 && (amount < 600 || amount > 3000))
      throw new Error("Seed request must be $600–$3,000, or $0 for no request");
    funding[key] = amount;
  }
  const result: Scenario = {
    schema: 1,
    selected: value.selected,
    settings: cleanedSettings,
    allowances,
    haze: value.haze,
    note: value.note,
    funding,
  };
  estimate(result);
  return result;
}
export const dollars = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
export const range = (values: number[]): string => values.map(dollars).join(" – ");
export interface Step {
  id: string;
  title: string;
  detail: string;
}
export function workflow(
  scenario: Pick<Scenario, "selected" | "haze"> & { settings: Pick<Settings, "capture"> },
): Step[] {
  const support = baseline.options.find((option) => option.id === scenario.selected);
  if (!support) throw new Error("Unknown support option");
  const suspended = ["existing-hang", "fixed-cantilever", "own-gantry"].includes(support.id);
  const occupied = support.id.startsWith("seed-");
  return [
    {
      id: "scope",
      title: "Define the experience",
      detail: occupied
        ? "A person inside on dry land, stationary and ground-supported. Resolve the exact entry/exit, ventilation, supervision and accessible participation before operation. No suspension or occupied haze."
        : "Historical unoccupied comparison: dry land, empty sphere, night use. Participant stays outside; this option does not yet meet the current person-inside brief.",
    },
    {
      id: "support",
      title: shortNames[support.id],
      detail: `${support.description} ${suspended ? "A qualified rigger and reviewed complete load path are prerequisites." : "Confirm ground interface, wind restraint and site acceptance."}`,
    },
    {
      id: "optics",
      title: support.projectors ? `Test ${support.projectors} projectors` : "Test internal light",
      detail: support.projectors
        ? "Test shell material, throw, ambient light, seams and usable viewing angles. These projector positions are schematic; no coverage or lumen result is inferred."
        : "Test the chosen shell and LED diffusion. Projector hire and external capture are excluded.",
    },
    ...(support.projectors > 0 && scenario.settings.capture
      ? [
          {
            id: "capture",
            title: "Set up external live capture",
            detail:
              "Test one outside camera, consent, sightlines and integration with the selected projection layout. No internal cameras or full-body reconstruction are included.",
          },
        ]
      : []),
    ...(scenario.haze
      ? [
          {
            id: "haze",
            title: "Owned hazer · external placement",
            detail:
              "Large owned unit sits below the sphere's lower edge, with no inflation connection. $0 acquisition; confirm actual model, power, fluid, outlet clearances and weather protection before operation.",
          },
        ]
      : []),
    {
      id: "offer",
      title: "Apply and receive an official offer",
      detail:
        "Love Burn placement and/or grant application must receive the Art Committee Offer Notice. No closing hour is verified. Confirm power, footprint, water restrictions and permitted anchors in writing.",
    },
    {
      id: "build",
      title: "Fabricate, inspect and rehearse",
      detail:
        "Resolve structural/site requirements, power protection, setup method, operating limits and retrieval. No physical acceptance is recorded in this studio.",
    },
    {
      id: "strike",
      title: "Operate and leave no trace",
      detail:
        "Staff the installation, inspect daily, stop at agreed limits, remove all equipment and restore the site.",
    },
  ];
}
