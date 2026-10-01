import { type JSX, useEffect, useState } from "react";
import seed from "../../assets/seed-options.json";
import { fundingSummary } from "./funding";
import {
  baseline,
  dollars,
  estimate,
  range,
  type Scenario,
  selectedOption,
  shortNames,
} from "./scenario";

export function NumberField({
  label,
  value,
  min = 0,
  max,
  step = 1,
  onCommit,
}: {
  label: string;
  value: number;
  min?: number;
  max: number;
  step?: number;
  onCommit: (value: number) => boolean;
}): JSX.Element {
  const [draft, setDraft] = useState(String(value));
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    setDraft(String(value));
    setInvalid(false);
  }, [value]);
  return (
    <label className="number-field">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={draft}
        aria-invalid={invalid}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => {
          if (!draft.trim() || !event.currentTarget.checkValidity()) {
            setInvalid(true);
            return;
          }
          setInvalid(!onCommit(Number(draft)));
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      {invalid && <small role="alert">Invalid value. Last valid estimate retained.</small>}
    </label>
  );
}
export default function BudgetView({
  scenario,
  update,
  onSelectOption,
}: {
  scenario: Scenario;
  update: (next: Scenario) => boolean;
  onSelectOption: (id: string) => void;
}): JSX.Element {
  const option = selectedOption(scenario);
  const result = estimate(scenario);
  const funding = fundingSummary(scenario);
  const seedScope = option.id.startsWith("seed-");
  return (
    <section className="reading-panel budget-panel">
      <span className="eyebrow">CASH PLANNING · USD</span>
      <h2>{shortNames[option.id]}</h2>
      <p>
        {seedScope
          ? "$3,000 TOTAL DIY target. These are spending ceilings to compare with actual quotes; a balanced allocation does not prove procurement feasibility."
          : "Historical unoccupied comparison; rental assumptions are shared across those options."}{" "}
        Source register: {baseline.as_of}.
      </p>
      <div className="budget-total">
        <span>{seedScope ? "Allocated cash including reserve" : "Planning range"}</span>
        <strong>{range(result.total)}</strong>
        <small>
          Includes {scenario.settings.contingency}% contingency and{" "}
          {dollars(scenario.settings.taxAllowance)} tax allowance
        </small>
      </div>
      <p>
        <a href="#/parts">View the selected build's parts and quote gaps</a>. These allocations do
        not include unpriced projection, camera or aerial additions selected in the parts plan.
      </p>
      <p aria-live="polite">
        <strong>
          {funding.overCap[1] > 0
            ? `Above the $3,000 target by ${range(funding.overCap)}.`
            : "Allocations fit the $3,000 target."}
        </strong>{" "}
        Unconfirmed product prices, permissions and donated resources remain open.
      </p>
      <h3>Who pays · separate from what it costs</h3>
      <p>
        Grant target $600–$3,000 (Andrew-supplied tier). Possible owner/fundraiser amounts do not
        enlarge the total budget or count as confirmed cash. Enter net fundraising proceeds after
        any fees and fulfillment costs.
      </p>
      {(
        [
          ["grantRequest", "Draft grant request · 0 or $600–$3,000", 3000],
          ["ownerPossible", "Possible Andrew contribution · uncommitted", 1000000],
          ["fundraiserTarget", "Possible net fundraiser proceeds · uncommitted", 1000000],
          ["confirmed", "Confirmed cash available · total, not additional", 1000000],
        ] as const
      ).map(([key, label, max]) => (
        <NumberField
          key={key}
          label={label}
          value={scenario.funding[key]}
          max={max}
          onCommit={(value) =>
            update({ ...scenario, funding: { ...scenario.funding, [key]: value } })
          }
        />
      ))}
      <p>
        Gap if all proposed sources arrive: <strong>{range(funding.plannedGap)}</strong>. Still
        unsecured against confirmed cash: <strong>{range(funding.unsecured)}</strong>.
      </p>
      <h3>Line allowances</h3>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Low · USD</th>
              <th>High · USD</th>
            </tr>
          </thead>
          <tbody>
            {option.items.map((item, index) => (
              <tr key={item.label}>
                <th scope="row">{item.label}</th>
                {(["low", "high"] as const).map((bound) => (
                  <td key={bound}>
                    <NumberField
                      label={`${item.label}: ${bound}`}
                      value={item[bound]}
                      max={1000000}
                      onCommit={(value) => {
                        const allowances = structuredClone(scenario.allowances);
                        allowances[option.id][index][bound] = value;
                        return update({ ...scenario, allowances });
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row">
                Projector rental · {option.projectors} × {scenario.settings.days} days
              </th>
              <td>{dollars(result.rent)}</td>
              <td>{dollars(result.rent)}</td>
            </tr>
            <tr>
              <th scope="row">External capture</th>
              <td>{dollars(result.liveCapture ? baseline.capture.low : 0)}</td>
              <td>{dollars(result.liveCapture ? baseline.capture.high : 0)}</td>
            </tr>
            <tr>
              <th scope="row">Owned hazer · acquisition</th>
              <td>$0</td>
              <td>$0</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="muted">
        Haze fluid, shell compatibility and trial effort remain unresolved; $0 applies to acquiring
        the already-owned machine.
      </p>
      <h3>Compare all supports</h3>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Support</th>
              <th>Projectors</th>
              <th>Cash range</th>
            </tr>
          </thead>
          <tbody>
            {baseline.options.map((candidate) => (
              <tr key={candidate.id} data-selected={candidate.id === option.id}>
                <th scope="row">
                  <button type="button" onClick={() => onSelectOption(candidate.id)}>
                    {candidate.name}
                  </button>
                </th>
                <td>{candidate.projectors}</td>
                <td>{range(estimate({ ...scenario, selected: candidate.id }).total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>What the estimate assumes</h3>
      <ul className="assumptions">
        {(seedScope ? seed.assumptions : baseline.assumptions).map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      <p>
        <a href={baseline.projector_basis.url} target="_blank" rel="noreferrer">
          Rental rate source
        </a>{" "}
        · {baseline.projector_basis.caveat}
      </p>
    </section>
  );
}
