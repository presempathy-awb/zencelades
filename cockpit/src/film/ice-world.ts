import { VertexBuffer } from "@babylonjs/core/Buffers/buffer";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { SolidParticle } from "@babylonjs/core/Particles/solidParticle";
import { SolidParticleSystem } from "@babylonjs/core/Particles/solidParticleSystem";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { Scene } from "@babylonjs/core/scene";
import { sampleFlight, surfaceHeight } from "./flight";
import { createLander } from "./lander";

export interface IceWorld {
  engine: Engine;
  render: (seconds: number, effects: number) => void;
  dispose: () => void;
}
const jetBases = [-25, -13, 0, 12, 25];
const noise = (id: number): number => {
  const v = Math.sin(id * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

function material(scene: Scene, name: string, color: Color3, glow = 0): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.emissiveColor = color.scale(glow);
  mat.specularColor = new Color3(0.25, 0.4, 0.5);
  return mat;
}

function iceTexture(scene: Scene): DynamicTexture {
  const texture = new DynamicTexture("ice geography", { width: 1024, height: 512 }, scene, true);
  const ctx = texture.getContext();
  ctx.fillStyle = "#cbdce5";
  ctx.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 500; i++) {
    const x = noise(i + 5) * 1024,
      y = noise(i + 800) * 512;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(56,100,124,${0.1 + noise(i) * 0.3})`;
    ctx.lineWidth = noise(i + 8) * 2 + 0.3;
    for (let j = 0; j < 35; j++) {
      const px = x + j * 3,
        py = y + Math.sin(j * 0.14 + i) * 7 + j * 0.35;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 180; i++) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(65,100,125,.2)";
    ctx.lineWidth = 1.5;
    ctx.arc(
      noise(i + 1400) * 1024,
      noise(i + 2000) * 400,
      2 + noise(i + 1800) * 14,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  texture.update();
  return texture;
}

function terrain(scene: Scene): Mesh {
  const ground = MeshBuilder.CreateGround(
    "ridged ice",
    { width: 360, height: 360, subdivisions: 180, updatable: true },
    scene,
  );
  const positions = ground.getVerticesData(VertexBuffer.PositionKind);
  const indices = ground.getIndices();
  if (!positions || !indices) throw new Error("The ice terrain has no geometry.");
  const colors: number[] = [];
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i],
      z = positions[i + 2];
    positions[i + 1] = surfaceHeight(x, z);
    const brightness = 0.68 + Math.sin(x * 0.32 + z * 0.1) * 0.12 + noise(i) * 0.08;
    colors.push(brightness * 0.7, brightness * 0.9, brightness, 1);
  }
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  ground.updateVerticesData(VertexBuffer.PositionKind, positions);
  ground.updateVerticesData(VertexBuffer.NormalKind, normals);
  ground.setVerticesData(VertexBuffer.ColorKind, colors);
  ground.material = material(scene, "cold ice", new Color3(0.62, 0.81, 0.9));
  ground.receiveShadows = true;
  for (let stripe = -1; stripe <= 1; stripe++) {
    const path: Vector3[] = [];
    for (let x = -100; x <= 100; x += 1.5) {
      const z = Math.sin(x * 0.12) * 3 + stripe * 18;
      path.push(new Vector3(x, surfaceHeight(x, z) + 0.08, z));
    }
    const fissure = MeshBuilder.CreateTube(
      `tiger stripe ${stripe}`,
      { path, radius: 0.12, tessellation: 6 },
      scene,
    );
    fissure.material = material(
      scene,
      `fissure light ${stripe}`,
      new Color3(0.13, 0.66, 0.85),
      1.8,
    );
  }
  const crystalMat = material(scene, "ice escarpments", new Color3(0.56, 0.8, 0.95));
  const rock = MeshBuilder.CreateIcoSphere(
    "crystal template",
    { radius: 1, subdivisions: 1, flat: true },
    scene,
  );
  const rocks = new SolidParticleSystem("frosted ridges", scene, { updatable: false });
  rocks.addShape(rock, 700, {
    positionFunction: (p: SolidParticle, i: number) => {
      const x = (noise(i + 100) - 0.5) * 140,
        z = (noise(i + 900) - 0.5) * 130;
      p.position.set(x, surfaceHeight(x, z) - 0.3, z);
      p.scaling.set(
        0.4 + noise(i + 1100) * 1.8,
        0.3 + noise(i + 1200) * 2.2,
        0.5 + noise(i + 1300),
      );
      p.rotation.set(noise(i) * 2, noise(i + 1) * 6, noise(i + 2));
    },
  });
  rocks.buildMesh().material = crystalMat;
  rock.dispose();
  return ground;
}

function saturn(scene: Scene): void {
  const planet = MeshBuilder.CreateSphere("Saturn", { diameter: 245, segments: 64 }, scene);
  planet.position.set(270, 175, 460);
  planet.rotation.z = -0.38;
  const mat = material(scene, "Saturn bands", new Color3(0.87, 0.73, 0.49), 0.18);
  const texture = new DynamicTexture("gas bands", { width: 512, height: 256 }, scene, true);
  const ctx = texture.getContext();
  for (let y = 0; y < 256; y++) {
    const v = 0.65 + 0.22 * Math.sin(y * 0.13) + noise(y) * 0.08;
    ctx.fillStyle = `rgb(${Math.round(v * 240)},${Math.round(v * 206)},${Math.round(v * 151)})`;
    ctx.fillRect(0, y, 512, 1);
  }
  texture.update();
  mat.diffuseTexture = texture;
  planet.material = mat;
  for (let i = 0; i < 35; i++) {
    const ring = MeshBuilder.CreateTorus(
      `ring ${i}`,
      { diameter: 315 + i * 5, thickness: 2.8, tessellation: 128 },
      scene,
    );
    ring.parent = planet;
    ring.rotation.x = -0.22;
    ring.material = material(
      scene,
      `ring dust ${i}`,
      new Color3(0.55 + noise(i) * 0.25, 0.5 + noise(i) * 0.19, 0.4 + noise(i) * 0.12),
      0.25,
    );
  }
}

function stars(scene: Scene): void {
  const shape = MeshBuilder.CreatePlane("star template", { size: 1 }, scene);
  const system = new SolidParticleSystem("fixed stars", scene, { updatable: false });
  system.addShape(shape, 1300, {
    positionFunction: (p: SolidParticle, i: number) => {
      const theta = noise(i) * Math.PI * 2,
        y = noise(i + 3000) * 2 - 1,
        r = Math.sqrt(1 - y * y);
      p.position.set(Math.cos(theta) * r * 1800, y * 1800, Math.sin(theta) * r * 1800);
      p.scaling.setAll(0.8 + noise(i + 5000) * 2.4);
      p.rotation.y = -theta + Math.PI / 2;
    },
  });
  const mat = material(scene, "starlight", new Color3(0.7, 0.87, 1), 1);
  mat.disableLighting = true;
  mat.backFaceCulling = false;
  system.buildMesh().material = mat;
  shape.dispose();
}

/** Create the ice world with deterministic plume motion and cinematic postprocessing. */
export function createIceWorld(canvas: HTMLCanvasElement): IceWorld {
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    powerPreference: "high-performance",
  });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.003, 0.009, 0.017, 1);
  const camera = new FreeCamera("flight camera", new Vector3(510, 230, -620), scene);
  camera.minZ = 0.12;
  camera.maxZ = 5000;
  const ambient = new HemisphericLight("Saturn light", new Vector3(0.3, 1, -0.2), scene);
  ambient.intensity = 0.65;
  ambient.groundColor = new Color3(0.06, 0.17, 0.24);
  const sun = new DirectionalLight("distant sun", new Vector3(-0.4, -0.7, 0.5), scene);
  sun.intensity = 1.5;
  sun.diffuse = new Color3(0.8, 0.89, 1);
  const globe = MeshBuilder.CreateSphere("Enceladus", { diameter: 500, segments: 96 }, scene);
  globe.position.y = -250;
  const globeMat = material(scene, "fractured moon", new Color3(0.72, 0.87, 0.95));
  globeMat.diffuseTexture = iceTexture(scene);
  globe.material = globeMat;
  const ground = terrain(scene);
  const animateLander = createLander(scene);
  saturn(scene);
  stars(scene);

  const sprite = new DynamicTexture("soft vapor", 128, scene, false);
  const ctx = sprite.getContext();
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 63);
  gradient.addColorStop(0, "rgba(190,237,255,.65)");
  gradient.addColorStop(0.25, "rgba(145,212,247,.3)");
  gradient.addColorStop(1, "rgba(115,185,220,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  sprite.update();
  sprite.hasAlpha = true;
  const vaporMat = material(scene, "backlit vapor", new Color3(0.4, 0.73, 1), 0.7);
  vaporMat.diffuseTexture = sprite;
  vaporMat.opacityTexture = sprite;
  vaporMat.useAlphaFromDiffuseTexture = true;
  vaporMat.disableLighting = true;
  vaporMat.backFaceCulling = false;
  vaporMat.disableDepthWrite = true;
  const quad = MeshBuilder.CreatePlane("vapor template", { size: 1 }, scene);
  const plumes = new SolidParticleSystem("geyser vapor", scene, { updatable: true });
  plumes.addShape(quad, 1700);
  plumes.billboard = true;
  plumes.buildMesh().material = vaporMat;
  plumes.mesh.alwaysSelectAsActiveMesh = true;
  quad.dispose();
  const shard = MeshBuilder.CreateIcoSphere(
    "ice grain",
    { radius: 0.1, subdivisions: 0, flat: true },
    scene,
  );
  const ice = new SolidParticleSystem("suspended ice crystals", scene, { updatable: true });
  ice.addShape(shard, 500);
  ice.buildMesh().material = material(scene, "glittering ice", new Color3(0.58, 0.86, 1), 0.9);
  ice.mesh.alwaysSelectAsActiveMesh = true;
  shard.dispose();
  let seconds = 0;
  plumes.updateParticle = (p) => {
    const i = p.idx,
      base = jetBases[i % jetBases.length];
    const phase = (noise(i + 7000) + seconds * (0.04 + noise(i + 7001) * 0.016)) % 1;
    const height = phase * (95 + noise(i + 7100) * 70),
      spread = 0.4 + height * 0.16;
    const angle = noise(i + 7300) * Math.PI * 2;
    p.position.set(
      base + Math.cos(angle) * spread * noise(i + 7500) + Math.sin(seconds * 0.25 + i) * 0.3,
      height,
      Math.sin(base * 0.12) * 3 + Math.sin(angle) * spread,
    );
    p.scaling.setAll(0.6 + height * 0.12);
    p.color = p.color ?? new Color4();
    p.color.set(0.54, 0.8, 1, (1 - phase) * 0.17);
    return p;
  };
  ice.updateParticle = (p) => {
    const i = p.idx,
      phase = (noise(i + 8000) + seconds * 0.065) % 1,
      h = phase * 100;
    const spread = 0.3 + h * 0.16,
      angle = noise(i + 8200) * Math.PI * 2;
    p.position.set(jetBases[i % 5] + Math.cos(angle) * spread, h, Math.sin(angle) * spread);
    p.rotation.set(seconds * 0.4 + i, seconds * 0.6, i);
    p.scaling.setAll(0.3 + noise(i + 8500) * 1.1);
    return p;
  };
  const pipeline = new DefaultRenderingPipeline("cinematic lens", true, scene, [camera]);
  pipeline.fxaaEnabled = true;
  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.65;
  pipeline.bloomKernel = 64;
  pipeline.bloomWeight = 0.35;
  pipeline.chromaticAberrationEnabled = true;
  pipeline.grainEnabled = true;
  pipeline.grain.animated = false;
  pipeline.grain.intensity = 4;
  scene.imageProcessingConfiguration.toneMappingEnabled = true;
  scene.imageProcessingConfiguration.exposure = 1.12;
  return {
    engine,
    render: (time, strength) => {
      seconds = time;
      animateLander(time);
      const frame = sampleFlight(time),
        effect = Math.max(0, Math.min(1, strength));
      camera.position.set(...frame.position);
      camera.setTarget(new Vector3(...frame.target));
      camera.fov = frame.fov;
      camera.rotation.z = Math.sin(time * 0.18) * 0.025 * effect;
      globe.setEnabled(time < 18 || time > 49);
      ground.setEnabled(time > 8 && time < 58);
      pipeline.bloomWeight = 0.15 + effect * 0.4;
      pipeline.chromaticAberration.aberrationAmount = effect * (time > 32 && time < 42 ? 7 : 1.3);
      pipeline.grain.intensity = effect * 6;
      plumes.setParticles();
      ice.setParticles();
      scene.render();
    },
    dispose: () => {
      scene.dispose();
      engine.dispose();
    },
  };
}
