import { expect, test } from "bun:test";
import { baseline, estimate, initialScenario, parseScenario, workflow } from "./scenario";

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
  const plain = { ...initialScenario(), selected: "ground-sphere" };
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
    expect(estimate(scenario).rent).toBe(option.projectors * 2970);
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
  const scenario = { ...initialScenario(), selected: "ground-sphere" };
  scenario.allowances[scenario.selected][0] = { low: 0, high: 0 };
  expect(estimate(scenario).total).toEqual([17425, 34050]);
  scenario.settings.credit = 1000000;
  expect(estimate(parseScenario(JSON.stringify(scenario))).total).toEqual([0, 0]);
});
