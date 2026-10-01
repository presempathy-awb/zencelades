import { expect, test } from "bun:test";
import { baseline, estimate, initialScenario, parseScenario } from "./scenario";
import { fundingSummary } from "./funding";

test("possible grant and owner money never reduce cost or count as secured cash", () => {
  const scenario = initialScenario();
  expect(scenario.selected).toBe("love-burn");
  expect(estimate(scenario).total[0]).toBeCloseTo(2378.4, 2);
  expect(estimate(scenario).total[1]).toBeCloseTo(5241.6, 2);
  scenario.funding = {
    grantRequest: 1500,
    ownerPossible: 500,
    fundraiserTarget: 500,
    confirmed: 0,
  };
  const funding = fundingSummary(scenario);
  expect(funding.plannedGap[0]).toBe(0);
  expect(funding.plannedGap[1]).toBeCloseTo(2741.6, 2);
  expect(funding.unsecured).toEqual(estimate(scenario).total);
  expect(funding.overCap[0]).toBe(0);
  expect(funding.overCap[1]).toBeCloseTo(2241.6, 2);
  expect(estimate(scenario).total[0]).toBeCloseTo(2378.4, 2);
  scenario.funding.confirmed = 500;
  expect(fundingSummary(scenario).unsecured[0]).toBeCloseTo(1878.4, 2);
  expect(fundingSummary(scenario).unsecured[1]).toBeCloseTo(4741.6, 2);
  scenario.allowances[scenario.selected][0] = { low: 1300, high: 1400 };
  expect(fundingSummary(scenario).overCap[0]).toBeCloseTo(938.4, 2);
  expect(fundingSummary(scenario).overCap[1]).toBeCloseTo(3081.6, 2);
  expect(parseScenario(JSON.stringify(scenario))).toEqual(scenario);
});

test("funding validation preserves zero and rejects negative, malformed and out-of-tier requests", () => {
  const scenario = initialScenario();
  for (const patch of [
    { grantRequest: 3001 },
    { grantRequest: 599 },
    { ownerPossible: -1 },
    { confirmed: "500" },
  ]) {
    expect(() =>
      parseScenario(JSON.stringify({ ...scenario, funding: { ...scenario.funding, ...patch } })),
    ).toThrow();
  }
  expect(
    parseScenario(
      JSON.stringify({ ...scenario, funding: { ...scenario.funding, grantRequest: 0 } }),
    ).funding.grantRequest,
  ).toBe(0);
  const legacy = {
    ...scenario,
    settings: { ...baseline.defaults },
    selected: "ground-sphere",
  } as Record<string, unknown>;
  delete legacy.funding;
  const allowances = { ...scenario.allowances };
  delete allowances["seed-surround"];
  delete allowances["seed-zorb"];
  delete allowances["love-burn"];
  legacy.allowances = allowances;
  const restored = parseScenario(JSON.stringify(legacy));
  expect(restored.selected).toBe("ground-sphere");
  expect(restored.funding.confirmed).toBe(0);
  expect(estimate(restored).total).toEqual([19300, 39675]);
});
