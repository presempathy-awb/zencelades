import { type JSX, useEffect, useRef, useState } from "react";
import markup from "../../showtime/index.html?raw";
import { mountShowtime } from "./main";
import stylesheet from "./showtime.css?url";

export interface LiveShowtimeProps {
  isCompact?: boolean;
}

function compactShowtime(content: HTMLElement): void {
  content.classList.toggle("showtime-compact", true);
  const heading = content.querySelector("header h1");
  if (heading) {
    const compactHeading = content.ownerDocument.createElement("h2");
    compactHeading.textContent = heading.textContent;
    heading.replaceWith(compactHeading);
  }
  const controls = content.querySelector<HTMLElement>(".controls");
  if (!controls) throw new Error("The projection stage is missing its controls.");
  for (const selector of [".controls", "header", "footer", "#intro", "#fullscreen", "#view-hint"]) {
    const node = content.querySelector<HTMLElement>(selector);
    if (!node) continue;
    node.hidden = true;
    node.inert = true;
  }
  const canvas = content.querySelector<HTMLElement>("#sphere");
  if (canvas) {
    canvas.inert = true;
    canvas.tabIndex = -1;
  }
}

/** Keep control navigation beside the scene instead of below a tall document. */
function dockShowtime(content: HTMLElement): void {
  content.classList.toggle("showtime-docked", true);
  const controls = content.querySelector<HTMLElement>(".controls");
  if (!controls) throw new Error("The projection stage is missing its controls.");
  const document = content.ownerDocument;
  const navigation = document.createElement("nav");
  navigation.classList.toggle("control-navigation", true);
  navigation.setAttribute("aria-label", "Interactive controls");
  const body = document.createElement("div");
  body.classList.toggle("control-body", true);
  const groups = [
    ["play", "Play", "#play"],
    ["image", "Image", "#content-moon"],
    ["rig", "Rig", "#rig-aerial"],
    ["view", "View", "#view-left"],
    ["look", "Look", "#preset-realistic"],
    ["setting", "Setting", ".environment-controls"],
    ["motion", "Motion", "#movement-control"],
    ["camera", "Camera", "#camera"],
    ["effects", "Effects", ".details-row"],
    ["notes", "Notes", "footer"],
  ].map(([id, label, selector]) => {
    const node = content.querySelector<HTMLElement>(selector);
    const panel = selector.startsWith("#") ? node?.parentElement : node;
    if (!panel) throw new Error(`Missing Showtime control group: ${label}`);
    const button = document.createElement("button");
    button.type = "button";
    button.id = `controls-${id}`;
    button.textContent = label;
    panel.id = `control-panel-${id}`;
    button.setAttribute("aria-controls", panel.id);
    navigation.append(button);
    body.append(panel);
    return { id, button, panel };
  });
  const select = (id: string): void => {
    for (const group of groups) {
      const active = group.id === id;
      group.button.setAttribute("aria-pressed", String(active));
      group.panel.hidden = !active;
      group.panel.inert = !active;
    }
  };
  for (const group of groups) group.button.addEventListener("click", () => select(group.id));
  controls.append(navigation, body);
  const status = content.querySelector<HTMLElement>("#status");
  if (status) controls.append(status);
  select("image");
}

/** Install one prepared Showtime document and return an idempotent lifecycle cleanup. */
export function installShowtimeContent(
  root: ShadowRoot,
  content: HTMLElement,
  stylesheetHref: string,
  isCompact: boolean,
  mount: typeof mountShowtime = mountShowtime,
): () => void {
  content.querySelectorAll("script").forEach((script) => {
    script.remove();
  });
  if (isCompact) compactShowtime(content);
  else dockShowtime(content);
  const style = content.ownerDocument.createElement("link");
  style.rel = "stylesheet";
  style.href = stylesheetHref;
  root.replaceChildren(style, content);
  let dispose: () => void;
  try {
    dispose = mount(root, "/film/film-media/", { autoStart: true });
  } catch (error: unknown) {
    root.replaceChildren();
    throw error;
  }
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    dispose();
    root.replaceChildren();
  };
}

/** Mount the live zorb in an isolated cockpit pane and release it on departure. */
export default function LiveShowtime({ isCompact = false }: LiveShowtimeProps): JSX.Element {
  const host = useRef<HTMLDivElement>(null);
  const [failure, setFailure] = useState("");
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const root = element.shadowRoot ?? element.attachShadow({ mode: "open" });
    const parsed = new DOMParser().parseFromString(markup, "text/html");
    const content = parsed.querySelector("main");
    if (!content) {
      setFailure("The projection stage is missing its content.");
      return;
    }
    setFailure("");
    try {
      return installShowtimeContent(root, content, stylesheet, isCompact);
    } catch (error: unknown) {
      setFailure(error instanceof Error ? error.message : "The projection could not start.");
    }
  }, [isCompact]);
  return (
    <section
      className={isCompact ? "showtime-panel showtime-panel--compact" : "showtime-panel"}
      aria-label="Live Showtime projection"
    >
      <div className="showtime-bar">
        <span>Showtime · Enceladus on the zorb</span>
        {isCompact ? (
          <a className="media-link" href="#/showtime">
            Enter cockpit and control
          </a>
        ) : (
          <a href="/#/showtime" target="_blank" rel="noreferrer">
            Open Showtime in a new tab ↗
          </a>
        )}
      </div>
      {failure && <p role="alert">{failure}</p>}
      <div className="showtime-host" ref={host} />
    </section>
  );
}
