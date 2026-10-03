import { expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import LiveShowtime, { installShowtimeContent } from "./live-showtime";

class FakeClassList {
  private readonly names = new Set<string>();

  contains(name: string): boolean {
    return this.names.has(name);
  }

  toggle(name: string, force?: boolean): boolean {
    const enabled = force ?? !this.names.has(name);
    if (enabled) this.names.add(name);
    else this.names.delete(name);
    return enabled;
  }
}

class FakeDocument {
  createElement(tagName: string): FakeElement {
    return new FakeElement(tagName, this);
  }
}

class FakeElement {
  readonly classList = new FakeClassList();
  readonly children: FakeElement[] = [];
  href = "";
  hidden = false;
  id = "";
  inert = false;
  open = false;
  parent: FakeElement | undefined;
  rel = "";
  textContent: string | null = "";
  tabIndex = 0;
  type = "";
  private readonly attributes = new Map<string, string>();
  private readonly clicks: Array<() => void> = [];

  get parentElement(): FakeElement | undefined {
    return this.parent;
  }
  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }
  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }
  addEventListener(_name: string, callback: () => void): void {
    this.clicks.push(callback);
  }
  click(): void {
    for (const callback of this.clicks) callback();
  }

  constructor(
    readonly tagName: string,
    readonly ownerDocument: FakeDocument,
  ) {}

  append(...nodes: FakeElement[]): void {
    for (const node of nodes) {
      node.remove();
      node.parent = this;
      this.children.push(node);
    }
  }

  after(node: FakeElement): void {
    if (!this.parent) throw new Error("Cannot insert beside a detached element.");
    const index = this.parent.children.indexOf(this);
    node.remove();
    node.parent = this.parent;
    this.parent.children.splice(index + 1, 0, node);
  }

  remove(): void {
    if (!this.parent) return;
    const index = this.parent.children.indexOf(this);
    if (index >= 0) this.parent.children.splice(index, 1);
    this.parent = undefined;
  }

  replaceWith(node: FakeElement): void {
    if (!this.parent) throw new Error("Cannot replace a detached element.");
    const parent = this.parent;
    const index = parent.children.indexOf(this);
    this.parent = undefined;
    node.remove();
    node.parent = parent;
    parent.children[index] = node;
  }

  querySelector(selector: string): FakeElement | null {
    if (selector === "header h1") {
      return (
        this.descendants().find(
          (node) => node.tagName === "h1" && node.parent?.tagName === "header",
        ) ?? null
      );
    }
    if (selector.startsWith("#"))
      return this.descendants().find((node) => node.id === selector.slice(1)) ?? null;
    if (selector.startsWith("."))
      return this.descendants().find((node) => node.classList.contains(selector.slice(1))) ?? null;
    return this.descendants().find((node) => node.tagName === selector) ?? null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    if (selector === "script")
      return this.descendants().filter((node) => node.tagName === "script");
    if (selector.startsWith("."))
      return this.descendants().filter((node) => node.classList.contains(selector.slice(1)));
    return [];
  }

  private descendants(): FakeElement[] {
    return this.children.flatMap((child) => [child, ...child.descendants()]);
  }
}

class FakeRoot {
  readonly children: FakeElement[] = [];

  replaceChildren(...nodes: FakeElement[]): void {
    this.children.splice(0, this.children.length, ...nodes);
  }
}

function element(document: FakeDocument, tag: string, id = "", className = ""): FakeElement {
  const value = document.createElement(tag);
  value.id = id;
  if (className) value.classList.toggle(className, true);
  return value;
}

function fixture(): { content: FakeElement; controls: Record<string, FakeElement> } {
  const document = new FakeDocument();
  const content = element(document, "main");
  const header = element(document, "header");
  const heading = element(document, "h1");
  heading.textContent = "Showtime";
  header.append(heading);
  const stage = element(document, "section", "stage");
  const begin = element(document, "button", "begin");
  const fullscreen = element(document, "button", "fullscreen");
  const intro = element(document, "div", "intro");
  intro.append(begin);
  const canvas = element(document, "canvas", "sphere");
  const viewHint = element(document, "p", "view-hint");
  stage.append(canvas, intro, fullscreen, viewHint);
  const controls = element(document, "section", "", "controls");
  const play = element(document, "button", "play");
  const transport = element(document, "div", "", "transport");
  transport.append(play);
  const environmentPhases = element(document, "fieldset", "", "phases");
  environmentPhases.classList.toggle("environment-controls", true);
  const environment = element(document, "input", "environment");
  const environmentLabel = element(document, "label");
  environmentLabel.append(environment);
  const hazerToggle = element(document, "button", "hazer-toggle");
  environmentPhases.append(environmentLabel, hazerToggle);
  const contentPhases = element(document, "fieldset", "", "phases");
  const presetPhases = element(document, "fieldset", "", "phases");
  const presetControls = ["realistic", "dusk", "day", "inspect", "wireframe"].map((preset) =>
    element(document, "button", `preset-${preset}`),
  );
  presetPhases.append(...presetControls);
  const moon = element(document, "button", "content-moon");
  const body = element(document, "button", "content-body");
  const both = element(document, "button", "content-both");
  const brightness = element(document, "input", "brightness");
  const projectionToggle = element(document, "button", "projection-toggle");
  contentPhases.append(moon, body, both, brightness, projectionToggle);
  const movementPhases = element(document, "fieldset", "", "phases");
  const randomMovement = element(document, "button", "movement-random");
  const controlledMovement = element(document, "button", "movement-control");
  const movementEnergy = element(document, "input", "movement-energy");
  const movementDirection = element(document, "input", "movement-direction");
  movementPhases.append(randomMovement, controlledMovement, movementEnergy, movementDirection);
  const rigPhases = element(document, "fieldset", "", "phases");
  const rig = element(document, "button", "rig-aerial");
  rigPhases.append(rig);
  const viewPhases = element(document, "fieldset", "", "phases");
  const view = element(document, "button", "view-left");
  viewPhases.append(view);
  const live = element(document, "div", "", "live-controls");
  const camera = element(document, "button", "camera");
  live.append(camera);
  const details = element(document, "div", "", "details-row");
  const haze = element(document, "input", "haze");
  const hazeLabel = element(document, "label");
  hazeLabel.append(haze);
  details.append(hazeLabel);
  controls.append(
    transport,
    environmentPhases,
    presetPhases,
    contentPhases,
    movementPhases,
    rigPhases,
    viewPhases,
    live,
    details,
  );
  const status = element(document, "p", "status");
  const footer = element(document, "footer");
  const notes = element(document, "details");
  footer.append(notes);
  const script = element(document, "script");
  content.append(header, stage, controls, status, footer, script);
  return {
    content,
    controls: {
      begin,
      canvas,
      body,
      both,
      brightness,
      camera,
      contentPhases,
      controlledMovement,
      environment,
      environmentPhases,
      footer,
      fullscreen,
      header,
      haze,
      hazerToggle,
      intro,
      moon,
      movementDirection,
      movementEnergy,
      movementPhases,
      play,
      presetPhases,
      projectionToggle,
      randomMovement,
      rig,
      view,
      viewHint,
    },
  };
}

test("homepage Showtime keeps the looping stage without operable playback or view controls", () => {
  const { content, controls } = fixture();
  const root = new FakeRoot();
  let mountCalls = 0;
  let disposeCalls = 0;
  const cleanup = installShowtimeContent(
    root as unknown as ShadowRoot,
    content as unknown as HTMLElement,
    "/showtime.css",
    true,
    (_root, _mediaBase, options) => {
      expect(options?.autoStart).toBe(true);
      mountCalls += 1;
      return () => {
        disposeCalls += 1;
      };
    },
  );

  expect(mountCalls).toBe(1);
  expect(content.classList.contains("showtime-compact")).toBe(true);
  expect(content.querySelector("header h1")).toBeNull();
  expect(content.querySelector("h2")?.textContent).toBe("Showtime");
  expect(content.querySelector(".compact-more")).toBeNull();
  for (const node of [
    content.querySelector(".controls"),
    controls.header,
    controls.footer,
    controls.intro,
    controls.fullscreen,
    controls.viewHint,
  ]) {
    expect(node?.hidden).toBe(true);
    expect(node?.inert).toBe(true);
  }
  expect(controls.canvas.inert).toBe(true);
  expect(controls.canvas.tabIndex).toBe(-1);
  expect(controls.environmentPhases.parent?.classList.contains("controls")).toBe(true);
  expect(controls.contentPhases.parent?.classList.contains("controls")).toBe(true);
  expect(controls.movementPhases.parent?.classList.contains("controls")).toBe(true);
  expect(controls.presetPhases.parent?.classList.contains("controls")).toBe(true);
  for (const preset of ["realistic", "dusk", "day", "inspect", "wireframe"])
    expect(content.querySelector(`#preset-${preset}`)?.parent).toBe(controls.presetPhases);
  expect(content.querySelector("#environment")).toBe(controls.environment);
  expect(controls.camera.parent?.parent?.classList.contains("controls")).toBe(true);
  expect(controls.footer.parent).toBe(content);
  for (const [id, original] of Object.entries({
    begin: controls.begin,
    fullscreen: controls.fullscreen,
    haze: controls.haze,
    "hazer-toggle": controls.hazerToggle,
    "content-moon": controls.moon,
    "content-body": controls.body,
    "content-both": controls.both,
    brightness: controls.brightness,
    "projection-toggle": controls.projectionToggle,
    "movement-random": controls.randomMovement,
    "movement-control": controls.controlledMovement,
    "movement-energy": controls.movementEnergy,
    "movement-direction": controls.movementDirection,
    play: controls.play,
    "rig-aerial": controls.rig,
    "view-left": controls.view,
  })) {
    expect(content.querySelector(`#${id}`)).toBe(original);
  }
  expect(content.querySelector("script")).toBeNull();
  expect(root.children[0]?.tagName).toBe("link");
  expect(root.children[1]).toBe(content);

  cleanup();
  cleanup();
  expect(disposeCalls).toBe(1);
  expect(root.children).toEqual([]);
});

test("homepage showcase offers one cockpit navigation action", () => {
  const rendered = renderToStaticMarkup(createElement(LiveShowtime, { isCompact: true }));
  expect(rendered.match(/<a\b/g)?.length).toBe(1);
  expect(rendered).toContain('href="#/showtime"');
  expect(rendered).toContain("Enter cockpit and control");
  expect(rendered).not.toContain('target="_blank"');
});

test("interactive cockpit exposes a control dock and retains every original control", () => {
  const { content, controls } = fixture();
  const root = new FakeRoot();
  const cleanup = installShowtimeContent(
    root as unknown as ShadowRoot,
    content as unknown as HTMLElement,
    "/showtime.css",
    false,
    () => () => {},
  );
  expect(content.classList.contains("showtime-compact")).toBe(false);
  expect(content.classList.contains("showtime-docked")).toBe(true);
  expect(content.querySelector("#controls-image")?.hidden).toBe(false);
  expect(controls.contentPhases.hidden).toBe(false);
  content.querySelector("#controls-setting")?.click();
  expect(controls.environmentPhases.hidden).toBe(false);
  expect(controls.environmentPhases.parent ?? null).toBe(content.querySelector(".control-body"));
  content.querySelector("#controls-effects")?.click();
  expect(controls.haze.parent?.parent?.hidden).toBe(false);
  expect(controls.haze.parent?.parent?.parent ?? null).toBe(content.querySelector(".control-body"));
  content.querySelector("#controls-notes")?.click();
  expect(controls.footer.hidden).toBe(false);
  expect(controls.footer.parent ?? null).toBe(content.querySelector(".control-body"));
  content.querySelector("#controls-image")?.click();
  expect(controls.camera.parent?.hidden).toBe(true);
  content.querySelector("#controls-camera")?.click();
  expect(controls.camera.parent?.hidden).toBe(false);
  expect(controls.contentPhases.hidden).toBe(true);
  expect(content.querySelector("#controls-camera")?.getAttribute("aria-pressed")).toBe("true");
  content.querySelector("#controls-image")?.click();
  expect(controls.contentPhases.hidden).toBe(false);
  expect(content.querySelector(".compact-more")).toBeNull();
  expect(content.querySelector("#environment")).toBe(controls.environment);
  expect(content.querySelector("#content-moon")).toBe(controls.moon);
  expect(content.querySelector("#movement-control")).toBe(controls.controlledMovement);
  expect(content.querySelector("#camera")).toBe(controls.camera);
  expect(content.querySelector(".controls")?.hidden).toBe(false);
  expect(controls.canvas.inert).toBe(false);
  cleanup();
});
