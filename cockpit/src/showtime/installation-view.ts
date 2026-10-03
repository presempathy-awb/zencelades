import type { Material } from "@babylonjs/core/Materials/material";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import "@babylonjs/core/Rendering/edgesRenderer";

export type InstallationDisplayMode = "realistic" | "inspect" | "wireframe";

/** Inspection changes the installation, leaving the body and projected surface legible. */
export function createInstallationView(
  meshes: readonly AbstractMesh[],
  readableMeshes: readonly AbstractMesh[],
): { setMode: (mode: InstallationDisplayMode) => void } {
  const readable = new Set(readableMeshes);
  const originalVisibility = new Map(meshes.map((mesh) => [mesh, mesh.visibility]));
  const materials = new Map<Material, boolean>();
  for (const mesh of meshes) {
    if (mesh.material) materials.set(mesh.material, mesh.material.wireframe);
    if (mesh.getTotalVertices() > 0 && !readable.has(mesh)) {
      mesh.enableEdgesRendering();
      mesh.edgesWidth = 1;
      mesh.edgesColor = new Color4(0.64, 0.78, 0.8, 0.65);
      if (mesh.edgesRenderer) mesh.edgesRenderer.isEnabled = false;
    }
  }
  return {
    setMode: (mode) => {
      for (const [material, wireframe] of materials)
        material.wireframe = mode === "wireframe" || wireframe;
      for (const [mesh, visibility] of originalVisibility) {
        mesh.visibility =
          mode === "inspect" && !readable.has(mesh) ? visibility * 0.28 : visibility;
        if (mesh.edgesRenderer) mesh.edgesRenderer.isEnabled = mode === "inspect";
      }
    },
  };
}
