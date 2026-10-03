import { expect, test } from "bun:test";
import { revealProgress, sampleLanding, shardProgress } from "./transitions";

test("inserts open and close completely without leaking outside their shot", () => {
  expect(revealProgress(10, 11, 17)).toBe(0);
  expect(revealProgress(11, 11, 17)).toBe(0);
  expect(revealProgress(14, 11, 17)).toBe(1);
  expect(revealProgress(17, 11, 17)).toBe(0);
  for (let time = 10; time <= 18; time += 0.02) {
    const value = revealProgress(time, 11, 17);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  }
});
test("shards assemble into an intact picture with bounded, staggered motion", () => {
  expect(shardProgress(0, 0)).toBe(0);
  expect(shardProgress(1, 39)).toBe(1);
  expect(shardProgress(0.4, 0)).not.toBe(shardProgress(0.4, 1));
  for (let id = 0; id < 40; id++) {
    let previous = 0;
    for (let step = 0; step <= 50; step++) {
      const value = shardProgress(step / 50, id);
      expect(value).toBeGreaterThanOrEqual(previous);
      expect(value).toBeLessThanOrEqual(1);
      previous = value;
    }
  }
});
test("the imagined lander touches down gently, with thrust extinguished", () => {
  expect(sampleLanding(20).height).toBeGreaterThan(10);
  expect(sampleLanding(24).height).toBeGreaterThan(sampleLanding(25).height);
  expect(sampleLanding(27).height).toBe(0);
  expect(sampleLanding(28).thrust).toBe(0);
  expect(sampleLanding(24).thrust).toBeGreaterThan(0);
});
