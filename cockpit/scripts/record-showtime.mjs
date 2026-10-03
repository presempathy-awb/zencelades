/** Record the built local Showtime canvas, then publish only a validated MP4. */

import { execFileSync } from "node:child_process";
import { createReadStream } from "node:fs";
import { copyFile, mkdtemp, readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { digest, inputHashes, sourceHashes } from "./recording-artifacts.mjs";

const cockpit = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const build = join(cockpit, "dist/film");
const output = resolve(cockpit, "../source/research/enceladus-cinema/web");
const preset = JSON.parse(await readFile(join(cockpit, "scripts/homepage-preset.json"), "utf8"));
const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require("playwright");
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND") throw error;
  const globalRoot = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
  playwright = require(join(globalRoot, "playwright"));
}
for (const tool of ["ffmpeg", "ffprobe"]) execFileSync(tool, ["-version"], { stdio: "ignore" });
if (preset.seconds !== 60 || preset.width !== 1280 || preset.height !== 720 || preset.fps !== 30)
  throw new Error("Homepage export requires one 60-second 1280×720 loop at 30 fps");
const inputs = await inputHashes(build);
const sources = await sourceHashes(cockpit);
const work = await mkdtemp(join(tmpdir(), "showtime-recording-"));
console.log(`Recording workspace: ${work}`);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".glb": "model/gltf-binary",
};
const server = createServer(async (request, response) => {
  try {
    let name = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (!name.startsWith("/film/")) {
      response.writeHead(404).end();
      return;
    }
    if (name.endsWith("/")) name += "index.html";
    const path = resolve(build, name.slice(6));
    if (!path.startsWith(build + sep)) {
      response.writeHead(403).end();
      return;
    }
    const info = await stat(path);
    if (!info.isFile()) throw new Error("Not a file");
    response.setHeader("Content-Type", types[extname(path)] || "application/octet-stream");
    response.setHeader("Accept-Ranges", "bytes");
    const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range || "");
    const start = range ? Number(range[1]) : 0;
    const end = range?.[2] ? Math.min(Number(range[2]), info.size - 1) : info.size - 1;
    if (start > end) {
      response.writeHead(416).end();
      return;
    }
    response.setHeader("Content-Length", end - start + 1);
    if (range) response.setHeader("Content-Range", `bytes ${start}-${end}/${info.size}`);
    response.writeHead(range ? 206 : 200);
    createReadStream(path, { start, end })
      .on("error", () => response.destroy())
      .pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await playwright.chromium.launch({
    channel: "chrome",
    headless: process.argv.includes("--headless"),
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
    permissions: [],
  });
  await context.route("**/*", (route) => {
    const url = route.request().url();
    return url.startsWith(`${origin}/`) || url.startsWith("blob:") || url.startsWith("data:")
      ? route.continue()
      : route.abort();
  });
  const page = await context.newPage();
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(`${origin}/film/showtime/index.html`);
  await page.waitForFunction(
    () => !document.querySelector("#view-left").disabled,
    {},
    { timeout: 90000 },
  );
  await page.waitForLoadState("networkidle", { timeout: 90000 });
  await page.locator(`#preset-${preset.viewingPreset}`).click();
  await page.locator(`#rig-${preset.rig}`).click();
  for (const [id, value] of Object.entries(preset.controls))
    await page.locator(`#${id}`).fill(String(value));
  for (const [id, value] of Object.entries(preset.checks))
    await page.locator(`#${id}`).setChecked(value);
  await page.locator(`#view-${preset.view}`).click();
  await page.evaluate(({ width, height }) => {
    const stage = document.querySelector("#stage");
    stage.style.width = `${width}px`;
    stage.style.height = `${height}px`;
    stage.style.minHeight = "0";
    stage.style.maxHeight = "none";
    window.dispatchEvent(new Event("resize"));
  }, preset);
  // The current stage autostarts; capture must begin from a paused zero frame.
  if ((await page.locator("#play").textContent()) === "Pause moon flight")
    await page.locator("#play").click();
  await page.locator("#seek").fill("0");
  await page.locator("#stage").scrollIntoViewIfNeeded();
  await page.locator("#sphere").screenshot({ path: join(work, "before.png") });
  if (failures.length) throw new Error(failures.join("\n"));
  const download = page.waitForEvent("download", { timeout: 100000 });
  await page.evaluate(({ seconds, fps }) => {
    const canvas = document.querySelector("#sphere");
    const stream = canvas.captureStream(fps);
    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8"].find((type) =>
      MediaRecorder.isTypeSupported(type),
    );
    if (!mimeType) throw new Error("No supported canvas recording codec");
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });
    const chunks = [];
    const progress = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
      progress.push(Number(document.querySelector("#seek").value));
    };
    recorder.onerror = () => {
      document.body.dataset.recordingError = "Canvas recording failed";
    };
    recorder.onstop = () => {
      if (Math.max(...progress) < seconds - 2)
        document.body.dataset.recordingError = "Showtime did not complete its timeline";
      for (const track of stream.getTracks()) track.stop();
      document.querySelector("#play").click();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob(chunks, { type: mimeType }));
      link.download = "showtime.webm";
      link.click();
    };
    recorder.start(1000);
    document.querySelector("#play").click();
    // This timer is the recording duration, not a readiness wait.
    setTimeout(() => recorder.stop(), seconds * 1000);
  }, preset);
  console.log("Recording 60-second Showtime canvas; camera and microphone remain off.");
  await (await download).saveAs(join(work, "showtime.webm"));
  if (failures.length) throw new Error(failures.join("\n"));
  if (await page.locator("body").getAttribute("data-recording-error"))
    throw new Error("Canvas recording failed");
  if (JSON.stringify(inputs) !== JSON.stringify(await inputHashes(build)))
    throw new Error("Film build changed during recording; rebuild and retry");
  if (JSON.stringify(sources) !== JSON.stringify(await sourceHashes(cockpit)))
    throw new Error("Renderer source changed during recording; rebuild and retry");
  const mp4 = join(work, "homepage-loop.mp4");
  execFileSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-i",
      join(work, "showtime.webm"),
      "-an",
      "-t",
      "60",
      "-vf",
      "scale=1280:720:flags=lanczos,fps=30",
      "-c:v",
      "libx264",
      "-crf",
      "21",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      mp4,
    ],
    { stdio: "inherit" },
  );
  const probe = JSON.parse(
    execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", mp4], {
      encoding: "utf8",
    }),
  );
  const video = probe.streams.find((stream) => stream.codec_type === "video");
  if (
    probe.streams.length !== 1 ||
    video?.codec_name !== "h264" ||
    video.width !== 1280 ||
    video.height !== 720 ||
    Number(probe.format.duration) < 59.5 ||
    Number(probe.format.duration) > 60.2
  )
    throw new Error("Recorded movie failed duration, dimensions, codec or no-audio validation");
  execFileSync("ffmpeg", [
    "-v",
    "error",
    "-ss",
    "8",
    "-i",
    mp4,
    "-frames:v",
    "1",
    join(work, "homepage-poster.jpg"),
  ]);
  for (const name of ["homepage-loop.mp4", "homepage-poster.jpg"])
    await copyFile(join(work, name), join(output, name));
  await writeFile(
    join(output, "homepage-recording.json"),
    `${JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        preset,
        inputs,
        sources,
        movieSha256: digest(await readFile(mp4)),
        posterSha256: digest(await readFile(join(work, "homepage-poster.jpg"))),
        duration: Number(probe.format.duration),
        bytes: (await stat(mp4)).size,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Validated homepage loop: ${join(output, "homepage-loop.mp4")}`);
} finally {
  await browser?.close();
  server.close();
}
