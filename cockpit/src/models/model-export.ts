import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Scene } from "@babylonjs/core/scene";
import { GLTF2Export } from "@babylonjs/serializers/glTF/2.0/glTFSerializer";
import type { CameraCount, ProjectorCount, SphereDiameter } from "./basket-model";
import { buildModel } from "./support-models";

/** Export only the selected study geometry, independent of the live viewer lifecycle. */
export async function exportModel(
  id: string,
  projectors: ProjectorCount,
  diameter: SphereDiameter = 3,
  cameras?: CameraCount,
): Promise<Blob> {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    buildModel(scene, id, projectors, diameter, cameras);
    const output = await GLTF2Export.GLBAsync(scene, "study", {
      exportWithoutWaitingForScene: true,
      metadataSelector: (value: unknown) => value,
    });
    const file = output.files["study.glb"];
    if (!(file instanceof Blob)) throw new Error("The model exporter did not produce a GLB");
    return file;
  } finally {
    scene.dispose();
    engine.dispose();
  }
}
