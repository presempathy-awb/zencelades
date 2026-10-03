import { expect, test } from "bun:test";
import { advanceShowtime, loopFade } from "./timeline";

test("the show loops seamlessly and pausing holds the moon while live input can continue", () => {
  expect(advanceShowtime(59.9, 0.2, true)).toBeCloseTo(0.1);
  expect(advanceShowtime(17, 3, false)).toBe(17);
  expect(advanceShowtime(17, -2, true)).toBe(17);
  expect(advanceShowtime(17, 120, true)).toBeCloseTo(17);
  let slowFrames = 0;
  for (let i = 0; i < 10; i++) slowFrames = advanceShowtime(slowFrames, 0.5, true);
  expect(slowFrames).toBe(5);
  let time = 0;
  for (let i = 0; i < 3601; i++) time = advanceShowtime(time, 1 / 30, true);
  expect(time).toBeCloseTo(1 / 30);
  let longShow = 17.25;
  for (let loop = 0; loop < 10_000; loop++) longShow = advanceShowtime(longShow, 60, true);
  expect(advanceShowtime(longShow, 61, true)).toBe(18.25);
});

test("the loop boundary closes and reopens without revealing the camera jump", () => {
  expect(loopFade(58)).toBe(0);
  expect(loopFade(59)).toBe(0.5);
  expect(loopFade(60)).toBe(1);
  expect(loopFade(0)).toBe(1);
  expect(loopFade(1)).toBe(0.5);
  expect(loopFade(2)).toBe(0);
  expect(loopFade(30)).toBe(0);
});
