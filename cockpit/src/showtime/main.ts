import { sampleFlight } from "../film/flight";
import { createHumanProjection, sampleHumanBlend } from "../film/human";
import { createIceWorld } from "../film/ice-world";
import { FILM_INSERTS } from "../film/shots";
import { drawTransition, revealProgress } from "../film/transitions";
import { createLiveInput } from "./live-input";
import {
  MOTION_SAMPLE_HEIGHT,
  MOTION_SAMPLE_WIDTH,
  MotionResponseAnalyzer,
} from "./motion-response";
import { type MovementRoutinePose, routinePoseAt } from "./movement-routines";
import { createProjectionSphere } from "./projection-sphere";
import { advanceShowtime, loopFade } from "./timeline";

type ProjectionContent = "moon" | "body" | "both";
type MovementMode = "random" | "control";
const viewingPresets = ["realistic", "dusk", "day", "inspect", "wireframe"] as const;
const routineLabels = {
  settle: "Routine · Settle",
  look: "Routine · Look",
  reach: "Routine · Reach",
  stretch: "Routine · Stretch",
  recline: "Routine · Recline",
  "tucked-crouch": "Routine · Tucked crouch",
} satisfies Record<MovementRoutinePose["routine"], string>;

export interface ShowtimeMountOptions {
  autoStart?: boolean;
}

/** Mount one Showtime runtime inside a host and return its synchronous cleanup. */
export function mountShowtime(
  root: ParentNode,
  mediaBase: string,
  options: ShowtimeMountOptions = {},
): () => void {
  const element = <T extends HTMLElement>(id: string): T => {
    const value = root.querySelector(`#${id}`);
    if (!value) throw new Error(`Missing Showtime element ${id}`);
    return value as T;
  };
  const stage = element("stage"),
    intro = element("intro"),
    status = element("status");
  const worldCanvas = element<HTMLCanvasElement>("world");
  const composition = element<HTMLCanvasElement>("composition");
  const sphereCanvas = element<HTMLCanvasElement>("sphere");
  const video = element<HTMLVideoElement>("live-video");
  const upload = element<HTMLInputElement>("upload");
  const seek = element<HTMLInputElement>("seek"),
    blend = element<HTMLInputElement>("blend");
  const fade = element<HTMLInputElement>("fade"),
    mirror = element<HTMLInputElement>("mirror");
  const reference = element<HTMLInputElement>("reference"),
    effects = element<HTMLInputElement>("effects");
  const haze = element<HTMLInputElement>("haze"),
    reaction = element<HTMLInputElement>("reaction");
  const internalHaze = element<HTMLInputElement>("internal-haze");
  const filmBlend = element<HTMLInputElement>("film-blend");
  const brightness = element<HTMLInputElement>("brightness");
  const movementEnergy = element<HTMLInputElement>("movement-energy"),
    movementDirection = element<HTMLInputElement>("movement-direction");
  const movementButtons = {
    random: element<HTMLButtonElement>("movement-random"),
    control: element<HTMLButtonElement>("movement-control"),
  } satisfies Record<MovementMode, HTMLButtonElement>;
  const timeOfDay = element<HTMLInputElement>("time-of-day"),
    timeOfDayLabel = element<HTMLOutputElement>("time-of-day-label");
  const environment = element<HTMLInputElement>("environment");
  const contentButtons = {
    moon: element<HTMLButtonElement>("content-moon"),
    body: element<HTMLButtonElement>("content-body"),
    both: element<HTMLButtonElement>("content-both"),
  } satisfies Record<ProjectionContent, HTMLButtonElement>;
  const hazerToggle = element<HTMLButtonElement>("hazer-toggle");
  const presetButtons = viewingPresets.map((preset) =>
    element<HTMLButtonElement>(`preset-${preset}`),
  );
  const projectionToggle = element<HTMLButtonElement>("projection-toggle");
  const motionState = element<HTMLOutputElement>("motion-state");
  const cameraButton = element<HTMLButtonElement>("camera"),
    stopButton = element<HTMLButtonElement>("stop-camera");
  const playButton = element<HTMLButtonElement>("play"),
    beginButton = element<HTMLButtonElement>("begin");
  const fullscreenButton = element<HTMLButtonElement>("fullscreen");
  const ownerDocument = stage.ownerDocument;
  const ownerWindow = ownerDocument.defaultView;
  if (ownerWindow === null) throw new Error("Showtime requires a browser window.");
  const browserWindow = ownerWindow;
  const assets = new URL(mediaBase, ownerDocument.baseURI).href;
  fullscreenButton.disabled = !ownerDocument.fullscreenEnabled;
  fullscreenButton.title = ownerDocument.fullscreenEnabled
    ? "Fill the screen; press Escape or Exit fullscreen to return."
    : "Fullscreen is unavailable in this browser.";
  const inputState = element("input-state"),
    chapter = element("chapter");
  const clock = element<HTMLOutputElement>("clock");
  element("showtime-about").hidden = !import.meta.env.PROD;
  element<HTMLAnchorElement>("showtime-license").href = new URL(
    "./environment-brdf.LICENSE.txt",
    import.meta.url,
  ).href;
  const width = 1280,
    height = 720;
  for (const canvas of [worldCanvas, composition]) {
    canvas.width = width;
    canvas.height = height;
  }
  const context = composition.getContext("2d", { alpha: false });
  if (!context) throw new Error("This browser cannot compose the projection.");
  const ctx = context;
  const live = createLiveInput(video);
  const motionSampler = ownerDocument.createElement("canvas");
  motionSampler.width = MOTION_SAMPLE_WIDTH;
  motionSampler.height = MOTION_SAMPLE_HEIGHT;
  const motionContext = motionSampler.getContext("2d", { willReadFrequently: true });
  const motionAnalyzer = new MotionResponseAnalyzer();
  const movementEpoch = browserWindow.performance.now();
  const movementSeed = 1 + Math.floor(Math.random() * 0x7ffffffe);
  const routinePose = routinePoseAt(0, movementSeed);
  let movementMode: MovementMode =
    movementButtons.control.getAttribute("aria-pressed") === "true" ? "control" : "random";
  let motionEnergy = 0,
    motionX = 0,
    lastMotionSample = 0,
    motionUnavailable = false;
  const projectionFrame = {
    seconds: 0,
    motion: 0,
    motionX: 0,
    haze: 0.9,
    internalHaze: 0.35,
    effects: 0.65,
    filmBlend: 0.7,
    avatarVisible: true,
    personOpacity: 0,
    moonVisible: true,
    brightness: 1,
    projectionEnabled: true,
    routinePose: undefined as MovementRoutinePose | undefined,
  };
  let seconds = 0,
    playing = false,
    lastFrame = ownerWindow.performance.now();
  let playbackRequested = options.autoStart !== false,
    playbackReady = false,
    playbackStarting = false,
    playbackAttempt = 0;
  playButton.textContent = playbackRequested ? "Pause moon flight" : "Start the show";
  let disposed = false,
    uploadedUrl: string | undefined,
    inputGeneration = 0;
  let lastInputLabel = "";
  let activeClip: HTMLVideoElement | undefined;
  let clipPlaybackAttempt = 0;
  const projectionContents = Object.keys(contentButtons) as ProjectionContent[];
  let projectionContent =
    projectionContents.find(
      (choice) => contentButtons[choice].getAttribute("aria-pressed") === "true",
    ) ?? "both";
  let hazerEnabled = hazerToggle.getAttribute("aria-pressed") !== "false";
  let viewingPreset =
    viewingPresets.find(
      (_, index) => presetButtons[index].getAttribute("aria-pressed") === "true",
    ) ?? "realistic";
  let projectionEnabled = projectionToggle.getAttribute("aria-pressed") !== "false";
  let world: ReturnType<typeof createIceWorld> | undefined;
  let sphere: Awaited<ReturnType<typeof createProjectionSphere>> | undefined;
  const startup = new AbortController();
  const events = new AbortController();
  const projectionViews = ["left", "rear", "right", "front"] as const;
  const projectionRigs = ["lander", "aerial"] as const;
  const updateContentButtons = (): void => {
    for (const choice of projectionContents)
      contentButtons[choice].setAttribute("aria-pressed", String(choice === projectionContent));
  };
  const updateHazerButton = (): void => {
    hazerToggle.setAttribute("aria-pressed", String(hazerEnabled));
    hazerToggle.textContent = hazerEnabled ? "Hazer on" : "Hazer off";
  };
  updateContentButtons();
  updateHazerButton();
  const updateMovementControls = (): void => {
    movementButtons.random.setAttribute("aria-pressed", String(movementMode === "random"));
    movementButtons.control.setAttribute("aria-pressed", String(movementMode === "control"));
    movementEnergy.disabled = movementDirection.disabled = movementMode !== "control";
  };
  updateMovementControls();
  for (const mode of ["random", "control"] as const)
    movementButtons[mode].addEventListener(
      "click",
      () => {
        movementMode = mode;
        motionAnalyzer.reset();
        lastMotionSample = 0;
        motionUnavailable = false;
        updateMovementControls();
      },
      { signal: events.signal },
    );
  for (const choice of projectionContents) {
    contentButtons[choice].addEventListener(
      "click",
      () => {
        projectionContent = choice;
        updateContentButtons();
        if (choice === "body") {
          clipPlaybackAttempt++;
          activeClip?.pause();
          activeClip = undefined;
        }
      },
      { signal: events.signal },
    );
  }
  hazerToggle.addEventListener(
    "click",
    () => {
      hazerEnabled = !hazerEnabled;
      updateHazerButton();
    },
    { signal: events.signal },
  );
  const readTimeOfDay = (): number => {
    const value = Number(timeOfDay.value);
    return Number.isFinite(value) ? Math.max(0, Math.min(24, value)) : 22;
  };
  const formatTimeOfDay = (hours: number): string => {
    const minutes = Math.round(hours * 60);
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  };
  let selectedTimeOfDay = readTimeOfDay();
  let environmentEnabled = environment.checked;
  const updateTimeOfDay = (): void => {
    const label = formatTimeOfDay(selectedTimeOfDay);
    timeOfDayLabel.value = label;
    timeOfDay.setAttribute("aria-valuetext", label);
    if (!sphere || disposed) return;
    sphere.setTimeOfDay(selectedTimeOfDay);
  };
  const updateEnvironment = (): void => {
    if (!sphere || disposed) return;
    sphere.setEnvironment(environmentEnabled);
  };
  const updatePresetButtons = (): void => {
    for (let index = 0; index < viewingPresets.length; index++)
      presetButtons[index].setAttribute(
        "aria-pressed",
        String(viewingPresets[index] === viewingPreset),
      );
  };
  const updateDisplayMode = (): void => {
    if (sphere && !disposed)
      sphere.setDisplayMode(
        viewingPreset === "inspect" || viewingPreset === "wireframe" ? viewingPreset : "realistic",
      );
  };
  const updateProjectionToggle = (): void => {
    projectionToggle.setAttribute("aria-pressed", String(projectionEnabled));
    projectionToggle.textContent = projectionEnabled ? "Projection on" : "Projection off";
  };
  updatePresetButtons();
  updateProjectionToggle();
  for (let index = 0; index < viewingPresets.length; index++)
    presetButtons[index].addEventListener(
      "click",
      () => {
        viewingPreset = viewingPresets[index];
        const hours =
          viewingPreset === "realistic"
            ? 22
            : viewingPreset === "dusk"
              ? 18
              : viewingPreset === "day"
                ? 12
                : undefined;
        if (hours !== undefined) {
          selectedTimeOfDay = hours;
          timeOfDay.value = String(hours);
          updateTimeOfDay();
        }
        updatePresetButtons();
        updateDisplayMode();
        status.textContent = `${presetButtons[index].textContent} view selected.`;
      },
      { signal: events.signal },
    );
  projectionToggle.addEventListener(
    "click",
    () => {
      projectionEnabled = !projectionEnabled;
      updateProjectionToggle();
      status.textContent = projectionEnabled
        ? "Projection on. The show continues."
        : "Projection off. The show keeps moving.";
    },
    { signal: events.signal },
  );
  updateTimeOfDay();
  timeOfDay.addEventListener(
    "input",
    () => {
      selectedTimeOfDay = readTimeOfDay();
      if (viewingPreset === "dusk" || viewingPreset === "day") {
        viewingPreset = "realistic";
        updatePresetButtons();
      }
      updateTimeOfDay();
    },
    { signal: events.signal },
  );
  environment.addEventListener(
    "change",
    () => {
      environmentEnabled = environment.checked;
      updateEnvironment();
    },
    { signal: events.signal },
  );
  for (const rig of projectionRigs) {
    element<HTMLButtonElement>(`rig-${rig}`).addEventListener(
      "click",
      () => {
        if (!sphere || disposed) return;
        sphere.setRig(rig);
        for (const choice of projectionRigs)
          element(`rig-${choice}`).setAttribute("aria-pressed", String(choice === rig));
        intro.hidden = true;
        status.textContent = `${rig === "aerial" ? "Aerial rig" : "Ground lander"} selected. The moon, movement and haze continue on the same zorb surface.`;
      },
      { signal: events.signal },
    );
  }
  for (const view of projectionViews) {
    element<HTMLButtonElement>(`view-${view}`).addEventListener(
      "click",
      () => {
        if (!sphere) return;
        sphere.setView(view);
        intro.hidden = true;
        element("view-hint").textContent =
          `${view === "front" ? "Clear front" : `${view[0].toUpperCase()}${view.slice(1)} projection`} · drag to orbit · scroll to zoom`;
        status.textContent =
          view === "front"
            ? "Clear front selected. The moon is projected from the two sides and rear."
            : `${view[0].toUpperCase()}${view.slice(1)} projection selected. All three projectors share the same Enceladus map.`;
      },
      { signal: events.signal },
    );
  }
  const portrait = createHumanProjection(assets);
  const bodyPortrait = ownerDocument.createElement("canvas");
  bodyPortrait.width = bodyPortrait.height = 512;
  const bodyContext = bodyPortrait.getContext("2d");
  if (!bodyContext) throw new Error("This browser cannot compose the full portrait.");
  let portraitReady = false;
  void portrait.ready
    .then(() => {
      if (!disposed) {
        bodyContext.fillStyle = "#211916";
        bodyContext.fillRect(0, 0, 512, 512);
        portrait.draw(bodyContext, 0, 1);
        portraitReady = true;
      }
    })
    .catch((error) => {
      if (!disposed)
        status.textContent = `Reference portrait unavailable: ${String(error)}. Camera and video can still be used.`;
    });
  const clips = FILM_INSERTS.map((clip) => {
    const media = ownerDocument.createElement("video");
    media.src = new URL(clip.src, assets).href;
    media.preload = "auto";
    media.loop = true;
    media.muted = true;
    media.playsInline = true;
    media.addEventListener(
      "error",
      () => {
        if (!disposed)
          status.textContent = `Source unavailable: ${clip.src}. Prepare film media before playing.`;
      },
      { signal: events.signal },
    );
    return { ...clip, video: media };
  });
  const reducedMotion = ownerWindow.matchMedia("(prefers-reduced-motion: reduce)");

  function stopInput(): void {
    inputGeneration++;
    live.stop();
    video.removeAttribute("src");
    video.load();
    if (uploadedUrl) browserWindow.URL.revokeObjectURL(uploadedUrl);
    uploadedUrl = undefined;
    upload.value = "";
    motionAnalyzer.reset();
    motionEnergy = 0;
    motionX = 0;
    lastMotionSample = 0;
    motionUnavailable = false;
    motionState.value = "Movement 0%";
  }
  function updateInput(): void {
    const label = live.active
      ? "Live camera · local only"
      : live.pending
        ? "Camera permission pending"
        : uploadedUrl
          ? "Moving video · local only"
          : reference.checked
            ? "Camera off · reference portrait"
            : "Moon only";
    if (label === lastInputLabel) return;
    lastInputLabel = label;
    cameraButton.disabled = live.pending || live.active;
    stopButton.disabled = !live.pending && !live.active && !uploadedUrl;
    cameraButton.textContent = live.pending
      ? "Waiting for camera…"
      : live.active
        ? "Camera on"
        : "Start camera";
    inputState.textContent = label;
  }
  function setPlaying(value: boolean): void {
    playbackRequested = value;
    playing = value;
    playButton.textContent = value ? "Pause moon flight" : "Start the show";
    lastFrame = browserWindow.performance.now();
    if (!value) {
      playbackAttempt++;
      playbackStarting = false;
      beginButton.disabled = false;
      clipPlaybackAttempt++;
      clips.forEach((clip) => {
        clip.video.pause();
      });
    }
  }
  async function begin(): Promise<void> {
    if (disposed) return;
    playbackRequested = true;
    playButton.textContent = "Pause moon flight";
    if (!playbackReady || playing || playbackStarting) return;
    const attempt = ++playbackAttempt;
    playbackStarting = true;
    beginButton.disabled = true;
    try {
      const primed = await Promise.allSettled(
        clips.map(async (clip) => {
          await clip.video.play();
          if (
            disposed ||
            attempt === playbackAttempt ||
            (!playbackStarting && (!playing || activeClip !== clip.video))
          )
            clip.video.pause();
        }),
      );
      if (disposed || attempt !== playbackAttempt || !playbackRequested) return;
      clips.forEach((clip) => {
        clip.video.pause();
      });
      const failure = primed.find((result) => result.status === "rejected");
      if (failure?.status === "rejected") throw failure.reason;
      activeClip = undefined;
      intro.hidden = true;
      setPlaying(true);
      status.textContent =
        "Show looping continuously. Random motion is on; Controls lets you direct the movement.";
    } catch (error) {
      if (disposed || attempt !== playbackAttempt) return;
      setPlaying(false);
      intro.hidden = false;
      status.textContent = `Could not start the show: ${String(error)}. Check the local film sources.`;
    } finally {
      if (!disposed && attempt === playbackAttempt) {
        playbackStarting = false;
        beginButton.disabled = false;
      }
    }
  }
  beginButton.addEventListener("click", () => void begin(), { signal: events.signal });
  playButton.addEventListener(
    "click",
    () => {
      if (playbackRequested) setPlaying(false);
      else void begin();
    },
    { signal: events.signal },
  );
  cameraButton.addEventListener(
    "click",
    async () => {
      stopInput();
      const generation = inputGeneration;
      const pending = live.start();
      updateInput();
      status.textContent =
        "Andrew grants camera access in the browser. Move back for a full-body view.";
      try {
        const started = await pending;
        if (generation !== inputGeneration || disposed) return;
        if (started) {
          intro.hidden = true;
          if (!playing) void begin();
          status.textContent =
            "Live camera is blended into the moon. Move around; turn Fade in & out off for a continuous blend.";
        }
      } catch (error) {
        if (generation === inputGeneration && !disposed)
          status.textContent = `Camera could not start: ${String(error)}. Choose a local video instead, or retry camera access.`;
      } finally {
        if (!disposed) updateInput();
      }
    },
    { signal: events.signal },
  );
  stopButton.addEventListener(
    "click",
    () => {
      stopInput();
      updateInput();
      status.textContent = "Camera stopped and released. The moon show can keep playing.";
    },
    { signal: events.signal },
  );
  upload.addEventListener(
    "change",
    async (event) => {
      const file = (event.currentTarget as HTMLInputElement).files?.[0];
      if (!file) return;
      stopInput();
      const generation = inputGeneration;
      uploadedUrl = ownerWindow.URL.createObjectURL(file);
      video.src = uploadedUrl;
      video.loop = true;
      video.muted = true;
      try {
        await video.play();
        if (generation !== inputGeneration || disposed) return;
        intro.hidden = true;
        if (!playing) void begin();
        status.textContent = "Your moving video is blended locally. It has not been uploaded.";
      } catch (error) {
        if (generation !== inputGeneration || disposed) return;
        stopInput();
        status.textContent = `The selected video could not play: ${String(error)}.`;
      }
      updateInput();
    },
    { signal: events.signal },
  );
  seek.addEventListener(
    "input",
    () => {
      seconds = Number(seek.value) % 60;
      intro.hidden = true;
      setPlaying(false);
    },
    { signal: events.signal },
  );
  for (const link of root.querySelectorAll<HTMLAnchorElement>('a[href="#stage"]')) {
    link.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        stage.scrollIntoView({ block: "start" });
      },
      { signal: events.signal },
    );
  }
  fullscreenButton.addEventListener(
    "click",
    async () => {
      try {
        const rootNode = stage.getRootNode();
        const fullscreenElement =
          rootNode instanceof ownerWindow.ShadowRoot
            ? rootNode.fullscreenElement
            : ownerDocument.fullscreenElement;
        if (fullscreenElement === stage) await ownerDocument.exitFullscreen();
        else await stage.requestFullscreen();
      } catch (error) {
        if (!disposed) status.textContent = `Fullscreen unavailable: ${String(error)}`;
      }
    },
    { signal: events.signal },
  );
  reference.addEventListener("change", updateInput, { signal: events.signal });

  function sampleMovement(now: number): void {
    if (movementMode === "random") {
      routinePoseAt(Math.max(0, (now - movementEpoch) / 1000), movementSeed, routinePose);
      motionEnergy = routinePose.motion;
      motionX = routinePose.motionX;
      const label = routineLabels[routinePose.routine];
      if (motionState.value !== label) motionState.value = label;
      return;
    }
    if (!live.active && !uploadedUrl) {
      motionAnalyzer.update(undefined);
      motionEnergy = Math.max(0, Math.min(1, Number(movementEnergy.value) || 0));
      motionX = Math.max(-1, Math.min(1, Number(movementDirection.value) || 0));
      motionState.value = `Controlled movement ${Math.round(motionEnergy * 100)}%`;
      lastMotionSample = 0;
      return;
    }
    if (
      motionUnavailable ||
      !motionContext ||
      (!live.active && !uploadedUrl) ||
      video.readyState < 2 ||
      !video.videoWidth ||
      now - lastMotionSample < 100
    )
      return;
    lastMotionSample = now;
    try {
      motionContext.drawImage(video, 0, 0, MOTION_SAMPLE_WIDTH, MOTION_SAMPLE_HEIGHT);
      const response = motionAnalyzer.update(
        motionContext.getImageData(0, 0, MOTION_SAMPLE_WIDTH, MOTION_SAMPLE_HEIGHT).data,
      );
      motionEnergy = response.energy;
      motionX = response.centroidX * (mirror.checked ? -1 : 1);
      const label = `Movement ${Math.round(motionEnergy * 100)}%`;
      if (motionState.value !== label) motionState.value = label;
    } catch (error) {
      motionUnavailable = true;
      motionEnergy = 0;
      motionX = 0;
      motionState.value = "Movement sensing unavailable";
      status.textContent = `The moving image can still blend, but movement sensing failed: ${String(error)}.`;
    }
  }

  function humanOpacity(): number {
    const passage = fade.checked ? sampleHumanBlend(seconds) / 0.72 : 1;
    const reactiveBlend = reducedMotion.matches ? 0 : motionEnergy * Number(reaction.value);
    return Math.min(1, Number(blend.value) * (1 + reactiveBlend * 0.3)) * passage;
  }

  function drawMovingHuman(): void {
    const opacity = humanOpacity();
    if ((!live.active && !uploadedUrl) || video.readyState < 2 || !video.videoWidth) {
      if (reference.checked && portraitReady) portrait.draw(ctx, seconds, opacity);
      return;
    }
    if (!opacity) return;
    const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
    const sourceWidth = width / scale,
      sourceHeight = height / scale;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = "screen";
    if (mirror.checked) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(
      video,
      (video.videoWidth - sourceWidth) / 2,
      (video.videoHeight - sourceHeight) / 2,
      sourceWidth,
      sourceHeight,
      0,
      0,
      width,
      height,
    );
    ctx.restore();
  }

  function drawMovementMerge(strength: number): void {
    const response = motionEnergy * Number(reaction.value) * strength;
    if (response < 0.005) return;
    const x = width * (0.5 + motionX * 0.28);
    const y = height * 0.52;
    const radius = 160 + response * 380;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = response * 0.38;
    const iceLight = ctx.createRadialGradient(x, y, 0, x, y, radius);
    iceLight.addColorStop(0, "#70cce2");
    iceLight.addColorStop(0.45, "#163c64");
    iceLight.addColorStop(1, "#000000");
    ctx.fillStyle = iceLight;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#b7f0ff";
    ctx.lineWidth = 1.5;
    for (let ring = 0; ring < 3; ring++) {
      ctx.beginPath();
      const spread = 80 + ((browserWindow.performance.now() / 10 + ring * 100) % 300);
      ctx.ellipse(x, y, spread, spread * 0.42, motionX * 0.2, 0.2, Math.PI * 1.8);
      ctx.stroke();
    }
    ctx.restore();
  }
  function compose(strength: number): void {
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    if (projectionContent === "body") {
      activeClip?.pause();
      activeClip = undefined;
      ctx.fillStyle = "#020710";
      ctx.fillRect(0, 0, width, height);
      if (reference.checked && portraitReady && !live.active && !uploadedUrl) {
        ctx.globalAlpha = humanOpacity();
        ctx.drawImage(bodyPortrait, 92, 92, 328, 328, 0, 0, width, height);
        ctx.globalAlpha = 1;
      }
      drawMovingHuman();
      return;
    }
    ctx.drawImage(worldCanvas, 0, 0, width, height);
    const clip = clips.find((entry) => seconds >= entry.start && seconds <= entry.end);
    if (activeClip !== clip?.video) {
      clipPlaybackAttempt++;
      activeClip?.pause();
      activeClip = clip?.video;
      if (clip && Number.isFinite(clip.video.duration))
        clip.video.currentTime = (seconds - clip.start) % clip.video.duration;
    }
    if (clip && clip.video.readyState >= 2) {
      if (playing && clip.video.paused) {
        const attempt = ++clipPlaybackAttempt;
        void clip.video.play().catch((error) => {
          if (
            disposed ||
            attempt !== clipPlaybackAttempt ||
            activeClip !== clip.video ||
            projectionContent === "body"
          )
            return;
          setPlaying(false);
          status.textContent = `Source playback failed: ${String(error)}`;
        });
      }
      if (!playing && Number.isFinite(clip.video.duration)) {
        const expected = (seconds - clip.start) % clip.video.duration;
        if (Math.abs(clip.video.currentTime - expected) > 0.1) clip.video.currentTime = expected;
      }
      drawTransition(
        ctx,
        clip.video,
        revealProgress(seconds, clip.start, clip.end),
        clip.transition,
        strength,
      );
    }
    drawMovementMerge(strength);
    if (projectionContent === "both") drawMovingHuman();
    ctx.save();
    ctx.globalAlpha = loopFade(seconds);
    ctx.fillStyle = "#020710";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
  async function startProjection(): Promise<void> {
    try {
      world = createIceWorld(worldCanvas);
      world.engine.setSize(width, height);
      sphere = await createProjectionSphere(sphereCanvas, composition, startup.signal, assets);
      if (disposed) {
        sphere.dispose();
        return;
      }
      updateTimeOfDay();
      updateEnvironment();
      updateDisplayMode();
      sphere.resize();
      for (const view of projectionViews)
        element<HTMLButtonElement>(`view-${view}`).disabled = false;
      for (const rig of projectionRigs) {
        const button = element<HTMLButtonElement>(`rig-${rig}`);
        button.disabled = false;
        button.setAttribute("aria-pressed", String(rig === "lander"));
      }
      lastFrame = browserWindow.performance.now();
      status.textContent = "Ready. Start the show, or use Controls to direct Andrew’s movement.";
      world.engine.runRenderLoop(() => {
        const now = browserWindow.performance.now();
        if (ownerDocument.hidden) {
          lastFrame = now;
          return;
        }
        seconds = advanceShowtime(seconds, (now - lastFrame) / 1000, playing);
        lastFrame = now;
        const strength = reducedMotion.matches ? 0 : Number(effects.value);
        sampleMovement(now);
        world?.render(seconds, strength);
        compose(strength);
        projectionFrame.seconds = now / 1000;
        projectionFrame.motion = reducedMotion.matches ? 0 : motionEnergy * Number(reaction.value);
        projectionFrame.motionX = reducedMotion.matches ? 0 : motionX;
        projectionFrame.routinePose =
          movementMode === "random" && !reducedMotion.matches ? routinePose : undefined;
        projectionFrame.haze = hazerEnabled ? Number(haze.value) : 0;
        projectionFrame.internalHaze = hazerEnabled ? Number(internalHaze.value) : 0;
        projectionFrame.effects = strength;
        projectionFrame.brightness = Math.max(0, Math.min(1, Number(brightness.value) || 0));
        projectionFrame.projectionEnabled = projectionEnabled;
        projectionFrame.filmBlend = Number(filmBlend.value);
        projectionFrame.avatarVisible =
          projectionContent !== "moon" &&
          (live.active || Boolean(uploadedUrl) || reference.checked);
        projectionFrame.moonVisible = projectionContent !== "body";
        projectionFrame.personOpacity = projectionFrame.avatarVisible ? humanOpacity() : 0;
        sphere?.render(projectionFrame);
        seek.value = String(seconds);
        const label = sampleFlight(seconds).chapter;
        if (chapter.textContent !== label) chapter.textContent = label;
        const time = `00:${String(Math.floor(seconds)).padStart(2, "0")} / 01:00`;
        if (clock.value !== time) clock.value = time;
        updateInput();
      });
      playbackReady = true;
      if (playbackRequested) void begin();
    } catch (error) {
      if (disposed) return;
      const message = `Showtime could not start: ${String(error)}.`;
      cleanup();
      status.textContent = message;
      playButton.disabled = true;
      beginButton.disabled = true;
      cameraButton.disabled = true;
      stopButton.disabled = true;
      upload.disabled = true;
      for (const rig of projectionRigs) element<HTMLButtonElement>(`rig-${rig}`).disabled = true;
    }
  }
  const resizeObserver = ownerWindow.ResizeObserver
    ? new ownerWindow.ResizeObserver(() => sphere?.resize())
    : undefined;
  const resizeTarget =
    root instanceof ownerWindow.ShadowRoot
      ? root.host
      : root instanceof ownerWindow.Element
        ? root
        : stage;
  resizeObserver?.observe(resizeTarget);
  ownerWindow.addEventListener("resize", () => sphere?.resize(), { signal: events.signal });
  ownerDocument.addEventListener(
    "fullscreenchange",
    () => {
      const rootNode = stage.getRootNode();
      const fullscreenElement =
        rootNode instanceof ownerWindow.ShadowRoot
          ? rootNode.fullscreenElement
          : ownerDocument.fullscreenElement;
      const active = fullscreenElement === stage;
      fullscreenButton.textContent = active ? "Exit fullscreen" : "Fullscreen";
      fullscreenButton.setAttribute("aria-pressed", String(active));
      sphere?.resize();
    },
    { signal: events.signal },
  );
  ownerDocument.addEventListener(
    "visibilitychange",
    () => {
      lastFrame = ownerWindow.performance.now();
      if (ownerDocument.hidden)
        clips.forEach((clip) => {
          clip.video.pause();
        });
    },
    { signal: events.signal },
  );
  void startProjection();

  function cleanup(): void {
    if (disposed) return;
    disposed = true;
    const rootNode = stage.getRootNode();
    const fullscreenElement =
      rootNode instanceof browserWindow.ShadowRoot
        ? rootNode.fullscreenElement
        : ownerDocument.fullscreenElement;
    if (fullscreenElement === stage) void ownerDocument.exitFullscreen().catch(() => {});
    startup.abort();
    events.abort();
    resizeObserver?.disconnect();
    playing = false;
    stopInput();
    clips.forEach((clip) => {
      clip.video.pause();
      clip.video.removeAttribute("src");
      clip.video.load();
    });
    world?.dispose();
    sphere?.dispose();
    world = undefined;
    sphere = undefined;
  }

  return cleanup;
}
