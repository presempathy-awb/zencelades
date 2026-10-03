import { useMemo, type JSX } from "react";
import {
  alternativeGroups,
  configurations,
  partLabel,
  partsForPlan,
  type AlternativeGroup,
  type Part,
  type PartsPlan,
} from "./parts-plan";
import { dollars, type Scenario } from "./scenario";
import ChoiceButtons from "./ChoiceButtons";

function PartsTable({ parts }: { parts: Part[] }): JSX.Element {
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Selected parts table">
      <table>
        <caption>
          Selected planning records · quantities and suitability still need confirmation
        </caption>
        <thead>
          <tr>
            <th>Part</th>
            <th>Quantity basis</th>
            <th>Acquisition cost</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={part.id}>
              <th scope="row">
                {part.item}
                <br />
                <small>
                  {part.id} · {part.module}
                </small>
                <details>
                  <summary>Specification and ownership</summary>
                  <p>{part.notes}</p>
                  <p>
                    Ownership: {part.ownership}. Procurement status: {part.status}.
                  </p>
                </details>
              </th>
              <td>
                {part.quantity} {part.unit}
                <br />
                <small>{part.quantity_status}</small>
              </td>
              <td>
                {part.incremental_purchase_usd === null
                  ? "Unquoted"
                  : dollars(part.incremental_purchase_usd)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Show a configuration-specific planning list without exposing private Pacinman records. */
export default function PartsView({
  scenario,
  update,
}: {
  scenario: Scenario;
  update: (next: Scenario) => boolean;
}): JSX.Element {
  const plan = scenario.parts;
  const result = useMemo(() => partsForPlan(plan, scenario.haze), [plan, scenario.haze]);
  const change = (patch: Partial<PartsPlan>): void => {
    update({ ...scenario, parts: { ...plan, ...patch } });
  };
  const activeGroups = (Object.keys(alternativeGroups) as AlternativeGroup[]).filter((group) =>
    group === "ring-route"
      ? plan.configuration !== "O30"
      : group === "host"
        ? plan.configuration.startsWith("S")
        : plan.projectors > 0,
  );
  return (
    <section className="reading-panel budget-panel parts-panel" aria-labelledby="parts-title">
      <h2 id="parts-title">Parts for {configurations[plan.configuration]}</h2>
      <p>
        Choose a build and optical package to narrow the 88-record catalog. Each shared part appears
        once. These are planning requirements, not a purchase order or approved cut list.
      </p>
      <details className="draft-help">
        <summary>How choices, costs and temporary edits work</summary>
        <p>
          Choices stay in this temporary draft and in an explicit scenario export; they do not
          update Pacinman. Selecting a known occupied model updates the parts configuration and
          depicted projector/camera counts. Common-holder model views follow the selected sphere
          size and head count and export them in their current-view GLB, using triangle arms.
          Camera, host and independent-stand changes here do not regenerate the model. Historical
          models keep this plan unchanged. Zero acquisition cost for owned equipment excludes
          running costs.
        </p>
      </details>
      <div className="library-controls">
        <ChoiceButtons
          label="Build configuration"
          value={plan.configuration}
          options={Object.entries(configurations)}
          onChange={(value) => change({ configuration: value as PartsPlan["configuration"] })}
        />
        <ChoiceButtons<PartsPlan["projectors"]>
          label="Visual package"
          value={plan.projectors}
          options={[
            [0, "LED lighting · no projectors"],
            [1, "P1 · one projector"],
            [2, "P2 · two projectors"],
            [3, "P3 · three projectors"],
          ]}
          onChange={(value) => change({ projectors: value })}
        />
        <ChoiceButtons<PartsPlan["cameras"]>
          label="Optional cameras"
          value={plan.cameras}
          options={[
            [0, "No cameras"],
            [1, "One camera"],
            [2, "Two cameras"],
          ]}
          onChange={(value) => change({ cameras: value })}
        />
        {plan.projectors > 0 && plan.configuration !== "O30" && (
          <ChoiceButtons<PartsPlan["mounting"]>
            label="Projector supports"
            value={plan.mounting}
            options={[
              ["arms", "Triangle-mounted arms"],
              ["stands", "Independent stands"],
            ]}
            onChange={(value) => change({ mounting: value })}
          />
        )}
      </div>
      <label className="check-field">
        <input
          type="checkbox"
          checked={scenario.haze}
          onChange={(event) => update({ ...scenario, haze: event.target.checked })}
        />
        Include the owned external hazer, fluid and weather protection
      </label>
      <h3>Choose alternatives</h3>
      <p>Unselected alternatives stay out of the subtotal and remain explicit missing decisions.</p>
      <div className="library-controls">
        {activeGroups.map((group) => (
          <ChoiceButtons
            key={group}
            label={alternativeGroups[group].label}
            value={plan.choices[group] ?? ""}
            options={[
              ["", "Not selected"],
              ...alternativeGroups[group].ids.map((id): [string, string] => [id, partLabel(id)]),
            ]}
            onChange={(value) => change({ choices: { ...plan.choices, [group]: value || null } })}
          />
        ))}
      </div>
      {result.optional.length > 0 && (
        <details>
          <summary>Optional node, generator or seat</summary>
          {result.optional.map((part) => (
            <label className="check-field" key={part.id}>
              <input
                type="checkbox"
                checked={plan.extras.includes(part.id)}
                onChange={(event) =>
                  change({
                    extras: event.target.checked
                      ? [...plan.extras, part.id]
                      : plan.extras.filter((id) => id !== part.id),
                  })
                }
              />
              {part.item}
            </label>
          ))}
        </details>
      )}
      <h3>Quote completeness</h3>
      <p role="status">
        {result.included.length} selected records · {result.owned.length} confirmed owned ·{" "}
        {result.unquoted.length} unquoted · {result.decisions.length} undecided alternatives. Known
        acquisition subtotal: {dollars(result.knownAcquisitionSubtotal)}.{" "}
        <strong>
          {result.total === null
            ? "Full build cost is incomplete."
            : `Catalog acquisition total: ${dollars(result.total)}.`}
        </strong>
      </p>
      <p>
        The <a href="#/budget">$3,000 allocation plan</a> is a separate ceiling. It does not price
        this projection or suspended assembly. Freight, tax, reserves, loan commitments, quantities
        and operating costs need reconciliation before a funded total exists. Aerial lists retain
        the lander/receiving equipment needed for ground handling.
      </p>
      {result.decisions.length > 0 && (
        <ul className="assumptions">
          {result.decisions.map((decision) => (
            <li key={decision.group}>
              Unresolved: {decision.label}. Choose one candidate above; no candidate cost is counted
              yet.
            </li>
          ))}
        </ul>
      )}
      <PartsTable parts={result.included} />
    </section>
  );
}
