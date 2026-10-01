import { Link, useRouterState } from "@tanstack/react-router";
import {
  Anchor,
  Box,
  Calculator,
  Circle,
  Columns3,
  Download,
  Layers,
  Library,
  Lightbulb,
  Network,
  Orbit,
  PanelRightClose,
  PanelRightOpen,
  Truck,
  Upload,
  Wind,
} from "lucide-react";
import { type JSX, lazy, Suspense, useRef, useState } from "react";
import BudgetView, { NumberField } from "./BudgetView";
import {
  baseline,
  estimate,
  initialScenario,
  parseScenario,
  range,
  type Scenario,
  type Settings,
  selectedOption,
  shortNames,
} from "./scenario";
import { Button } from "./ui";

const SceneView = lazy(() => import("./SceneView"));
const WorkflowView = lazy(() => import("./WorkflowView"));
const ResearchView = lazy(() => import("./ResearchView"));
// SHORTCUT: browser-local scenarios; migrate to the project API after the deferred identity contract is verified.
const storageKey = "enceladus.studio.scenario.v1";
function restore(): { scenario: Scenario; message: string } {
  try {
    const saved = localStorage.getItem(storageKey);
    return {
      scenario: saved ? parseScenario(saved) : initialScenario(),
      message: saved ? "Restored from this browser" : "Local scenario · not saved to a server",
    };
  } catch {
    return {
      scenario: initialScenario(),
      message:
        "Saved scenario could not be read. It has not been overwritten; export current work before replacing it.",
    };
  }
}
const icons = [Lightbulb, Layers, Circle, Truck, Columns3, Anchor, Truck, Columns3];
const tools = [
  { path: "/", title: "Model", icon: Box },
  { path: "/workflow", title: "Workflow", icon: Network },
  { path: "/budget", title: "Budget", icon: Calculator },
  { path: "/research", title: "Research", icon: Library },
] as const;

export default function App(): JSX.Element {
  const [restored] = useState(restore);
  const [scenario, setScenario] = useState(restored.scenario);
  const [message, setMessage] = useState(restored.message);
  const [note, setNote] = useState(scenario.note);
  const [inspector, setInspector] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);
  const path = useRouterState({ select: (state) => state.location.pathname });
  const option = selectedOption(scenario);
  const result = estimate(scenario);
  const update = (next: Scenario): boolean => {
    try {
      const checked = parseScenario(JSON.stringify(next));
      setScenario(checked);
      try {
        localStorage.setItem(storageKey, JSON.stringify(checked));
        setMessage("Saved in this browser · export for a portable copy");
      } catch {
        setMessage("Browser storage unavailable. Export a copy before leaving this page.");
      }
      return true;
    } catch (error) {
      setMessage(
        `Change not applied: ${error instanceof Error ? error.message : "invalid scenario"}`,
      );
      return false;
    }
  };
  const field = (
    key: keyof Omit<Settings, "capture">,
    label: string,
    max: number,
    min = 0,
  ): JSX.Element => (
    <NumberField
      label={label}
      value={scenario.settings[key]}
      min={min}
      max={max}
      onCommit={(value) =>
        update({
          ...scenario,
          settings: { ...scenario.settings, [key]: value },
        })
      }
    />
  );
  const exportScenario = (): void => {
    const blob = new Blob([`${JSON.stringify(scenario, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "enceladus-scenario.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      "Exported the last saved scenario and note. Any unsaved note text remains in the editor.",
    );
  };
  return (
    <div className="studio">
      <button
        type="button"
        className="skip-link"
        onClick={() => {
          document.getElementById("workspace")?.focus();
        }}
      >
        Skip to workspace
      </button>
      <header className="app-header">
        <div className="brand">
          <Orbit size={30} aria-hidden="true" />
          <div>
            <h1>
              ZENCELADUS <span>STUDIO</span>
            </h1>
            <small>Project studio</small>
          </div>
        </div>
        <div className="header-actions">
          <a href="/name-concepts/">Name concepts</a>
          <span className="local-label">Browser-local scenario</span>
          <Button variant="ghost" onClick={() => fileInput.current?.click()}>
            <Upload size={16} />
            Import
          </Button>
          <Button variant="outline" onClick={exportScenario}>
            <Download size={16} />
            Export scenario
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-label="Import scenario JSON"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              try {
                if (file.size > 50000) throw new Error("Scenario file exceeds 50 KB");
                const imported = parseScenario(await file.text());
                if (update(imported)) setNote(imported.note);
              } catch (error) {
                setMessage(
                  `Import refused; current scenario retained. ${error instanceof Error ? error.message : "Invalid file"}`,
                );
              }
            }}
          />
        </div>
      </header>
      <nav className="toolbar" aria-label="Studio tools">
        <div>
          {tools.map(({ path: to, title, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className={path === to ? "tool active" : "tool"}
              aria-current={path === to ? "page" : undefined}
            >
              <Icon size={17} aria-hidden="true" />
              {title}
            </Link>
          ))}
        </div>
        <Button
          variant="ghost"
          className="inspector-toggle"
          aria-pressed={inspector}
          onClick={() => setInspector(!inspector)}
        >
          {inspector ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          <span>Inspector</span>
        </Button>
      </nav>
      <div className={`workbench ${inspector ? "" : "inspector-hidden"}`}>
        <aside className="support-rail" aria-label="Support options">
          <div className="rail-heading">
            <span className="eyebrow">01 / STRUCTURE</span>
            <h2>Support options</h2>
          </div>
          <div className="support-list">
            {baseline.options.map((item, index) => {
              const Icon = icons[index];
              return (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={scenario.selected === item.id}
                  className={scenario.selected === item.id ? "support selected" : "support"}
                  onClick={() => update({ ...scenario, selected: item.id })}
                >
                  <Icon size={21} aria-hidden="true" />
                  <span>
                    {shortNames[item.id]}
                    <small>
                      {item.projectors ? `${item.projectors} projectors` : "Internal light"}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="rail-footer">
            <span className="eyebrow">CURRENT BASIS</span>
            <p>
              Dry land. Empty shell.
              <br />
              Participant outside.
            </p>
            <a href="/mounts/">Mount research ↗</a>
          </div>
        </aside>
        <main id="workspace" className="workspace" tabIndex={-1}>
          <div className="scene-container" hidden={path !== "/"}>
            <Suspense fallback={<p className="loading">Loading the 3D workspace…</p>}>
              <SceneView option={option} visible={path === "/"} />
            </Suspense>
          </div>
          <Suspense fallback={<p className="loading">Loading workspace…</p>}>
            {path === "/workflow" ? (
              <WorkflowView scenario={scenario} />
            ) : path === "/budget" ? (
              <BudgetView scenario={scenario} update={update} />
            ) : path === "/research" ? (
              <ResearchView />
            ) : path !== "/" ? (
              <div className="reading-panel">
                <h2>That workspace does not exist.</h2>
                <Link to="/">Return to Model</Link>
              </div>
            ) : null}
          </Suspense>
        </main>
        {inspector && (
          <aside className="inspector" aria-label="Scenario inspector">
            <div className="inspector-heading">
              <Layers size={24} />
              <div>
                <span className="eyebrow">SELECTED SUPPORT</span>
                <h2>{shortNames[option.id]}</h2>
              </div>
            </div>
            <p>{option.description}</p>
            <div className="estimate-block">
              <span>Planning estimate</span>
              <strong aria-live="polite">{range(result.total)}</strong>
              <small>
                USD · {scenario.settings.contingency}% contingency · allowances, not a quote
              </small>
            </div>
            <section>
              <h3>Planning inputs</h3>
              {field("days", "Rental days", 60, 1)}
              {field("dayRate", "Daily rate · USD", 10000)}
              {field("contingency", "Contingency · %", 100)}
              <details>
                <summary>Discount, credit & tax</summary>
                {field("discount", "Rental discount · %", 100)}
                {field("credit", "Documented credit · USD", 1000000)}
                {field("taxAllowance", "Tax allowance · USD", 100000)}
              </details>
            </section>
            <section>
              <h3>
                <Wind size={18} />
                Experience
              </h3>
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={scenario.haze}
                  onChange={(event) => update({ ...scenario, haze: event.target.checked })}
                />
                <span>
                  Owned hazer
                  <small>$0 acquisition · add haze during normal inflation</small>
                </span>
              </label>
              <p className="muted small">
                Adds an empty-shell optical trial to Workflow. Haze density and projection response
                are not simulated.
              </p>
              <label className="check-field">
                <input
                  type="checkbox"
                  disabled={!option.projectors}
                  checked={scenario.settings.capture && option.projectors > 0}
                  onChange={(event) =>
                    update({
                      ...scenario,
                      settings: {
                        ...scenario.settings,
                        capture: event.target.checked,
                      },
                    })
                  }
                />
                <span>
                  External live capture
                  <small>One outside camera and integration; no internal GoPros</small>
                </span>
              </label>
            </section>
            <a href="/pricing/">Open the standalone estimate ↗</a>
          </aside>
        )}
      </div>
      <footer className="notes-strip">
        <label htmlFor="design-note">
          <span>Design note</span>
          <small>{note.length}/4,000</small>
        </label>
        <input
          id="design-note"
          value={note}
          maxLength={4000}
          placeholder="What should the next design pass resolve?"
          onChange={(event) => setNote(event.target.value)}
        />
        <Button onClick={() => update({ ...scenario, note })} disabled={note === scenario.note}>
          Save note
        </Button>
        <p role="status">{message}</p>
      </footer>
    </div>
  );
}
