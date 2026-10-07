import { mock } from "bun:test";
import assert from "node:assert/strict";
import type { ProjectionSphereFrame } from "./projection-sphere";

interface Deferred<T> {
  promise: Promise<T>;
  reject: (reason: unknown) => void;
  resolve: (value: T) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve = (_value: T): void => {};
  let reject = (_reason: unknown): void => {};
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, reject, resolve };
}

interface SphereRecord {
  disposeCalls: number;
  environments: boolean[];
  resizeCalls: number;
  timesOfDay: number[];
  dispose: () => void;
  frames: Array<Partial<ProjectionSphereFrame>>;
  render: (frame: Partial<ProjectionSphereFrame>) => void;
  resize: () => void;
  setView: () => void;
  rigs: Array<"lander" | "aerial">;
  setEnvironment: (enabled: boolean) => void;
  setRig: (rig: "lander" | "aerial") => void;
  setTimeOfDay: (hours: number) => void;
  displayModes: Array<"realistic" | "inspect" | "wireframe">;
  setDisplayMode: (mode: "realistic" | "inspect" | "wireframe") => void;
}

const worlds: Array<{ disposeCalls: number; loopCalls: number; frame?: () => void }> = [];
const spheres: SphereRecord[] = [];
const pendingSpheres: Array<Deferred<SphereRecord>> = [];
const startupSignals: AbortSignal[] = [];
const liveInputs: Array<{
  active: boolean;
  pending: boolean;
  startDeferred?: Deferred<boolean>;
  startCalls: number;
  stopCalls: number;
}> = [];
const portraitSource = { kind: "portrait" };

mock.module("../film/ice-world", () => ({
  createIceWorld: () => {
    const world: (typeof worlds)[number] = { disposeCalls: 0, loopCalls: 0 };
    worlds.push(world);
    return {
      engine: {
        setSize: (): void => {},
        runRenderLoop: (frame: () => void): void => {
          world.loopCalls++;
          world.frame = frame;
        },
      },
      render: (): void => {},
      dispose: (): void => {
        world.disposeCalls++;
      },
    };
  },
}));
mock.module("./projection-sphere", () => ({
  createProjectionSphere: (_canvas: unknown, _source: unknown, signal: AbortSignal) => {
    startupSignals.push(signal);
    const pending = deferred<(typeof spheres)[number]>();
    pendingSpheres.push(pending);
    return pending.promise;
  },
}));
mock.module("../film/human", () => ({
  createHumanProjection: () => ({
    ready: Promise.resolve(),
    draw: (context: CanvasRenderingContext2D): void => {
      context.drawImage(portraitSource as unknown as CanvasImageSource, 0, 0);
    },
  }),
  sampleHumanBlend: () => 0,
}));
mock.module("./live-input", () => ({
  createLiveInput: () => {
    let generation = 0;
    const state: (typeof liveInputs)[number] = {
      active: false,
      pending: false,
      startCalls: 0,
      stopCalls: 0,
    };
    liveInputs.push(state);
    return {
      get active() {
        return state.active;
      },
      get pending() {
        return state.pending;
      },
      start: async (): Promise<boolean> => {
        const requestedGeneration = ++generation;
        state.startCalls++;
        state.pending = true;
        const started = state.startDeferred ? await state.startDeferred.promise : true;
        if (requestedGeneration !== generation) return false;
        state.pending = false;
        state.active = started;
        return started;
      },
      stop: () => {
        generation++;
        state.stopCalls++;
        state.active = false;
        state.pending = false;
      },
    };
  },
}));
const filmInserts = [{ src: "clip.mp4", start: 0, end: 10, transition: "dissolve" }];
mock.module("../film/shots", () => ({ FILM_INSERTS: filmInserts }));

class FakeElement extends EventTarget {
  checked = true;
  currentTime = 0;
  dataset: DOMStringMap = {};
  disabled = false;
  duration = Number.NaN;
  files: FileList | null = null;
  height = 0;
  href = "";
  hidden = false;
  loop = false;
  muted = false;
  paused = true;
  playsInline = false;
  preload = "";
  readyState = 0;
  src = "";
  srcObject: MediaProvider | null = null;
  textContent: string | null = "";
  title = "";
  value = "0.5";
  videoHeight = 0;
  videoWidth = 0;
  width = 0;
  loadCalls = 0;
  pauseCalls = 0;
  playCalls = 0;
  playDeferred: Deferred<void> | undefined;
  commitPlayOnResolution = false;
  rejectPendingPlayOnPause = false;
  scrollCalls = 0;
  root: FakeShadowRoot | undefined;
  attributes = new Map<string, string>();
  contextOperations: Array<{
    fillStyle?: unknown;
    kind: "drawImage" | "fillRect";
    source?: unknown;
    rectangle?: number[];
  }> = [];

  constructor(readonly ownerDocument: FakeDocument) {
    super();
  }
  override dispatchEvent(event: Event): boolean {
    const result = super.dispatchEvent(event);
    if (event.type === "click" && this.href.startsWith("#") && !event.defaultPrevented)
      this.ownerDocument.defaultView.locationHash = this.href;
    return result;
  }
  getContext(): CanvasRenderingContext2D {
    const operations = this.contextOperations;
    const context = {
      canvas: this,
      fillStyle: "#000000",
      globalAlpha: 1,
      globalCompositeOperation: "source-over",
      lineWidth: 1,
      strokeStyle: "#000000",
      beginPath: (): void => {},
      clip: (): void => {},
      closePath: (): void => {},
      createRadialGradient: () => ({ addColorStop: (): void => {} }),
      drawImage: (source: unknown, ...coordinates: number[]): void => {
        operations.push({ kind: "drawImage", source, rectangle: coordinates.slice(-4) });
      },
      ellipse: (): void => {},
      fillRect: (): void => {
        operations.push({ fillStyle: context.fillStyle, kind: "fillRect" });
      },
      lineTo: (): void => {},
      moveTo: (): void => {},
      rect: (): void => {},
      restore: (): void => {},
      save: (): void => {},
      scale: (): void => {},
      stroke: (): void => {},
      translate: (): void => {},
    };
    return context as unknown as CanvasRenderingContext2D;
  }
  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }
  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }
  getRootNode(): FakeShadowRoot {
    if (!this.root) throw new Error("Missing fake root");
    return this.root;
  }
  load(): void {
    this.loadCalls++;
  }
  pause(): void {
    this.pauseCalls++;
    this.paused = true;
    if (this.rejectPendingPlayOnPause)
      this.playDeferred?.reject(new Error("new playback interrupted"));
  }
  play(): Promise<void> {
    this.playCalls++;
    this.paused = false;
    if (this.playDeferred && this.commitPlayOnResolution)
      return this.playDeferred.promise.then(() => {
        this.paused = false;
      });
    return this.playDeferred?.promise ?? Promise.resolve();
  }
  removeAttribute(name: string): void {
    if (name === "src") this.src = "";
  }
  requestFullscreen(): Promise<void> {
    if (!this.root) return Promise.reject(new Error("Missing fake root"));
    this.root.fullscreenElement = this as unknown as Element;
    return Promise.resolve();
  }
  scrollIntoView(): void {
    this.scrollCalls++;
  }
}

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  disconnected = false;
  observed: FakeElement | undefined;
  constructor(readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }
  observe(target: FakeElement): void {
    this.observed = target;
  }
  disconnect(): void {
    this.disconnected = true;
  }
}

class FakeWindow extends EventTarget {
  Element = FakeElement;
  ResizeObserver = FakeResizeObserver;
  ShadowRoot = FakeShadowRoot;
  now = 1_000;
  performance = { now: (): number => this.now };
  locationHash = "#/showtime";
  createdUrls: string[] = [];
  revokedUrls: string[] = [];
  reducedMotion = { matches: false };
  URL = {
    createObjectURL: (): string => {
      const url = `blob:local-video-${this.createdUrls.length}`;
      this.createdUrls.push(url);
      return url;
    },
    revokeObjectURL: (url: string): void => {
      this.revokedUrls.push(url);
    },
  };
  matchMedia(): MediaQueryList {
    return this.reducedMotion as MediaQueryList;
  }
}

class FakeDocument extends EventTarget {
  baseURI = "https://zencelades.test/showtime/";
  defaultView = new FakeWindow();
  fullscreenElement: Element | null = null;
  fullscreenEnabled = true;
  hidden = false;
  createdVideos: FakeElement[] = [];
  root: FakeShadowRoot | undefined;
  createElement(name: string): FakeElement {
    const element = new FakeElement(this);
    element.root = this.root;
    if (name === "video") this.createdVideos.push(element);
    return element;
  }
  querySelector(selector: string): FakeElement | null {
    return this.root?.querySelector(selector) ?? null;
  }
  querySelectorAll(selector: string): FakeElement[] {
    return this.root?.querySelectorAll(selector) ?? [];
  }
  exitFullscreen(): Promise<void> {
    if (this.root) this.root.fullscreenElement = null;
    this.fullscreenElement = null;
    return Promise.resolve();
  }
}

class FakeShadowRoot {
  fullscreenElement: Element | null = null;
  readonly host: FakeElement;
  readonly elements = new Map<string, FakeElement>();
  readonly returnLinks: FakeElement[] = [];
  constructor(readonly ownerDocument: FakeDocument) {
    this.host = new FakeElement(ownerDocument);
    this.host.root = this;
    ownerDocument.root = this;
  }
  querySelector(selector: string): FakeElement | null {
    return this.elements.get(selector.replace(/^#/, "")) ?? null;
  }
  element(id: string): FakeElement {
    const value = this.elements.get(id);
    if (!value) throw new Error(`Missing fixture element ${id}`);
    return value;
  }
  querySelectorAll(selector: string): FakeElement[] {
    if (selector === 'a[href="#stage"]') return this.returnLinks;
    return [];
  }
}

const ids = [
  "stage",
  "intro",
  "status",
  "world",
  "composition",
  "sphere",
  "live-video",
  "upload",
  "seek",
  "blend",
  "fade",
  "mirror",
  "reference",
  "effects",
  "haze",
  "internal-haze",
  "reaction",
  "film-blend",
  "motion-state",
  "camera",
  "stop-camera",
  "play",
  "fullscreen",
  "input-state",
  "chapter",
  "clock",
  "showtime-about",
  "showtime-license",
  "view-left",
  "view-rear",
  "view-right",
  "view-front",
  "view-hint",
  "rig-lander",
  "rig-aerial",
  "begin",
  "time-of-day",
  "time-of-day-label",
  "environment",
  "content-moon",
  "content-body",
  "content-both",
  "hazer-toggle",
  "brightness",
  "movement-random",
  "movement-control",
  "movement-energy",
  "movement-direction",
  "preset-realistic",
  "preset-night",
  "preset-dusk",
  "preset-day",
  "preset-inspect",
  "preset-wireframe",
  "projection-toggle",
] as const;

function createRoot(): { document: FakeDocument; root: FakeShadowRoot } {
  const document = new FakeDocument();
  const root = new FakeShadowRoot(document);
  for (const id of ids) {
    const element = new FakeElement(document);
    element.root = root;
    root.elements.set(id, element);
  }
  const seek = root.elements.get("seek");
  const timeOfDay = root.elements.get("time-of-day");
  const timeOfDayLabel = root.elements.get("time-of-day-label");
  const environment = root.elements.get("environment");
  const haze = root.elements.get("haze");
  const contentMoon = root.elements.get("content-moon");
  const contentBody = root.elements.get("content-body");
  const contentBoth = root.elements.get("content-both");
  const hazerToggle = root.elements.get("hazer-toggle");
  if (
    !seek ||
    !timeOfDay ||
    !timeOfDayLabel ||
    !environment ||
    !haze ||
    !contentMoon ||
    !contentBody ||
    !contentBoth ||
    !hazerToggle
  )
    throw new Error("Missing fixture environment controls");
  seek.value = "0";
  timeOfDay.value = "22";
  timeOfDayLabel.value = "";
  environment.checked = true;
  haze.value = "0.55";
  contentMoon.setAttribute("aria-pressed", "false");
  contentBody.setAttribute("aria-pressed", "false");
  contentBoth.setAttribute("aria-pressed", "true");
  hazerToggle.setAttribute("aria-pressed", "true");
  hazerToggle.textContent = "Hazer on";
  root.element("blend").value = "1";
  root.element("fade").checked = false;
  root.element("brightness").value = "1";
  root.element("movement-energy").value = "0.35";
  root.element("movement-direction").value = "0";
  root.element("movement-random").setAttribute("aria-pressed", "true");
  root.element("movement-control").setAttribute("aria-pressed", "false");
  root.element("preset-realistic").setAttribute("aria-pressed", "true");
  root.element("projection-toggle").setAttribute("aria-pressed", "true");
  for (let index = 0; index < 2; index++) {
    const link = new FakeElement(document);
    link.href = "#stage";
    link.root = root;
    root.returnLinks.push(link);
  }
  return { document, root };
}

function createSphere(): SphereRecord {
  const sphere: SphereRecord = {
    displayModes: [],
    setDisplayMode: (mode): void => {
      sphere.displayModes.push(mode);
    },
    disposeCalls: 0,
    environments: [],
    resizeCalls: 0,
    timesOfDay: [],
    frames: [],
    render: (frame): void => {
      sphere.frames.push({ ...frame });
    },
    setView: (): void => {},
    rigs: [],
    setEnvironment: (enabled): void => {
      sphere.environments.push(enabled);
    },
    setRig: (rig): void => {
      sphere.rigs.push(rig);
    },
    setTimeOfDay: (hours): void => {
      sphere.timesOfDay.push(hours);
    },
    resize: (): void => {
      sphere.resizeCalls++;
    },
    dispose: (): void => {
      sphere.disposeCalls++;
    },
  };
  spheres.push(sphere);
  return sphere;
}

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

const { mountShowtime } = await import("./main");
const fixture = createRoot();
const root = fixture.root as unknown as ShadowRoot;

const cleanupFirst = mountShowtime(root, "/film/film-media/");
const timeOfDay = fixture.root.elements.get("time-of-day");
const timeOfDayLabel = fixture.root.elements.get("time-of-day-label");
const environment = fixture.root.elements.get("environment");
const seekBeforeStartup = fixture.root.elements.get("seek");
const contentMoon = fixture.root.elements.get("content-moon");
const contentBody = fixture.root.elements.get("content-body");
const contentBoth = fixture.root.elements.get("content-both");
const hazerToggle = fixture.root.elements.get("hazer-toggle");
const haze = fixture.root.elements.get("haze");
const composition = fixture.root.elements.get("composition");
const worldCanvas = fixture.root.elements.get("world");
if (
  !timeOfDay ||
  !timeOfDayLabel ||
  !environment ||
  !seekBeforeStartup ||
  !contentMoon ||
  !contentBody ||
  !contentBoth ||
  !hazerToggle ||
  !haze ||
  !composition ||
  !worldCanvas
)
  throw new Error("Missing environment controls");
assert.equal(timeOfDayLabel.value, "22:00");
assert.equal(timeOfDay.getAttribute("aria-valuetext"), "22:00");
timeOfDay.value = "26";
timeOfDay.dispatchEvent(new Event("input"));
assert.equal(timeOfDayLabel.value, "24:00");
assert.equal(timeOfDay.getAttribute("aria-valuetext"), "24:00");
timeOfDay.value = "not-a-number";
timeOfDay.dispatchEvent(new Event("input"));
assert.equal(timeOfDayLabel.value, "22:00");
assert.equal(timeOfDay.getAttribute("aria-valuetext"), "22:00");
timeOfDay.value = "6.25";
timeOfDay.dispatchEvent(new Event("input"));
environment.checked = false;
environment.dispatchEvent(new Event("change"));
assert.equal(timeOfDayLabel.value, "06:15");
assert.equal(seekBeforeStartup.value, "0");
assert.equal(contentMoon.getAttribute("aria-pressed"), "false");
assert.equal(contentBody.getAttribute("aria-pressed"), "false");
assert.equal(contentBoth.getAttribute("aria-pressed"), "true");
contentMoon.dispatchEvent(new Event("click"));
contentBody.dispatchEvent(new Event("click"));
assert.equal(contentMoon.getAttribute("aria-pressed"), "false");
assert.equal(contentBody.getAttribute("aria-pressed"), "true");
assert.equal(contentBoth.getAttribute("aria-pressed"), "false");
assert.equal(seekBeforeStartup.value, "0");
hazerToggle.dispatchEvent(new Event("click"));
assert.equal(hazerToggle.getAttribute("aria-pressed"), "false");
assert.equal(hazerToggle.textContent, "Hazer off");
const firstSphere = createSphere();
assert.deepEqual(firstSphere.timesOfDay, []);
assert.deepEqual(firstSphere.environments, []);
pendingSpheres[0].resolve(firstSphere);
await settle();
await settle();
assert.equal(fixture.root.element("play").textContent, "Pause moon flight");
assert.equal(fixture.document.createdVideos[0].playCalls, 0);
assert.equal(liveInputs[0].startCalls, 0);
fixture.root.element("begin").dispatchEvent(new Event("click"));
await settle();
assert.equal(fixture.document.createdVideos[0].playCalls, 0);
assert.equal(worlds[0].loopCalls, 1);
assert.deepEqual(firstSphere.timesOfDay, [6.25]);
assert.deepEqual(firstSphere.environments, [false]);
assert.deepEqual(firstSphere.displayModes, ["realistic"]);
assert.equal(seekBeforeStartup.value, "0");

const firstClip = fixture.document.createdVideos[0];
if (!firstClip) throw new Error("Missing first film clip");
firstClip.readyState = 4;
firstClip.duration = 10;
composition.contextOperations.length = 0;
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.moonVisible, false);
assert.equal(firstSphere.frames.at(-1)?.avatarVisible, true);
assert.equal(firstSphere.frames.at(-1)?.haze, 0);
assert.equal(firstSphere.frames.at(-1)?.personOpacity, 1);
assert.equal(firstSphere.frames.at(-1)?.brightness, 1);
assert.equal(firstSphere.frames.at(-1)?.projectionEnabled, true);
assert.ok(firstSphere.frames.at(-1)?.routinePose?.routine);
const initialRoutineLabel = fixture.root.element("motion-state").value;
assert.match(initialRoutineLabel, /^Routine · (Settle|Look|Reach|Stretch|Recline|Tucked crouch)$/);
const reusedRoutine = firstSphere.frames.at(-1)?.routinePose;
assert.ok((firstSphere.frames.at(-1)?.motion ?? 0) > 0);
assert.equal(liveInputs[0].startCalls, 0);
const randomMotion = firstSphere.frames.at(-1)?.motion;
fixture.document.defaultView.now += 4_000;
worlds[0].frame?.();
assert.notEqual(firstSphere.frames.at(-1)?.motion, randomMotion);
assert.equal(firstSphere.frames.at(-1)?.routinePose, reusedRoutine);
fixture.document.defaultView.now += 4_000;
worlds[0].frame?.();
assert.notEqual(fixture.root.element("motion-state").value, initialRoutineLabel);
fixture.document.defaultView.now -= 4_000;
fixture.document.defaultView.now -= 4_000;
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.motion, randomMotion);
fixture.document.defaultView.now += 40_000;
worlds[0].frame?.();
assert.notEqual(fixture.root.element("motion-state").value, initialRoutineLabel);
fixture.document.defaultView.now -= 40_000;
seekBeforeStartup.value = "0";
seekBeforeStartup.dispatchEvent(new Event("input"));
fixture.root.element("begin").dispatchEvent(new Event("click"));
await settle();
assert.equal(fixture.root.element("play").textContent, "Pause moon flight");
assert.equal(liveInputs[0].startCalls, 0);
fixture.document.defaultView.now += 6_001_000;
worlds[0].frame?.();
assert.equal(seekBeforeStartup.value, "1");
fixture.root.element("play").dispatchEvent(new Event("click"));
seekBeforeStartup.value = "0";
seekBeforeStartup.dispatchEvent(new Event("input"));
const manualMovement = fixture.root.element("movement-energy");
const manualDirection = fixture.root.element("movement-direction");
const brightness = fixture.root.element("brightness");
const effects = fixture.root.element("effects");
fixture.root.element("movement-control").dispatchEvent(new Event("click"));
manualMovement.value = "0.4";
manualDirection.value = "-0.6";
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.motion, 0.2);
assert.equal(firstSphere.frames.at(-1)?.motionX, -0.6);
assert.equal(firstSphere.frames.at(-1)?.routinePose, undefined);
assert.equal(manualMovement.disabled, false);
brightness.value = "0.25";
effects.value = "0";
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.brightness, 0.25);
assert.equal(firstSphere.frames.at(-1)?.effects, 0);
fixture.document.defaultView.reducedMotion.matches = true;
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.motion, 0);
assert.equal(firstSphere.frames.at(-1)?.brightness, 0.25);
fixture.document.defaultView.reducedMotion.matches = false;
fixture.root.element("movement-random").dispatchEvent(new Event("click"));
fixture.document.defaultView.reducedMotion.matches = true;
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.routinePose, undefined);
fixture.document.defaultView.reducedMotion.matches = false;
fixture.root.element("movement-control").dispatchEvent(new Event("click"));
manualMovement.value = "0";
brightness.value = "1";
effects.value = "0.5";
const projectionFade = fixture.root.elements.get("fade");
const projectionBlend = fixture.root.elements.get("blend");
if (!projectionFade || !projectionBlend) throw new Error("Missing person fade controls");
projectionFade.checked = false;
projectionBlend.value = "0.4";
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.personOpacity, 0.4);
projectionBlend.value = "0";
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.personOpacity, 0);
projectionBlend.value = "0.4";
worlds[0].frame?.();
assert.equal(
  composition.contextOperations.some(
    (operation) =>
      operation.kind === "drawImage" && operation.rectangle?.join(",") === "0,0,1280,720",
  ),
  true,
);
assert.equal(
  composition.contextOperations.some(
    (operation) => operation.kind === "drawImage" && operation.source === portraitSource,
  ),
  true,
);
assert.equal(
  composition.contextOperations.some(
    (operation) => operation.kind === "drawImage" && operation.source === worldCanvas,
  ),
  false,
);
assert.equal(
  composition.contextOperations.some(
    (operation) => operation.kind === "drawImage" && operation.source === firstClip,
  ),
  false,
);

contentMoon.dispatchEvent(new Event("click"));
composition.contextOperations.length = 0;
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.moonVisible, true);
assert.equal(firstSphere.frames.at(-1)?.avatarVisible, false);
assert.equal(firstSphere.frames.at(-1)?.personOpacity, 0);
assert.equal(
  composition.contextOperations.some(
    (operation) => operation.kind === "drawImage" && operation.source === worldCanvas,
  ),
  true,
);
assert.equal(
  composition.contextOperations.some(
    (operation) => operation.kind === "drawImage" && operation.source === portraitSource,
  ),
  false,
);

seekBeforeStartup.value = "5";
seekBeforeStartup.dispatchEvent(new Event("input"));
const pauseCallsBeforeBody = firstClip.pauseCalls;
contentBody.dispatchEvent(new Event("click"));
assert.equal(firstClip.pauseCalls, pauseCallsBeforeBody + 1);
assert.equal(seekBeforeStartup.value, "5");
contentBoth.dispatchEvent(new Event("click"));
composition.contextOperations.length = 0;
worlds[0].frame?.();
assert.equal(firstClip.currentTime, 5);
assert.equal(firstSphere.frames.at(-1)?.moonVisible, true);
assert.equal(firstSphere.frames.at(-1)?.avatarVisible, true);
assert.equal(firstSphere.frames.at(-1)?.personOpacity, 0.4);
assert.equal(
  composition.contextOperations.some(
    (operation) => operation.kind === "drawImage" && operation.source === worldCanvas,
  ),
  true,
);
assert.equal(
  composition.contextOperations.some(
    (operation) => operation.kind === "drawImage" && operation.source === portraitSource,
  ),
  true,
);
seekBeforeStartup.value = "0";
seekBeforeStartup.dispatchEvent(new Event("input"));

haze.value = "0.8";
haze.dispatchEvent(new Event("input"));
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.haze, 0);
hazerToggle.dispatchEvent(new Event("click"));
assert.equal(hazerToggle.getAttribute("aria-pressed"), "true");
assert.equal(hazerToggle.textContent, "Hazer on");
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.haze, 0.8);

timeOfDay.value = "18.5";
timeOfDay.dispatchEvent(new Event("input"));
environment.checked = true;
environment.dispatchEvent(new Event("change"));
assert.equal(timeOfDayLabel.value, "18:30");
assert.deepEqual(firstSphere.timesOfDay, [6.25, 18.5]);
assert.deepEqual(firstSphere.environments, [false, true]);
assert.equal(seekBeforeStartup.value, "0");

const returnEvent = new Event("click", { cancelable: true });
fixture.root.returnLinks[0].dispatchEvent(returnEvent);
assert.equal(returnEvent.defaultPrevented, true);
assert.equal(fixture.document.defaultView.locationHash, "#/showtime");
assert.equal(fixture.root.elements.get("stage")?.scrollCalls, 1);

worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.avatarVisible, true);
const reference = fixture.root.elements.get("reference");
if (!reference) throw new Error("Missing reference control");
reference.checked = false;
reference.dispatchEvent(new Event("change"));
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.avatarVisible, false);
assert.equal(firstSphere.frames.at(-1)?.personOpacity, 0);
contentBody.dispatchEvent(new Event("click"));
composition.contextOperations.length = 0;
worlds[0].frame?.();
assert.equal(
  composition.contextOperations.some((operation) => operation.kind === "drawImage"),
  false,
);
contentBoth.dispatchEvent(new Event("click"));

fixture.root.elements.get("camera")?.dispatchEvent(new Event("click"));
await settle();
await settle();
assert.equal(fixture.root.elements.get("play")?.textContent, "Pause moon flight");
const retiredPlayback = deferred<void>();
firstClip.playDeferred = retiredPlayback;
firstClip.pause();
worlds[0].frame?.();
contentBody.dispatchEvent(new Event("click"));
contentBoth.dispatchEvent(new Event("click"));
firstClip.playDeferred = undefined;
retiredPlayback.reject(new Error("retired body-mode playback"));
await settle();
assert.equal(fixture.root.elements.get("play")?.textContent, "Pause moon flight");
const seekBeforeRetiredFailure = Number(seekBeforeStartup.value);
fixture.document.defaultView.now += 1_000;
worlds[0].frame?.();
assert.equal(Number(seekBeforeStartup.value), seekBeforeRetiredFailure + 1);
await settle();
await settle();

const activePlayback = deferred<void>();
firstClip.playDeferred = activePlayback;
firstClip.pause();
worlds[0].frame?.();
firstClip.playDeferred = undefined;
activePlayback.reject(new Error("active source playback"));
await settle();
await settle();
assert.equal(fixture.root.elements.get("play")?.textContent, "Pause moon flight");
assert.match(fixture.root.element("status").textContent ?? "", /native moon show continues/);
const rigLander = fixture.root.elements.get("rig-lander");
const rigAerial = fixture.root.elements.get("rig-aerial");
const seek = fixture.root.elements.get("seek");
if (!rigLander || !rigAerial || !seek) throw new Error("Missing rig or transport control");
assert.equal(rigLander.disabled, false);
assert.equal(rigAerial.disabled, false);
seek.value = "23.5";
seek.dispatchEvent(new Event("input"));
assert.deepEqual(firstSphere.timesOfDay, [6.25, 18.5]);
assert.deepEqual(firstSphere.environments, [false, true]);
fixture.root.elements.get("begin")?.dispatchEvent(new Event("click"));
await settle();
assert.deepEqual(firstSphere.timesOfDay, [6.25, 18.5]);
assert.deepEqual(firstSphere.environments, [false, true]);
fixture.document.defaultView.now += 1_000;
worlds[0].frame?.();
assert.equal(seek.value, "24.5");
fixture.root.elements.get("fullscreen")?.dispatchEvent(new Event("click"));
await settle();
const cameraStopsBeforeRig = liveInputs[0].stopCalls;
const fullscreenBeforeRig = fixture.root.fullscreenElement;
rigAerial.dispatchEvent(new Event("click"));
assert.deepEqual(firstSphere.rigs, ["aerial"]);
assert.deepEqual(firstSphere.timesOfDay, [6.25, 18.5]);
assert.deepEqual(firstSphere.environments, [false, true]);
assert.equal(rigLander.getAttribute("aria-pressed"), "false");
assert.equal(rigAerial.getAttribute("aria-pressed"), "true");
assert.equal(liveInputs[0].active, true);
assert.equal(liveInputs[0].stopCalls, cameraStopsBeforeRig);
assert.equal(worlds[0].loopCalls, 1);
assert.equal(worlds[0].disposeCalls, 0);
assert.equal(firstSphere.disposeCalls, 0);
assert.equal(fixture.root.fullscreenElement, fullscreenBeforeRig);
assert.equal(fixture.root.elements.get("play")?.textContent, "Pause moon flight");
fixture.document.defaultView.now += 1_000;
worlds[0].frame?.();
assert.equal(seek.value, "25.5");
assert.equal(firstSphere.frames.at(-1)?.avatarVisible, true);
assert.equal(firstSphere.frames.at(-1)?.moonVisible, true);
assert.equal(firstSphere.frames.at(-1)?.haze, 0.8);
const upload = fixture.root.elements.get("upload");
if (!upload) throw new Error("Missing upload input");
upload.files = [new File(["video"], "local.mp4", { type: "video/mp4" })] as unknown as FileList;
upload.dispatchEvent(new Event("change"));
await settle();
const videoUrlBeforeRig = fixture.root.elements.get("live-video")?.src;
const inputStopsBeforeRig = liveInputs[0].stopCalls;
rigLander.dispatchEvent(new Event("click"));
assert.deepEqual(firstSphere.rigs, ["aerial", "lander"]);
assert.deepEqual(firstSphere.timesOfDay, [6.25, 18.5]);
assert.deepEqual(firstSphere.environments, [false, true]);
assert.equal(rigLander.getAttribute("aria-pressed"), "true");
assert.equal(rigAerial.getAttribute("aria-pressed"), "false");
assert.equal(liveInputs[0].stopCalls, inputStopsBeforeRig);
assert.equal(fixture.root.elements.get("live-video")?.src, videoUrlBeforeRig);
assert.equal(fixture.document.defaultView.revokedUrls.length, 0);
const projectionToggle = fixture.root.element("projection-toggle");
projectionToggle.dispatchEvent(new Event("click"));
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.projectionEnabled, false);
assert.equal(projectionToggle.getAttribute("aria-pressed"), "false");
const presetIds = ["realistic", "night", "dusk", "day", "inspect", "wireframe"] as const;
for (const [preset, expectedTime, mode] of [
  ["realistic", "22", "realistic"],
  ["night", "0", "realistic"],
  ["dusk", "18", "realistic"],
  ["day", "12", "realistic"],
  ["inspect", "12", "inspect"],
  ["wireframe", "12", "wireframe"],
] as const) {
  fixture.root.element(`preset-${preset}`).dispatchEvent(new Event("click"));
  worlds[0].frame?.();
  assert.equal(firstSphere.displayModes.at(-1), mode);
  assert.equal(timeOfDay.value, expectedTime);
  assert.equal(
    presetIds
      .filter((id) => fixture.root.element(`preset-${id}`).getAttribute("aria-pressed") === "true")
      .join(),
    preset,
  );
  assert.equal(firstSphere.frames.at(-1)?.projectionEnabled, false);
  assert.equal(firstSphere.frames.at(-1)?.brightness, 1);
  assert.equal(firstSphere.frames.at(-1)?.haze, 0.8);
  assert.equal(contentBoth.getAttribute("aria-pressed"), "true");
  assert.equal(rigLander.getAttribute("aria-pressed"), "true");
  assert.equal(fixture.root.element("play").textContent, "Pause moon flight");
  assert.equal(fixture.root.element("live-video").src, videoUrlBeforeRig);
  assert.equal(liveInputs[0].stopCalls, inputStopsBeforeRig);
}
assert.deepEqual(firstSphere.timesOfDay, [6.25, 18.5, 22, 0, 18, 12]);
timeOfDay.value = "7";
timeOfDay.dispatchEvent(new Event("input"));
assert.equal(fixture.root.element("preset-wireframe").getAttribute("aria-pressed"), "true");
fixture.root.element("preset-inspect").dispatchEvent(new Event("click"));
timeOfDay.value = "6.5";
timeOfDay.dispatchEvent(new Event("input"));
assert.equal(fixture.root.element("preset-inspect").getAttribute("aria-pressed"), "true");
assert.equal(firstSphere.displayModes.at(-1), "inspect");
for (const preset of ["night", "dusk", "day"]) {
  fixture.root.element(`preset-${preset}`).dispatchEvent(new Event("click"));
  timeOfDay.value = "8.5";
  timeOfDay.dispatchEvent(new Event("input"));
  assert.equal(timeOfDayLabel.value, "08:30");
  assert.equal(fixture.root.element("preset-realistic").getAttribute("aria-pressed"), "true");
  assert.equal(fixture.root.element(`preset-${preset}`).getAttribute("aria-pressed"), "false");
}
projectionToggle.dispatchEvent(new Event("click"));
worlds[0].frame?.();
assert.equal(firstSphere.frames.at(-1)?.projectionEnabled, true);
const timesBeforeCleanup = [...firstSphere.timesOfDay];
const modesBeforeCleanup = [...firstSphere.displayModes];
cleanupFirst();
assert.equal(worlds[0].disposeCalls, 1);
assert.equal(firstSphere.disposeCalls, 1);
timeOfDay.value = "3";
timeOfDay.dispatchEvent(new Event("input"));
environment.checked = false;
environment.dispatchEvent(new Event("change"));
assert.deepEqual(firstSphere.timesOfDay, timesBeforeCleanup);
fixture.root.element("preset-day").dispatchEvent(new Event("click"));
projectionToggle.dispatchEvent(new Event("click"));
assert.deepEqual(firstSphere.displayModes, modesBeforeCleanup);
assert.equal(projectionToggle.getAttribute("aria-pressed"), "true");
assert.equal(fixture.root.element("preset-realistic").getAttribute("aria-pressed"), "true");
assert.deepEqual(firstSphere.environments, [false, true]);
assert.equal(fixture.document.defaultView.revokedUrls.length, 1);
assert.equal(liveInputs[0].active, false);
assert.ok(liveInputs[0].stopCalls >= 1);
assert.equal(FakeResizeObserver.instances[0].disconnected, true);
assert.ok(fixture.document.createdVideos[0].pauseCalls >= 1);
assert.ok(fixture.document.createdVideos[0].loadCalls >= 1);
assert.equal(fixture.document.createdVideos[0].src, "");

const contentStateAfterCleanup = [contentMoon, contentBody, contentBoth].map((button) =>
  button.getAttribute("aria-pressed"),
);
const hazerStateAfterCleanup = hazerToggle.getAttribute("aria-pressed");
contentBody.dispatchEvent(new Event("click"));
hazerToggle.dispatchEvent(new Event("click"));
assert.deepEqual(
  [contentMoon, contentBody, contentBoth].map((button) => button.getAttribute("aria-pressed")),
  contentStateAfterCleanup,
);
assert.equal(hazerToggle.getAttribute("aria-pressed"), hazerStateAfterCleanup);

const firstStartCalls = liveInputs[0].startCalls;
fixture.root.elements.get("camera")?.dispatchEvent(new Event("click"));
await settle();
assert.equal(liveInputs[0].startCalls, firstStartCalls);
rigAerial.dispatchEvent(new Event("click"));
assert.deepEqual(firstSphere.rigs, ["aerial", "lander"]);

contentMoon.setAttribute("aria-pressed", "true");
contentBody.setAttribute("aria-pressed", "false");
contentBoth.setAttribute("aria-pressed", "false");
hazerToggle.setAttribute("aria-pressed", "false");
hazerToggle.textContent = "Hazer off";

const cleanupSecond = mountShowtime(root, "/film/film-media/");
const secondSphere = createSphere();
pendingSpheres[1].resolve(secondSphere);
await settle();
assert.equal(worlds[1].loopCalls, 1);
assert.deepEqual(secondSphere.timesOfDay, [3]);
assert.deepEqual(secondSphere.environments, [false]);
worlds[1].frame?.();
assert.equal(secondSphere.frames.at(-1)?.moonVisible, true);
assert.equal(secondSphere.frames.at(-1)?.avatarVisible, false);
assert.equal(secondSphere.frames.at(-1)?.haze, 0);
fixture.root.elements.get("camera")?.dispatchEvent(new Event("click"));
await settle();
assert.equal(liveInputs[1].startCalls, 1);
cleanupSecond();
assert.equal(worlds[1].disposeCalls, 1);
assert.equal(secondSphere.disposeCalls, 1);
assert.equal(FakeResizeObserver.instances[1].disconnected, true);

const cleanupThird = mountShowtime(root, "/film/film-media/");
cleanupThird();
assert.equal(startupSignals[2].aborted, true);
const lateSphere = createSphere();
pendingSpheres[2].resolve(lateSphere);
await settle();
assert.equal(worlds[2].loopCalls, 0);
assert.equal(worlds[2].disposeCalls, 1);
assert.equal(lateSphere.disposeCalls, 1);
assert.equal(FakeResizeObserver.instances[2].disconnected, true);

const cleanupFourth = mountShowtime(root, "/film/film-media/");
const fourthClip = fixture.document.createdVideos[3];
if (!fourthClip) throw new Error("Missing fourth film clip");
const fourthClipPlay = deferred<void>();
fourthClip.playDeferred = fourthClipPlay;
fixture.root.elements.get("begin")?.dispatchEvent(new Event("click"));

const liveVideo = fixture.root.elements.get("live-video");
if (!liveVideo) throw new Error("Missing live video");
const uploadPlay = deferred<void>();
liveVideo.playDeferred = uploadPlay;
upload.files = [new File(["video"], "pending.mp4", { type: "video/mp4" })] as unknown as FileList;
upload.dispatchEvent(new Event("change"));
await settle();
assert.equal(fixture.document.defaultView.createdUrls.length, 2);
const fourthStopCallsBeforeFailure = liveInputs[3].stopCalls;

pendingSpheres[3].reject(new Error("projection startup failed"));
await settle();
const fatalStatus = "Showtime could not start: Error: projection startup failed.";
assert.equal(worlds[3].disposeCalls, 1);
assert.equal(startupSignals[3].aborted, true);
assert.equal(FakeResizeObserver.instances[3].disconnected, true);
assert.equal(liveInputs[3].active, false);
assert.equal(liveInputs[3].stopCalls, fourthStopCallsBeforeFailure + 1);
assert.equal(fixture.document.defaultView.revokedUrls.length, 2);
assert.ok(fourthClip.pauseCalls >= 1);
assert.ok(fourthClip.loadCalls >= 1);
assert.equal(fourthClip.src, "");
assert.equal(fixture.root.elements.get("status")?.textContent, fatalStatus);
assert.equal(fixture.root.elements.get("play")?.disabled, true);
assert.equal(fixture.root.elements.get("begin")?.disabled, true);
assert.equal(fixture.root.elements.get("camera")?.disabled, true);
assert.equal(upload.disabled, true);
assert.equal(rigLander.disabled, true);
assert.equal(rigAerial.disabled, true);

fourthClipPlay.resolve();
uploadPlay.resolve();
await settle();
assert.equal(fixture.root.elements.get("status")?.textContent, fatalStatus);
assert.equal(fixture.root.elements.get("play")?.disabled, true);

const fourthClipPlayCalls = fourthClip.playCalls;
const fourthUploadPlayCalls = liveVideo.playCalls;
const fourthCameraStartCalls = liveInputs[3].startCalls;
fixture.root.elements.get("begin")?.dispatchEvent(new Event("click"));
fixture.root.elements.get("camera")?.dispatchEvent(new Event("click"));
fixture.root.elements.get("reference")?.dispatchEvent(new Event("change"));
upload.dispatchEvent(new Event("change"));
await settle();
assert.equal(fourthClip.playCalls, fourthClipPlayCalls);
assert.equal(liveVideo.playCalls, fourthUploadPlayCalls);
assert.equal(liveInputs[3].startCalls, fourthCameraStartCalls);
assert.equal(fixture.root.elements.get("status")?.textContent, fatalStatus);
cleanupFourth();
assert.equal(worlds[3].disposeCalls, 1);
assert.equal(FakeResizeObserver.instances[3].disconnected, true);

const cleanupFifth = mountShowtime(root, "/film/film-media/");
const cameraStart = deferred<boolean>();
liveInputs[4].startDeferred = cameraStart;
fixture.root.elements.get("camera")?.dispatchEvent(new Event("click"));
await settle();
assert.equal(liveInputs[4].pending, true);
pendingSpheres[4].reject(new Error("projection startup failed"));
await settle();
assert.equal(worlds[4].disposeCalls, 1);
assert.equal(startupSignals[4].aborted, true);
assert.equal(FakeResizeObserver.instances[4].disconnected, true);
assert.equal(liveInputs[4].pending, false);
assert.equal(liveInputs[4].active, false);
assert.equal(liveInputs[4].stopCalls, 2);
assert.equal(fixture.root.elements.get("status")?.textContent, fatalStatus);
cameraStart.resolve(true);
await settle();
assert.equal(liveInputs[4].active, false);
assert.equal(fixture.root.elements.get("status")?.textContent, fatalStatus);
assert.equal(fixture.root.elements.get("camera")?.disabled, true);
cleanupFifth();
assert.equal(worlds[4].disposeCalls, 1);

Object.defineProperty(globalThis, "document", { configurable: true, value: fixture.document });
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: fixture.document.defaultView,
});
await import("./standalone");
const standaloneSphere = createSphere();
pendingSpheres[5].resolve(standaloneSphere);
await settle();
assert.equal(worlds[5].loopCalls, 1);
fixture.document.defaultView.dispatchEvent(new Event("pagehide"));
assert.equal(worlds[5].disposeCalls, 1);
const pageshow = new Event("pageshow") as PageTransitionEvent;
Object.defineProperty(pageshow, "persisted", { value: true });
fixture.document.defaultView.dispatchEvent(pageshow);
assert.equal(worlds.length, 7);
const restoredSphere = createSphere();
pendingSpheres[6].resolve(restoredSphere);
await settle();
assert.equal(worlds[6].loopCalls, 1);
fixture.document.defaultView.dispatchEvent(new Event("pagehide"));
assert.equal(worlds[6].disposeCalls, 1);

function prepareAutomaticMount(autoStart?: boolean) {
  const instance = createRoot();
  const index = worlds.length;
  const cleanup = mountShowtime(instance.root as unknown as ShadowRoot, "/film/film-media/", {
    autoStart,
  });
  return {
    ...instance,
    cleanup,
    clip: instance.document.createdVideos[0],
    pending: pendingSpheres[index],
    sphere: createSphere(),
    world: worlds[index],
    input: liveInputs[index],
  };
}

const optOut = prepareAutomaticMount(false);
optOut.pending.resolve(optOut.sphere);
await settle();
await settle();
assert.equal(optOut.clip.playCalls, 0);
assert.equal(optOut.root.element("play").textContent, "Start the show");
optOut.cleanup();

const stalled = prepareAutomaticMount();
const stalledPlay = deferred<void>();
stalled.clip.playDeferred = stalledPlay;
stalled.pending.resolve(stalled.sphere);
await settle();
stalled.document.defaultView.now += 1_000;
stalled.world.frame?.();
assert.equal(
  stalled.root.element("seek").value,
  "1",
  "a loading film must not block the native show",
);
assert.equal(stalled.root.element("intro").hidden, true);
assert.equal(stalled.input.startCalls, 0);
stalled.cleanup();
stalledPlay.resolve();
await settle();

const earlyPause = prepareAutomaticMount();
earlyPause.root.element("play").dispatchEvent(new Event("click"));
earlyPause.pending.resolve(earlyPause.sphere);
await settle();
await settle();
assert.equal(earlyPause.clip.playCalls, 0);
earlyPause.document.defaultView.now += 1_000;
earlyPause.world.frame?.();
assert.equal(earlyPause.root.element("seek").value, "0");
earlyPause.root.element("begin").dispatchEvent(new Event("click"));
await settle();
assert.equal(earlyPause.clip.playCalls, 0);
assert.equal(earlyPause.root.element("intro").hidden, true);
assert.equal(earlyPause.input.startCalls, 0);
earlyPause.cleanup();

const blocked = prepareAutomaticMount();
const blockedPlay = deferred<void>();
blocked.clip.playDeferred = blockedPlay;
blocked.clip.readyState = 4;
blocked.pending.resolve(blocked.sphere);
await settle();
blocked.world.frame?.();
blockedPlay.reject(new Error("autoplay blocked"));
await settle();
await settle();
assert.equal(blocked.root.element("play").textContent, "Pause moon flight");
assert.equal(blocked.root.element("intro").hidden, true);
assert.equal(blocked.root.element("begin").disabled, false);
assert.match(blocked.root.element("status").textContent ?? "", /autoplay blocked/);
blocked.clip.playDeferred = undefined;
blocked.clip.paused = true;
const attemptsBeforeRetry = blocked.clip.playCalls;
blocked.document.defaultView.now += 1_000;
blocked.world.frame?.();
assert.equal(blocked.root.element("seek").value, "1");
assert.equal(blocked.clip.playCalls, attemptsBeforeRetry);
blocked.root.element("play").dispatchEvent(new Event("click"));
blocked.root.element("begin").dispatchEvent(new Event("click"));
blocked.world.frame?.();
await settle();
assert.equal(blocked.root.element("play").textContent, "Pause moon flight");
assert.equal(blocked.clip.playCalls, attemptsBeforeRetry + 1);
assert.equal(blocked.input.startCalls, 0);
blocked.cleanup();

filmInserts.push({ src: "second.mp4", start: 10, end: 20, transition: "dissolve" });
const mixedFailure = prepareAutomaticMount();
const failedPlay = deferred<void>();
const sibling = mixedFailure.document.createdVideos[1];
mixedFailure.clip.playDeferred = failedPlay;
mixedFailure.clip.readyState = 4;
mixedFailure.pending.resolve(mixedFailure.sphere);
await settle();
mixedFailure.world.frame?.();
failedPlay.reject(new Error("first clip rejected"));
await settle();
await settle();
assert.equal(mixedFailure.root.element("play").textContent, "Pause moon flight");
assert.equal(sibling.paused, true);
assert.match(mixedFailure.root.element("status").textContent ?? "", /first clip rejected/);
sibling.readyState = 4;
mixedFailure.root.element("seek").value = "11";
mixedFailure.root.element("seek").dispatchEvent(new Event("input"));
mixedFailure.root.element("begin").dispatchEvent(new Event("click"));
mixedFailure.world.frame?.();
await settle();
assert.equal(sibling.paused, false, "a failed insert must not disable a later healthy insert");
mixedFailure.cleanup();
filmInserts.pop();

for (const action of ["pause", "dispose"] as const) {
  const pending = prepareAutomaticMount();
  const delayedPlay = deferred<void>();
  pending.clip.playDeferred = delayedPlay;
  pending.clip.commitPlayOnResolution = true;
  pending.clip.readyState = 4;
  pending.pending.resolve(pending.sphere);
  await settle();
  pending.world.frame?.();
  if (action === "pause") pending.root.element("play").dispatchEvent(new Event("click"));
  else pending.cleanup();
  delayedPlay.resolve();
  await settle();
  await settle();
  assert.equal(pending.root.element("intro").hidden, true);
  assert.equal(pending.clip.paused, true);
  assert.equal(pending.input.startCalls, 0);
  if (action === "pause") {
    pending.document.defaultView.now += 1_000;
    pending.world.frame?.();
    assert.equal(pending.root.element("seek").value, "0");
    assert.equal(pending.root.element("play").textContent, "Start the show");
    pending.cleanup();
  }
  assert.equal(pending.world.disposeCalls, 1);
  assert.equal(pending.sphere.disposeCalls, 1);
}

const retry = prepareAutomaticMount();
const oldPlay = deferred<void>();
retry.clip.playDeferred = oldPlay;
retry.clip.commitPlayOnResolution = true;
retry.clip.readyState = 4;
retry.pending.resolve(retry.sphere);
await settle();
retry.world.frame?.();
retry.root.element("play").dispatchEvent(new Event("click"));
retry.root.element("begin").dispatchEvent(new Event("click"));
retry.world.frame?.();
assert.equal(retry.clip.playCalls, 1, "resume must not pile play calls onto a pending insert");
oldPlay.resolve();
await settle();
await settle();
assert.equal(retry.clip.paused, false);
assert.equal(retry.root.element("play").textContent, "Pause moon flight");
retry.cleanup();
