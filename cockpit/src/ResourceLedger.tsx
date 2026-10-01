import { Link } from "@tanstack/react-router";
import type { JSX } from "react";
import grantSources from "../../assets/grant-sources.json";
import mountSources from "../../assets/mount-sources.json";
import seedSources from "../../assets/seed-sources.json";
import { MODEL_STUDIES } from "./models/model-spec";
import type { OptionContext } from "./option-context";
import { dollars, estimate, range, type Scenario } from "./scenario";
import { Button } from "./ui";

/** Present the current option's resource amounts and open grant requirements. */
export default function ResourceLedger({
  scenario,
  context,
  onModelSelect,
}: {
  scenario: Scenario;
  context: OptionContext;
  onModelSelect: (id: string) => void;
}): JSX.Element {
  const result = estimate(scenario);
  const unpriced = context.rows.some((row) => row.low === null);
  const exportBrief = (): void => {
    const brief = {
      project: "Zencelades",
      option: scenario.selected,
      sourceRegisterAsOf: "2026-09-30",
      scenario,
      ...context,
      sourceLinks: [
        ...context.seed.map((entry) => ({
          ...seedSources.sources.find((source) => source.id === entry.id),
          relevance: entry.why,
        })),
        ...context.grants.map((entry) => ({
          ...grantSources.sources.find((source) => source.id === entry.id),
          relevance: entry.why,
        })),
        ...context.mounts.map((entry) => ({
          ...mountSources.sources.find((source) => source.id === entry.id),
          relevance: entry.why,
        })),
      ],
      status:
        "Planning brief only: draft funding amounts are user-entered intentions, not a submitted request, award, verified commitment or physical approval.",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(brief, null, 2) + "\n"], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `zencelades-${scenario.selected}-grant-resources.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section aria-label="Selected option grant and resource ledger">
      <h2>{context.label} · grant and resource ledger</h2>
      {scenario.selected.startsWith("seed-") && (
        <p>
          <a href="/studio-data/seed-occupied-options.md" target="_blank" rel="noreferrer">
            Basket geometry and $3,000 allocation
          </a>
          {" · "}
          <a href="/studio-data/soft-sphere-prior-work.md" target="_blank" rel="noreferrer">
            Documented soft-sphere precedents
          </a>
        </p>
      )}
      <p aria-live="polite">{context.proposal}</p>
      <p>
        Gap if every proposed funding source succeeds:{" "}
        <strong>{range(context.funding.plannedGap)}</strong>. Cash still unsecured against the
        entered confirmed amount: <strong>{range(context.funding.unsecured)}</strong>. Funding never
        reduces the project cost. <Link to="/budget">Edit the funding plan</Link>.
      </p>
      <p>
        <Link to="/budget">Edit this option’s allowances</Link>
        {" · "}
        <Link to="/" onClick={() => onModelSelect(context.model)}>
          View selected 3D model
        </Link>
      </p>
      <Button variant="outline" onClick={exportBrief}>
        Export selected grant/resource brief
      </Button>
      <h3>Resources and current costs</h3>
      <p>
        Every support choice and saved cost input updates this ledger. Amounts are planning
        allowances; source registers were checked September 30, 2026.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Low · USD</th>
              <th>High · USD</th>
              <th>Basis / remaining work</th>
            </tr>
          </thead>
          <tbody>
            {context.rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                <td>{row.low === null ? "Unpriced" : dollars(row.low)}</td>
                <td>{row.high === null ? "Unpriced" : dollars(row.high)}</td>
                <td>
                  {row.basis}
                  {row.href && (
                    <>
                      {" "}
                      <a href={row.href} target="_blank" rel="noreferrer">
                        Rate source
                      </a>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Resource subtotal</th>
              <td>{dollars(result.gross[0])}</td>
              <td>{dollars(result.gross[1])}</td>
              <td>Before credit, contingency and tax</td>
            </tr>
            <tr>
              <th scope="row">Documented credit used</th>
              <td>−{dollars(result.gross[0] - result.subtotal[0])}</td>
              <td>−{dollars(result.gross[1] - result.subtotal[1])}</td>
              <td>User-entered credit, capped at each subtotal; no award verification</td>
            </tr>
            <tr>
              <th scope="row">Contingency · {scenario.settings.contingency}%</th>
              <td>{dollars(result.contingency[0])}</td>
              <td>{dollars(result.contingency[1])}</td>
              <td>Applied after credit</td>
            </tr>
            <tr>
              <th scope="row">Tax allowance</th>
              <td>{dollars(scenario.settings.taxAllowance)}</td>
              <td>{dollars(scenario.settings.taxAllowance)}</td>
              <td>User-entered allowance</td>
            </tr>
            <tr>
              <th scope="row">Current cash range</th>
              <td colSpan={2}>
                <strong>{range(context.total)}</strong>
              </td>
              <td>{unpriced ? "Unpriced resources are excluded." : "No costs are booked."}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <h3>Open requirements for this option</h3>
      <ul className="assumptions">
        {context.requirements.map((requirement) => (
          <li key={requirement}>{requirement}</li>
        ))}
      </ul>
      {context.relatedModels.length > 0 && (
        <details>
          <summary>Related models and alternatives · {context.relatedModels.length}</summary>
          <p>
            Priced alternatives change the shared support choice. Unpriced studies and hardware are
            reference views; they retain this option’s separately labelled budget.
          </p>
          <ul>
            {context.relatedModels.map((id) => {
              const model = MODEL_STUDIES.find((item) => item.id === id)!;
              return (
                <li key={id}>
                  <Link to="/" onClick={() => onModelSelect(id)}>
                    {model.label}
                  </Link>
                  {" · "}
                  {model.budget ? "Priced alternative" : "Reference, unpriced"}
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </section>
  );
}
