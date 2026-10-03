import { FILM_SECONDS } from "../film/flight";

/** Advance the looping performance without losing time at the end. */
export function advanceShowtime(seconds: number, elapsed: number, playing: boolean): number {
  return playing
    ? (seconds + (Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0)) % FILM_SECONDS
    : seconds;
}

/** Hide the camera-path discontinuity at the loop boundary with a short fade. */
export function loopFade(seconds: number): number {
  return (
    Math.max(0, Math.min(1, (seconds - 58) / 2, 1)) + Math.max(0, Math.min(1, (2 - seconds) / 2))
  );
}
