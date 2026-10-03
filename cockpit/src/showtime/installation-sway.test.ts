import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { LoadAssetContainerAsync } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/core/Materials/standardMaterial";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import { createInstallationSway } from "./installation-sway";

const aerialPath = new URL(
  "../../../deliveries/grant-3d-p059/zencelades-2p5m-suspended.glb",
  import.meta.url,
);

function expectSamePoint(actual: Vector3, expected: Vector3): void {
  expect(Vector3.Distance(actual, expected)).toBeLessThan(0.00001);
}

function worldPoint(mesh: TransformNode, local: Vector3): Vector3 {
  return Vector3.TransformCoordinates(local, mesh.computeWorldMatrix(true));
}

function createFixture(scene: Scene): Mesh[] {
  const fixture = [
    new Mesh("Halyard route - unselected", scene),
    new Mesh("Outer wall - front panel removed for drawing", scene),
    new Mesh("Illustrative host crossbar", scene),
    new Mesh("Owned external hazer body - provisional envelope", scene),
  ];
  for (const mesh of fixture) {
    const data = new VertexData();
    data.positions = [0, 3.53, 0, 0, 4.8, 0, 0.01, 3.53, 0.01];
    data.indices = [0, 1, 2];
    data.applyToMesh(mesh);
  }
  return fixture;
}

test("the actual aerial bowl sways rigidly about its halyard attachment while the host and hazer stay fixed", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  try {
    const container = await LoadAssetContainerAsync(await readFile(aerialPath), scene, {
      pluginExtension: ".glb",
    });
    container.addAllToScene();
    const find = (name: string): Mesh => {
      const mesh = container.meshes.find((candidate) => candidate.name === name);
      if (!(mesh instanceof Mesh)) throw new Error(`Missing actual aerial mesh: ${name}`);
      return mesh;
    };
    const wall = find("Outer wall - front panel removed for drawing");
    const halyard = find("Halyard route - unselected");
    const host = find("Illustrative host crossbar");
    const hazer = find("Owned external hazer body - provisional envelope");
    const originalHostParent = host.parent;
    const originalHazerParent = hazer.parent;
    const rest = new Vector3(0, 1.7, 0);
    const pivot = new Vector3(0, 4.8, 0);
    const wallRest = worldPoint(wall, rest);
    const hostRest = host.computeWorldMatrix(true).clone();
    const hazerRest = hazer.computeWorldMatrix(true).clone();
    const sway = createInstallationSway(scene, container.meshes, rest);

    expect(sway.matrix.isIdentity()).toBe(true);
    expectSamePoint(worldPoint(wall, rest), wallRest);
    const movable = [
      wall,
      halyard,
      find("Over-sphere webbing 1 - illustrative width"),
      find("Top collector ring - unselected"),
      find("Swivel envelope - unselected"),
      find("Projector head 1 - device unselected"),
      find("Projector lens 1"),
      find("Two-metre optical arm 1"),
      find("Proposed arm stay 1"),
      find("Ventilated rain canopy 1"),
      find("Compliant floor - illustrative local deformation"),
    ];
    for (const mesh of movable) expect(mesh.parent === sway.root).toBe(true);

    for (let frame = 0; frame <= 120; frame++) {
      sway.update(frame / 60, 1, 1, 1, true);
    }
    expect(sway.matrix.isIdentity()).toBe(false);
    expect(Vector3.Distance(worldPoint(wall, rest), wallRest)).toBeGreaterThan(0.02);
    expectSamePoint(Vector3.TransformCoordinates(pivot, sway.matrix), pivot);
    expectSamePoint(worldPoint(wall, rest), Vector3.TransformCoordinates(wallRest, sway.matrix));
    expect(host.parent === originalHostParent).toBe(true);
    expect(hazer.parent === originalHazerParent).toBe(true);
    expect(host.computeWorldMatrix(true).equalsWithEpsilon(hostRest, 0.000001)).toBe(true);
    expect(hazer.computeWorldMatrix(true).equalsWithEpsilon(hazerRest, 0.000001)).toBe(true);

    const pointA = new Vector3(1.25, 1.7, 0);
    const pointB = new Vector3(-1.25, 1.7, 0);
    expect(
      Vector3.Distance(
        Vector3.TransformCoordinates(pointA, sway.matrix),
        Vector3.TransformCoordinates(pointB, sway.matrix),
      ),
    ).toBeCloseTo(2.5, 6);
    expect(sway.root.scaling.asArray()).toEqual([1, 1, 1]);
    sway.reset();
    expect(sway.matrix.isIdentity()).toBe(true);
    expectSamePoint(worldPoint(wall, rest), wallRest);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("sway is deterministic, bounded, settles with motion, and resets for Ground or zero Effects", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const first = createInstallationSway(scene, createFixture(scene), new Vector3(0, 1.7, 0));
    const second = createInstallationSway(scene, createFixture(scene), new Vector3(0, 1.7, 0));
    const matrix = first.matrix;
    // Shared overlays retain their world position when attached to the resting pivot.
    const overlay = new TransformNode("shared avatar", scene);
    overlay.position.set(0, 1.7, 0);
    overlay.setParent(first.root, true);
    expectSamePoint(worldPoint(overlay, Vector3.Zero()), new Vector3(0, 1.7, 0));
    for (let frame = 0; frame <= 180; frame++) {
      const seconds = frame / 60;
      first.update(seconds, 20, 20, 20, true);
      second.update(seconds, 20, 20, 20, true);
      expect(first.matrix.equalsWithEpsilon(second.matrix, 0.000001)).toBe(true);
      const restUp = new Vector3(0, 1, 0);
      const swayUp = Vector3.TransformNormal(restUp, first.matrix);
      const angle = Math.acos(Math.max(-1, Math.min(1, Vector3.Dot(restUp, swayUp))));
      expect(angle).toBeLessThanOrEqual(0.03501);
    }
    expect(first.matrix).toBe(matrix);
    expect(
      Vector3.Distance(worldPoint(overlay, Vector3.Zero()), new Vector3(0, 1.7, 0)),
    ).toBeGreaterThan(0.02);
    for (let frame = 181; frame <= 540; frame++) {
      first.update(frame / 60, 0, 0, 1, true);
    }
    expect(first.matrix.equalsWithEpsilon(Matrix.Identity(), 0.000001)).toBe(true);
    first.update(10, 1, 1, 1, true);
    expect(first.matrix.isIdentity()).toBe(false);
    first.update(10.02, 1, 1, 0, true);
    expect(first.matrix.isIdentity()).toBe(true);
    expectSamePoint(worldPoint(overlay, Vector3.Zero()), new Vector3(0, 1.7, 0));
    first.update(10.03, 1, 1, 1, true);
    first.update(10.04, 1, 1, 1, false);
    expect(first.matrix.isIdentity()).toBe(true);
    first.update(Number.NaN, Number.NaN, Number.NaN, Number.NaN, true);
    expect(first.matrix.isIdentity()).toBe(true);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});
