import { expect, test } from "bun:test";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Scene } from "@babylonjs/core/scene";
import { buildModel } from "./models/support-models";
import { MODEL_STUDIES, RAM, ANDERSEN } from "./models/model-spec";
import { baseline } from "./scenario";

test("all budget concepts have usable finite geometry and preserve their selection", () => {
  const engine = new NullEngine();
  try {
    for (const study of MODEL_STUDIES) {
      const scene = new Scene(engine);
      const result = buildModel(scene, study.id);
      expect(result.root.getChildMeshes().length).toBeGreaterThan(0);
      for (const mesh of result.root.getChildMeshes()) {
        mesh.computeWorldMatrix(true);
        expect(mesh.getVerticesData("position")?.every(Number.isFinite)).toBe(true);
        expect(mesh.getBoundingInfo().boundingBox.minimumWorld.asArray().every(Number.isFinite)).toBe(true);
      }
      scene.dispose();
    }
    for (const option of baseline.options) {
      expect(MODEL_STUDIES.some(study => study.id === option.id && study.budget === option.id)).toBe(true);
    }
  } finally { engine.dispose(); }
});

test("Ram axles and Andersen base reproduce documented datums in metres", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    buildModel(scene, "ram-2021");
    const front = scene.getMeshByName("ram-front-axle");
    const rear = scene.getMeshByName("ram-rear-axle");
    expect(front).not.toBeNull(); expect(rear).not.toBeNull();
    expect(Math.abs(front!.position.x - rear!.position.x)).toBeCloseTo(4.074, 5);
    expect(RAM.length).toBe(6.348);
    expect(RAM.bedLength).toBe(1.9385);
    expect(ANDERSEN.length).toBeCloseTo(0.8001, 5);
    expect(ANDERSEN.width).toBeCloseTo(0.904875, 5);
    expect(ANDERSEN.lowBallTop).toBeCloseTo(0.4191, 6);
    expect(ANDERSEN.highBallTop).toBeCloseTo(0.4651375, 6);
  } finally { scene.dispose(); engine.dispose(); }
});
