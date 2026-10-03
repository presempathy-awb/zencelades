export const FILM_SECONDS = 60;
type Point = [number, number, number];
export interface FlightFrame {
  position: Point;
  target: Point;
  fov: number;
  chapter: string;
}
interface Key extends FlightFrame {
  time: number;
}
const keys: Key[] = [
  {
    time: 0,
    position: [510, 230, -620],
    target: [0, -130, 0],
    fov: 0.75,
    chapter: "A moon that breathes",
  },
  {
    time: 10,
    position: [160, 100, -240],
    target: [0, 0, 0],
    fov: 0.8,
    chapter: "Descent to the south pole",
  },
  {
    time: 19,
    position: [-42, 15, -65],
    target: [0, 12, 0],
    fov: 0.9,
    chapter: "Along the tiger stripes",
  },
  {
    time: 24,
    position: [-20, 9, -23],
    target: [-8, 6, -8],
    fov: 0.85,
    chapter: "Orbilander / imagined touchdown",
  },
  {
    time: 27,
    position: [-16, 6, -22],
    target: [-8, 3, -8],
    fov: 0.95,
    chapter: "Orbilander / imagined touchdown",
  },
  { time: 34, position: [-3, 9, -7], target: [0, 36, 4], fov: 1.05, chapter: "Into the geyser" },
  { time: 38, position: [0, 22, 0], target: [2, 65, 8], fov: 1.14, chapter: "Inside the plume" },
  { time: 45, position: [6, 72, 18], target: [0, 8, 0], fov: 0.95, chapter: "Ice becomes a ring" },
  {
    time: 53,
    position: [90, 150, -105],
    target: [0, 10, 0],
    fov: 0.8,
    chapter: "Return to the dark",
  },
  {
    time: 60,
    position: [220, 260, -370],
    target: [20, -60, 50],
    fov: 0.75,
    chapter: "Enceladus / a world within",
  },
];

/** Procedural ridges and a recessed central fracture, in artistic scene units. */
export function surfaceHeight(x: number, z: number): number {
  return (
    0.8 * Math.sin(x * 0.22 + Math.sin(z * 0.07) * 2) +
    0.6 * Math.cos(z * 0.19) +
    0.35 * Math.sin(x * 0.7 + z * 0.35) -
    1.8 * Math.exp(-(((z - Math.sin(x * 0.12) * 3) / 2.5) ** 2))
  );
}
function spline(a: number, b: number, c: number, d: number, t: number): number {
  return (
    0.5 *
    (2 * b +
      (-a + c) * t +
      (2 * a - 5 * b + 4 * c - d) * t * t +
      (-a + 3 * b - 3 * c + d) * t * t * t)
  );
}

/** Sample the same continuous camera flight during playback, seeking and export. */
export function sampleFlight(seconds: number): FlightFrame {
  const time = Math.max(0, Math.min(FILM_SECONDS, Number.isFinite(seconds) ? seconds : 0));
  const index = Math.max(
    0,
    keys.findIndex((_key, i) => i < keys.length - 1 && time <= keys[i + 1].time),
  );
  const i = time === FILM_SECONDS ? keys.length - 2 : index;
  const before = keys[Math.max(0, i - 1)],
    start = keys[i],
    end = keys[i + 1],
    after = keys[Math.min(keys.length - 1, i + 2)];
  const t = (time - start.time) / (end.time - start.time);
  const sample = (field: "position" | "target"): Point =>
    [0, 1, 2].map((axis) =>
      spline(before[field][axis], start[field][axis], end[field][axis], after[field][axis], t),
    ) as Point;
  const position = sample("position");
  position[1] = Math.max(position[1], surfaceHeight(position[0], position[2]) + 3);
  return {
    position,
    target: sample("target"),
    fov: start.fov + (end.fov - start.fov) * t,
    chapter: time === FILM_SECONDS ? end.chapter : start.chapter,
  };
}
