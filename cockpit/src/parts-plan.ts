import catalog from "../../assets/build-parts.json";

export const configurations = {
  G25: "2.5 m lander",
  G30: "3 m lander",
  S25: "2.5 m suspended holder",
  S30: "3 m suspended holder",
  O30: "3 m open surround",
} as const;
export const alternativeGroups = {
  "ring-route": { label: "Seating ring route", ids: ["ZC-F02", "ZC-F03"] },
  host: { label: "Suspension host", ids: ["ZC-A01", "ZC-A02", "ZC-A03", "ZC-A04"] },
  "projector-class": { label: "Projector class", ids: ["ZC-P01", "ZC-P02"] },
} as const;
export const optionalPartIds = ["ZC-P11", "ZC-E06", "ZC-O04"] as const;
export type Configuration = keyof typeof configurations;
export type AlternativeGroup = keyof typeof alternativeGroups;
export type Part = (typeof catalog.parts)[number];
export interface PartsPlan {
  configuration: Configuration;
  projectors: 0 | 1 | 2 | 3;
  cameras: 0 | 1 | 2;
  mounting: "arms" | "stands";
  choices: Record<AlternativeGroup, string | null>;
  extras: string[];
}
export interface PartsResult {
  included: Part[];
  decisions: { group: AlternativeGroup; label: string; candidates: Part[] }[];
  optional: Part[];
  owned: Part[];
  unquoted: Part[];
  knownAcquisitionSubtotal: number;
  total: number | null;
}
const partsById = new Map(catalog.parts.map((part) => [part.id, part]));
const groups = Object.keys(alternativeGroups) as AlternativeGroup[];

/** Start with the displayed 3 m lander and its three unpriced projector witnesses. */
export function createPartsPlan(): PartsPlan {
  return {
    configuration: "G30",
    projectors: 3,
    cameras: 0,
    mounting: "arms",
    choices: { "ring-route": null, host: null, "projector-class": null },
    extras: [],
  };
}

/** Refuse malformed selections before they can replace a guest or account draft. */
export function parsePartsPlan(value: unknown): PartsPlan {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a parts plan");
  const plan = value as Record<string, unknown>;
  if (typeof plan.configuration !== "string" || !Object.hasOwn(configurations, plan.configuration))
    throw new Error("Unknown build configuration");
  if (
    ![0, 1, 2, 3].includes(plan.projectors as number) ||
    ![0, 1, 2].includes(plan.cameras as number)
  )
    throw new Error("Choose zero to three projectors and zero to two cameras");
  if (plan.mounting !== "arms" && plan.mounting !== "stands")
    throw new Error("Choose holder arms or independent projector stands");
  if (!plan.choices || typeof plan.choices !== "object" || Array.isArray(plan.choices))
    throw new Error("Missing part alternatives");
  const input = plan.choices as Record<string, unknown>;
  const choices = {} as PartsPlan["choices"];
  for (const group of groups) {
    const choice = input[group];
    if (choice !== null && !alternativeGroups[group].ids.some((id) => id === choice))
      throw new Error(`Invalid choice for ${alternativeGroups[group].label}`);
    choices[group] = choice as string | null;
  }
  if (
    !Array.isArray(plan.extras) ||
    new Set(plan.extras).size !== plan.extras.length ||
    plan.extras.some((id) => !optionalPartIds.some((allowed) => allowed === id))
  )
    throw new Error("Unknown or duplicate optional part");
  return {
    configuration: plan.configuration as Configuration,
    projectors: plan.projectors as PartsPlan["projectors"],
    cameras: plan.cameras as PartsPlan["cameras"],
    mounting: plan.mounting,
    choices,
    extras: [...plan.extras] as string[],
  };
}

/** Filter the existing catalog; unknown quotes never become a zero-cost complete build. */
export function partsForPlan(plan: PartsPlan, haze: boolean): PartsResult {
  const selected = parsePartsPlan(plan);
  const applicable = catalog.parts.filter((part) => {
    if (!part.configurations.includes(selected.configuration)) return false;
    if (part.module === "PROJECTION" && selected.projectors === 0) return false;
    if (part.module === "CONTROL" && selected.projectors === 0 && selected.cameras === 0)
      return false;
    if (part.module === "LED" && selected.projectors > 0) return false;
    if (part.module === "CAPTURE" && selected.cameras === 0) return false;
    if (part.module === "HAZE" && !haze) return false;
    return true;
  });
  const stands = selected.mounting === "stands" || selected.configuration === "O30";
  const decisions: PartsResult["decisions"] = [];
  const excludedAlternatives = new Set<string>();
  for (const group of groups) {
    const candidates = applicable.filter((part) =>
      alternativeGroups[group].ids.some((id) => id === part.id),
    );
    if (!candidates.length) continue;
    const choice = selected.choices[group];
    if (choice === null)
      decisions.push({ group, label: alternativeGroups[group].label, candidates });
    for (const part of candidates) if (part.id !== choice) excludedAlternatives.add(part.id);
  }
  const optional = applicable.filter((part) => optionalPartIds.some((id) => id === part.id));
  const included = applicable
    .filter((part) => {
      if (excludedAlternatives.has(part.id)) return false;
      if (optionalPartIds.some((id) => id === part.id) && !selected.extras.includes(part.id))
        return false;
      if (["ZC-P03", "ZC-P07"].includes(part.id) && stands) return false;
      if (part.id === "ZC-P09" && !stands) return false;
      return true;
    })
    .map((part) => {
      if (["ZC-P01", "ZC-P02", "ZC-P03"].includes(part.id))
        return {
          ...part,
          quantity: selected.projectors,
          unit: part.id === "ZC-P03" ? "arm positions" : "projector heads",
          quantity_status: "selected concept count; exact equipment and support design unresolved",
          incremental_purchase_usd: null,
        };
      if (part.id === "ZC-C01")
        return {
          ...part,
          quantity: selected.cameras,
          unit: "camera candidates",
          quantity_status: "selected concept count; model, location and ownership unresolved",
          incremental_purchase_usd: null,
        };
      return { ...part };
    });
  const unquoted = included.filter((part) => part.incremental_purchase_usd === null);
  const knownAcquisitionSubtotal = included.reduce(
    (total, part) => total + (part.incremental_purchase_usd ?? 0),
    0,
  );
  return {
    included,
    decisions,
    optional,
    unquoted,
    owned: included.filter((part) => part.ownership === "Andrew-confirmed owned"),
    knownAcquisitionSubtotal,
    total: unquoted.length || decisions.length ? null : knownAcquisitionSubtotal,
  };
}

/** Match catalog configuration/counts to the occupied studies that actually exist. */
export function partsPlanForModel(plan: PartsPlan, id: string): PartsPlan {
  const studies: Record<string, Partial<PartsPlan>> = {
    "seed-zorb": { configuration: "G30", projectors: 3, cameras: 0 },
    "seed-surround": { configuration: "O30", projectors: 0, cameras: 0 },
    "basket-live-overlay": { configuration: "G30", projectors: 3, cameras: 1 },
    "basket-camera-arms": { configuration: "G30", projectors: 0, cameras: 1 },
    "basket-webbing": { configuration: "S30", projectors: 0, cameras: 0 },
    "basket-tripod": { configuration: "S30", projectors: 0, cameras: 0 },
    "basket-aerial-rig": { configuration: "S30", projectors: 3, cameras: 0 },
  };
  const study = studies[id];
  if (!study) return plan;
  const configuration = plan.configuration.endsWith("25")
    ? study.configuration === "G30"
      ? "G25"
      : study.configuration === "S30"
        ? "S25"
        : study.configuration
    : study.configuration;
  return {
    ...plan,
    ...study,
    configuration: configuration ?? plan.configuration,
    mounting: "arms",
    choices: {
      ...plan.choices,
      host: id === "basket-aerial-rig" ? "ZC-A01" : id === "basket-tripod" ? "ZC-A02" : null,
    },
  };
}

/** Resolve a catalog label without making any ownership or procurement claim. */
export function partLabel(id: string): string {
  const part = partsById.get(id);
  if (!part) throw new Error(`Unknown catalog part: ${id}`);
  return part.item;
}
