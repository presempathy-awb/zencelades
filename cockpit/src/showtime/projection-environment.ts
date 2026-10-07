import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import { createCoastalEnvironment } from "./coastal-environment";

export interface ProjectionEnvironment {
  setTimeOfDay: (hours: number) => void;
  setEnvironment: (enabled: boolean) => void;
}

type RGB = readonly [number, number, number];

interface Palette {
  backdrop: RGB;
  ambient: RGB;
  fill: RGB;
  groundFill: RGB;
  ground: RGB;
  intensity: number;
}

const night: Palette = {
  backdrop: [0.008, 0.018, 0.032],
  ambient: [0.025, 0.04, 0.065],
  fill: [0.38, 0.52, 0.7],
  groundFill: [0.028, 0.04, 0.055],
  ground: [0.075, 0.085, 0.095],
  intensity: 0.38,
};
const day: Palette = {
  backdrop: [0.36, 0.61, 0.82],
  ambient: [0.34, 0.38, 0.42],
  fill: [1, 0.97, 0.9],
  groundFill: [0.19, 0.16, 0.12],
  ground: [0.38, 0.34, 0.28],
  intensity: 1.05,
};
const twilight: Palette = {
  backdrop: [0.14, 0.07, 0.1],
  ambient: [0.16, 0.1, 0.075],
  fill: [1, 0.43, 0.19],
  groundFill: [0.07, 0.028, 0.02],
  ground: [0.075, 0.048, 0.04],
  intensity: 0.48,
};

function blend(
  color: Color3 | Color4,
  from: RGB,
  to: RGB,
  warm: RGB,
  daylight: number,
  dusk: number,
): void {
  color.r = from[0] + daylight * (to[0] - from[0]) + dusk * (warm[0] - from[0]);
  color.g = from[1] + daylight * (to[1] - from[1]) + dusk * (warm[1] - from[1]);
  color.b = from[2] + daylight * (to[2] - from[2]) + dusk * (warm[2] - from[2]);
}

/** Create the installation's ground, backdrop and art lighting. */
export function createProjectionEnvironment(scene: Scene): ProjectionEnvironment {
  scene.clearColor = new Color4(...night.backdrop, 1);
  scene.ambientColor = new Color3(...night.ambient);
  const fill = new HemisphericLight("cold night fill", new Vector3(-0.3, 1, 0.2), scene);
  fill.intensity = night.intensity;
  fill.diffuse = new Color3(...night.fill);
  fill.groundColor = new Color3(...night.groundFill);
  const coast = createCoastalEnvironment(scene);
  const { groundMaterial } = coast;
  let hours = 22;
  let enabled = true;
  const update = (): void => {
    if (scene.isDisposed) return;
    // Approximate art lighting: hours blend palettes, rather than model a physical sun.
    const height = Math.cos(((hours - 12) / 24) * Math.PI * 2);
    const bright = Math.max(0, Math.min(1, height * 2));
    const daylight = bright * bright * (3 - 2 * bright);
    const warm = Math.max(0, 1 - Math.abs(height) / 0.26);
    const dusk = warm * warm * (3 - 2 * warm) * (1 - daylight);
    const midnight = Math.max(0, 1 - Math.min(hours, 24 - hours) / 2);
    const darkness = midnight * midnight * (3 - 2 * midnight);
    const naturalLight = 1 - darkness * 0.94;
    blend(scene.ambientColor, night.ambient, day.ambient, twilight.ambient, daylight, dusk);
    blend(fill.diffuse, night.fill, day.fill, twilight.fill, daylight, dusk);
    blend(fill.groundColor, night.groundFill, day.groundFill, twilight.groundFill, daylight, dusk);
    blend(groundMaterial.diffuseColor, night.ground, day.ground, twilight.ground, daylight, dusk);
    fill.intensity =
      night.intensity +
      daylight * (day.intensity - night.intensity) +
      dusk * (twilight.intensity - night.intensity);
    fill.intensity *= naturalLight;
    scene.ambientColor.scaleInPlace(naturalLight);
    if (enabled) {
      blend(scene.clearColor, night.backdrop, day.backdrop, twilight.backdrop, daylight, dusk);
      scene.clearColor.r *= naturalLight;
      scene.clearColor.g *= naturalLight;
      scene.clearColor.b *= naturalLight;
    } else {
      scene.clearColor.r = scene.clearColor.g = scene.clearColor.b = 0.005;
    }
    coast.setLighting(daylight, dusk, naturalLight);
    coast.root.setEnabled(enabled);
  };
  update();
  return {
    setTimeOfDay: (value) => {
      if (scene.isDisposed) return;
      hours = Number.isFinite(value) ? Math.max(0, Math.min(24, value)) : 22;
      update();
    },
    setEnvironment: (value) => {
      if (scene.isDisposed) return;
      enabled = value;
      update();
    },
  };
}
