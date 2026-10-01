import { expect, test } from "bun:test";
import { basketLayout } from "./basket-model";

test.each([2.5, 3] as const)(
  "padding meets the %s m sphere without metal entering the shell",
  (diameter) => {
    const layout = basketLayout(diameter);
    const nearestPadding = Math.hypot(layout.ringRadius, layout.centreY - layout.ringY) - 0.055;
    expect(nearestPadding).toBeCloseTo(diameter / 2, 6);
    expect(Math.hypot(layout.ringRadius, layout.centreY - layout.ringY) - 0.025).toBeGreaterThan(
      diameter / 2,
    );
    expect(layout.ringY).toBeGreaterThan(layout.centreY - diameter / 2);
  },
);

test("lander leaves the negative-Z entrance between two side legs", () => {
  const { corners } = basketLayout();
  const front = corners.filter(([, , z]) => z < 0);
  const rear = corners.filter(([, , z]) => z > 0);
  expect(front).toHaveLength(2);
  expect(rear).toHaveLength(1);
  expect(front.every(([x]) => Math.abs(x) > 1.5)).toBe(true);
  expect(rear[0][0]).toBeCloseTo(0, 8);
  expect(rear[0][2]).toBeCloseTo(1.8, 8);
});

test.each([2.5, 3] as const)("six-foot ring and webbing fit the %s m shell", (diameter) => {
  const layout = basketLayout(diameter);
  expect(layout.ringRadius).toBeCloseTo(0.9144, 5);
  expect(layout.triangleSide).toBeCloseTo(3.117691, 5);
  expect(layout.ringOverhang).toBeCloseTo(0.0144, 5);
  expect(layout.cornerRadiusToEnclose).toBeCloseTo(1.8288, 5);
  expect(layout.corners).toHaveLength(3);
  for (const [index, path] of layout.straps.entries()) {
    expect(path[0]).toEqual(layout.corners[index]);
    expect(path.at(-1)).toEqual(layout.collector);
    let nearest = Infinity;
    for (let n = 1; n < path.length; n++) {
      const a = path[n - 1],
        b = path[n];
      // Sample the rendered segments, including the long tangent runs.
      for (let sample = 0; sample <= 20; sample++) {
        const f = sample / 20;
        const distance = Math.hypot(
          a[0] + (b[0] - a[0]) * f,
          a[1] + (b[1] - a[1]) * f - layout.centreY,
          a[2] + (b[2] - a[2]) * f,
        );
        nearest = Math.min(nearest, distance);
      }
    }
    expect(nearest).toBeGreaterThanOrEqual(diameter / 2);
    expect(nearest).toBeLessThan(diameter / 2 + 0.02);
  }
});
