import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { Ray } from "@babylonjs/core/Culling/ray";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { createInstallationAccess } from "./installation-access";
import { loadProjectedLander } from "./projection-sphere";

test("six even treads reach both physical entry lips while leaving the central approach clear", async () => {
  const engine = new NullEngine();
  try {
    for (const filename of ["zencelades-2p5m-lander.glb", "zencelades-2p5m-suspended.glb"]) {
      const scene = new Scene(engine);
      scene.useRightHandedSystem = true;
      try {
        const model = await loadProjectedLander(
          scene,
          await readFile(new URL(`../../../deliveries/grant-3d-p059/${filename}`, import.meta.url)),
          new StandardMaterial("projected skin", scene),
        );
        const lip = scene.getMeshByName("Outer entry lip - nominal 680 mm opening");
        if (!lip) throw new Error("Expected the actual P059 entry lip.");
        lip.computeWorldMatrix(true);
        const lipBounds = lip.getBoundingInfo().boundingBox;
        const access = createInstallationAccess(scene, model.center, model.meshes);
        const treads = access.meshes.filter((mesh) => /^access tread \d$/.test(mesh.name));
        expect(treads).toHaveLength(6);
        let previousTop = 0;
        for (const [index, tread] of treads.entries()) {
          tread.computeWorldMatrix(true);
          const bounds = tread.getBoundingInfo().boundingBox;
          expect(bounds.maximumWorld.y - previousTop).toBeCloseTo(0.18, 6);
          expect(bounds.minimumWorld.z).toBeCloseTo(2.69 - index * 0.27, 5);
          expect(bounds.maximumWorld.z - bounds.minimumWorld.z).toBeCloseTo(0.27, 5);
          const positions = tread.getVerticesData("position");
          const normals = tread.getVerticesData("normal");
          if (!positions || !normals) throw new Error("Expected a solid rubber tread.");
          for (let offset = 0; offset < positions.length; offset += 3) {
            if (positions[offset + 1] === 0) expect(normals[offset + 1]).toBeGreaterThan(0.5);
          }
          previousTop = bounds.maximumWorld.y;
        }
        expect(lipBounds.minimumWorld.y - previousTop).toBeGreaterThan(0);
        expect(lipBounds.minimumWorld.y - previousTop).toBeLessThan(0.02);
        for (const mesh of access.meshes) {
          mesh.computeWorldMatrix(true);
          const bounds = mesh.getBoundingInfo().boundingBox;
          expect(bounds.minimumWorld.x).toBeGreaterThan(0.4);
          expect(bounds.minimumWorld.y).toBeGreaterThanOrEqual(-0.00001);
          expect(bounds.minimumWorld.z).toBeGreaterThan(lipBounds.maximumWorld.z);
          const positions = mesh.getVerticesData("position");
          const normals = mesh.getVerticesData("normal");
          expect(positions?.every(Number.isFinite)).toBe(true);
          expect(normals?.every(Number.isFinite)).toBe(true);
          for (const lens of model.lenses) {
            const axis = model.center.subtract(lens);
            const beam = new Ray(lens, axis.normalizeToNew(), axis.length());
            expect(beam.intersectsMesh(mesh).hit).toBe(false);
          }
        }
        const rail = scene.getMeshByName("access side handhold");
        expect(rail).not.toBeNull();
        expect(rail?.getBoundingInfo().boundingBox.maximumWorld.y).toBeGreaterThan(1.8);
      } finally {
        scene.dispose();
      }
    }
  } finally {
    engine.dispose();
  }
});

test("boarding light affects only supplied physical meshes and the access unit", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const base = MeshBuilder.CreateBox("physical base", {}, scene);
    const avatar = MeshBuilder.CreateSphere("physical avatar", {}, scene);
    const scenery = MeshBuilder.CreateBox("scenery", {}, scene);
    const projection = MeshBuilder.CreateSphere("projection surface", {}, scene);
    const access = createInstallationAccess(scene, new Vector3(0, 1.7, 0), [base, avatar, base]);
    expect(access.light.includedOnlyMeshes).toHaveLength(access.meshes.length + 2);
    expect(access.light.canAffectMesh(base)).toBe(true);
    expect(access.light.canAffectMesh(avatar)).toBe(true);
    expect(access.meshes.every((mesh) => access.light.canAffectMesh(mesh))).toBe(true);
    expect(access.light.canAffectMesh(scenery)).toBe(false);
    expect(access.light.canAffectMesh(projection)).toBe(false);
    expect(access.light.diffuse.r).toBeGreaterThan(access.light.diffuse.b);
    expect(access.light.position.y).toBeLessThan(0.8);
    expect(access.light.range).toBeLessThan(3.5);
    expect(access.light.intensity).toBeGreaterThan(0);
    expect(access.light.intensity).toBeLessThan(0.5);
    const tread = scene.getMeshByName("access tread 6");
    if (!(tread?.material instanceof StandardMaterial))
      throw new Error("Expected the rubber tread material.");
    expect(tread.material.specularColor.asArray().every((channel) => channel < 0.06)).toBe(true);
    const nosing = scene.getMeshByName("access nosing 6");
    if (!(nosing?.material instanceof StandardMaterial))
      throw new Error("Expected a dim edge cue.");
    expect(nosing.material.emissiveColor.r).toBeGreaterThan(0);
    expect(nosing.material.emissiveColor.r).toBeLessThan(0.15);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("daylight dims the access cues without moving the fixed unit and disposed updates are harmless", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const access = createInstallationAccess(scene, new Vector3(4, 3, -2), []);
    const positions = access.meshes.map((mesh) => mesh.position.asArray());
    const top = scene.getMeshByName("access tread 6");
    top?.computeWorldMatrix(true);
    expect(top?.getBoundingInfo().boundingBox.maximumWorld.y).toBeCloseTo(1.08, 6);
    access.setTimeOfDay(22);
    const nightIntensity = access.light.intensity;
    access.setTimeOfDay(6);
    const duskIntensity = access.light.intensity;
    access.setTimeOfDay(12);
    expect(access.light.intensity).toBeLessThan(duskIntensity);
    expect(duskIntensity).toBeLessThan(nightIntensity);
    expect(access.meshes.map((mesh) => mesh.position.asArray())).toEqual(positions);
    for (const hours of [Number.NaN, Number.POSITIVE_INFINITY, -20, 48]) {
      access.setTimeOfDay(hours);
      expect(Number.isFinite(access.light.intensity)).toBe(true);
      expect(access.light.intensity).toBeGreaterThan(0);
    }
    scene.dispose();
    expect(() => access.setTimeOfDay(22)).not.toThrow();
    expect(access.meshes.every((mesh) => mesh.isDisposed())).toBe(true);
    expect(scene.materials).toHaveLength(0);
    expect(scene.lights).toHaveLength(0);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});
