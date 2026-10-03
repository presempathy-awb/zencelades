import { expect, test } from "bun:test";
import { type MovementRoutinePose, routinePoseAt } from "./movement-routines";

const numericPose = (pose: MovementRoutinePose): number[] => [
  pose.motion,
  pose.motionX,
  pose.torsoPitch,
  pose.torsoYaw,
  pose.torsoRoll,
  pose.headPitch,
  pose.headYaw,
  pose.armLift,
  pose.armReach,
  pose.hipTuck,
  pose.kneeBend,
  pose.bodyLift,
];

test("random seeds shuffle the routine order instead of only rotating the same cycle", () => {
  const orders = Array.from({ length: 20 }, (_, seed) =>
    Array.from({ length: 6 }, (_, step) => routinePoseAt(step * 8 + 4, seed + 1).routine),
  );
  expect(new Set(orders.map((order) => order.join(","))).size).toBeGreaterThan(6);
  for (const order of orders) expect(new Set(order).size).toBe(6);
});

test("seeded routines rotate through every natural pose and reuse a supplied frame", () => {
  const routines = Array.from({ length: 6 }, (_, index) => routinePoseAt(index * 8 + 4, 0).routine);
  expect(new Set(routines).size).toBe(6);
  expect(routines).toContain("settle");
  expect(routines).toContain("look");
  expect(routines).toContain("reach");
  expect(routines).toContain("stretch");
  expect(routines).toContain("recline");
  expect(routines).toContain("tucked-crouch");
  expect(
    Array.from({ length: 6 }, (_, index) => routinePoseAt(index * 8 + 4, 91).routine),
  ).not.toEqual(routines);

  const cached = routinePoseAt(0, 0);
  expect(routinePoseAt(1, 0, cached)).toBe(cached);
});

test("routine actions are distinct, finite and bounded", () => {
  const sampled = new Map(
    Array.from({ length: 6 }, (_, index) => {
      const pose = routinePoseAt(index * 8 + 4, 0);
      return [pose.routine, { ...pose }] as const;
    }),
  );
  expect(sampled.get("stretch")?.armLift).toBeGreaterThan(0.5);
  expect(sampled.get("reach")?.armReach).toBeGreaterThan(0.4);
  expect(sampled.get("recline")?.torsoPitch).toBeLessThan(-0.12);
  expect(sampled.get("tucked-crouch")?.kneeBend).toBeGreaterThan(0.35);
  expect(Math.abs(sampled.get("look")?.headYaw ?? 0)).toBeGreaterThan(0.12);

  for (const seconds of [-1e9, -1, 0, 7.999, 8.001, 1e9, Number.NaN]) {
    const pose = routinePoseAt(seconds, Number.POSITIVE_INFINITY);
    expect(numericPose(pose).every(Number.isFinite)).toBe(true);
    expect(pose.motion).toBeWithin(0, 1);
    expect(pose.motionX).toBeWithin(-1, 1);
    expect(Math.abs(pose.torsoPitch)).toBeLessThanOrEqual(0.24);
    expect(Math.abs(pose.headYaw)).toBeLessThanOrEqual(0.28);
    expect(pose.armLift).toBeWithin(0, 0.8);
    expect(pose.armReach).toBeWithin(0, 0.65);
    expect(pose.hipTuck).toBeWithin(0, 0.36);
    expect(pose.kneeBend).toBeWithin(0, 0.5);
    expect(pose.bodyLift).toBeWithin(-0.1, 0.06);
  }
});

test("routine boundaries ease continuously and the full sequence loops", () => {
  for (let boundary = 8; boundary <= 48; boundary += 8) {
    const before = numericPose(routinePoseAt(boundary - 0.001, 37));
    const after = numericPose(routinePoseAt(boundary + 0.001, 37));
    expect(Math.max(...before.map((value, index) => Math.abs(value - after[index])))).toBeLessThan(
      0.002,
    );
  }
  expect(numericPose(routinePoseAt(0, 37))).toEqual(numericPose(routinePoseAt(48, 37)));

  let previous = numericPose(routinePoseAt(0, 12));
  let largestStep = 0;
  for (let frame = 1; frame <= 48 * 60; frame++) {
    const current = numericPose(routinePoseAt(frame / 60, 12));
    largestStep = Math.max(
      largestStep,
      ...current.map((value, index) => Math.abs(value - previous[index])),
    );
    previous = current;
  }
  expect(largestStep).toBeLessThan(0.02);
});
