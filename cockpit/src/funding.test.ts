import { expect, test } from "bun:test";
import { estimate, initialScenario, parseScenario } from "./scenario";
import { fundingSummary } from "./funding";

test("possible grant and owner money never reduce cost or count as secured cash", () => {
  const scenario = initialScenario();
  expect(scenario.selected).toBe("seed-zorb");
  expect(estimate(scenario).total).toEqual([3000, 3000]);
  scenario.funding = {
    grantRequest: 1500,
    ownerPossible: 500,
    fundraiserTarget: 500,
    confirmed: 0,
  };
  const funding = fundingSummary(scenario);
  expect(funding.plannedGap).toEqual([500, 500]);
  expect(funding.unsecured).toEqual([3000, 3000]);
  expect(funding.overCap).toEqual([0, 0]);
  expect(estimate(scenario).total).toEqual([3000, 3000]);
  scenario.funding.confirmed = 500;
  expect(fundingSummary(scenario).unsecured).toEqual([2500, 2500]);
  scenario.allowances[scenario.selected][0] = { low: 1300, high: 1400 };
  expect(fundingSummary(scenario).overCap).toEqual([125, 250]);
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
  const legacy = { ...scenario, selected: "ground-sphere" } as Record<string, unknown>;
  delete legacy.funding;
  const allowances = { ...scenario.allowances };
  delete allowances["seed-surround"];
  delete allowances["seed-zorb"];
  legacy.allowances = allowances;
  const restored = parseScenario(JSON.stringify(legacy));
  expect(restored.selected).toBe("ground-sphere");
  expect(restored.funding.confirmed).toBe(0);
  expect(estimate(restored).total).toEqual([19300, 39675]);
});
