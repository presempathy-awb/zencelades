import { expect, test } from "bun:test";
import { MotionResponseAnalyzer } from "./motion-response";

const WIDTH = 32;
const HEIGHT = 18;

function frame(luma = 0): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
  for (let index = 0; index < pixels.length; index += 4) {
    pixels[index] = luma;
    pixels[index + 1] = luma;
    pixels[index + 2] = luma;
    pixels[index + 3] = 255;
  }
  return pixels;
}

function paint(
  pixels: Uint8ClampedArray,
  startX: number,
  startY: number,
  width: number,
  height: number,
  luma: number,
): void {
  for (let y = startY; y < startY + height; y++) {
    for (let x = startX; x < startX + width; x++) {
      const index = (y * WIDTH + x) * 4;
      pixels[index] = luma;
      pixels[index + 1] = luma;
      pixels[index + 2] = luma;
    }
  }
}

test("the first frame establishes a motionless baseline", () => {
  const analyzer = new MotionResponseAnalyzer();
  expect(analyzer.update(frame())).toEqual({ energy: 0, centroidX: 0 });
  expect(analyzer.update(frame())).toEqual({ energy: 0, centroidX: 0 });
});

test("localized movement produces bounded energy and a directional centroid", () => {
  const analyzer = new MotionResponseAnalyzer({ smoothing: 1 });
  analyzer.update(frame());
  const left = frame();
  paint(left, 2, 5, 7, 7, 255);
  const leftMotion = analyzer.update(left);
  expect(leftMotion.energy).toBeGreaterThan(0.1);
  expect(leftMotion.energy).toBeLessThanOrEqual(1);
  expect(leftMotion.centroidX).toBeLessThan(-0.45);

  analyzer.reset();
  analyzer.update(frame());
  const right = frame();
  paint(right, 23, 5, 7, 7, 255);
  const rightMotion = analyzer.update(right);
  expect(rightMotion.centroidX).toBeGreaterThan(0.45);
  expect(rightMotion.centroidX).toBeLessThanOrEqual(1);
});

test("a scene-wide illumination shift is filtered as light change rather than movement", () => {
  const analyzer = new MotionResponseAnalyzer({ smoothing: 1 });
  analyzer.update(frame(20));
  expect(analyzer.update(frame(180))).toEqual({ energy: 0, centroidX: 0 });
});

test("smoothing damps a one-frame movement spike and reset clears all history", () => {
  const analyzer = new MotionResponseAnalyzer({ smoothing: 0.25 });
  analyzer.update(frame());
  const moving = frame();
  paint(moving, 22, 4, 8, 8, 255);
  const response = analyzer.update(moving);
  expect(response.energy).toBeGreaterThan(0);
  expect(response.energy).toBeLessThan(0.25);
  expect(response.centroidX).toBeGreaterThan(0);
  analyzer.reset();
  expect(analyzer.update(moving)).toEqual({ energy: 0, centroidX: 0 });
});

test("invalid frames fail explicitly without corrupting the baseline", () => {
  const analyzer = new MotionResponseAnalyzer({ smoothing: 1 });
  analyzer.update(frame());
  expect(() => analyzer.update(new Uint8ClampedArray(12))).toThrow(RangeError);
  expect(analyzer.update(frame())).toEqual({ energy: 0, centroidX: 0 });
});

test("an absent source clears motion and makes the next real frame a fresh baseline", () => {
  const analyzer = new MotionResponseAnalyzer({ smoothing: 1 });
  analyzer.update(frame());
  const moving = frame();
  paint(moving, 22, 4, 8, 8, 255);
  expect(analyzer.update(moving).energy).toBeGreaterThan(0);
  expect(analyzer.update(undefined)).toEqual({ energy: 0, centroidX: 0 });
  expect(analyzer.update(moving)).toEqual({ energy: 0, centroidX: 0 });
});
