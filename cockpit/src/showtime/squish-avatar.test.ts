import { expect, test } from "bun:test";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { VertexBuffer } from "@babylonjs/core/Meshes/buffer";
import { Scene } from "@babylonjs/core/scene";
import { routinePoseAt } from "./movement-routines";
import { createSquishAvatar } from "./squish-avatar";

const center = new Vector3(0, 1.7, 0);
const innerRadius = 0.833333313;

function worldVertices(scene: Scene): Vector3[] {
  return scene.meshes.flatMap((mesh) => {
    const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
    if (!positions) return [];
    const world = mesh.computeWorldMatrix(true);
    const vertices: Vector3[] = [];
    for (let index = 0; index < positions.length; index += 3) {
      vertices.push(Vector3.TransformCoordinates(Vector3.FromArray(positions, index), world));
    }
    return vertices;
  });
}

function transforms(scene: Scene): number[][] {
  return scene.transformNodes
    .concat(scene.meshes)
    .map((node) => [
      ...node.position.asArray(),
      ...node.rotation.asArray(),
      ...node.scaling.asArray(),
    ]);
}

test("the seated squish avatar stays completely inside the spherical chamber", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const avatar = createSquishAvatar(scene, center, innerRadius);
    expect(avatar.meshes.length).toBeGreaterThan(8);
    expect(avatar.meshes.every((mesh) => !/participant/i.test(mesh.name))).toBe(true);
    expect(avatar.root.position).toEqual(center);
    const lowestVertex = Math.min(...worldVertices(scene).map((vertex) => vertex.y - center.y));
    expect(lowestVertex).toBeLessThan(-0.67);
    expect(lowestVertex).toBeGreaterThan(-innerRadius);
    for (const hand of avatar.meshes.filter((mesh) => /hand/.test(mesh.name))) {
      expect(hand.parent?.name).toMatch(/^squish avatar arm joint (-1|1)$/);
    }
    const topper = avatar.meshes.find(
      (mesh) => mesh.name === "squish avatar circular futon topper",
    );
    if (!topper) throw new Error("Expected a chamber-filling circular futon topper.");
    const topperPositions = topper.getVerticesData(VertexBuffer.PositionKind);
    if (!topperPositions) throw new Error("Expected futon topper geometry.");
    const topperWorld = topper.computeWorldMatrix(true);
    const topperVertices: Vector3[] = [];
    for (let index = 0; index < topperPositions.length; index += 3) {
      topperVertices.push(
        Vector3.TransformCoordinates(Vector3.FromArray(topperPositions, index), topperWorld),
      );
    }
    const topperTop = Math.max(...topperVertices.map((vertex) => vertex.y - center.y));
    const topperBottom = Math.min(...topperVertices.map((vertex) => vertex.y - center.y));
    const local = topperVertices.map((vertex) => vertex.subtract(center));
    // Cover the floor in every direction without chair sides or a raised back.
    for (const direction of [
      new Vector3(1, 0, 0),
      new Vector3(-1, 0, 0),
      new Vector3(0, 0, -1),
      new Vector3(0, 0, 1),
    ]) {
      expect(Math.max(...local.map((vertex) => Vector3.Dot(vertex, direction)))).toBeGreaterThan(
        innerRadius * 0.8,
      );
    }
    expect(topperTop).toBeLessThanOrEqual(-innerRadius * 0.45);
    const middle = local.filter((vertex) => Math.hypot(vertex.x, vertex.z) < innerRadius * 0.2);
    expect(Math.max(...middle.map((vertex) => vertex.y))).toBeLessThan(-innerRadius * 0.6);
    const entrance = local.filter(
      (vertex) => vertex.z > innerRadius * 0.7 && Math.abs(vertex.x) < innerRadius * 0.1,
    );
    expect(entrance.length).toBeGreaterThan(0);
    expect(Math.max(...entrance.map((vertex) => vertex.y))).toBeLessThan(-innerRadius * 0.45);
    // The imported compliant floor sits about 9 cm above the chamber's bottom.
    expect(topperBottom).toBeCloseTo(-innerRadius + 0.09, 2);
    const normals = topper.getVerticesData(VertexBuffer.NormalKind);
    if (!normals) throw new Error("Expected padded seat surface normals.");
    for (const [index, vertex] of local.entries()) {
      if (Math.hypot(vertex.x, vertex.z) < innerRadius * 0.2 && vertex.y > -innerRadius * 0.7)
        expect(normals[index * 3 + 1]).toBeGreaterThan(0.95);
      if (vertex.y < -innerRadius * 0.87) expect(normals[index * 3 + 1]).toBeLessThan(-0.9);
    }
    expect(
      topperVertices.every((vertex) => vertex.subtract(center).length() <= innerRadius + 1e-6),
    ).toBe(true);

    for (const frame of [
      [0, 0, 0, 0],
      [2.5, 1, -1, 1],
      [9, 1, 1, 1],
      [-1000, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 99],
    ] as const) {
      avatar.update(frame[0], frame[1], frame[2], frame[3]);
      const vertices = worldVertices(scene);
      expect(vertices.length).toBeGreaterThan(500);
      expect(vertices.flatMap((vertex) => vertex.asArray()).every(Number.isFinite)).toBe(true);
      const furthestVertex = Math.max(
        ...vertices.map((vertex) => vertex.subtract(center).length()),
      );
      expect(furthestVertex).toBeLessThanOrEqual(innerRadius + 1e-6);
    }
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("motion gently deforms the body while reduced effects remain stationary", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const avatar = createSquishAvatar(scene, center, innerRadius);
    avatar.update(0, 1, 0.8, 0);
    const reduced = transforms(scene);
    avatar.update(400, -5, -8, 0);
    expect(transforms(scene)).toEqual(reduced);

    avatar.update(0, 0.7, 0.6, 1);
    const moving = transforms(scene);
    avatar.update(1.25, 0.7, 0.6, 1);
    expect(transforms(scene)).not.toEqual(moving);

    avatar.update(Number.NaN, Number.POSITIVE_INFINITY, Number.NaN, 20);
    expect(transforms(scene).flat().every(Number.isFinite)).toBe(true);
    expect(avatar.meshes.every((mesh) => mesh.isEnabled())).toBe(true);
    avatar.update(2, 1, 1, 1, false);
    const topper = avatar.meshes.find((mesh) => mesh.name.includes("futon topper"));
    if (!topper) throw new Error("Expected the physical futon topper.");
    expect(topper.isEnabled()).toBe(true);
    expect(avatar.meshes.filter((mesh) => mesh !== topper).every((mesh) => !mesh.isEnabled())).toBe(
      true,
    );
    scene.dispose();
    expect(scene.meshes).toEqual([]);
    expect(scene.materials).toEqual([]);
    expect(() => avatar.update(3, 1, 1, 1)).not.toThrow();
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("rounded anatomy covers the articulated joints and keeps the portrait lit", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const portrait = new Texture(null, scene);
    const avatar = createSquishAvatar(scene, center, innerRadius, portrait);
    const roundedParts = [
      "squish avatar neck",
      "squish avatar shoulder -1",
      "squish avatar shoulder 1",
      "squish avatar elbow -1",
      "squish avatar elbow 1",
      "squish avatar knee -1",
      "squish avatar knee 1",
      "squish avatar ankle -1",
      "squish avatar ankle 1",
    ].map((name) => avatar.meshes.find((mesh) => mesh.name === name));
    expect(roundedParts.every(Boolean)).toBe(true);
    let furthestRoundedVertex = 0;
    for (const part of roundedParts) {
      if (!part) throw new Error("Expected every rounded articulation mesh.");
      const positions = part.getVerticesData(VertexBuffer.PositionKind);
      if (!positions) throw new Error("Expected rounded articulation geometry.");
      expect(positions.length).toBeGreaterThan(100);
      const world = part.computeWorldMatrix(true);
      for (let index = 0; index < positions.length; index += 3) {
        const vertex = Vector3.TransformCoordinates(Vector3.FromArray(positions, index), world);
        furthestRoundedVertex = Math.max(furthestRoundedVertex, vertex.subtract(center).length());
      }
    }
    expect(Number.isFinite(furthestRoundedVertex)).toBe(true);
    expect(furthestRoundedVertex).toBeLessThanOrEqual(innerRadius + 1e-6);
    expect(
      avatar.meshes.filter((mesh) => mesh.name.includes("curl detail")).length,
    ).toBeGreaterThanOrEqual(5);
    expect(avatar.meshes.filter((mesh) => mesh.name.includes("glasses temple")).length).toBe(2);
    const face = avatar.meshes.find((mesh) => mesh.name === "squish avatar portrait face");
    if (!(face?.material instanceof StandardMaterial))
      throw new Error("Expected the portrait material.");
    expect(face.material.diffuseTexture).toBe(portrait);
    expect(face.material.emissiveTexture).toBe(portrait);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("the reference portrait has a very small articulated idle sway", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const avatar = createSquishAvatar(scene, center, innerRadius);
    const torso = scene.getTransformNodeByName("squish avatar breathing root");
    const head = scene.getTransformNodeByName("squish avatar head joint");
    const leftArm = scene.getTransformNodeByName("squish avatar arm joint -1");
    if (!torso || !head || !leftArm) throw new Error("Expected articulated idle joints.");
    avatar.update(0, 0, 0, 1);
    const initial = [torso.rotation.z, head.rotation.z, leftArm.rotation.z];
    for (let frame = 1; frame <= 120; frame++) avatar.update(frame / 60, 0, 0, 1);
    const idle = [torso.rotation.z, head.rotation.z, leftArm.rotation.z];
    expect(idle).not.toEqual(initial);
    expect(Math.max(...idle.map(Math.abs))).toBeGreaterThan(0.001);
    expect(Math.max(...idle.map(Math.abs))).toBeLessThan(0.02);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("centered movement drives the articulated pose beyond its idle sway", () => {
  const engine = new NullEngine();
  const idleScene = new Scene(engine);
  const movingScene = new Scene(engine);
  try {
    const idleAvatar = createSquishAvatar(idleScene, center, innerRadius);
    const movingAvatar = createSquishAvatar(movingScene, center, innerRadius);
    const idleHead = idleScene.getTransformNodeByName("squish avatar head joint");
    const idleArm = idleScene.getTransformNodeByName("squish avatar arm joint -1");
    const movingHead = movingScene.getTransformNodeByName("squish avatar head joint");
    const movingArm = movingScene.getTransformNodeByName("squish avatar arm joint -1");
    if (!idleHead || !idleArm || !movingHead || !movingArm)
      throw new Error("Expected articulated centered-motion joints.");

    let centeredDifference = 0;
    for (let frame = 0; frame <= 120; frame++) {
      idleAvatar.update(frame / 60, 0, 0, 1);
      movingAvatar.update(frame / 60, 1, 0, 1);
      centeredDifference = Math.max(
        centeredDifference,
        Math.abs(movingHead.rotation.z - idleHead.rotation.z) +
          Math.abs(movingArm.rotation.z - idleArm.rotation.z),
      );
    }
    expect(centeredDifference).toBeGreaterThan(0.003);
    const vertices = worldVertices(movingScene);
    expect(
      Math.max(...vertices.map((vertex) => vertex.subtract(center).length())),
    ).toBeLessThanOrEqual(innerRadius + 1e-6);

    for (let frame = 121; frame <= 481; frame++) {
      idleAvatar.update(frame / 60, 0, 0, 1);
      movingAvatar.update(frame / 60, 0, 0, 1);
    }
    expect(Math.abs(movingHead.rotation.z - idleHead.rotation.z)).toBeLessThan(0.001);
    expect(Math.abs(movingArm.rotation.z - idleArm.rotation.z)).toBeLessThan(0.001);
    movingAvatar.update(9, 1, 0, 0);
    expect(movingHead.rotation.asArray()).toEqual([0, 0, 0]);
    expect(movingArm.rotation.asArray()).toEqual([0, 0, 0]);
  } finally {
    idleScene.dispose();
    movingScene.dispose();
    engine.dispose();
  }
});

test("bounded routine poses articulate the seated body without leaving the chamber", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const avatar = createSquishAvatar(scene, center, innerRadius);
    const leftHip = scene.getTransformNodeByName("squish avatar hip joint -1");
    const leftKnee = scene.getTransformNodeByName("squish avatar knee joint -1");
    if (!leftHip || !leftKnee) throw new Error("Expected articulated routine leg joints.");
    const distinctTransforms = new Set<string>();
    let largestHipTuck = 0;
    let largestKneeBend = 0;
    let lastPose = routinePoseAt(0, 0);
    for (let routine = 0; routine < 6; routine++) {
      const seconds = routine * 8 + 4;
      lastPose = routinePoseAt(seconds, 0, lastPose);
      avatar.update(seconds, lastPose.motion, lastPose.motionX, 1, true, lastPose);
      distinctTransforms.add(JSON.stringify(transforms(scene)));
      largestHipTuck = Math.max(largestHipTuck, Math.abs(leftHip.rotation.x));
      largestKneeBend = Math.max(largestKneeBend, Math.abs(leftKnee.rotation.x));
      const vertices = worldVertices(scene);
      expect(
        Math.max(...vertices.map((vertex) => vertex.subtract(center).length())),
      ).toBeLessThanOrEqual(innerRadius + 1e-6);
    }
    expect(distinctTransforms.size).toBeGreaterThanOrEqual(5);
    expect(largestHipTuck).toBeGreaterThan(0.05);
    expect(largestKneeBend).toBeGreaterThan(0.1);
    avatar.update(49, 1, 1, 0, true, lastPose);
    expect(leftHip.rotation.asArray()).toEqual([0, 0, 0]);
    expect(leftKnee.rotation.asArray()).toEqual([0, 0, 0]);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("motion leaves a small articulated lag that settles after the impulse", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const baselineScene = new Scene(engine);
  try {
    const avatar = createSquishAvatar(scene, center, innerRadius);
    const baseline = createSquishAvatar(baselineScene, center, innerRadius);
    const torso = scene.getTransformNodeByName("squish avatar breathing root");
    const head = scene.getTransformNodeByName("squish avatar head joint");
    const leftArm = scene.getTransformNodeByName("squish avatar arm joint -1");
    const rightArm = scene.getTransformNodeByName("squish avatar arm joint 1");
    const baselineTorso = baselineScene.getTransformNodeByName("squish avatar breathing root");
    const baselineHead = baselineScene.getTransformNodeByName("squish avatar head joint");
    const baselineLeftArm = baselineScene.getTransformNodeByName("squish avatar arm joint -1");
    const baselineRightArm = baselineScene.getTransformNodeByName("squish avatar arm joint 1");
    if (
      !torso ||
      !head ||
      !leftArm ||
      !rightArm ||
      !baselineTorso ||
      !baselineHead ||
      !baselineLeftArm ||
      !baselineRightArm
    )
      throw new Error("Expected articulated torso, head and arm joints.");

    for (let frame = 0; frame < 12; frame++) {
      avatar.update(frame / 60, 1, 1, 1);
      baseline.update(frame / 60, 0, 0, 1);
    }
    const impulse = {
      torso: torso.rotation.z,
      head: head.rotation.z,
      leftArm: leftArm.rotation.z,
      rightArm: rightArm.rotation.z,
    };
    expect(Math.abs(impulse.torso)).toBeGreaterThan(0.001);
    expect(impulse.head).not.toBeCloseTo(impulse.torso, 5);
    expect(impulse.leftArm).not.toBeCloseTo(impulse.torso, 5);
    expect(impulse.rightArm).not.toBeCloseTo(impulse.leftArm, 5);

    avatar.update(12 / 60, 0, 0, 1);
    baseline.update(12 / 60, 0, 0, 1);
    const released =
      Math.abs(head.rotation.z - baselineHead.rotation.z) +
      Math.abs(leftArm.rotation.z - baselineLeftArm.rotation.z);
    expect(released).toBeGreaterThan(0.001);
    for (let frame = 13; frame < 373; frame++) {
      avatar.update(frame / 60, 0, 0, 1);
      baseline.update(frame / 60, 0, 0, 1);
    }
    expect(Math.abs(torso.rotation.z - baselineTorso.rotation.z)).toBeLessThan(0.001);
    expect(Math.abs(head.rotation.z - baselineHead.rotation.z)).toBeLessThan(0.001);
    expect(Math.abs(leftArm.rotation.z - baselineLeftArm.rotation.z)).toBeLessThan(0.001);
    expect(Math.abs(rightArm.rotation.z - baselineRightArm.rotation.z)).toBeLessThan(0.001);

    for (let frame = 373; frame < 493; frame++) {
      avatar.update(frame / 60, frame < 397 ? 1 : 0, -1, 1);
      const vertices = worldVertices(scene);
      expect(vertices.flatMap((vertex) => vertex.asArray()).every(Number.isFinite)).toBe(true);
      const furthestVertex = Math.max(
        ...vertices.map((vertex) => vertex.subtract(center).length()),
      );
      expect(furthestVertex).toBeLessThanOrEqual(innerRadius + 1e-6);
    }

    avatar.update(9, 1, 1, 0);
    expect(torso.rotation.asArray()).toEqual([0, 0, 0]);
    expect(head.rotation.asArray()).toEqual([0, 0, 0]);
    expect(leftArm.rotation.asArray()).toEqual([0, 0, 0]);
    expect(rightArm.rotation.asArray()).toEqual([0, 0, 0]);
  } finally {
    scene.dispose();
    baselineScene.dispose();
    engine.dispose();
  }
});

test("the curved face patch uses the supplied portrait texture without billboarding", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const portrait = new Texture(null, scene);
    const avatar = createSquishAvatar(scene, center, innerRadius, portrait);
    const face = avatar.meshes.find((mesh) => mesh.name === "squish avatar portrait face");
    if (!face) throw new Error("Expected the avatar portrait face patch.");
    if (!(face.material instanceof StandardMaterial))
      throw new Error("Expected the face patch material.");
    expect(face.material.diffuseTexture).toBe(portrait);
    expect(face.billboardMode).toBe(0);
    expect(face.parent?.name).toBe("squish avatar head joint");
    const positions = face.getVerticesData(VertexBuffer.PositionKind);
    if (!positions) throw new Error("Expected curved face vertices.");
    const depths = Array.from(
      { length: positions.length / 3 },
      (_, index) => positions[index * 3 + 2],
    );
    expect(Math.max(...depths) - Math.min(...depths)).toBeGreaterThan(0.005);
    const uvs = face.getVerticesData(VertexBuffer.UVKind);
    if (!uvs) throw new Error("Expected portrait crop UVs.");
    const horizontal = uvs.filter((_, index) => index % 2 === 0);
    const vertical = uvs.filter((_, index) => index % 2 === 1);
    expect(Math.min(...horizontal)).toBeCloseTo(467 / 1280, 8);
    expect(Math.max(...horizontal)).toBeCloseTo(575 / 1280, 8);
    expect(Math.min(...vertical)).toBeCloseTo(1 - 202 / 951, 8);
    expect(Math.max(...vertical)).toBeCloseTo(1 - 124 / 951, 8);
    expect(avatar.root.rotation.y).toBe(0);
    avatar.root.rotation.y = Math.PI;
    expect(avatar.root.rotation.y).toBe(Math.PI);
    scene.dispose();
    expect(scene.transformNodes).toEqual([]);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});
