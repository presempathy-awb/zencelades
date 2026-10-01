import { expect, test } from "bun:test";
import { createPartsPlan, parsePartsPlan, partsForPlan, partsPlanForModel } from "./parts-plan";

test("a lander plan excludes other sizes, aerial equipment and unselected effects", () => {
  const plan = { ...createPartsPlan(), configuration: "G25" as const, projectors: 0 as const };
  const result = partsForPlan(plan, false);
  const ids = result.included.map((part) => part.id);
  expect(ids).toContain("ZC-S25");
  expect(ids).toContain("ZC-L01");
  expect(ids).not.toContain("ZC-S30");
  expect(
    result.included.filter((part) =>
      ["SUSPENSION", "HOST", "PROJECTION", "CONTROL", "CAPTURE", "HAZE"].includes(part.module),
    ),
  ).toHaveLength(0);
  expect(ids).toContain("ZC-D01");
  expect(new Set(ids).size).toBe(ids.length);
  expect(result.decisions.map((decision) => decision.group)).toEqual(["ring-route"]);
  expect(result.total).toBeNull();
  expect(result.unquoted.length).toBeGreaterThan(0);
});

test("projection selects one class and mount system and scales only explicit per-head quantities", () => {
  const plan = createPartsPlan();
  plan.projectors = 2;
  plan.choices["ring-route"] = "ZC-F02";
  plan.choices["projector-class"] = "ZC-P02";
  let result = partsForPlan(plan, false);
  expect(result.included.find((part) => part.id === "ZC-P02")?.quantity).toBe(2);
  expect(result.included.find((part) => part.id === "ZC-P03")?.quantity).toBe(2);
  expect(result.included.find((part) => part.id === "ZC-P04")?.quantity).toBe(1);
  expect(result.included.map((part) => part.id)).not.toContain("ZC-P01");
  expect(result.included.map((part) => part.id)).not.toContain("ZC-D01");
  plan.mounting = "stands";
  result = partsForPlan(plan, false);
  expect(result.included.map((part) => part.id)).toContain("ZC-P09");
  expect(result.included.map((part) => part.id)).not.toContain("ZC-P03");
  expect(result.included.map((part) => part.id)).not.toContain("ZC-P07");
});

test("aerial, cameras and owned haze retain operating quote gaps and no double-counted hosts", () => {
  const plan = { ...createPartsPlan(), configuration: "S30" as const, cameras: 1 as const };
  plan.choices.host = "ZC-A01";
  const result = partsForPlan(plan, true);
  const ids = result.included.map((part) => part.id);
  expect(ids).toContain("ZC-R05");
  expect(ids).toContain("ZC-L01");
  expect(ids).toContain("ZC-A01");
  expect(ids).toContain("ZC-A05");
  expect(ids).not.toContain("ZC-A02");
  expect(ids).toContain("ZC-C01");
  expect(result.owned.map((part) => part.id).sort()).toEqual(["ZC-H01", "ZC-T01"]);
  expect(result.knownAcquisitionSubtotal).toBe(0);
  expect(result.unquoted.map((part) => part.id)).toContain("ZC-H02");
  expect(result.total).toBeNull();
});

test("the open surround excludes sphere and holder procurement and uses independent stands", () => {
  const plan = { ...createPartsPlan(), configuration: "O30" as const };
  const result = partsForPlan(plan, false);
  expect(result.included.map((part) => part.id)).toContain("ZC-O01");
  expect(result.included.map((part) => part.id)).toContain("ZC-P09");
  expect(result.included.some((part) => part.module === "SPHERE")).toBe(false);
  expect(result.decisions.some((decision) => decision.group === "ring-route")).toBe(false);
});

test("model-derived plans follow known occupied studies without repricing unrelated references", () => {
  const plan = createPartsPlan();
  const aerial = partsPlanForModel(plan, "basket-aerial-rig");
  expect(aerial.configuration).toBe("S30");
  expect(aerial.projectors).toBe(3);
  expect(aerial.choices.host).toBe("ZC-A01");
  expect(partsPlanForModel(aerial, "seed-zorb").configuration).toBe("G30");
  expect(partsPlanForModel(aerial, "seed-surround").configuration).toBe("O30");
  expect(partsPlanForModel(aerial, "tree-highline")).toBe(aerial);
  expect(plan.configuration).toBe("G30");
});

test("switching holder support keeps the selected sphere size", () => {
  const plan = { ...createPartsPlan(), configuration: "G25" as const };
  const aerial = partsPlanForModel(plan, "basket-aerial-rig");
  expect(aerial.configuration).toBe("S25");
  expect(partsPlanForModel(aerial, "seed-zorb").configuration).toBe("G25");
  expect(partsPlanForModel(aerial, "seed-surround").configuration).toBe("O30");
});

test("imported plans reject unknown options and cross-group choices without losing the original", () => {
  const plan = createPartsPlan();
  expect(parsePartsPlan(JSON.parse(JSON.stringify(plan)))).toEqual(plan);
  for (const patch of [
    { configuration: "truck" },
    { projectors: 4 },
    { cameras: -1 },
    { mounting: "tree" },
    { extras: ["ZC-S25"] },
    { extras: ["ZC-E06", "ZC-E06"] },
    { choices: { ...plan.choices, host: "ZC-F02" } },
    { choices: { ...plan.choices, "ring-route": "ZC-S30" } },
  ])
    expect(() => parsePartsPlan({ ...plan, ...patch })).toThrow();
  expect(plan.choices.host).toBeNull();
});

test("optional equipment and alternative choices stay conditional across configurations", () => {
  const plan = createPartsPlan();
  plan.extras = ["ZC-P11", "ZC-E06", "ZC-O04"];
  plan.choices["ring-route"] = "ZC-F03";
  const ids = partsForPlan(plan, false).included.map((part) => part.id);
  expect(ids).toContain("ZC-F03");
  expect(ids).not.toContain("ZC-F02");
  expect(ids).toContain("ZC-P11");
  expect(ids).toContain("ZC-E06");
  expect(ids).not.toContain("ZC-O04");
  plan.configuration = "O30";
  plan.projectors = 0;
  const changed = partsForPlan(plan, false).included.map((part) => part.id);
  expect(changed).not.toContain("ZC-P11");
  expect(changed).toContain("ZC-O04");
  expect(changed).not.toContain("ZC-H01");
  expect(plan.extras).toEqual(["ZC-P11", "ZC-E06", "ZC-O04"]);
});
