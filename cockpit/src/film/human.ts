export const HUMAN_PORTRAIT = "andrew-reference.jpeg";
const passages = [
  [4, 12],
  [20, 30],
  [34, 45],
  [50, 59],
];
const smooth = (value: number): number => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

/** Fade Andrew's projection in and out at four distinct passages. */
export function sampleHumanBlend(seconds: number): number {
  return passages.reduce(
    (alpha, [start, end]) =>
      Math.max(alpha, 0.72 * smooth(Math.min((seconds - start) / 2.4, (end - seconds) / 2.4))),
    0,
  );
}

/** Paint a softly curved, translucent face/body projection over the moon imagery. */
export function createHumanProjection(mediaBase?: string): {
  ready: Promise<void>;
  draw: (ctx: CanvasRenderingContext2D, seconds: number, opacity?: number) => void;
} {
  const portrait = new Image();
  portrait.src = mediaBase
    ? new URL(HUMAN_PORTRAIT, mediaBase).href
    : `${import.meta.env.BASE_URL}film-media/${HUMAN_PORTRAIT}`;
  const projection = document.createElement("canvas");
  projection.width = projection.height = 768;
  const mask = projection.getContext("2d");
  if (!mask) throw new Error("This browser cannot composite the portrait.");
  const ready = portrait.decode().then(() => {
    // Reference-sheet pixels only: the main front sphere, with no mounting.
    mask.drawImage(portrait, 400, 115, 265, 265, 0, 0, 768, 768);
    mask.globalCompositeOperation = "destination-in";
    const edge = mask.createRadialGradient(384, 384, 275, 384, 384, 380);
    edge.addColorStop(0, "#fff");
    edge.addColorStop(1, "#ffffff00");
    mask.fillStyle = edge;
    mask.fillRect(0, 0, 768, 768);
  });
  return {
    ready,
    draw: (ctx, seconds, opacity = sampleHumanBlend(seconds)) => {
      const alpha = Math.max(0, Math.min(1, opacity));
      if (!alpha || !portrait.complete || !portrait.naturalWidth) return;
      const size = ctx.canvas.height * 0.94;
      const x = (ctx.canvas.width - size) / 2;
      const y = (ctx.canvas.height - size) / 2;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.globalCompositeOperation = "screen";
      // Curve the portrait at the edges while keeping the face/body center legible.
      const rows = 64;
      for (let row = 0; row < rows; row++) {
        const latitude = ((row + 0.5) / rows - 0.5) * 2;
        const width = size * Math.sqrt(1 - latitude * latitude * 0.2);
        ctx.drawImage(
          projection,
          0,
          (row * projection.height) / rows,
          projection.width,
          projection.height / rows,
          x + (size - width) / 2,
          y + (row * size) / rows,
          width,
          size / rows + 0.5,
        );
      }
      ctx.restore();
    },
  };
}
