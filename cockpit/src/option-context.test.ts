import { expect, test } from "bun:test";
import grantSources from "../../assets/grant-sources.json";
import mountSources from "../../assets/mount-sources.json";
import seedSources from "../../assets/seed-sources.json";
import { baseline, initialScenario } from "./scenario";
import { chooseModel, optionContext } from "./option-context";
import { MODEL_STUDIES } from "./models/model-spec";

test("occupied model selection updates its parts plan while preserving the allowance comparison", () => {
  const initial = initialScenario();
  const aerial = chooseModel(initial, "basket-aerial-rig");
  expect(aerial.scenario.parts.configuration).toBe("S25");
  expect(aerial.scenario.parts.choices.host).toBe("ZC-A01");
  expect(aerial.scenario.selected).toBe(initial.selected);
  expect(aerial.scenario.allowances).toBe(initial.allowances);
  expect(aerial.reference).toBe("basket-aerial-rig");
  expect(chooseModel(aerial.scenario, "seed-zorb").scenario.parts.configuration).toBe("G25");
});

test("model choices select priced supports and retain budgets for unpriced references", () => {
  const initial = initialScenario();
  const chosen = chooseModel(initial, "ground-sphere");
  expect(chosen.scenario.selected).toBe("ground-sphere");
  expect(chosen.reference).toBe("scenario");
  const reference = chooseModel(chosen.scenario, "tree-highline");
  expect(reference.scenario).toBe(chosen.scenario);
  expect(reference.reference).toBe("tree-highline");
  expect(chooseModel(reference.scenario, "ground-light").reference).toBe("scenario");
  expect(() => chooseModel(initial, "unknown")).toThrow();
  for (const deferred of [
    "fixed-bed",
    "receiver-crane",
    "bed-crane",
    "chassis-short",
    "fixed15-study",
  ]) {
    expect(() => chooseModel(initial, deferred)).toThrow();
  }
});

test("resource amounts, grant scope and relevant evidence follow support and settings", () => {
  const initial = {
    ...initialScenario(),
    settings: { ...baseline.defaults },
    selected: "ground-sphere",
  };
  const light = optionContext({ ...initial, selected: "ground-light", haze: true });
  expect(light.rows.find((row) => row.id === "projectors")?.low).toBe(0);
  expect(light.rows.find((row) => row.id === "capture")?.low).toBe(0);
  expect(light.rows.find((row) => row.id === "hazer")?.low).toBe(0);
  expect(light.rows.find((row) => row.id === "haze-trial")?.low).toBeNull();
  expect(light.grants.some((source) => source.id === "nova")).toBe(true);
  const ground = optionContext(initial);
  expect(ground.rows.find((row) => row.id === "projectors")?.low).toBe(5940);
  expect(ground.total).toEqual([19300, 39675]);
  expect(ground.grants.some((source) => source.id === "moon-form")).toBe(true);
  expect(ground.relatedModels).not.toContain("tree-highline");
  const revised = structuredClone(initial);
  revised.allowances[revised.selected][0] = { low: 0, high: 0 };
  revised.settings.days = 3;
  revised.settings.capture = true;
  const updated = optionContext(revised);
  expect(updated.rows.find((row) => row.id === "allowance-0")?.low).toBe(0);
  expect(updated.rows.find((row) => row.id === "projectors")?.low).toBe(2970);
  expect(updated.rows.find((row) => row.id === "capture")?.low).toBe(750);
  expect(updated.total).not.toEqual(ground.total);
});

test("every support has real evidence IDs and a selected model in its resource ledger", () => {
  const grants = new Set(grantSources.sources.map((source) => source.id));
  const mounts = new Set(mountSources.sources.map((source) => source.id));
  const seed = new Set(seedSources.sources.map((source) => source.id));
  for (const support of baseline.options) {
    const context = optionContext({ ...initialScenario(), selected: support.id });
    expect(context.model).toBe(support.id);
    expect(context.grants.every((source) => grants.has(source.id))).toBe(true);
    expect(context.mounts.every((source) => mounts.has(source.id))).toBe(true);
    expect(context.seed.every((source) => seed.has(source.id))).toBe(true);
    expect(context.requirements.length).toBeGreaterThan(0);
    expect(
      context.relatedModels.every((id) => MODEL_STUDIES.some((model) => model.id === id)),
    ).toBe(true);
  }
});
