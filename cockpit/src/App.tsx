import { Link, useRouterState } from "@tanstack/react-router";
import {
  Anchor,
  Circle,
  Columns3,
  Download,
  Layers,
  Lightbulb,
  Orbit,
  Truck,
  Upload,
  Wind,
} from "lucide-react";
import { type JSX, lazy, Suspense, useEffect, useRef, useState } from "react";
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
import { chooseModel } from "./option-context";
import { BuildBoard } from "./BuildBoard";
import HomePage from "./HomePage";
import MediaView, { ShowtimeView } from "./MediaView";
import DocumentPages from "./DocumentPages";
import { cockpitHref, documentPages } from "./page-routes";
import { fitColumns, selectColumn } from "./cockpit-layout";
import ViewSelector from "./ViewSelector";
import "./columns.css";

const SceneView = lazy(() => import("./SceneView"));
const WorkflowView = lazy(() => import("./WorkflowView"));
const ResearchView = lazy(() => import("./ResearchView"));
const PartsView = lazy(() => import("./PartsView"));
const icons = [Circle, Circle, Lightbulb, Layers, Circle, Truck, Columns3, Anchor, Truck, Columns3];
export default function App(): JSX.Element {
  const [scenario, setScenario] = useState(initialScenario);
  const [message, setMessage] = useState("Temporary draft · changes reset when this page reloads");
  const [note, setNote] = useState(scenario.note);
  const [columns, setColumns] = useState(1);
  const [width, setWidth] = useState(window.innerWidth);
  const [pages, setPages] = useState(["/", "/model", "/budget", "/parts"]);
  const workspaceRef = useRef<HTMLElement>(null);
  const [referenceModel, setReferenceModel] = useState("scenario");
  const fileInput = useRef<HTMLInputElement>(null);
  const path = useRouterState({ select: (state) => state.location.pathname });
  const routeLocation = useRouterState({ select: (state) => state.location.href });
  useEffect(() => {
    setPages((current) => (current[0] === path ? current : selectColumn(current, 0, path)));
  }, [path]);
  useEffect(() => {
    const section = new URLSearchParams(routeLocation.split("?")[1]).get("section");
    if (section) document.getElementById(section)?.scrollIntoView({ behavior: "instant" });
  }, [routeLocation]);
  const fitted = fitColumns(columns, width);
  const selectedPages = pages[0] === path ? pages : selectColumn(pages, 0, path);
  const visiblePages = selectedPages.slice(0, fitted);
  const modelVisible = visiblePages.includes("/model");
  const presentation = visiblePages.every((page) =>
    ["/", "/media", "/showtime", ...documentPages.map(([id]) => `/${id}`)].includes(page),
  );
  const choosePage = (index: number, next: string): void => {
    const updated = selectColumn(selectedPages, index, next);
    setPages(updated);
    if (updated[0] !== path) window.location.hash = updated[0];
  };
  useEffect(() => {
    const element = workspaceRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const option = selectedOption(scenario);
  const result = estimate(scenario);
  const update = (next: Scenario): boolean => {
    try {
      const checked = parseScenario(JSON.stringify(next));
      if (checked.selected !== scenario.selected) setReferenceModel("scenario");
      setScenario(checked);
      setMessage("Changed this temporary draft · export a copy before leaving or reloading");
      return true;
    } catch (error) {
      setMessage(
        `Change not applied: ${error instanceof Error ? error.message : "invalid scenario"}`,
      );
      return false;
    }
  };
  const selectModel = (id: string): void => {
    const choice = chooseModel(scenario, id);
    if (choice.scenario !== scenario && !update(choice.scenario)) return;
    setReferenceModel(choice.reference);
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
      "Downloaded your temporary draft and applied note. Unapplied note text is not in the file; no account save was made.",
    );
  };
  const supportPane = (
    <aside className="support-rail" aria-label="Support options">
      <div className="rail-heading">
        <h2>Love Burn design</h2>
      </div>
      <div className="support-list">
        <button
          type="button"
          className={scenario.selected === "love-burn" ? "support selected" : "support"}
          aria-pressed={scenario.selected === "love-burn"}
          onClick={() => selectModel("love-burn")}
        >
          <Orbit size={21} aria-hidden="true" />
          <span>
            Main proposal<small>2.5 m moon · 2 purchased projectors</small>
          </span>
        </button>
        <details open={scenario.selected !== "love-burn" ? true : undefined}>
          <summary>Alternate designs</summary>
          {baseline.options
            .filter((item) => item.id !== "love-burn")
            .map((item, index) => {
              const Icon = icons[index];
              return (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={scenario.selected === item.id}
                  className={scenario.selected === item.id ? "support selected" : "support"}
                  onClick={() => selectModel(item.id)}
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
        </details>
      </div>
      <div className="rail-footer">
        <span className="eyebrow">CURRENT BASIS</span>
        <p>
          {option.id === "love-burn"
            ? "$3,000 target · Claude's grant purchase budget. Aerial holder with lander mode."
            : option.id.startsWith("seed-")
              ? "$3,000 TOTAL · DIY. Person inside. Ground-supported concept."
              : "Historical empty-shell comparison. Does not yet meet the occupied brief."}
        </p>
        <a href="/mounts/">Mount research ↗</a>
      </div>
    </aside>
  );
  const settingsPane = (
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
        <span>
          {option.id === "love-burn"
            ? "Proposal purchase estimate"
            : option.id.startsWith("seed-")
              ? "Alternate allocations"
              : "Alternate rental estimate"}{" "}
          · {shortNames[option.id]}
        </span>
        <strong aria-live="polite">{range(result.total)}</strong>
        <small>USD · {scenario.settings.contingency}% contingency · allowances, not a quote</small>
      </div>
      <section>
        <h3>Planning inputs</h3>
        {option.id !== "love-burn" && (
          <>
            {field("days", "Rental days", 60, 1)}
            {field("dayRate", "Daily rate · USD", 10000)}
          </>
        )}
        {field("contingency", "Contingency · %", 100)}
        <details>
          <summary>Discount, credit & tax</summary>
          {option.id !== "love-burn" && field("discount", "Rental discount · %", 100)}
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
            <small>$0 acquisition · external unit below the sphere</small>
          </span>
        </label>
        <p className="muted small">
          External effect only. Unit dimensions, outlet clearances, power and fluid remain
          unconfirmed; airflow is not simulated.
        </p>
        {option.id === "love-burn" ? (
          <p className="muted small">
            Two phone feeds and their mounts are included in the proposal budget. Capture and
            participant controls remain to be prototyped.
          </p>
        ) : (
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
        )}
      </section>
      <a href="/pricing/">Open the full pricing study</a>
    </aside>
  );
  return (
    <div
      className={`studio column-cockpit ${presentation ? "media-cockpit" : ""}`}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const link = event.nativeEvent
          .composedPath()
          .find((node) => node instanceof HTMLAnchorElement) as HTMLAnchorElement | undefined;
        if (!link || link.hasAttribute("download") || link.target === "_blank") return;
        const href = link.getAttribute("href");
        if (!href) return;
        const destination = cockpitHref(href, "/");
        if (destination.startsWith("/#")) {
          event.preventDefault();
          window.location.hash = destination.slice(1);
        }
      }}
    >
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
            <a className="brand-name" href="#/">
              Zencelades <span>cockpit</span>
            </a>
            <small>A human sphere · Love Burn 2027</small>
          </div>
        </div>
        <div className="header-actions">
          <label className="column-control">
            <span>Columns</span>
            <select
              aria-label="Workspace columns"
              value={columns}
              onChange={(event) => setColumns(Number(event.target.value))}
            >
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            {fitted < columns && <small role="status">{fitted} fit here</small>}
          </label>
          <details className="draft-help">
            <summary title="Guest changes stay in memory and reset on reload.">
              Temporary draft ⓘ
            </summary>
            <p>
              Experiment freely. Changes are temporary in this page; they do not update the project
              or survive a reload. Export a file to keep a personal copy. Account saving is being
              connected.
            </p>
          </details>
          <Button
            variant="ghost"
            hint="Load a scenario file into this temporary draft; shared data is unchanged."
            onClick={() => fileInput.current?.click()}
          >
            <Upload size={16} />
            Import
          </Button>
          <Button
            variant="outline"
            hint="Download your current draft and applied note. This does not save to an account."
            onClick={exportScenario}
          >
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
                if (update(imported)) {
                  setNote(imported.note);
                  setReferenceModel("scenario");
                }
              } catch (error) {
                setMessage(
                  `Import refused; current scenario retained. ${error instanceof Error ? error.message : "Invalid file"}`,
                );
              }
            }}
          />
        </div>
      </header>
      <nav
        className="column-selectors"
        aria-label="Cockpit views"
        style={{ gridTemplateColumns: `repeat(${fitted}, minmax(0, 1fr))` }}
      >
        {visiblePages.map((page, index) => (
          <ViewSelector
            key={index}
            path={page}
            column={index + 1}
            onSelect={(next) => choosePage(index, next)}
          />
        ))}
      </nav>
      <main
        ref={workspaceRef}
        id="workspace"
        className="column-workspace"
        tabIndex={-1}
        style={{ gridTemplateColumns: `repeat(${fitted}, minmax(0, 1fr))` }}
      >
        <DocumentPages paths={visiblePages} />
        <div
          className="cockpit-pane scene-container"
          hidden={!modelVisible}
          style={{ gridColumn: visiblePages.indexOf("/model") + 1 }}
          aria-label="3D model"
        >
          <Suspense fallback={<p className="loading">Loading the 3D workspace…</p>}>
            <SceneView
              option={option}
              visible={modelVisible}
              model={referenceModel}
              onModelSelect={selectModel}
              projectors={scenario.parts.projectors}
              cameras={scenario.parts.cameras}
              diameter={scenario.parts.configuration.endsWith("25") ? 2.5 : 3}
              onDiameterChange={(diameter) =>
                update({
                  ...scenario,
                  parts: {
                    ...scenario.parts,
                    configuration: scenario.parts.configuration.startsWith("S")
                      ? diameter === 2.5
                        ? "S25"
                        : "S30"
                      : diameter === 2.5
                        ? "G25"
                        : "G30",
                  },
                })
              }
              onProjectorCountChange={(projectors) =>
                update({ ...scenario, parts: { ...scenario.parts, projectors } })
              }
            />
          </Suspense>
        </div>
        {visiblePages
          .filter((page) => page !== "/model" && !documentPages.some(([id]) => page === `/${id}`))
          .map((page) => (
            <section
              key={page}
              className={`cockpit-pane ${["/", "/media", "/showtime"].includes(page) ? "presentation-pane" : "tool-pane"}`}
              style={{ gridColumn: visiblePages.indexOf(page) + 1 }}
              aria-label={`${page === "/" ? "Overview" : page.slice(1)} view`}
            >
              <Suspense fallback={<p className="loading">Loading workspace…</p>}>
                {page === "/" ? (
                  <HomePage />
                ) : page === "/media" ? (
                  <MediaView />
                ) : page === "/showtime" ? (
                  <ShowtimeView />
                ) : page === "/tasks" ? (
                  <BuildBoard
                    state={scenario.board}
                    onChange={(board) => update({ ...scenario, board })}
                  />
                ) : page === "/workflow" ? (
                  <WorkflowView scenario={scenario} />
                ) : page === "/budget" ? (
                  <BudgetView scenario={scenario} update={update} onSelectOption={selectModel} />
                ) : page === "/parts" ? (
                  <PartsView scenario={scenario} update={update} />
                ) : page === "/research" ? (
                  <ResearchView scenario={scenario} onModelSelect={selectModel} />
                ) : page === "/supports" ? (
                  supportPane
                ) : page === "/settings" ? (
                  settingsPane
                ) : (
                  <div className="reading-panel">
                    <h2>That workspace does not exist.</h2>
                    <Link to="/model">Return to Model</Link>
                  </div>
                )}
              </Suspense>
            </section>
          ))}
      </main>
      {!presentation && (
        <footer className="notes-strip">
          <nav aria-label="Project sources and attachments">
            <a
              href="https://git.telpher.stream/telpher/zencelades"
              target="_blank"
              rel="noreferrer"
            >
              Gitea
            </a>
            {" · "}
            <a
              href="https://github.com/presempathy-awb/zencelades"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            {" · "}
            <a href="/attachments/Zencelades-3D-Schematics.pdf" target="_blank" rel="noreferrer">
              3D schematics
            </a>
          </nav>
          <label htmlFor="design-note">
            <span>Design note</span>
            <small>{note.length}/4,000</small>
          </label>
          <input
            id="design-note"
            value={note}
            maxLength={4000}
            aria-describedby="design-note-help"
            placeholder="What should the next design pass resolve?"
            onChange={(event) => setNote(event.target.value)}
          />
          <Button
            onClick={() => update({ ...scenario, note })}
            disabled={note === scenario.note}
            hint="Include this note in the temporary draft and its next export. Reloading still resets the draft."
          >
            Apply note
          </Button>
          <small id="design-note-help" className="sr-only">
            Apply the note before exporting. Export a file to keep a copy; reloading clears this
            draft.
          </small>
          <p role="status">{message}</p>
        </footer>
      )}
    </div>
  );
}
