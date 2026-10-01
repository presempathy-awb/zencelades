import { expect, test } from "bun:test";
import { basketLayout } from "./basket-model";

test("six-foot ring fit exposes overhang and webbing follows the shell surface", () => {
  const layout = basketLayout();
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
    expect(nearest).toBeGreaterThanOrEqual(1.5);
    expect(nearest).toBeLessThan(1.52);
  }
});
