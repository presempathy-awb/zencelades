import { expect, test } from "bun:test";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { createProjectionCaptures } from "./projection-capture";
import { createSquishAvatar } from "./squish-avatar";

test("side captures frame Andrew to fill the wall while retaining the spherical projector mapping", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  const center = new Vector3(0, 1.7, 0);
  const avatar = createSquishAvatar(scene, center, 5 / 6);
  const radial = Math.sqrt(3.75 ** 2 - 0.65 ** 2);
  const lenses = [
    new Vector3(0, 2.35, -radial),
    new Vector3((-radial * Math.sqrt(3)) / 2, 2.35, radial / 2),
    new Vector3((radial * Math.sqrt(3)) / 2, 2.35, radial / 2),
  ];
  try {
    const body = avatar.meshes.filter((mesh) => !mesh.name.includes("futon topper"));
    const captures = createProjectionCaptures(scene, body, lenses, center, 1.25);
    expect(captures).toHaveLength(3);
    for (const capture of captures) {
      const matrix = capture.camera.getTransformationMatrix();
      let bottom = Infinity,
        top = -Infinity,
        left = Infinity,
        right = -Infinity;
      for (const mesh of body) {
        const world = mesh.computeWorldMatrix(true);
        const positions = mesh.getVerticesData("position");
        if (!positions) throw new Error("Expected Andrew's body geometry.");
        for (let index = 0; index < positions.length; index += 3) {
          const point = Vector3.TransformCoordinates(
            Vector3.TransformCoordinates(Vector3.FromArray(positions, index), world),
            matrix,
          );
          bottom = Math.min(bottom, point.y);
          top = Math.max(top, point.y);
          left = Math.min(left, point.x);
          right = Math.max(right, point.x);
        }
      }
      expect(Math.max(top - bottom, right - left)).toBeGreaterThan(1.7);
      expect(
        Math.max(Math.abs(bottom), Math.abs(top), Math.abs(left), Math.abs(right)),
      ).toBeLessThan(1);
      const mappedCenter = Vector3.TransformCoordinates(center, capture.viewProjection);
      expect(mappedCenter.x).toBeCloseTo(0, 5);
      expect(mappedCenter.y).toBeCloseTo(0, 5);
      expect(capture.texture.renderList).toEqual(body);
      const restLens = capture.camera.position.clone();
      const landmark = center.add(new Vector3(0.6, 0.3, -0.9));
      const restMapping = Vector3.TransformCoordinates(landmark, capture.viewProjection);
      const transform = Matrix.RotationZ(0.03).multiply(Matrix.Translation(0.08, 0.01, 0));
      capture.updateTransform(transform);
      expect(
        capture.camera.position
          .subtract(Vector3.TransformCoordinates(restLens, transform))
          .length(),
      ).toBeLessThan(0.00001);
      const movingMapping = Vector3.TransformCoordinates(
        Vector3.TransformCoordinates(landmark, transform),
        capture.viewProjection,
      );
      expect(movingMapping.subtract(restMapping).length()).toBeLessThan(0.00001);
      expect(
        capture.camera.upVector.subtract(Vector3.TransformNormal(Vector3.Up(), transform)).length(),
      ).toBeLessThan(0.00001);
      capture.updateTransform(Matrix.Identity());
      expect(capture.camera.position.subtract(restLens).length()).toBeLessThan(0.00001);
    }
  } finally {
    scene.dispose();
    engine.dispose();
  }
});
