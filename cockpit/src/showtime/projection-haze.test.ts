import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { createProjectionHaze } from "./projection-haze";
import { loadProjectedLander } from "./projection-sphere";

const landerPath = new URL(
  "../../../deliveries/grant-3d-p059/zencelades-2p5m-lander.glb",
  import.meta.url,
);

test("soft haze rises and widens from the actual external outlet below the orb", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  try {
    const projection = new StandardMaterial("unrelated projected wall", scene);
    const model = await loadProjectedLander(scene, await readFile(landerPath), projection);
    const outlet = scene.getMeshByName("Hazer outlet - no sphere connection");
    if (!outlet) throw new Error("Expected the actual provisional hazer outlet.");
    outlet.computeWorldMatrix(true);
    const source = outlet.getBoundingInfo().boundingBox.centerWorld.clone();
    expect(source.x).toBeCloseTo(0, 5);
    expect(source.y).toBeCloseTo(0.22, 5);
    expect(source.z).toBeCloseTo(-0.945, 5);
    expect(source.y).toBeLessThan(model.center.y - model.radius);
    const texture = new Texture(null, scene);
    const originalMeshes = new Set(scene.meshes);
    const plume = createProjectionHaze(
      scene,
      outlet,
      texture,
      model.lenses,
      model.center,
      model.radius,
    );
    const wisps = scene.meshes.filter((mesh) => !originalMeshes.has(mesh));
    expect(wisps.length).toBeGreaterThan(1);
    plume.update(0, 1, 0, 1);
    const youngest = wisps.reduce((lowest, mesh) =>
      mesh.position.y < lowest.position.y ? mesh : lowest,
    );
    expect(youngest.position.subtract(source).length()).toBeLessThan(0.03);
    const initialY = youngest.position.y;
    const initialWidth = youngest.scaling.x;
    plume.update(1, 1, 0, 1);
    expect(youngest.position.y).toBeGreaterThan(initialY);
    expect(youngest.scaling.x).toBeGreaterThan(initialWidth);
    let highestVapor = 0;
    let lowestVapor = Infinity;
    let strongestAlpha = 0;
    let nearestVapor = Infinity;
    let widestVapor = 0;
    let tallestVapor = 0;
    for (const wisp of wisps) {
      expect(wisp.billboardMode).toBe(Mesh.BILLBOARDMODE_ALL);
      const material = wisp.material;
      if (!(material instanceof StandardMaterial))
        throw new Error("Expected illuminated haze material.");
      expect(material.opacityTexture).toBe(texture);
      expect(material.diffuseTexture).toBeNull();
      expect(material).not.toBe(projection);
      highestVapor = Math.max(highestVapor, wisp.position.y + wisp.scaling.y / 2);
      lowestVapor = Math.min(lowestVapor, wisp.position.y - wisp.scaling.y / 2);
      strongestAlpha = Math.max(strongestAlpha, material.alpha);
      nearestVapor = Math.min(nearestVapor, wisp.position.subtract(model.center).length());
      widestVapor = Math.max(widestVapor, wisp.scaling.x);
      tallestVapor = Math.max(tallestVapor, wisp.scaling.y);
    }
    expect(highestVapor).toBeLessThan(model.center.y);
    expect(lowestVapor).toBeGreaterThan(0);
    expect(strongestAlpha).toBeGreaterThan(0.2);
    expect(nearestVapor).toBeGreaterThan(model.radius);
    expect(widestVapor).toBeLessThan(2.1);
    expect(tallestVapor).toBeLessThan(0.81);
    expect(texture.hasAlpha).toBe(true);
    expect(texture.getAlphaFromRGB).toBe(false);
    plume.update(2, 0, 1, 1);
    expect(wisps.every((mesh) => !mesh.isEnabled() && mesh.material?.alpha === 0)).toBe(true);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("haze animation is deterministic and reduced effects keep a visible stationary plume", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  try {
    const projection = new StandardMaterial("projected skin", scene);
    const model = await loadProjectedLander(scene, await readFile(landerPath), projection);
    const outlet = scene.getMeshByName("Hazer outlet - no sphere connection");
    if (!outlet) throw new Error("Expected the imported hazer outlet.");
    const before = new Set(scene.meshes);
    const plume = createProjectionHaze(
      scene,
      outlet,
      new Texture(null, scene),
      model.lenses,
      model.center,
      model.radius,
    );
    const wisps = scene.meshes.filter((mesh) => !before.has(mesh));
    const snapshot = (): unknown[] =>
      wisps.map((mesh) => {
        if (!(mesh.material instanceof StandardMaterial))
          throw new Error("Expected a haze material.");
        return {
          position: mesh.position.asArray(),
          scale: mesh.scaling.asArray(),
          alpha: mesh.material.alpha,
          emission: mesh.material.emissiveColor.asArray(),
        };
      });
    plume.update(2, 0.8, 0.7, 1);
    const moving = snapshot();
    plume.update(2, 0.8, 0.7, 1);
    expect(snapshot()).toEqual(moving);
    plume.update(3, 0.8, 0.7, 1);
    expect(snapshot()).not.toEqual(moving);
    plume.update(0, 0.8, 0, 0);
    const still = snapshot();
    expect(wisps.some((mesh) => mesh.isEnabled() && (mesh.material?.alpha ?? 0) > 0.2)).toBe(true);
    plume.update(100, 0.8, 1, 0);
    expect(snapshot()).toEqual(still);
    scene.dispose();
    expect(() => plume.update(101, 1, 1, 1)).not.toThrow();
    expect(scene.meshes).toEqual([]);
    expect(scene.materials).toEqual([]);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("each of the three projectors lights the same source-anchored plume", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  try {
    const projection = new StandardMaterial("projected skin", scene);
    const model = await loadProjectedLander(scene, await readFile(landerPath), projection);
    const outlet = scene.getMeshByName("Hazer outlet - no sphere connection");
    if (!outlet) throw new Error("Expected the imported hazer outlet.");
    const before = new Set(scene.meshes);
    const texture = new Texture(null, scene);
    const nearby = createProjectionHaze(
      scene,
      outlet,
      texture,
      model.lenses,
      model.center,
      model.radius,
    );
    const nearbyWisps = scene.meshes.filter((mesh) => !before.has(mesh));
    const afterNearby = new Set(scene.meshes);
    const distant = createProjectionHaze(
      scene,
      outlet,
      texture,
      [new Vector3(100, 0, 0), new Vector3(-100, 0, 0), new Vector3(0, 0, -100)],
      model.center,
      model.radius,
    );
    const distantWisps = scene.meshes.filter((mesh) => !afterNearby.has(mesh));
    nearby.update(1, 1, 0, 0);
    distant.update(1, 1, 0, 0);
    const brightness = (meshes: typeof nearbyWisps): number =>
      meshes.reduce((sum, mesh) => {
        if (!(mesh.material instanceof StandardMaterial))
          throw new Error("Expected scattered light.");
        return sum + mesh.material.emissiveColor.r;
      }, 0);
    expect(brightness(nearbyWisps)).toBeGreaterThan(brightness(distantWisps) * 1.5);
    expect(nearbyWisps.map((mesh) => mesh.position.asArray())).toEqual(
      distantWisps.map((mesh) => mesh.position.asArray()),
    );
    const fullBrightness = brightness(nearbyWisps);
    const litPositions = nearbyWisps.map((mesh) => mesh.position.asArray());
    nearby.update(1, 1, 0, 0, 0);
    expect(brightness(nearbyWisps)).toBeLessThan(fullBrightness);
    expect(nearbyWisps.some((mesh) => mesh.isEnabled() && (mesh.material?.alpha ?? 0) > 0)).toBe(
      true,
    );
    expect(nearbyWisps.map((mesh) => mesh.position.asArray())).toEqual(litPositions);
    nearby.update(1, 1, 0, 0, 1);
    for (const movedIndex of [0, 1, 2]) {
      const beforeMoved = new Set(scene.meshes);
      const movedLenses = model.lenses.map((position, index) =>
        index === movedIndex ? new Vector3(100, 0, 100) : position,
      );
      const changed = createProjectionHaze(
        scene,
        outlet,
        texture,
        movedLenses,
        model.center,
        model.radius,
      );
      changed.update(1, 1, 0, 0);
      const changedWisps = scene.meshes.filter((mesh) => !beforeMoved.has(mesh));
      expect(brightness(changedWisps)).toBeLessThan(fullBrightness - 0.01);
    }
  } finally {
    scene.dispose();
    engine.dispose();
  }
});
