import ledger from "../../assets/grant-resource-ledger.json";

/** The application budget, using the same line amounts as Claude's grant ledger. */
export const loveBurnOption = {
  id: "love-burn",
  name: "Love Burn · main proposal",
  position: "2.5 m occupied moon · common holder and aerial rig · lander mode",
  projectors: 2,
  projectorPricing: "purchase" as const,
  description:
    "The Love Burn proposal: a person inside the 2.5 m zorb, supported by the shared triangle and padded loop, with an aerial rig and detachable lander legs. Two purchased HD146X projectors, phone capture, the existing laptop and network, and the owned external hazer. The budget assumes the proposal's existing sphere and rig; replacement purchases are not hidden in the low estimate.",
  items: ledger.tier1.lines.map((line) => ({
    label: line.item,
    low: line.low,
    high: line.high,
    basis: line.basis,
  })),
};
export const grantContingency = ledger.contingency_percent;
