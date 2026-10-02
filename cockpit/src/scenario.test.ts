import { expect, test } from "bun:test";
import { baseline, estimate, initialScenario, parseScenario, workflow } from "./scenario";
import { createPartsPlan } from "./parts-plan";

test("the main Love Burn design uses Claude's purchased-projector budget without rental or duplicate capture", () => {
  const scenario = initialScenario();
  expect(scenario.selected).toBe("love-burn");
  expect(scenario.settings.contingency).toBe(20);
  const result = estimate(scenario);
  expect(result.rent).toBe(0);
  expect(result.subtotal).toEqual([1982, 4368]);
  expect(result.total[0]).toBeCloseTo(2378.4, 2);
  expect(result.total[1]).toBeCloseTo(5241.6, 2);
  const changed = {
    ...scenario,
    settings: { ...scenario.settings, days: 60, dayRate: 9999, capture: true },
  };
  expect(estimate(changed).total).toEqual(result.total);
  expect(scenario.parts.configuration).toBe("G25");
  expect(scenario.parts.cameras).toBe(2);
  expect(scenario.parts.choices.host).toBeNull();
  expect(scenario.parts.projectors).toBe(2);
  expect(scenario.parts.mounting).toBe("stands");
});

test("parts choices round trip and invalid imports cannot replace the current draft", () => {
  const initial = initialScenario();
  const parts = { ...createPartsPlan(), configuration: "S25" as const, projectors: 1 as const };
  const saved = parseScenario(JSON.stringify({ ...initial, parts }));
  expect(saved.parts).toEqual(parts);
  expect(initial.parts.configuration).toBe("G25");
  expect(() =>
    parseScenario(JSON.stringify({ ...saved, parts: { ...parts, projectors: 4 } })),
  ).toThrow();
  expect(parseScenario(JSON.stringify({ ...initial, parts: undefined })).parts).toEqual(
    initial.parts,
  );
  const earlierSurround = parseScenario(
    JSON.stringify({ ...initial, selected: "seed-surround", parts: undefined }),
  );
  expect(earlierSurround.parts.configuration).toBe("O30");
  expect(earlierSurround.parts.projectors).toBe(0);
});

test("the primary proposal gets occupied-moon and internal-phone steps without external capture", () => {
  const scenario = initialScenario();
  scenario.settings.capture = false;
  const steps = workflow(scenario);
  expect(steps.find((step) => step.id === "scope")?.detail).toContain("participant inside");
  expect(steps.find((step) => step.id === "scope")?.detail).not.toContain("Historical unoccupied");
  expect(steps.find((step) => step.id === "scope")?.detail).toContain("lander");
  expect(steps.find((step) => step.id === "support")?.detail).toContain("ground interface");
  expect(steps.find((step) => step.id === "capture")?.title).toBe("Test the internal phone overlay");
  const alternate = workflow({ ...scenario, selected: "ground-sphere" });
  expect(alternate.find((step) => step.id === "scope")?.detail).toContain("Historical unoccupied");
  expect(alternate.some((step) => step.id === "capture")).toBe(false);
});

test("build progress survives explicit export while a fresh guest draft starts unedited", () => {
  const draft = initialScenario();
  draft.board.statuses["ZC-W01"] = "in-progress";
  draft.note = "Synthetic draft";
  const restored = parseScenario(JSON.stringify(draft));
  expect(restored.board.statuses["ZC-W01"]).toBe("in-progress");
  expect(initialScenario().board.statuses["ZC-W01"]).toBe("todo");
  expect(initialScenario().note).toBe("");
  expect(() =>
    parseScenario(
      JSON.stringify({ ...draft, board: { schema_version: 1, statuses: { injected: "done" } } }),
    ),
  ).toThrow();
});

test("deferred truck scenarios are refused without mutating the saved data", () => {
  const saved = { ...initialScenario(), selected: "fixed-bed" };
  expect(() => parseScenario(JSON.stringify(saved))).toThrow("stretch goal");
  expect(saved.selected).toBe("fixed-bed");
});

test("real ground scenario includes two six-day rentals and keeps owned haze free", () => {
  const plain = {
    ...initialScenario(),
    settings: { ...baseline.defaults },
    selected: "ground-sphere",
  };
  expect(estimate(plain).rent).toBe(5940);
  expect(estimate(plain).total).toEqual([19300, 39675]);
  expect(estimate({ ...plain, haze: true })).toEqual(estimate(plain));
  expect(workflow({ ...plain, haze: true }).some((step) => step.id === "haze")).toBe(true);
});

test("scenario JSON round trips and rejects unsafe or unknown input without changing current state", () => {
  const current = { ...initialScenario(), note: "Test the empty shell first" };
  expect(parseScenario(JSON.stringify(current))).toEqual(current);
  for (const patch of [
    { selected: "unknown" },
    { settings: { ...current.settings, days: -1 } },
    { haze: "yes" },
    { note: "x".repeat(4001) },
    { schema: 99 },
    { allowances: { "ground-sphere": [{ low: 9, high: 1 }] } },
  ]) {
    expect(() => parseScenario(JSON.stringify({ ...current, ...patch }))).toThrow();
  }
  expect(current.note).toBe("Test the empty shell first");
});

test("every layout derives its own rent; zero projector option ignores external capture", () => {
  for (const option of baseline.options) {
    const scenario = { ...initialScenario(), selected: option.id };
    expect(estimate(scenario).rent).toBe(option.id === "love-burn" ? 0 : option.projectors * 2970);
  }
  const light = { ...initialScenario(), selected: "ground-light" };
  expect(estimate({ ...light, settings: { ...light.settings, capture: true } }).liveCapture).toBe(
    false,
  );
  expect(
    workflow({ ...light, settings: { ...light.settings, capture: true } }).some(
      (step) => step.id === "capture",
    ),
  ).toBe(false);
  const projection = { ...initialScenario(), selected: "ground-sphere" };
  expect(
    workflow({ ...projection, settings: { ...projection.settings, capture: true } }).some(
      (step) => step.id === "capture",
    ),
  ).toBe(true);
});

test("line allowances survive export and excessive credit cannot create negative cash", () => {
  const scenario = {
    ...initialScenario(),
    settings: { ...baseline.defaults },
    selected: "ground-sphere",
  };
  scenario.allowances[scenario.selected][0] = { low: 0, high: 0 };
  expect(estimate(scenario).total).toEqual([17425, 34050]);
  scenario.settings.credit = 1000000;
  expect(estimate(parseScenario(JSON.stringify(scenario))).total).toEqual([0, 0]);
});
