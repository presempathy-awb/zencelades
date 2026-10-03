import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { MovementRoutinePose } from "./movement-routines";

const FACE_RECT = { x: 467, y: 124, width: 108, height: 78 } as const;
const PORTRAIT_SIZE = { width: 1280, height: 951 } as const;

export interface SquishAvatar {
  root: TransformNode;
  meshes: readonly Mesh[];
  update: (
    seconds: number,
    motion: number,
    motionX: number,
    effects: number,
    visible?: boolean,
    pose?: MovementRoutinePose,
  ) => void;
}

function bounded(value: number, minimum: number, maximum: number, fallback = 0): number {
  return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : fallback));
}

function material(scene: Scene, name: string, color: string): StandardMaterial {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = Color3.FromHexString(color);
  value.specularColor = new Color3(0.08, 0.08, 0.08);
  return value;
}

function curvedPortrait(scene: Scene, texture: BaseTexture | undefined): Mesh {
  const columns = 12;
  const rows = 8;
  const positions: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];
  const left = FACE_RECT.x / PORTRAIT_SIZE.width;
  const right = (FACE_RECT.x + FACE_RECT.width) / PORTRAIT_SIZE.width;
  const bottom = 1 - (FACE_RECT.y + FACE_RECT.height) / PORTRAIT_SIZE.height;
  const top = 1 - FACE_RECT.y / PORTRAIT_SIZE.height;
  for (let row = 0; row <= rows; row += 1) {
    const vertical = row / rows;
    const y = (vertical - 0.5) * 0.21;
    for (let column = 0; column <= columns; column += 1) {
      const horizontal = column / columns;
      const x = (horizontal - 0.5) * 0.2;
      const normalizedX = x / 0.1;
      const normalizedY = y / 0.105;
      const curve = Math.max(0, 1 - normalizedX ** 2 - normalizedY ** 2);
      positions.push(x, y, 0.137 + curve * 0.014);
      uvs.push(left + (right - left) * horizontal, bottom + (top - bottom) * vertical);
    }
  }
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const first = row * (columns + 1) + column;
      const next = first + columns + 1;
      indices.push(first, next, first + 1, first + 1, next, next + 1);
    }
  }
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  const data = new VertexData();
  data.positions = positions;
  data.indices = indices;
  data.normals = normals;
  data.uvs = uvs;
  const face = new Mesh("squish avatar portrait face", scene);
  data.applyToMesh(face);
  const faceMaterial = material(scene, "squish avatar portrait material", "#b67f69");
  faceMaterial.diffuseTexture = texture ?? null;
  faceMaterial.emissiveTexture = texture ?? null;
  faceMaterial.emissiveColor = new Color3(0.12, 0.09, 0.08);
  faceMaterial.backFaceCulling = false;
  face.material = faceMaterial;
  return face;
}

/** Build a compact seated portrait avatar whose animated geometry remains inside the zorb. */
export function createSquishAvatar(
  scene: Scene,
  center: Vector3,
  innerRadius: number,
  portraitTexture?: BaseTexture,
): SquishAvatar {
  if (!Number.isFinite(innerRadius) || innerRadius < 0.7)
    throw new Error("The squish avatar needs at least a 0.7 m spherical inner radius.");
  const root = new TransformNode("squish avatar root", scene);
  root.position.copyFrom(center);
  const poseRoot = new TransformNode("squish avatar seated pose", scene);
  poseRoot.parent = root;
  poseRoot.position.y = -0.14;
  const torsoRoot = new TransformNode("squish avatar breathing root", scene);
  torsoRoot.parent = poseRoot;
  const headRoot = new TransformNode("squish avatar head joint", scene);
  headRoot.parent = torsoRoot;
  headRoot.position.set(0, 0.39, 0.01);
  const armRoots: TransformNode[] = [];
  const legRoots: TransformNode[] = [];
  const kneeRoots: TransformNode[] = [];
  const meshes: Mesh[] = [];
  const skin = material(scene, "squish avatar skin", "#b97d67");
  const hair = material(scene, "squish avatar hair", "#1b1214");
  const shorts = material(scene, "squish avatar dark navy shorts", "#101b35");
  const glasses = material(scene, "squish avatar glasses", "#111318");
  const topperMaterial = material(scene, "squish avatar futon topper material", "#7896a5");
  topperMaterial.specularColor.set(0.025, 0.025, 0.025);

  const finish = (
    mesh: Mesh,
    parent: TransformNode,
    position: readonly [number, number, number],
    meshMaterial: StandardMaterial,
  ): Mesh => {
    mesh.parent = parent;
    mesh.position.set(...position);
    mesh.material = meshMaterial;
    mesh.isPickable = false;
    meshes.push(mesh);
    return mesh;
  };
  const sphere = (
    name: string,
    diameters: readonly [number, number, number],
    position: readonly [number, number, number],
    meshMaterial: StandardMaterial,
    parent = poseRoot,
  ): Mesh =>
    finish(
      MeshBuilder.CreateSphere(
        name,
        {
          segments: 18,
          diameterX: diameters[0],
          diameterY: diameters[1],
          diameterZ: diameters[2],
        },
        scene,
      ),
      parent,
      position,
      meshMaterial,
    );
  const limb = (
    name: string,
    from: Vector3,
    to: Vector3,
    diameter: number,
    meshMaterial: StandardMaterial,
    parent = poseRoot,
  ): Mesh => {
    const direction = to.subtract(from);
    const mesh = finish(
      MeshBuilder.CreateCylinder(
        name,
        { height: direction.length(), diameter, tessellation: 18 },
        scene,
      ),
      parent,
      from.add(to).scale(0.5).asArray() as [number, number, number],
      meshMaterial,
    );
    mesh.rotationQuaternion = Quaternion.FromUnitVectorsToRef(
      Vector3.Up(),
      direction.normalize(),
      new Quaternion(),
    );
    return mesh;
  };

  const topperSegments = 48;
  const topperRings = 24;
  const topperShellRadius = innerRadius * 0.99;
  const topperRadius = innerRadius * 0.86;
  const floorBottom = -innerRadius + 0.09;
  const topperTop = -innerRadius * 0.62;
  const topperPositions = [0, topperTop, 0];
  const topperIndices: number[] = [];
  for (let ring = 0; ring < topperRings; ring++) {
    for (let segment = 0; segment < topperSegments; segment++) {
      const angle = (segment / topperSegments) * Math.PI * 2;
      let y: number;
      let radius: number;
      if (ring < topperRings / 2) {
        const progress = (ring + 1) / (topperRings / 2);
        // A low floor pad: a broad flat center and only the floor's gentle edge curve.
        y = topperTop + innerRadius * 0.16 * progress ** 4;
        radius = topperRadius * progress;
      } else {
        // Rest on the imported compliant floor (grant_3d_models.py), including its shell clip.
        const progress = (ring - topperRings / 2) / (topperRings / 2);
        radius = topperRadius * (1 - progress);
        const floorProgress = radius / 0.72;
        y = floorBottom + 0.28 * floorProgress ** 2 + 0.018 * Math.sin(6 * angle) * floorProgress;
        const shellFit = Math.min(1, topperShellRadius / Math.hypot(radius, y));
        radius *= shellFit;
        y *= shellFit;
      }
      topperPositions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    }
  }
  for (let segment = 0; segment < topperSegments; segment++) {
    const current = 1 + segment;
    const next = 1 + ((segment + 1) % topperSegments);
    // Seating faces up; the continuous outer shell faces away from the padding.
    topperIndices.push(0, current, next);
  }
  for (let ring = 0; ring < topperRings - 1; ring++) {
    const upper = 1 + ring * topperSegments;
    const lower = upper + topperSegments;
    for (let segment = 0; segment < topperSegments; segment++) {
      const next = (segment + 1) % topperSegments;
      topperIndices.push(
        upper + segment,
        lower + segment,
        upper + next,
        upper + next,
        lower + segment,
        lower + next,
      );
    }
  }
  const topperBottom = topperPositions.length / 3;
  topperPositions.push(0, floorBottom, 0);
  const lastRing = 1 + (topperRings - 1) * topperSegments;
  for (let segment = 0; segment < topperSegments; segment++) {
    topperIndices.push(
      lastRing + segment,
      topperBottom,
      lastRing + ((segment + 1) % topperSegments),
    );
  }
  const topperNormals: number[] = [];
  VertexData.ComputeNormals(topperPositions, topperIndices, topperNormals);
  const topperData = new VertexData();
  topperData.positions = topperPositions;
  topperData.indices = topperIndices;
  topperData.normals = topperNormals;
  const topper = new Mesh("squish avatar circular futon topper", scene);
  topperData.applyToMesh(topper);
  topper.position.copyFrom(center);
  topper.material = topperMaterial;
  topper.isPickable = false;
  meshes.push(topper);

  sphere("squish avatar shorts", [0.47, 0.27, 0.31], [0, -0.22, 0.02], shorts);
  sphere("squish avatar soft belly", [0.43, 0.27, 0.31], [0, -0.1, 0.015], skin, torsoRoot);
  sphere("squish avatar broad torso", [0.48, 0.48, 0.29], [0, 0.04, 0], skin, torsoRoot);
  sphere("squish avatar upper chest", [0.5, 0.26, 0.3], [0, 0.14, 0], skin, torsoRoot);
  sphere("squish avatar neck", [0.14, 0.16, 0.13], [0, 0.28, 0], skin, torsoRoot);
  sphere("squish avatar head", [0.28, 0.31, 0.27], [0, 0, 0], skin, headRoot);
  sphere("squish avatar curls", [0.31, 0.18, 0.28], [0, 0.11, -0.02], hair, headRoot);
  sphere("squish avatar beard", [0.24, 0.15, 0.07], [0, -0.07, 0.12], hair, headRoot);
  for (const [index, position] of [
    [-0.105, 0.1, 0.035],
    [0.105, 0.1, 0.035],
    [-0.07, 0.165, -0.005],
    [0.07, 0.165, -0.005],
    [0, 0.18, 0.015],
  ].entries()) {
    sphere(
      `squish avatar curl detail ${index + 1}`,
      [0.09, 0.085, 0.085],
      position as [number, number, number],
      hair,
      headRoot,
    );
  }

  const face = curvedPortrait(scene, portraitTexture);
  face.parent = headRoot;
  face.position.set(0, 0.01, -0.01);
  face.isPickable = false;
  meshes.push(face);

  for (const side of [-1, 1] as const) {
    const armRoot = new TransformNode(`squish avatar arm joint ${side}`, scene);
    armRoot.parent = torsoRoot;
    armRoot.position.set(side * 0.19, 0.13, 0);
    armRoots.push(armRoot);
    sphere(`squish avatar shoulder ${side}`, [0.15, 0.15, 0.14], [0, 0, 0], skin, armRoot);
    limb(
      `squish avatar upper arm ${side}`,
      Vector3.Zero(),
      new Vector3(side * 0.08, -0.21, 0.13),
      0.11,
      skin,
      armRoot,
    );
    sphere(
      `squish avatar elbow ${side}`,
      [0.12, 0.12, 0.12],
      [side * 0.08, -0.21, 0.13],
      skin,
      armRoot,
    );
    limb(
      `squish avatar forearm ${side}`,
      new Vector3(side * 0.08, -0.21, 0.13),
      new Vector3(side * 0.01, -0.39, 0.3),
      0.1,
      skin,
      armRoot,
    );
    sphere(
      `squish avatar hand ${side}`,
      [0.13, 0.105, 0.15],
      [side * 0.01, -0.39, 0.3],
      skin,
      armRoot,
    );
    sphere(
      `squish avatar thumb ${side}`,
      [0.055, 0.07, 0.065],
      [side * 0.055, -0.375, 0.335],
      skin,
      armRoot,
    );
    const hipRoot = new TransformNode(`squish avatar hip joint ${side}`, scene);
    hipRoot.parent = poseRoot;
    hipRoot.position.set(side * 0.13, -0.22, 0.02);
    legRoots.push(hipRoot);
    const knee = new Vector3(side * 0.14, -0.14, 0.29);
    limb(`squish avatar short leg ${side}`, Vector3.Zero(), knee, 0.17, shorts, hipRoot);
    sphere(
      `squish avatar knee ${side}`,
      [0.18, 0.16, 0.18],
      knee.asArray() as [number, number, number],
      skin,
      hipRoot,
    );
    const kneeRoot = new TransformNode(`squish avatar knee joint ${side}`, scene);
    kneeRoot.parent = hipRoot;
    kneeRoot.position.copyFrom(knee);
    kneeRoots.push(kneeRoot);
    const ankle = new Vector3(side * -0.04, -0.14, -0.17);
    limb(`squish avatar shin ${side}`, Vector3.Zero(), ankle, 0.13, skin, kneeRoot);
    sphere(
      `squish avatar ankle ${side}`,
      [0.13, 0.12, 0.13],
      ankle.asArray() as [number, number, number],
      skin,
      kneeRoot,
    );
    sphere(
      `squish avatar foot ${side}`,
      [0.16, 0.105, 0.25],
      [side * -0.04, -0.14, -0.11],
      skin,
      kneeRoot,
    );
    const lens = finish(
      MeshBuilder.CreateTorus(
        `squish avatar glasses lens ${side}`,
        { diameter: 0.105, thickness: 0.009, tessellation: 20 },
        scene,
      ),
      headRoot,
      [side * 0.057, 0.03, 0.135],
      glasses,
    );
    lens.rotation.x = Math.PI / 2;
    finish(
      MeshBuilder.CreateBox(
        `squish avatar glasses temple ${side}`,
        { width: 0.009, height: 0.009, depth: 0.13 },
        scene,
      ),
      headRoot,
      [side * 0.105, 0.03, 0.085],
      glasses,
    );
  }
  finish(
    MeshBuilder.CreateBox(
      "squish avatar glasses bridge",
      { width: 0.035, height: 0.008, depth: 0.009 },
      scene,
    ),
    headRoot,
    [0, 0.03, 0.138],
    glasses,
  );

  let lastUpdateSeconds: number | undefined;
  let torsoLean = 0;
  let torsoVelocity = 0;
  let headLean = 0;
  let headVelocity = 0;
  let armLean = 0;
  let armVelocity = 0;

  return {
    root,
    meshes,
    update: (seconds, motionValue, motionXValue, effectsValue, visible = true, pose) => {
      if (scene.isDisposed) return;
      root.setEnabled(visible);
      const effects = bounded(effectsValue, 0, 1);
      if (effects === 0) {
        lastUpdateSeconds = Number.isFinite(seconds) ? seconds : undefined;
        torsoLean = 0;
        torsoVelocity = 0;
        headLean = 0;
        headVelocity = 0;
        armLean = 0;
        armVelocity = 0;
        torsoRoot.scaling.set(1, 1, 1);
        torsoRoot.position.set(0, 0, 0);
        torsoRoot.rotation.set(0, 0, 0);
        headRoot.rotation.set(0, 0, 0);
        armRoots[0].rotation.set(0, 0, 0);
        armRoots[1].rotation.set(0, 0, 0);
        poseRoot.position.set(0, -0.14, 0);
        poseRoot.rotation.set(0, 0, 0);
        legRoots[0].rotation.set(0, 0, 0);
        legRoots[1].rotation.set(0, 0, 0);
        kneeRoots[0].rotation.set(0, 0, 0);
        kneeRoots[1].rotation.set(0, 0, 0);
        return;
      }
      const secondsSafe = Number.isFinite(seconds) ? seconds : (lastUpdateSeconds ?? 0);
      const motion = bounded(motionValue, 0, 1);
      const motionX = bounded(motionXValue, -1, 1);
      const elapsed = lastUpdateSeconds === undefined ? 1 / 60 : secondsSafe - lastUpdateSeconds;
      const delta = elapsed > 0 && elapsed <= 0.05 ? elapsed : 1 / 60;
      lastUpdateSeconds = secondsSafe;
      const idleLean = Math.sin(secondsSafe * 0.52) * 0.009 * effects;
      const energyLean = Math.sin(secondsSafe * 2.35) * motion * effects * 0.018;
      const targetLean = idleLean + energyLean + motionX * motion * effects * 0.055;
      torsoVelocity += (targetLean - torsoLean) * 24 * delta;
      torsoVelocity *= Math.exp(-7 * delta);
      torsoLean += torsoVelocity * delta;
      headVelocity += (-torsoLean * 0.72 - headLean) * 17 * delta;
      headVelocity *= Math.exp(-5.5 * delta);
      headLean += headVelocity * delta;
      armVelocity += (-torsoLean * 1.35 - armLean) * 14 * delta;
      armVelocity *= Math.exp(-4.8 * delta);
      armLean += armVelocity * delta;
      const torsoPitch = bounded(pose?.torsoPitch ?? 0, -0.24, 0.24) * effects;
      const torsoYaw = bounded(pose?.torsoYaw ?? 0, -0.18, 0.18) * effects;
      const torsoRoll = bounded(pose?.torsoRoll ?? 0, -0.12, 0.12) * effects;
      const headPitch = bounded(pose?.headPitch ?? 0, -0.16, 0.16) * effects;
      const headYaw = bounded(pose?.headYaw ?? 0, -0.28, 0.28) * effects;
      const armLift = bounded(pose?.armLift ?? 0, 0, 0.8) * effects;
      const armReach = bounded(pose?.armReach ?? 0, 0, 0.65) * effects;
      const hipTuck = bounded(pose?.hipTuck ?? 0, 0, 0.36) * effects;
      const kneeBend = bounded(pose?.kneeBend ?? 0, 0, 0.5) * effects;
      const bodyLift = bounded(pose?.bodyLift ?? 0, -0.1, 0.06) * effects;
      const breath = Math.sin(secondsSafe * 1.45) * 0.018 * effects;
      const response = Math.sin(secondsSafe * 2.1) * motion * 0.012 * effects;
      poseRoot.position.set(0, -0.14 + bodyLift, 0);
      poseRoot.rotation.set(0, 0, 0);
      torsoRoot.scaling.set(1 - breath * 0.45, 1 + breath, 1 - breath * 0.25);
      torsoRoot.position.set(0, -Math.abs(response) * 0.25, response * 0.35);
      torsoRoot.rotation.set(
        response * 0.25 + torsoPitch,
        torsoLean * 0.35 + torsoYaw,
        -torsoLean + torsoRoll,
      );
      headRoot.rotation.set(headLean * 0.18 + headPitch, headYaw, headLean);
      armRoots[0].rotation.set(
        Math.abs(armLean) * 0.35 - armReach * 0.35,
        0,
        armLean * 0.72 + armLift * 0.55,
      );
      armRoots[1].rotation.set(
        Math.abs(armLean) * 0.3 - armReach * 0.55,
        0,
        -armLean * 0.58 - armLift * 0.55,
      );
      legRoots[0].rotation.set(-hipTuck * 0.55, 0, 0);
      legRoots[1].rotation.set(-hipTuck * 0.55, 0, 0);
      kneeRoots[0].rotation.set(kneeBend * 0.68, 0, 0);
      kneeRoots[1].rotation.set(kneeBend * 0.68, 0, 0);
    },
  };
}
