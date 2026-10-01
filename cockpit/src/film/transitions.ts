const clamp = (value: number): number => Math.max(0, Math.min(1, value));
const smooth = (value: number): number => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
export type TransitionKind = "ring" | "fracture" | "plume" | "shards" | "dive";

/** Open and close an insert over bounded, smooth transitions. */
export function revealProgress(time: number, start: number, end: number): number {
  return smooth(Math.min((time - start) / 1.1, (end - time) / 1.1));
}
/** Assemble each ice shard at a different deterministic point of the transition. */
export function shardProgress(progress: number, id: number): number {
  const offset = (((id * 17) % 40) / 40) * 0.36;
  return smooth((clamp(progress) - offset) / 0.64);
}
/** Artistic touchdown timing, not a reconstruction of a mission trajectory. */
export function sampleLanding(seconds: number): { height: number; thrust: number } {
  const descent = 1 - smooth((seconds - 20) / 7);
  return { height: 12 * descent, thrust: seconds >= 27 ? 0 : 0.6 + descent * 0.4 };
}

/** Reveal a video through orbital irises, widening fractures or assembling ice shards. */
export function drawTransition(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  progress: number,
  kind: TransitionKind,
  strength: number,
): void {
  const w = ctx.canvas.width,
    h = ctx.canvas.height;
  const p = clamp(progress);
  if (p === 0) return;
  const scale =
    Math.max(w / video.videoWidth, h / video.videoHeight) *
    (1 + (1 - p) * (kind === "dive" ? 0.35 : 0.025) * strength);
  const vw = video.videoWidth * scale,
    vh = video.videoHeight * scale;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.beginPath();
  if (strength < 0.05 || p > 0.999) ctx.rect(0, 0, w, h);
  else if (kind === "fracture") {
    for (let step = 0; step <= 32; step++) {
      const x = (step / 32) * w,
        center = h * (0.48 + Math.sin(step * 0.7) * 0.05);
      if (step === 0) ctx.moveTo(x, center - p * h);
      else ctx.lineTo(x, center - p * h);
    }
    for (let step = 32; step >= 0; step--) {
      const x = (step / 32) * w,
        center = h * (0.48 + Math.sin(step * 0.7) * 0.05);
      ctx.lineTo(x, center + p * h);
    }
    ctx.closePath();
  } else if (kind === "shards") {
    const tw = w / 8,
      th = h / 5;
    for (let id = 0; id < 40; id++) {
      const amount = shardProgress(p, id),
        x = ((id % 8) + 0.5) * tw,
        y = (Math.floor(id / 8) + 0.5) * th;
      const angle = (1 - amount) * ((id % 3) - 1) * 0.35;
      const corners = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ];
      corners.forEach(([dx, dy], index) => {
        const px = (dx * tw * amount) / 2,
          py = (dy * th * amount) / 2,
          rx = x + px * Math.cos(angle) - py * Math.sin(angle),
          ry = y + px * Math.sin(angle) + py * Math.cos(angle);
        if (index === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      });
      ctx.closePath();
    }
  } else
    ctx.ellipse(
      w * 0.55,
      h * 0.45,
      p * w,
      p * h * (kind === "ring" ? 0.65 : 1.1),
      kind === "ring" ? -0.22 : 0,
      0,
      Math.PI * 2,
    );
  ctx.clip();
  ctx.drawImage(video, (w - vw) / 2, (h - vh) / 2, vw, vh);
  ctx.restore();
  if (kind === "ring" && p < 0.97 && strength > 0.05) {
    ctx.save();
    ctx.globalAlpha = Math.sin(p * Math.PI) * 0.55 * strength;
    ctx.strokeStyle = "#c3edf1";
    ctx.lineWidth = Math.max(1, w / 900);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(w * 0.55, h * 0.45, p * w + i * 5, p * h * 0.65 + i * 2, -0.22, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}
