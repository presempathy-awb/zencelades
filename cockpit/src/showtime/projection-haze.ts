import { Engine } from "@babylonjs/core/Engines/engine";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";

export interface ProjectionHaze {
  update: (
    seconds: number,
    haze: number,
    motion: number,
    effects: number,
    projectionStrength?: number,
    internalHaze?: number,
  ) => void;
}

/** Emit soft illuminated wisps from the imported external outlet, with resources owned by the scene. */
export function createProjectionHaze(
  scene: Scene,
  outlet: AbstractMesh,
  opacity: BaseTexture,
  lenses: readonly Vector3[],
  sphereCenter: Vector3,
  sphereRadius: number,
): ProjectionHaze {
  outlet.computeWorldMatrix(true);
  const origin = outlet.getBoundingInfo().boundingBox.centerWorld.clone();
  const rise = Math.max(0, sphereCenter.y - origin.y - 0.55);
  const beams = lenses.map((position) => ({
    position,
    direction: sphereCenter.subtract(position).normalize(),
  }));
  const horizontal = Vector3.Zero();
  const ray = Vector3.Zero();
  opacity.hasAlpha = true;
  opacity.getAlphaFromRGB = false;
  const wisps = Array.from({ length: 24 }, (_, index) => {
    const mesh = MeshBuilder.CreatePlane(
      `external hazer plume wisp ${index + 1}`,
      { size: 1 },
      scene,
    );
    mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
    mesh.isPickable = false;
    const material = new StandardMaterial(`hazer scattered light ${index + 1}`, scene);
    material.diffuseColor = Color3.Black();
    material.specularColor = Color3.Black();
    material.disableLighting = true;
    material.opacityTexture = opacity;
    material.backFaceCulling = false;
    material.disableDepthWrite = true;
    material.alphaMode = Engine.ALPHA_COMBINE;
    mesh.material = material;
    mesh.setEnabled(false);
    const angle = index * 2.3999632297;
    return { mesh, material, phase: index / 24, angle, x: Math.cos(angle), z: Math.sin(angle) };
  });

  // SHORTCUT: an illustrative feed and vapor volume, not a ventilation or exposure model;
  // replace only after optical and unoccupied air-quality measurements of the actual equipment.
  const feedPath = [
    origin.clone(),
    origin.add(new Vector3(0, 0.18, -0.4)),
    sphereCenter.add(new Vector3(0, -sphereRadius * 0.8, -sphereRadius * 0.7)),
    sphereCenter.add(new Vector3(0, -sphereRadius * 0.45, -sphereRadius * 0.35)),
  ];
  const feed = MeshBuilder.CreateTube(
    "internal haze concept feed",
    { path: feedPath, radius: 0.025, tessellation: 8, updatable: true },
    scene,
  );
  feed.isPickable = false;
  const feedMaterial = new StandardMaterial("concept feed finish", scene);
  feedMaterial.diffuseColor = new Color3(0.25, 0.48, 0.52);
  feedMaterial.emissiveColor = Color3.Black();
  feed.material = feedMaterial;
  const feedCenter = sphereCenter.clone();
  feed.setEnabled(false);
  const interior = Array.from({ length: 18 }, (_, index) => {
    const mesh = MeshBuilder.CreatePlane(
      `internal haze study wisp ${index + 1}`,
      { size: 1 },
      scene,
    );
    mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
    mesh.isPickable = false;
    const material = new StandardMaterial(`internal haze scattering ${index + 1}`, scene);
    material.diffuseColor = Color3.Black();
    material.specularColor = Color3.Black();
    material.emissiveColor = Color3.Black();
    material.disableLighting = true;
    material.opacityTexture = opacity;
    material.backFaceCulling = false;
    material.disableDepthWrite = true;
    mesh.material = material;
    mesh.setEnabled(false);
    return { mesh, material, phase: index / 18, angle: index * 2.3999632297 };
  });

  return {
    update: (
      seconds,
      hazeValue,
      motionValue,
      effectsValue,
      projectionStrength = 1,
      internalHaze = 0,
    ) => {
      if (scene.isDisposed) return;
      const haze = Math.max(0, Math.min(1, hazeValue));
      const motion = Math.max(0, Math.min(1, motionValue));
      const effects = Math.max(0, Math.min(1, effectsValue));
      const time = seconds * effects;
      for (const beam of beams)
        sphereCenter.subtractToRef(beam.position, beam.direction).normalize();
      for (const { mesh, material, phase, angle, x, z } of wisps) {
        const age = (((time * (0.13 + motion * 0.035) + phase) % 1) + 1) % 1;
        const spread = age * (0.14 + motion * effects * 0.06);
        const curl = Math.sin(time * 0.7 + angle) * age * effects * 0.04;
        mesh.position.set(
          origin.x + x * spread + curl,
          origin.y + age * rise,
          origin.z + age * 0.22 + z * spread,
        );
        const dy = mesh.position.y - sphereCenter.y;
        horizontal.set(mesh.position.x - sphereCenter.x, 0, mesh.position.z - sphereCenter.z);
        const outside = Math.sqrt(Math.max(0, (sphereRadius + 0.08) ** 2 - dy ** 2));
        if (horizontal.length() < outside) {
          if (horizontal.lengthSquared() === 0) horizontal.z = -1;
          horizontal.normalize().scaleInPlace(outside);
          mesh.position.x = sphereCenter.x + horizontal.x;
          mesh.position.z = sphereCenter.z + horizontal.z;
        }
        mesh.scaling.set(0.22 + age * 1.8, 0.12 + age * 0.68, 1);
        let scatteredLight = 0;
        for (const beam of beams) {
          mesh.position.subtractToRef(beam.position, ray);
          const distanceSquared = ray.lengthSquared();
          const alignment = Vector3.Dot(ray.normalize(), beam.direction);
          const edge = Math.max(0, Math.min(1, (alignment - 0.905) / 0.05));
          const cone = edge * edge * (3 - 2 * edge);
          scatteredLight += cone / (1 + 0.055 * distanceSquared);
        }
        // SHORTCUT: illustrative cone/distance scattering; replace with measured plume density and
        // projector photometry when the actual hazer outlet, airflow and optical throw are calibrated.
        const brightness = 0.18 + Math.min(1.6, scatteredLight) * 0.72 * projectionStrength;
        material.emissiveColor.set(brightness * 0.32, brightness * 0.39, brightness * 0.46);
        const birth = Math.min(1, age / 0.1);
        const decay = Math.min(1, (1 - age) / 0.3);
        material.alpha = haze * birth * decay * (0.65 + motion * effects * 0.12);
        mesh.setEnabled(haze > 0);
      }
      const inside = Number.isFinite(internalHaze) ? Math.max(0, Math.min(1, internalHaze)) : 0;
      feed.setEnabled(inside > 0);
      if (inside > 0 && Vector3.DistanceSquared(feedCenter, sphereCenter) > 0.0004) {
        feedPath[2]
          .copyFrom(sphereCenter)
          .addInPlaceFromFloats(0, -sphereRadius * 0.8, -sphereRadius * 0.7);
        feedPath[3]
          .copyFrom(sphereCenter)
          .addInPlaceFromFloats(0, -sphereRadius * 0.45, -sphereRadius * 0.35);
        MeshBuilder.CreateTube(
          "internal haze concept feed",
          { path: feedPath, instance: feed },
          scene,
        );
        feedCenter.copyFrom(sphereCenter);
      }
      for (const { mesh, material, phase, angle } of interior) {
        const age = (((time * 0.09 + phase) % 1) + 1) % 1;
        const orbit = angle + time * 0.08;
        mesh.position.set(
          sphereCenter.x + Math.cos(orbit) * sphereRadius * 0.32,
          sphereCenter.y + (age - 0.5) * sphereRadius * 0.9,
          sphereCenter.z + Math.sin(orbit) * sphereRadius * 0.32,
        );
        mesh.scaling.setAll(sphereRadius * 0.5);
        material.alpha = inside * Math.sin(Math.PI * age) * 0.24;
        const light = inside > 0 ? 0.08 + projectionStrength * 0.5 : 0;
        material.emissiveColor.set(light * 0.5, light * 0.75, light);
        mesh.setEnabled(inside > 0);
      }
    },
  };
}
