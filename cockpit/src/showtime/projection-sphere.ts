import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";

/** Wrap the current video composition around a freely rotatable projection globe. */
export function createProjectionSphere(
  canvas: HTMLCanvasElement,
  source: HTMLCanvasElement,
): {
  render: () => void;
  resize: () => void;
  dispose: () => void;
} {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true });
  engine.setHardwareScalingLevel(Math.max(1, window.devicePixelRatio / 1.5));
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.008, 0.025, 0.05, 1);
  const camera = new ArcRotateCamera(
    "projection view",
    -Math.PI / 2,
    Math.PI / 2,
    5.7,
    Vector3.Zero(),
    scene,
  );
  camera.lowerRadiusLimit = 3.3;
  camera.upperRadiusLimit = 9;
  camera.wheelPrecision = 40;
  camera.panningSensibility = 0;
  camera.attachControl(canvas, true);
  new HemisphericLight("moon fill", new Vector3(0, 1, -1), scene).intensity = 0.65;
  const globe = MeshBuilder.CreateSphere("live human moon", { diameter: 2.8, segments: 64 }, scene);
  const texture = new DynamicTexture("live projection", source, scene, false);
  const skin = new StandardMaterial("projection skin", scene);
  skin.diffuseTexture = texture;
  skin.emissiveTexture = texture;
  skin.emissiveColor = new Color3(0.82, 0.9, 1);
  skin.specularColor = new Color3(0.1, 0.17, 0.2);
  globe.material = skin;
  globe.rotation.y = Math.PI / 2;
  const seams = MeshBuilder.CreateSphere(
    "zorb seam outline",
    { diameter: 2.81, segments: 12 },
    scene,
  );
  const wire = new StandardMaterial("faint sphere seams", scene);
  wire.wireframe = true;
  wire.emissiveColor = new Color3(0.26, 0.55, 0.7);
  wire.alpha = 0.12;
  seams.material = wire;
  const floor = MeshBuilder.CreateDisc(
    "projected light pool",
    { radius: 2.2, tessellation: 64 },
    scene,
  );
  floor.rotation.x = Math.PI / 2;
  floor.position.y = -1.65;
  const glow = new StandardMaterial("light spill", scene);
  glow.emissiveColor = new Color3(0.03, 0.13, 0.2);
  glow.alpha = 0.2;
  glow.backFaceCulling = false;
  floor.material = glow;
  return {
    render: () => {
      texture.update();
      scene.render();
    },
    resize: () => engine.resize(),
    dispose: () => {
      camera.detachControl();
      scene.dispose();
      engine.dispose();
    },
  };
}
