import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { surfaceHeight } from "./flight";
import { sampleLanding } from "./transitions";

/** Add an original Orbilander-inspired craft, with a clearly artistic landing. */
export function createLander(scene: Scene): (seconds: number) => void {
  const root = new TransformNode("imagined Orbilander", scene);
  const baseY = surfaceHeight(-8, -8) + 1.4;
  const gold = new StandardMaterial("thermal blanket", scene);
  gold.diffuseColor = new Color3(0.75, 0.5, 0.18);
  gold.specularColor = new Color3(0.7, 0.6, 0.3);
  const white = new StandardMaterial("antenna and struts", scene);
  white.diffuseColor = new Color3(0.8, 0.88, 0.9);
  const dark = new StandardMaterial("RTG fins", scene);
  dark.diffuseColor = new Color3(0.15, 0.2, 0.24);
  const body = MeshBuilder.CreateCylinder(
    "lander bus",
    { diameter: 2.5, height: 1.5, tessellation: 8 },
    scene,
  );
  body.parent = root;
  body.material = gold;
  const dish = MeshBuilder.CreateSphere(
    "high gain antenna",
    { diameter: 2, segments: 24, slice: 0.5 },
    scene,
  );
  dish.parent = root;
  dish.position.set(0, 1.5, 0.3);
  dish.scaling.y = 0.24;
  dish.rotation.x = -0.7;
  dish.material = white;
  const mast = MeshBuilder.CreateCylinder("dish mast", { diameter: 0.09, height: 1.5 }, scene);
  mast.parent = root;
  mast.position.y = 1.2;
  mast.material = white;
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const end = new Vector3(Math.cos(angle) * 2.3, -1.25, Math.sin(angle) * 2.3);
    const start = new Vector3(Math.cos(angle) * 0.8, -0.3, Math.sin(angle) * 0.8);
    const leg = MeshBuilder.CreateTube(
      `landing leg ${i}`,
      { path: [start, end], radius: 0.06, tessellation: 6 },
      scene,
    );
    leg.parent = root;
    leg.material = white;
    const foot = MeshBuilder.CreateCylinder(`footpad ${i}`, { diameter: 0.6, height: 0.1 }, scene);
    foot.parent = root;
    foot.position.copyFrom(end);
    foot.material = dark;
  }
  for (const side of [-1, 1]) {
    const rtg = MeshBuilder.CreateCylinder(
      `RTG ${side}`,
      { diameter: 0.6, height: 1.5, tessellation: 12 },
      scene,
    );
    rtg.parent = root;
    rtg.position.set(side * 1.7, 0.3, 0);
    rtg.rotation.z = Math.PI / 2;
    rtg.material = dark;
    for (let fin = 0; fin < 8; fin++) {
      const disk = MeshBuilder.CreateCylinder(
        `RTG fin ${side} ${fin}`,
        { diameter: 0.82, height: 0.04, tessellation: 12 },
        scene,
      );
      disk.parent = rtg;
      disk.position.y = -0.65 + fin * 0.18;
      disk.material = dark;
    }
  }
  const thrustMaterial = new StandardMaterial("landing thrust light", scene);
  thrustMaterial.emissiveColor = new Color3(0.15, 0.7, 1);
  thrustMaterial.alpha = 0.35;
  const exhaust = MeshBuilder.CreateCylinder(
    "landing exhaust",
    { diameterTop: 0.2, diameterBottom: 2.2, height: 4, tessellation: 24 },
    scene,
  );
  exhaust.parent = root;
  exhaust.position.y = -2.6;
  exhaust.material = thrustMaterial;
  const dustMat = new StandardMaterial("disturbed frost", scene);
  dustMat.emissiveColor = new Color3(0.22, 0.48, 0.58);
  dustMat.alpha = 0.25;
  const frost = MeshBuilder.CreateTorus(
    "landing frost ring",
    { diameter: 3, thickness: 0.15, tessellation: 64 },
    scene,
  );
  frost.position.set(-8, baseY - 1.2, -8);
  frost.material = dustMat;
  return (seconds) => {
    const landing = sampleLanding(seconds);
    root.position.set(-8, baseY + landing.height, -8);
    exhaust.setEnabled(seconds >= 20 && seconds < 27);
    exhaust.scaling.y = landing.thrust;
    thrustMaterial.alpha = 0.2 + landing.thrust * 0.15;
    frost.setEnabled(seconds >= 23 && seconds <= 29);
    frost.scaling.setAll(1 + Math.max(0, seconds - 23) * 0.8);
    dustMat.alpha = Math.max(0, 0.25 * (1 - (seconds - 23) / 6));
  };
}
