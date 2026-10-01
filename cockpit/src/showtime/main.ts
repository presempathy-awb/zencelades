import { sampleFlight } from "../film/flight";
import { createHumanProjection, sampleHumanBlend } from "../film/human";
import { createIceWorld } from "../film/ice-world";
import { FILM_INSERTS } from "../film/shots";
import { drawTransition, revealProgress } from "../film/transitions";
import { createLiveInput } from "./live-input";
import { createProjectionSphere } from "./projection-sphere";
import { advanceShowtime, loopFade } from "./timeline";
import "./showtime.css";

function element<T extends HTMLElement>(id: string): T {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing Showtime element ${id}`);
  return value as T;
}
const stage = element("stage"),
  intro = element("intro"),
  status = element("status");
const worldCanvas = element<HTMLCanvasElement>("world");
const composition = element<HTMLCanvasElement>("composition");
const sphereCanvas = element<HTMLCanvasElement>("sphere");
const flat = element<HTMLCanvasElement>("flat");
const video = element<HTMLVideoElement>("live-video");
const seek = element<HTMLInputElement>("seek"),
  blend = element<HTMLInputElement>("blend");
const fade = element<HTMLInputElement>("fade"),
  mirror = element<HTMLInputElement>("mirror");
const reference = element<HTMLInputElement>("reference"),
  effects = element<HTMLInputElement>("effects");
const cameraButton = element<HTMLButtonElement>("camera"),
  stopButton = element<HTMLButtonElement>("stop-camera");
const playButton = element<HTMLButtonElement>("play");
const viewButton = element<HTMLButtonElement>("view");
const inputState = element("input-state"),
  chapter = element("chapter");
const clock = element<HTMLOutputElement>("clock");
const width = 1280,
  height = 720;
for (const canvas of [worldCanvas, composition, flat]) {
  canvas.width = width;
  canvas.height = height;
}
const context = composition.getContext("2d", { alpha: false });
const flatContext = flat.getContext("2d", { alpha: false });
if (!context || !flatContext) throw new Error("This browser cannot compose the projection.");
const ctx = context;
const live = createLiveInput(video);
let seconds = 0,
  playing = false,
  flatView = false,
  lastFrame = performance.now();
let disposed = false,
  uploadedUrl: string | undefined,
  inputGeneration = 0;
let lastInputLabel = "";
let activeClip: HTMLVideoElement | undefined;
let world: ReturnType<typeof createIceWorld> | undefined;
let sphere: ReturnType<typeof createProjectionSphere> | undefined;
const portrait = createHumanProjection();
let portraitReady = false;
void portrait.ready
  .then(() => {
    portraitReady = true;
  })
  .catch((error) => {
    status.textContent = `Reference portrait unavailable: ${String(error)}. Camera and video can still be used.`;
  });
const clips = FILM_INSERTS.map((clip) => {
  const media = document.createElement("video");
  media.src = `/film-media/${clip.src}`;
  media.preload = "auto";
  media.loop = true;
  media.muted = true;
  media.playsInline = true;
  media.addEventListener("error", () => {
    status.textContent = `Source unavailable: ${clip.src}. Prepare film media before playing.`;
  });
  return { ...clip, video: media };
});
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function stopInput(): void {
  inputGeneration++;
  live.stop();
  video.removeAttribute("src");
  video.load();
  if (uploadedUrl) URL.revokeObjectURL(uploadedUrl);
  uploadedUrl = undefined;
  element<HTMLInputElement>("upload").value = "";
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
  playing = value;
  playButton.textContent = value ? "Pause moon flight" : "Start the show";
  lastFrame = performance.now();
  if (!value)
    clips.forEach((clip) => {
      clip.video.pause();
    });
}
async function begin(): Promise<void> {
  if (!world) return;
  playButton.disabled = true;
  try {
    await Promise.all(
      clips.map(async (clip) => {
        await clip.video.play();
        clip.video.pause();
      }),
    );
    activeClip = undefined;
    intro.hidden = true;
    setPlaying(true);
    status.textContent = "Show looping. Start camera to blend your movement into every phase.";
  } catch (error) {
    clips.forEach((clip) => {
      clip.video.pause();
    });
    status.textContent = `Could not start the show: ${String(error)}. Check the local film sources.`;
  } finally {
    playButton.disabled = false;
  }
}
element("begin").addEventListener("click", () => void begin());
playButton.addEventListener("click", () => {
  if (playing) setPlaying(false);
  else void begin();
});
cameraButton.addEventListener("click", async () => {
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
});
stopButton.addEventListener("click", () => {
  stopInput();
  updateInput();
  status.textContent = "Camera stopped and released. The moon show can keep playing.";
});
element<HTMLInputElement>("upload").addEventListener("change", async (event) => {
  const file = (event.currentTarget as HTMLInputElement).files?.[0];
  if (!file) return;
  stopInput();
  const generation = inputGeneration;
  uploadedUrl = URL.createObjectURL(file);
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
});
seek.addEventListener("input", () => {
  seconds = Number(seek.value) % 60;
  intro.hidden = true;
  setPlaying(false);
});
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-time]")) {
  button.addEventListener("click", () => {
    seconds = Number(button.dataset.time);
    seek.value = String(seconds);
    intro.hidden = true;
    setPlaying(false);
    status.textContent = `${button.textContent} phase selected. Camera movement stays live when the moon is paused.`;
  });
}
viewButton.addEventListener("click", () => {
  flatView = !flatView;
  flat.hidden = !flatView;
  sphereCanvas.hidden = flatView;
  viewButton.textContent = flatView ? "Sphere preview" : "Flat projection";
  viewButton.setAttribute("aria-pressed", String(flatView));
  element("view-hint").hidden = flatView;
  sphere?.resize();
});
element("fullscreen").addEventListener("click", () => {
  void stage.requestFullscreen().catch((error) => {
    status.textContent = `Fullscreen unavailable: ${String(error)}`;
  });
});
reference.addEventListener("change", updateInput);

function drawMovingHuman(): void {
  const opacity = Number(blend.value) * (fade.checked ? sampleHumanBlend(seconds) / 0.72 : 1);
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
function compose(strength: number): void {
  ctx.globalAlpha = 1;
  ctx.drawImage(worldCanvas, 0, 0, width, height);
  const clip = clips.find((entry) => seconds >= entry.start && seconds <= entry.end);
  if (activeClip !== clip?.video) {
    activeClip?.pause();
    activeClip = clip?.video;
    if (clip && Number.isFinite(clip.video.duration))
      clip.video.currentTime = (seconds - clip.start) % clip.video.duration;
  }
  if (clip && clip.video.readyState >= 2) {
    if (playing && clip.video.paused)
      void clip.video.play().catch((error) => {
        setPlaying(false);
        status.textContent = `Source playback failed: ${String(error)}`;
      });
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
  drawMovingHuman();
  ctx.save();
  ctx.globalAlpha = loopFade(seconds);
  ctx.fillStyle = "#020710";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
  flatContext?.drawImage(composition, 0, 0);
}
try {
  world = createIceWorld(worldCanvas);
  world.engine.setSize(width, height);
  sphere = createProjectionSphere(sphereCanvas, composition);
  sphere.resize();
  status.textContent = "Ready. Start the show, jump to a phase, or start your camera.";
  world.engine.runRenderLoop(() => {
    const now = performance.now();
    if (document.hidden) {
      lastFrame = now;
      return;
    }
    seconds = advanceShowtime(seconds, (now - lastFrame) / 1000, playing);
    lastFrame = now;
    const strength = reducedMotion.matches ? 0 : Number(effects.value);
    world?.render(seconds, strength);
    compose(strength);
    if (!flatView) sphere?.render();
    seek.value = String(seconds);
    const label = sampleFlight(seconds).chapter;
    if (chapter.textContent !== label) chapter.textContent = label;
    const time = `00:${String(Math.floor(seconds)).padStart(2, "0")} / 01:00`;
    if (clock.value !== time) clock.value = time;
    updateInput();
  });
} catch (error) {
  status.textContent = `Showtime could not start: ${String(error)}. A WebGL-capable browser is required.`;
  world?.dispose();
  sphere?.dispose();
  playButton.disabled = true;
  element<HTMLButtonElement>("begin").disabled = true;
  cameraButton.disabled = true;
}
window.addEventListener("resize", () => sphere?.resize());
document.addEventListener("fullscreenchange", () => sphere?.resize());
document.addEventListener("visibilitychange", () => {
  lastFrame = performance.now();
  if (document.hidden)
    clips.forEach((clip) => {
      clip.video.pause();
    });
});
window.addEventListener(
  "pagehide",
  () => {
    disposed = true;
    stopInput();
    clips.forEach((clip) => {
      clip.video.pause();
      clip.video.removeAttribute("src");
      clip.video.load();
    });
    world?.dispose();
    sphere?.dispose();
  },
  { once: true },
);
