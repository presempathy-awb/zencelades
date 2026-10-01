import { expect, test } from "bun:test";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { buildModel } from "./models/support-models";
import { MODEL_STUDIES } from "./models/model-spec";
import { baseline } from "./scenario";

test("sphere size changes shell, holder height and dimensions without scaling the participant", () => {
  const engine = new NullEngine();
  try {
    for (const id of ["seed-zorb", "basket-aerial-rig"]) {
      for (const diameter of [2.5, 3] as const) {
        const scene = new Scene(engine);
        try {
          const result = buildModel(scene, id, 1, diameter);
          const shell = scene.getMeshByName(`double-wall-cutaway-${diameter}`)!;
          expect(shell).not.toBeNull();
          shell.computeWorldMatrix(true);
          const bounds = shell.getBoundingInfo().boundingBox;
          expect(bounds.maximumWorld.y - bounds.minimumWorld.y).toBeCloseTo(diameter, 5);
          expect(result.dimensions[0].b[0] - result.dimensions[0].a[0]).toBe(diameter);
          expect(result.dimensions[0].label).toStartWith(`${diameter} m`);
          expect(result.root.metadata.sphereDiameter).toBe(diameter);
          const ring = scene.getMeshByName("seat-loop-nominal-six-foot-unrated")!;
          ring.computeWorldMatrix(true);
          expect(ring.getBoundingInfo().boundingBox.centerWorld.y).toBeCloseTo(
            diameter === 2.5 ? 0.847725021 : 0.510936234,
            4,
          );
          const torso = scene.getMeshByName("participant-torso-envelope")!;
          torso.computeWorldMatrix(true);
          const human = torso.getBoundingInfo().boundingBox;
          expect(human.maximumWorld.y - human.minimumWorld.y).toBeCloseTo(0.55, 5);
        } finally {
          scene.dispose();
        }
      }
    }
  } finally {
    engine.dispose();
  }
});

test("selected projector counts change holder heads, covers and stays without changing the frame", () => {
  const engine = new NullEngine();
  try {
    for (const id of ["seed-zorb", "basket-aerial-rig"]) {
      for (const projectors of [0, 1, 2, 3] as const) {
        const scene = new Scene(engine);
        try {
          buildModel(scene, id, projectors);
          expect(
            scene.meshes.filter((mesh) => mesh.name.startsWith("triangle-projector-head-")),
          ).toHaveLength(projectors);
          expect(
            scene.meshes.filter((mesh) => mesh.name.startsWith("arm-rain-cover-")),
          ).toHaveLength(projectors);
          expect(
            scene.meshes.filter((mesh) => mesh.name.startsWith("proposed-arm-stay-")),
          ).toHaveLength(id === "basket-aerial-rig" ? projectors : 0);
          expect(
            scene.meshes.filter((mesh) => mesh.name.startsWith("low-triangle-side-")),
          ).toHaveLength(3);
          expect(scene.getMeshByName("seat-loop-nominal-six-foot-unrated")).not.toBeNull();
        } finally {
          scene.dispose();
        }
      }
    }
  } finally {
    engine.dispose();
  }
});

test("landed and suspended holders carry three aimed projector heads and rain covers", () => {
  const engine = new NullEngine();
  try {
    for (const id of ["seed-zorb", "basket-aerial-rig", "basket-live-overlay"]) {
      const scene = new Scene(engine);
      try {
        buildModel(scene, id);
        expect(scene.getMeshByName("owned-external-hazer-provisional")!.position.z).toBeGreaterThan(
          0,
        );
        for (let index = 0; index < 3; index++) {
          const head = scene.getMeshByName(`triangle-projector-head-${index}`);
          expect(head).not.toBeNull();
          expect(scene.getMeshByName(`arm-rain-cover-${index}`)).not.toBeNull();
          head!.computeWorldMatrix(true);
          const forward = head!.getDirection(Vector3.Forward());
          const toward = head!.position.scale(-1);
          toward.y += 1.7;
          expect(forward.normalize().dot(toward.normalize())).toBeCloseTo(1, 5);
        }
        expect(scene.meshes.some((mesh) => mesh.name.startsWith("projector-mast-"))).toBe(false);
        const cameras = scene.meshes.filter((mesh) =>
          mesh.name.startsWith("inside-camera-witness-"),
        );
        expect(cameras).toHaveLength(id === "basket-live-overlay" ? 1 : 0);
      } finally {
        scene.dispose();
      }
    }
  } finally {
    engine.dispose();
  }
});

test("all budget concepts have usable finite geometry and preserve their selection", () => {
  const engine = new NullEngine();
  try {
    for (const study of MODEL_STUDIES) {
      const scene = new Scene(engine);
      const result = buildModel(scene, study.id);
      expect(result.root.getChildMeshes().length).toBeGreaterThan(0);
      const invalid = result.root
        .getChildMeshes()
        .filter((mesh) => {
          mesh.computeWorldMatrix(true);
          const bounds = mesh.getBoundingInfo().boundingBox;
          return (
            !mesh.getVerticesData("position")?.every(Number.isFinite) ||
            ![...bounds.minimumWorld.asArray(), ...bounds.maximumWorld.asArray()].every(
              Number.isFinite,
            )
          );
        })
        .map((mesh) => mesh.name);
      expect(invalid).toEqual([]);
      scene.dispose();
    }
    for (const option of baseline.options) {
      expect(
        MODEL_STUDIES.some((study) => study.id === option.id && study.budget === option.id),
      ).toBe(true);
    }
  } finally {
    engine.dispose();
  }
});

test("installation modules preserve the same ring and triangle holder", () => {
  const engine = new NullEngine();
  const reference = new Scene(engine);
  buildModel(reference, "seed-zorb");
  const commonNames = [
    "seat-loop-nominal-six-foot-unrated",
    "broad-contact-padding-envelope",
    "low-triangle-side-0",
    "low-triangle-side-1",
    "low-triangle-side-2",
  ];
  try {
    for (const id of ["basket-webbing", "basket-aerial-rig", "basket-camera-arms"]) {
      const scene = new Scene(engine);
      try {
        buildModel(scene, id);
        for (const name of commonNames) {
          const actual = scene.getMeshByName(name)!;
          const expected = reference.getMeshByName(name)!;
          expect(actual.getVerticesData("position")).toEqual(expected.getVerticesData("position"));
          expect(actual.computeWorldMatrix(true).asArray()).toEqual(
            expected.computeWorldMatrix(true).asArray(),
          );
        }
      } finally {
        scene.dispose();
      }
    }
  } finally {
    reference.dispose();
    engine.dispose();
  }
});

test("Ram axles and Andersen base reproduce documented datums in metres", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    buildModel(scene, "ram-2021");
    const front = scene.getMeshByName("ram-front-axle");
    const rear = scene.getMeshByName("ram-rear-axle");
    expect(front).not.toBeNull();
    expect(rear).not.toBeNull();
    expect(Math.abs(front!.position.x - rear!.position.x)).toBeCloseTo(4.074, 5);
    const bed = scene.getMeshByName("ram-bed-floor")!;
    bed.computeWorldMatrix(true);
    const bounds = bed.getBoundingInfo().boundingBox;
    expect(bounds.maximumWorld.x - bounds.minimumWorld.x).toBeCloseTo(1.9385, 5);
    const sides = [-1, 1].map((side) => scene.getMeshByName(`andersen-side-${side}`)!);
    for (const side of sides) side.computeWorldMatrix(true);
    const left = sides[0].getBoundingInfo().boundingBox;
    const right = sides[1].getBoundingInfo().boundingBox;
    expect(left.maximumWorld.x - left.minimumWorld.x).toBeCloseTo(0.8001, 5);
    expect(right.maximumWorld.z - left.minimumWorld.z).toBeCloseTo(0.904875, 5);
    const ball = scene.getMeshByName("andersen-2-5-16-ball")!;
    ball.computeWorldMatrix(true);
    expect(ball.getBoundingInfo().boundingBox.maximumWorld.y - bounds.maximumWorld.y).toBeCloseTo(
      0.4191,
      5,
    );
  } finally {
    scene.dispose();
    engine.dispose();
  }
});
