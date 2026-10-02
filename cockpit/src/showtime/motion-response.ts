/** Width of the low-cost camera sample consumed by the analyzer. */
export const MOTION_SAMPLE_WIDTH = 32;

/** Height of the low-cost camera sample consumed by the analyzer. */
export const MOTION_SAMPLE_HEIGHT = 18;

const PIXEL_COUNT = MOTION_SAMPLE_WIDTH * MOTION_SAMPLE_HEIGHT;
const RGBA_LENGTH = PIXEL_COUNT * 4;
const INLIER_DISTANCE = 32;
const NOISE_FLOOR = 4;
const FULL_MOTION_LUMA = 48;

/** A bounded signal that can drive projection bloom, ripples, and haze. */
export interface MotionResponse {
  energy: number;
  centroidX: number;
}

/** Settings for temporal smoothing of the motion response. */
export interface MotionResponseOptions {
  smoothing?: number;
}

/** Reduce 32x18 RGBA frames to illumination-resistant image motion. */
export class MotionResponseAnalyzer {
  readonly #smoothing: number;
  #initialized = false;
  #energy = 0;
  #centroidX = 0;
  #previousLuma = new Float32Array(PIXEL_COUNT);
  #currentLuma = new Float32Array(PIXEL_COUNT);
  #differences = new Float32Array(PIXEL_COUNT);

  constructor(options: MotionResponseOptions = {}) {
    const smoothing = options.smoothing ?? 0.3;
    if (!Number.isFinite(smoothing) || smoothing <= 0 || smoothing > 1) {
      throw new RangeError("Motion smoothing must be greater than 0 and at most 1");
    }
    this.#smoothing = smoothing;
  }

  update(frame?: Uint8Array | Uint8ClampedArray): MotionResponse {
    if (!frame) {
      this.reset();
      return { energy: 0, centroidX: 0 };
    }
    if (frame.length !== RGBA_LENGTH) {
      throw new RangeError(`Motion frames must contain ${RGBA_LENGTH} RGBA values`);
    }

    for (let pixel = 0, rgba = 0; pixel < PIXEL_COUNT; pixel++, rgba += 4) {
      this.#currentLuma[pixel] =
        frame[rgba] * 0.2126 + frame[rgba + 1] * 0.7152 + frame[rgba + 2] * 0.0722;
    }

    if (!this.#initialized) {
      this.#swapFrames();
      this.#initialized = true;
      return { energy: 0, centroidX: 0 };
    }

    let meanDifference = 0;
    for (let pixel = 0; pixel < PIXEL_COUNT; pixel++) {
      const difference = this.#currentLuma[pixel] - this.#previousLuma[pixel];
      this.#differences[pixel] = difference;
      meanDifference += difference;
    }
    meanDifference /= PIXEL_COUNT;

    let commonDifference = 0;
    let inlierCount = 0;
    for (let pixel = 0; pixel < PIXEL_COUNT; pixel++) {
      const difference = this.#differences[pixel];
      if (Math.abs(difference - meanDifference) <= INLIER_DISTANCE) {
        commonDifference += difference;
        inlierCount++;
      }
    }
    commonDifference = inlierCount > 0 ? commonDifference / inlierCount : meanDifference;

    let totalWeight = 0;
    let weightedX = 0;
    for (let pixel = 0; pixel < PIXEL_COUNT; pixel++) {
      const weight = Math.max(
        0,
        Math.abs(this.#differences[pixel] - commonDifference) - NOISE_FLOOR,
      );
      if (weight === 0) continue;
      const x = pixel % MOTION_SAMPLE_WIDTH;
      totalWeight += weight;
      weightedX += weight * ((x / (MOTION_SAMPLE_WIDTH - 1)) * 2 - 1);
    }

    const rawEnergy = Math.min(1, totalWeight / (PIXEL_COUNT * FULL_MOTION_LUMA));
    const rawCentroidX = totalWeight > 0 ? weightedX / totalWeight : 0;
    this.#energy += (rawEnergy - this.#energy) * this.#smoothing;
    this.#centroidX += (rawCentroidX - this.#centroidX) * this.#smoothing;
    this.#swapFrames();
    return {
      energy: Math.max(0, Math.min(1, this.#energy)),
      centroidX: Math.max(-1, Math.min(1, this.#centroidX)),
    };
  }

  reset(): void {
    this.#initialized = false;
    this.#energy = 0;
    this.#centroidX = 0;
  }

  #swapFrames(): void {
    const previous = this.#previousLuma;
    this.#previousLuma = this.#currentLuma;
    this.#currentLuma = previous;
  }
}
