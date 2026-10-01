import { describe, expect, test } from "bun:test";
import { FILM_SECONDS, sampleFlight, surfaceHeight } from "./flight";

describe("the Enceladus flight", () => {
  test("descends from orbit, enters a jet, then clears the surface", () => {
    const orbit = sampleFlight(0);
    const skim = sampleFlight(27);
    const jet = sampleFlight(38);
    const exit = sampleFlight(FILM_SECONDS);
    expect(orbit.position[1]).toBeGreaterThan(150);
    expect(skim.position[1]).toBeLessThan(10);
    expect(Math.hypot(jet.position[0], jet.position[2])).toBeLessThan(3);
    expect(jet.position[1]).toBeGreaterThan(12);
    expect(exit.position[1]).toBeGreaterThan(120);
  });

  test("seeking is deterministic, clamped and continuous without terrain collisions", () => {
    expect(sampleFlight(-10)).toEqual(sampleFlight(0));
    expect(sampleFlight(100)).toEqual(sampleFlight(FILM_SECONDS));
    expect(sampleFlight(38)).toEqual(sampleFlight(38));
    let previous = sampleFlight(0);
    for (let tick = 1; tick <= FILM_SECONDS * 30; tick++) {
      const current = sampleFlight(tick / 30);
      expect([...current.position, ...current.target, current.fov].every(Number.isFinite)).toBe(
        true,
      );
      expect(Math.hypot(...current.position.map((v, i) => v - previous.position[i]))).toBeLessThan(
        7,
      );
      expect(current.position[1]).toBeGreaterThan(
        surfaceHeight(current.position[0], current.position[2]) + 1.5,
      );
      previous = current;
    }
  });
});
