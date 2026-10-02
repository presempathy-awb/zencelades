import { expect, test } from "bun:test";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { createProjectionEnvironment } from "./projection-environment";

function appearance(scene: Scene): number[] {
  const fill = scene.getLightByName("cold night fill");
  const ground = scene.getMeshByName("night playa");
  if (!(fill instanceof HemisphericLight) || !(ground?.material instanceof StandardMaterial))
    throw new Error("Environment resources are missing.");
  return [
    ...scene.clearColor.asArray(),
    ...scene.ambientColor.asArray(),
    ...fill.diffuse.asArray(),
    ...fill.groundColor.asArray(),
    fill.intensity,
    ...ground.material.diffuseColor.asArray(),
  ];
}

test("dark hours retain faint ground and scenery detail below daylight brightness", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const environment = createProjectionEnvironment(scene);
    const initial = appearance(scene);
    environment.setTimeOfDay(22);
    expect(appearance(scene)).toEqual(initial);
    const ground = scene.getMeshByName("night playa");
    const fill = scene.getLightByName("cold night fill");
    if (!(ground?.material instanceof StandardMaterial) || !(fill instanceof HemisphericLight))
      throw new Error("Expected the beach and its fill light.");
    const material = ground.material;
    for (const hour of [0, 2, 4, 20, 22, 24]) {
      environment.setTimeOfDay(hour);
      expect(material.diffuseColor.asArray().every((channel) => channel >= 0.06)).toBe(true);
      expect(material.diffuseColor.asArray().every((channel) => channel <= 0.12)).toBe(true);
      expect(fill.intensity).toBeGreaterThanOrEqual(0.35);
      expect(fill.intensity).toBeLessThan(0.48);
      expect(fill.groundColor.asArray().every((channel) => channel >= 0.025)).toBe(true);
      expect(scene.clearColor.b).toBeGreaterThanOrEqual(0.025);
      expect(scene.clearColor.b).toBeLessThan(0.05);
      expect(material.diffuseColor.r).toBeGreaterThan(scene.clearColor.r);
      expect(material.diffuseColor.g).toBeGreaterThan(scene.clearColor.g);
      expect(material.diffuseColor.b).toBeGreaterThan(scene.clearColor.b);
    }
    for (const name of ["coastal palm fronds", "coastal grass", "coastal tent canopy 1"])
      expect(scene.getMeshByName(name)?.isEnabled()).toBe(true);
    expect(ground?.isEnabled()).toBe(true);
    expect(ground?.getBoundingInfo().boundingBox.extendSize.asArray()).toEqual([36, 0, 48]);
    expect(material.specularColor.asArray()).toEqual([0.025, 0.035, 0.045]);
    expect(material.specularPower).toBe(96);
    expect(
      (scene.getLightByName("cold night fill") as HemisphericLight).direction.asArray(),
    ).toEqual([-0.3, 1, 0.2]);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("noon brightens the existing environment and twilight gives it a distinct warm palette", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const environment = createProjectionEnvironment(scene);
    const ground = scene.getMeshByName("night playa");
    const material = ground?.material as StandardMaterial;
    const fill = scene.getLightByName("cold night fill") as HemisphericLight;
    environment.setTimeOfDay(12);
    expect(fill.intensity).toBeGreaterThan(0.8);
    expect(material.diffuseColor.r).toBeGreaterThan(0.2);
    expect(scene.clearColor.b).toBeGreaterThan(0.4);
    const noon = appearance(scene);
    const dayPalette = [
      0.36, 0.61, 0.82, 1, 0.34, 0.38, 0.42, 1, 0.97, 0.9, 0.19, 0.16, 0.12, 1.05, 0.38, 0.34, 0.28,
    ];
    for (const [index, channel] of noon.entries())
      expect(channel).toBeCloseTo(dayPalette[index], 10);
    environment.setTimeOfDay(18);
    expect(appearance(scene)).not.toEqual(noon);
    expect(fill.diffuse.r).toBeGreaterThan(fill.diffuse.b);
    expect(fill.intensity).toBeGreaterThan(0.27);
    expect(fill.intensity).toBeLessThan(0.8);
    const duskPalette = [
      0.14, 0.07, 0.1, 1, 0.16, 0.1, 0.075, 1, 0.43, 0.19, 0.07, 0.028, 0.02, 0.48, 0.075, 0.048,
      0.04,
    ];
    for (const [index, channel] of appearance(scene).entries())
      expect(channel).toBeCloseTo(duskPalette[index], 10);
    expect(scene.getMeshByName("night playa")).toBe(ground);
    expect(ground?.material).toBe(material);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("the day wraps continuously at midnight and unsafe times use a finite night default", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const environment = createProjectionEnvironment(scene);
    const night = appearance(scene);
    environment.setTimeOfDay(0);
    const midnight = appearance(scene);
    environment.setTimeOfDay(24);
    expect(appearance(scene)).toEqual(midnight);
    environment.setTimeOfDay(-10);
    expect(appearance(scene)).toEqual(midnight);
    environment.setTimeOfDay(100);
    expect(appearance(scene)).toEqual(midnight);
    for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      environment.setTimeOfDay(12);
      environment.setTimeOfDay(invalid);
      expect(appearance(scene)).toEqual(night);
      expect(appearance(scene).every(Number.isFinite)).toBe(true);
    }
    environment.setTimeOfDay(5.999);
    const before = appearance(scene);
    environment.setTimeOfDay(6.001);
    expect(
      Math.max(...appearance(scene).map((value, index) => Math.abs(value - before[index]))),
    ).toBeLessThan(0.01);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("hiding the backdrop keeps time, ground identity, hardware, spill and haze intact", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const hardware = MeshBuilder.CreateBox("rig hardware", {}, scene);
    const haze = MeshBuilder.CreatePlane("rising haze", {}, scene);
    const avatar = MeshBuilder.CreateSphere("seated avatar", {}, scene);
    const spill = new PointLight("projection spill", new Vector3(0, 1.7, 0), scene);
    spill.diffuse = new Color3(0.18, 0.48, 0.72);
    spill.intensity = 0.34;
    const environment = createProjectionEnvironment(scene);
    const ground = scene.getMeshByName("night playa");
    const meshes = [...scene.meshes];
    const lights = [...scene.lights];
    environment.setTimeOfDay(12);
    const noon = appearance(scene);
    environment.setEnvironment(false);
    expect(ground?.isEnabled()).toBe(false);
    const coast = scene.getTransformNodeByName("coastal environment");
    if (!coast) throw new Error("Expected the owned coastal scenery.");
    expect(coast.getChildMeshes().every((mesh) => !mesh.isEnabled())).toBe(true);
    expect(scene.clearColor.asArray()).toEqual([0.005, 0.005, 0.005, 1]);
    environment.setTimeOfDay(18);
    expect(ground?.isEnabled()).toBe(false);
    expect(scene.clearColor.asArray()).toEqual([0.005, 0.005, 0.005, 1]);
    environment.setEnvironment(true);
    expect(ground?.isEnabled()).toBe(true);
    expect(coast.getChildMeshes().every((mesh) => mesh.isEnabled())).toBe(true);
    expect(appearance(scene)).not.toEqual(noon);
    expect(scene.getMeshByName("night playa")).toBe(ground);
    expect(scene.meshes).toEqual(meshes);
    expect(scene.lights).toEqual(lights);
    for (const mesh of [hardware, haze, avatar]) expect(mesh.isEnabled()).toBe(true);
    expect(spill.diffuse.asArray()).toEqual([0.18, 0.48, 0.72]);
    expect(spill.intensity).toBe(0.34);
    environment.setTimeOfDay(12);
    expect(appearance(scene)).toEqual(noon);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("the coast provides a broad beach and ocean with raised scenery clear of the installation", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    createProjectionEnvironment(scene);
    const coast = scene.getTransformNodeByName("coastal environment");
    if (!coast) throw new Error("Expected the owned coastal scenery.");
    const ocean = scene.getMeshByName("coastal ocean");
    if (!ocean) throw new Error("Expected the ocean surface.");
    ocean.computeWorldMatrix(true);
    const oceanBounds = ocean.getBoundingInfo().boundingBox;
    expect(oceanBounds.minimumWorld.x).toBeLessThan(-150);
    expect(oceanBounds.maximumWorld.x).toBeCloseTo(-6, 4);
    expect(oceanBounds.extendSize.z).toBeGreaterThan(70);
    for (const name of [
      "coastal grass",
      "coastal palm fronds",
      "coastal tent canopy 1",
      "coastal string bulbs",
      "coastal shoreline",
    ])
      expect(scene.getMeshByName(name)?.getTotalVertices()).toBeGreaterThan(0);
    for (const mesh of coast.getChildMeshes()) {
      const positions = mesh.getVerticesData("position");
      if (!positions) throw new Error("Every coastal mesh needs geometry.");
      const world = mesh.computeWorldMatrix(true);
      for (let index = 0; index < positions.length; index += 3) {
        const point = Vector3.TransformCoordinates(Vector3.FromArray(positions, index), world);
        expect([point.x, point.y, point.z].every(Number.isFinite)).toBe(true);
        if (point.y > 0.1) expect(Math.hypot(point.x, point.z)).toBeGreaterThan(5);
      }
    }
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("coastal water and warm lamps follow the stored time without rebuilding scenery", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const environment = createProjectionEnvironment(scene);
    const ocean = scene.getMeshByName("coastal ocean");
    const bulbs = scene.getMeshByName("coastal string bulbs");
    if (
      !(ocean?.material instanceof StandardMaterial) ||
      !(bulbs?.material instanceof StandardMaterial)
    )
      throw new Error("Expected the water and lamp materials.");
    const meshes = [...scene.meshes];
    const nightWater = ocean.material.diffuseColor.clone();
    const nightGlow = bulbs.material.emissiveColor.r;
    expect(nightWater.b).toBeGreaterThan(nightWater.r);
    expect(nightGlow).toBeGreaterThan(0.7);
    environment.setTimeOfDay(12);
    const dayWater = ocean.material.diffuseColor.asArray();
    expect(ocean.material.diffuseColor.b).toBeGreaterThan(nightWater.b);
    expect(bulbs.material.emissiveColor.r).toBeLessThan(nightGlow);
    environment.setEnvironment(false);
    environment.setTimeOfDay(18);
    const twilightWater = ocean.material.diffuseColor.asArray();
    expect(twilightWater).not.toEqual(dayWater);
    environment.setEnvironment(true);
    expect(ocean.material.diffuseColor.asArray()).toEqual(twilightWater);
    expect(scene.meshes).toEqual(meshes);
    expect(scene.getMeshByName("coastal ocean")).toBe(ocean);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("environment setters do not revive disposed scene resources", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const environment = createProjectionEnvironment(scene);
  scene.dispose();
  try {
    expect(() => {
      environment.setTimeOfDay(12);
      environment.setEnvironment(false);
      environment.setEnvironment(true);
    }).not.toThrow();
    expect(scene.meshes).toHaveLength(0);
    expect(scene.lights).toHaveLength(0);
  } finally {
    engine.dispose();
  }
});
