import { expect, test } from "bun:test";
import { createHumanProjection, sampleHumanBlend } from "./human";

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

test("the portrait loads from the media base supplied by its host", async () => {
  const previousImage = globalThis.Image;
  const previousDocument = globalThis.document;
  let requestedSource = "";
  class TestImage {
    complete = false;
    naturalWidth = 0;
    set src(value: string) {
      requestedSource = value;
    }
    decode(): Promise<void> {
      return Promise.resolve();
    }
  }
  const gradient = { addColorStop: (): void => {} };
  const context = {
    drawImage: (): void => {},
    globalCompositeOperation: "source-over",
    createRadialGradient: () => gradient,
    fillStyle: "",
    fillRect: (): void => {},
  };
  const testDocument = {
    baseURI: "https://zencelades.test/showtime/",
    createElement: () => ({ width: 0, height: 0, getContext: () => context }),
  };
  Object.defineProperty(globalThis, "Image", { configurable: true, value: TestImage });
  Object.defineProperty(globalThis, "document", { configurable: true, value: testDocument });
  try {
    const projection = createHumanProjection("https://zencelades.test/film/film-media/");
    await projection.ready;
    expect(requestedSource).toBe("https://zencelades.test/film/film-media/andrew-reference.jpeg");
  } finally {
    if (previousImage) Object.defineProperty(globalThis, "Image", { value: previousImage });
    else Reflect.deleteProperty(globalThis, "Image");
    if (previousDocument)
      Object.defineProperty(globalThis, "document", { value: previousDocument });
    else Reflect.deleteProperty(globalThis, "document");
  }
});
