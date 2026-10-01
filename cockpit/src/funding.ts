import { estimate, type Scenario } from "./scenario";

export interface FundingPlan {
  grantRequest: number;
  ownerPossible: number;
  fundraiserTarget: number;
  confirmed: number;
}

/** Proposed sources and secured cash are separate; neither changes project cost. */
export function fundingSummary(scenario: Scenario): {
  proposed: number;
  plannedGap: number[];
  unsecured: number[];
  overCap: number[];
} {
  const { grantRequest, ownerPossible, fundraiserTarget, confirmed } = scenario.funding;
  const proposed = grantRequest + ownerPossible + fundraiserTarget;
  const costs = estimate(scenario).total;
  return {
    proposed,
    plannedGap: costs.map((cost) => Math.max(0, cost - proposed)),
    unsecured: costs.map((cost) => Math.max(0, cost - confirmed)),
    overCap: costs.map((cost) => Math.max(0, cost - 3000)),
  };
}
