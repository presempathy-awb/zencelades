import { expect, mock, test } from "bun:test";
import { act, createElement, useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AlternateDesigns from "./AlternateDesigns";
import HomePage from "./HomePage";
import MediaView, { ShowtimeView } from "./MediaView";

test("artwork fits within the cockpit landmark while retaining renders and narrative", () => {
  const html = renderToStaticMarkup(<HomePage />);
  expect(html).not.toContain("<main");
  expect(html).not.toContain('<header class="masthead"');
  expect(html).toContain("Step inside another world.");
  expect(html).toContain("The audience makes the show.");
  expect(html).toContain("concept-suspended-hoop-v3.png");
  expect(html).toContain("concept-landed.png");
  expect(html).toContain("zencelades-2p5m-suspended-iso.png");
  expect(html).toContain("zencelades-2p5m-lander-iso.png");
});

test("homepage pairs the preserved lead render with a live Showtime slot in reading order", async () => {
  const html = renderToStaticMarkup(<HomePage />);
  const pairChildren: string[] = [];
  const renderSources: string[] = [];
  let pageHeadings = 0;
  let competingTeasers = 0;
  let nestedFooters = 0;
  const startButtons: string[] = [];
  await new HTMLRewriter()
    .on(".lead-media > *", {
      element(element) {
        pairChildren.push(element.getAttribute("id") ?? element.getAttribute("class") ?? "");
      },
    })
    .on(".lead-media .home-visuals img", {
      element(element) {
        renderSources.push(element.getAttribute("src") ?? "");
      },
    })
    .on("h1", {
      element() {
        pageHeadings += 1;
      },
    })
    .on(".showtime-teaser", {
      element() {
        competingTeasers += 1;
      },
    })
    .on(".artwork-content > footer", {
      element() {
        nestedFooters += 1;
      },
    })
    .on(".homepage-showtime button", {
      element(element) {
        startButtons.push(element.getAttribute("data-home-showtime-start") ?? "missing");
      },
    })
    .transform(new Response(html))
    .text();
  expect(pairChildren).toEqual(["home-visuals", "homepage-showtime"]);
  expect(renderSources).toEqual([
    "/media/concept-landed.png",
    "/media/concept-suspended-hoop-v3.png",
  ]);
  expect(pageHeadings).toBe(1);
  expect(competingTeasers).toBe(0);
  expect(startButtons).toEqual([""]);
  expect(nestedFooters).toBe(1);
});

class HomeElement {
  readonly nodeType = 1;
  readonly namespaceURI = "http://www.w3.org/1999/xhtml";
  readonly style = {};
  parentNode: HomeElement | null = null;
  readonly childNodes: HomeElement[] = [];
  private readonly attributes = new Map<string, string>();
  private readonly listeners = new Map<string, { callback: EventListener; capture: boolean }[]>();
  private text = "";
  constructor(
    readonly nodeName: string,
    readonly ownerDocument: HomeDocument,
  ) {}
  get tagName(): string {
    return this.nodeName;
  }
  get firstChild(): HomeElement | null {
    return this.childNodes[0] ?? null;
  }
  get nextSibling(): HomeElement | null {
    const siblings = this.parentNode?.childNodes ?? [];
    return siblings[siblings.indexOf(this) + 1] ?? null;
  }
  get textContent(): string {
    return this.text + this.childNodes.map((child) => child.textContent).join("");
  }
  set textContent(value: string) {
    this.replaceChildren();
    this.text = value;
  }
  set innerHTML(value: string) {
    this.replaceChildren();
    if (!value.includes("data-home-showtime")) return;
    const slot = this.ownerDocument.createElement("div");
    slot.setAttribute("data-home-showtime", "");
    this.appendChild(slot);
    if (value.includes("data-home-showtime-start")) {
      const button = this.ownerDocument.createElement("button");
      button.setAttribute("data-home-showtime-start", "");
      button.textContent = "Start";
      slot.appendChild(button);
    }
  }
  appendChild(child: HomeElement): HomeElement {
    child.parentNode?.removeChild(child);
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }
  insertBefore(child: HomeElement, before: HomeElement): HomeElement {
    child.parentNode?.removeChild(child);
    child.parentNode = this;
    this.childNodes.splice(this.childNodes.indexOf(before), 0, child);
    return child;
  }
  removeChild(child: HomeElement): HomeElement {
    this.childNodes.splice(this.childNodes.indexOf(child), 1);
    child.parentNode = null;
    return child;
  }
  replaceChildren(): void {
    for (const child of this.childNodes) child.parentNode = null;
    this.childNodes.length = 0;
    this.text = "";
  }
  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }
  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }
  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }
  addEventListener(type: string, callback: EventListener, capture = false): void {
    const callbacks = this.listeners.get(type) ?? [];
    callbacks.push({ callback, capture });
    this.listeners.set(type, callbacks);
  }
  removeEventListener(type: string, callback: EventListener): void {
    this.listeners.set(
      type,
      (this.listeners.get(type) ?? []).filter((entry) => entry.callback !== callback),
    );
  }
  dispatchEvent(event: Event): boolean {
    const path: HomeElement[] = [];
    for (let node: HomeElement | null = this; node; node = node.parentNode) path.push(node);
    for (const capture of [true, false]) {
      for (const node of capture ? [...path].reverse() : path) {
        for (const entry of node.listeners.get(event.type) ?? []) {
          if (entry.capture === capture) entry.callback(event);
        }
      }
    }
    return !event.defaultPrevented;
  }
  matches(selector: string): boolean {
    if (selector === "a" || selector === "button") return this.nodeName === selector.toUpperCase();
    const attribute = selector.match(/\[([^\]]+)\]/)?.[1];
    return Boolean(attribute && this.attributes.has(attribute));
  }
  closest(selector: string): HomeElement | null {
    for (let node: HomeElement | null = this; node; node = node.parentNode)
      if (node.matches(selector)) return node;
    return null;
  }
  querySelector(selector: string): HomeElement | null {
    for (const child of this.childNodes) {
      if (child.matches(selector)) return child;
      const nested = child.querySelector(selector);
      if (nested) return nested;
    }
    return null;
  }
  contains(node: HomeElement): boolean {
    for (let current: HomeElement | null = node; current; current = current.parentNode)
      if (current === this) return true;
    return false;
  }
}

class HomeDocument {
  readonly nodeType = 9;
  readonly body = new HomeElement("BODY", this);
  readonly documentElement = new HomeElement("HTML", this);
  readonly activeElement = this.body;
  defaultView: unknown;
  createElement(tagName: string): HomeElement {
    return new HomeElement(tagName.toUpperCase(), this);
  }
  addEventListener(): void {}
  removeEventListener(): void {}
}

test("homepage loads Showtime only after Start, mounts it once and releases it on departure", async () => {
  if (process.env.SHOWTIME_HOMEPAGE_ISOLATED_CLIENT_TEST !== "1") {
    const result = Bun.spawnSync(
      [
        process.execPath,
        "test",
        import.meta.filename,
        "-t",
        "homepage loads Showtime only after Start",
      ],
      {
        env: { ...process.env, SHOWTIME_HOMEPAGE_ISOLATED_CLIENT_TEST: "1" },
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    if (result.exitCode !== 0) throw new Error(new TextDecoder().decode(result.stderr));
    expect(result.exitCode).toBe(0);
    return;
  }
  const document = new HomeDocument();
  const window = { document, HTMLElement: HomeElement, HTMLIFrameElement: class {} };
  document.defaultView = window;
  const globals = {
    document,
    window,
    Element: HomeElement,
    HTMLElement: HomeElement,
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const originals = new Map<string, PropertyDescriptor | undefined>();
  for (const [name, value] of Object.entries(globals)) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
  let imports = 0;
  let mounts = 0;
  let active = 0;
  mock.module("./showtime/live-showtime", () => {
    imports += 1;
    return {
      default: ({ isCompact }: { isCompact: boolean }) => {
        useEffect(() => {
          mounts += 1;
          active += 1;
          return () => {
            active -= 1;
          };
        }, []);
        return createElement(
          "a",
          { href: "#/showtime", "data-home-live-showtime": String(isCompact) },
          "Enter cockpit and control",
        );
      },
    };
  });
  const { createRoot } = await import("react-dom/client");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container as unknown as HTMLElement);
  try {
    await act(async () => root.render(<HomePage />));
    expect(imports).toBe(0);
    expect(active).toBe(0);
    const start = container.querySelector("[data-home-showtime-start]");
    expect(start?.textContent).toBe("Start");
    if (!start) throw new Error("Expected the lightweight Start action.");
    const click = (): Event =>
      ({
        type: "click",
        target: start,
        button: 0,
        preventDefault() {},
        stopPropagation() {},
      }) as unknown as Event;
    await act(async () => {
      start.dispatchEvent(click());
      await Promise.resolve();
    });
    expect(imports).toBe(1);
    expect(mounts).toBe(1);
    expect(active).toBe(1);
    expect(container.querySelector("[data-home-showtime-start]")).toBeNull();
    const link = container.querySelector("[data-home-live-showtime]");
    expect(link?.getAttribute("href")).toBe("#/showtime");
    expect(link?.getAttribute("data-home-live-showtime")).toBe("true");
    await act(async () => root.render(<HomePage />));
    expect(mounts).toBe(1);
    await act(async () => root.unmount());
    expect(active).toBe(0);
    expect(container.childNodes).toHaveLength(0);
  } finally {
    await act(async () => root.unmount());
    mock.restore();
    for (const [name, original] of originals) {
      if (original) Object.defineProperty(globalThis, name, original);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
});

test("media keeps the moon film, current gallery and assemblies while historical film moves to alternatives", () => {
  const html = renderToStaticMarkup(<MediaView />);
  expect(html.match(/<video /g)).toHaveLength(1);
  expect(html).not.toContain("/media/previs.mp4");
  expect(html.match(/<img /g)).toHaveLength(10);
  expect(html.match(/<h1>/g)).toHaveLength(1);
  expect(html).not.toContain("<main");
  for (const size of ["2p5m", "3p0m"]) {
    for (const host of ["lander", "suspended"]) {
      expect(html).toContain(`zencelades-${size}-${host}.glb`);
      expect(html).toContain(`zencelades-${size}-${host}.blend`);
    }
  }
  const showtime = renderToStaticMarkup(<ShowtimeView />);
  expect(showtime).not.toContain("<iframe");
  expect(showtime.match(/<video /g)).toHaveLength(1);
  expect(showtime).not.toContain("/media/previs.mp4");
  expect(showtime).toContain('href="/showtime/"');
});

test("truck imagery and the original film remain available only as alternate designs", () => {
  const alternatives = renderToStaticMarkup(<AlternateDesigns />);
  const main = renderToStaticMarkup(<HomePage />) + renderToStaticMarkup(<MediaView />);
  for (const file of [
    "concept-board.png",
    "11_59_25",
    "variant-a.png",
    "variant-b.png",
    "previs.mp4",
  ]) {
    expect(alternatives).toContain(file);
    expect(main).not.toContain(file);
  }
  expect(alternatives).toContain("Alternate designs");
});
