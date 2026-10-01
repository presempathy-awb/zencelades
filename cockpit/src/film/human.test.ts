import { expect, test } from "bun:test";
import { sampleHumanBlend } from "./human";

test("the portrait repeatedly fades completely in and out without sudden jumps", () => {
  expect(sampleHumanBlend(0)).toBe(0);
  expect(sampleHumanBlend(8)).toBeGreaterThan(0.5);
  expect(sampleHumanBlend(13)).toBe(0);
  expect(sampleHumanBlend(24)).toBeGreaterThan(0.5);
  expect(sampleHumanBlend(31)).toBe(0);
  expect(sampleHumanBlend(38)).toBeGreaterThan(0.5);
  expect(sampleHumanBlend(46)).toBe(0);
  expect(sampleHumanBlend(55)).toBeGreaterThan(0.5);
  expect(sampleHumanBlend(60)).toBe(0);
  for (let frame = 1; frame <= 1800; frame++) {
    const now = sampleHumanBlend(frame / 30);
    expect(now).toBeGreaterThanOrEqual(0);
    expect(now).toBeLessThanOrEqual(0.72);
    expect(Math.abs(now - sampleHumanBlend((frame - 1) / 30))).toBeLessThan(0.03);
  }
});
