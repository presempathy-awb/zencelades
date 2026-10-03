import { FILM_SECONDS, sampleFlight } from "./flight";
import { createHumanProjection } from "./human";
import { createIceWorld } from "./ice-world";
import { FILM_INSERTS } from "./shots";
import { drawTransition, revealProgress } from "./transitions";
import "./film.css";

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing film element ${id}`);
  return found as T;
}
const worldCanvas = element<HTMLCanvasElement>("world"),
  film = element<HTMLCanvasElement>("film");
const play = element<HTMLButtonElement>("play"),
  record = element<HTMLButtonElement>("record"),
  seek = element<HTMLInputElement>("seek");
const opening = element("opening"),
  status = element("status"),
  clock = element<HTMLOutputElement>("time");
const effects = element<HTMLInputElement>("effects"),
  footage = element<HTMLInputElement>("footage"),
  titles = element<HTMLInputElement>("titles");
const human = element<HTMLInputElement>("human");
const humanProjection = createHumanProjection();
void humanProjection.ready.catch((error) => {
  status.textContent = `Portrait unavailable: ${String(error)}. Prepare the portrait asset before playing.`;
});
const context = film.getContext("2d", { alpha: false });
if (!context) throw new Error("This browser does not support the film canvas.");
const ctx = context;
let seconds = 0,
  playing = false,
  recording = false,
  lastFrame = performance.now(),
  lastLabel = "";
let recorder: MediaRecorder | undefined;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let activeVideo: HTMLVideoElement | undefined;
const clips = FILM_INSERTS.map((clip) => {
  const video = document.createElement("video");
  video.src = `${import.meta.env.BASE_URL}film-media/${clip.src}`;
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.addEventListener("error", () => {
    status.textContent = `NASA insert unavailable: ${clip.src}. Run the film preparation command before playing.`;
  });
  return { ...clip, video };
});

function resize(width = 1280, height = 720): void {
  film.width = worldCanvas.width = width;
  film.height = worldCanvas.height = height;
}
resize();
function text(value: string, x: number, y: number, size: number, serif = false): void {
  ctx.font = `${size}px ${serif ? "Georgia" : "Trebuchet MS"}`;
  ctx.fillStyle = "#edf8ff";
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 12;
  ctx.fillText(value, x, y);
  ctx.shadowBlur = 0;
}
function compose(strength: number): void {
  const w = film.width,
    h = film.height;
  ctx.globalAlpha = 1;
  ctx.drawImage(worldCanvas, 0, 0, w, h);
  const rush = Math.max(0, 1 - Math.abs(seconds - 37) / 5) * strength;
  if (rush > 0) {
    ctx.save();
    ctx.globalAlpha = rush * 0.045;
    for (let layer = 1; layer <= 4; layer++) {
      const spread = layer * rush * 0.007;
      ctx.drawImage(
        worldCanvas,
        (-w * spread) / 2,
        (-h * spread) / 2,
        w * (1 + spread),
        h * (1 + spread),
      );
    }
    ctx.restore();
  }
  const clip = footage.checked
    ? clips.find((c) => seconds >= c.start && seconds <= c.end)
    : undefined;
  const video = clip?.video;
  if (activeVideo !== video) {
    activeVideo?.pause();
    activeVideo = video;
    if (clip && Number.isFinite(clip.video.duration))
      clip.video.currentTime = (seconds - clip.start) % clip.video.duration;
  }
  if (clip && clip.video.readyState >= 2) {
    if (playing && clip.video.paused)
      void clip.video.play().catch((error) => {
        status.textContent = `Insert playback failed: ${String(error)}`;
      });
    if (!playing) {
      clip.video.pause();
      const expected = (seconds - clip.start) % clip.video.duration;
      if (Math.abs(clip.video.currentTime - expected) > 0.12) clip.video.currentTime = expected;
    }
  }
  let blend = 0;
  if (clip && clip.video.readyState >= 2) {
    blend = revealProgress(seconds, clip.start, clip.end);
    drawTransition(ctx, clip.video, blend, clip.transition, strength);
  }
  if (human.checked) humanProjection.draw(ctx, seconds);
  const vignette = ctx.createRadialGradient(w * 0.5, h * 0.45, h * 0.2, w * 0.5, h * 0.45, w * 0.7);
  vignette.addColorStop(0, "#00000000");
  vignette.addColorStop(1, "#020711aa");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#02070c";
  ctx.fillRect(0, 0, w, h * 0.06);
  ctx.fillRect(0, h * 0.94, w, h * 0.06);
  if (titles.checked) {
    ctx.fillStyle = "#02070ccc";
    ctx.fillRect(0, h * 0.77, w, h * 0.14);
    ctx.fillRect(0, h * 0.06, w, h * 0.085);
    const label = sampleFlight(seconds).chapter;
    text(label, w * 0.045, h * 0.815, h * 0.043, true);
    const credit =
      blend > 0.3 && clip
        ? clip.label
        : "Artistic surface interpretation · Babylon.js / Zencelades";
    text(credit, w * 0.045, h * 0.865, h * 0.018);
    text("ENCELADUS", w * 0.045, h * 0.115, h * 0.019);
    text(`${String(Math.floor(seconds)).padStart(2, "0")} / 60`, w * 0.91, h * 0.115, h * 0.019);
  }
  const fade = Math.max(0, (seconds - 58) / 2);
  ctx.globalAlpha = fade;
  ctx.fillStyle = "#02070c";
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  if (seconds > 58 && titles.checked) {
    ctx.globalAlpha = fade;
    text("A world within.", w * 0.36, h * 0.49, h * 0.055, true);
    text("Zencelades · NASA / JPL-Caltech / SSI", w * 0.33, h * 0.56, h * 0.019);
    ctx.globalAlpha = 1;
  }
}
async function startVideos(): Promise<void> {
  for (const clip of clips) {
    clip.video.currentTime = 0;
    await clip.video.play();
    clip.video.pause();
  }
  activeVideo = undefined;
}
function setPlaying(value: boolean): void {
  playing = value;
  play.textContent = playing ? "Pause" : "Play";
  lastFrame = performance.now();
  for (const clip of clips) {
    if (!value) clip.video.pause();
  }
}
async function begin(): Promise<void> {
  opening.hidden = true;
  if (seconds >= FILM_SECONDS) seconds = 0;
  try {
    if (human.checked) await humanProjection.ready;
    if (footage.checked) await startVideos();
    setPlaying(true);
    status.textContent = "Flight playing. Seek to explore, or save the complete movie.";
  } catch (error) {
    status.textContent = `Could not start film media: ${String(error)}. Check the enabled portrait and NASA sources.`;
  }
}
play.addEventListener("click", () => {
  if (playing) setPlaying(false);
  else void begin();
});
element("begin").addEventListener("click", () => void begin());
seek.addEventListener("input", () => {
  seconds = Number(seek.value);
  opening.hidden = true;
  setPlaying(false);
});
element("jet").addEventListener("click", () => {
  seconds = 34;
  seek.value = "34";
  opening.hidden = true;
  setPlaying(false);
  status.textContent = "At the geyser entrance. Press Play to rise through the plume.";
});
element("fullscreen").addEventListener("click", () => {
  void element("film")
    .requestFullscreen()
    .catch((error) => {
      status.textContent = `Fullscreen unavailable: ${String(error)}`;
    });
});
element("lander").addEventListener("click", () => {
  seconds = 23;
  seek.value = "23";
  opening.hidden = true;
  setPlaying(false);
  status.textContent = "Orbilander-inspired touchdown. Press Play to watch the imagined landing.";
});

async function exportFilm(): Promise<void> {
  if (recording) return;
  const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(
    (type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type),
  );
  if (!mimeType || !film.captureStream) {
    status.textContent =
      "This browser cannot record WebM. Use a Chromium browser with canvas recording support.";
    return;
  }
  const chunks: Blob[] = [];
  let stream: MediaStream | undefined;
  try {
    if (human.checked) await humanProjection.ready;
    if (footage.checked) await startVideos();
    recording = true;
    record.disabled = true;
    play.disabled = true;
    seek.disabled = true;
    element<HTMLButtonElement>("jet").disabled = true;
    element<HTMLButtonElement>("lander").disabled = true;
    resize(1920, 1080);
    world.engine.setSize(1920, 1080);
    seconds = 0;
    opening.hidden = true;
    stream = film.captureStream(30);
    const capturedStream = stream;
    recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 14_000_000 });
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onerror = (event) => {
      status.textContent = `Recording failed: ${event.type}`;
      setPlaying(false);
      if (recorder?.state === "recording") recorder.stop();
    };
    recorder.onstop = () => {
      capturedStream.getTracks().forEach((track) => {
        track.stop();
      });
      recording = false;
      record.disabled = false;
      play.disabled = false;
      seek.disabled = false;
      element<HTMLButtonElement>("jet").disabled = false;
      element<HTMLButtonElement>("lander").disabled = false;
      resize();
      world.engine.setSize(1280, 720);
      if (seconds < 59.5 || chunks.length === 0) {
        status.textContent = "Recording did not finish. Retry with other GPU workloads closed.";
        return;
      }
      const url = URL.createObjectURL(new Blob(chunks, { type: mimeType }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "enceladus-into-the-jets.webm";
      link.click();
      status.textContent =
        "Film saved: enceladus-into-the-jets.webm · 1920×1080 · silent · 60 seconds.";
      window.addEventListener("pagehide", () => URL.revokeObjectURL(url), { once: true });
    };
    recorder.start(1000);
    setPlaying(true);
    status.textContent = "Recording the complete 60-second flight. Keep this tab visible.";
  } catch (error) {
    stream?.getTracks().forEach((track) => {
      track.stop();
    });
    recording = false;
    record.disabled = false;
    play.disabled = false;
    seek.disabled = false;
    element<HTMLButtonElement>("jet").disabled = false;
    element<HTMLButtonElement>("lander").disabled = false;
    resize();
    world.engine.setSize(1280, 720);
    status.textContent = `Could not record film: ${String(error)}`;
  }
}
record.addEventListener("click", () => void exportFilm());
let world: ReturnType<typeof createIceWorld>;
try {
  world = createIceWorld(worldCanvas);
  world.engine.setSize(1280, 720);
  status.textContent = "Ready. Begin the voyage, or jump straight into the jets.";
  world.engine.runRenderLoop(() => {
    if (document.hidden) {
      lastFrame = performance.now();
      if (recording) {
        setPlaying(false);
        recorder?.stop();
      }
      return;
    }
    const now = performance.now();
    if (playing) seconds = Math.min(FILM_SECONDS, seconds + (now - lastFrame) / 1000);
    lastFrame = now;
    const effectStrength = reducedMotion.matches ? 0 : Number(effects.value);
    world.render(seconds, effectStrength);
    compose(effectStrength);
    const label = `${seconds >= FILM_SECONDS ? "01:00" : `00:${String(Math.floor(seconds)).padStart(2, "0")}`} / 01:00`;
    if (label !== lastLabel) {
      clock.value = label;
      lastLabel = label;
    }
    if (playing) seek.value = String(seconds);
    if (playing && seconds >= FILM_SECONDS) {
      setPlaying(false);
      if (recording) recorder?.stop();
    }
  });
  window.addEventListener(
    "pagehide",
    () => {
      if (recorder?.state === "recording") recorder.stop();
      clips.forEach((c) => {
        c.video.pause();
        c.video.removeAttribute("src");
        c.video.load();
      });
      world.dispose();
    },
    { once: true },
  );
} catch (error) {
  status.textContent = `The 3D film could not start: ${String(error)}. WebGL is required.`;
  play.disabled = true;
  record.disabled = true;
  element<HTMLButtonElement>("begin").disabled = true;
}
