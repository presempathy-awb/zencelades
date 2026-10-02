import ledger from "../../assets/grant-resource-ledger.json";

/** The application budget, using the same line amounts as Claude's grant ledger. */
export const loveBurnOption = {
  id: "love-burn",
  name: "Love Burn · main proposal",
  position: "2.5 m occupied moon · lander · two inside phones",
  projectors: 2,
  projectorPricing: "purchase" as const,
  description:
    "The current Love Burn build: a person inside the 2.5 m zorb on the shared triangle, padded loop and three detachable lander legs. Two phones inside feed the live portrait to two purchased HD146X projectors on stands, using the existing laptop and network. The owned hazer stays outside. Aerial suspension remains an alternate. The retained proposal budget assumes an existing sphere; replacement purchases are not hidden in the low estimate.",
  items: ledger.tier1.lines.map((line) => ({
    label: line.item,
    low: line.low,
    high: line.high,
    basis: line.basis,
  })),
};
export const grantContingency = ledger.contingency_percent;
