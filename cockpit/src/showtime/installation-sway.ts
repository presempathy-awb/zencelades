import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";

// P059 four-pole host: turn the common holder so all three optical axes pass between poles.
export const AERIAL_ASSEMBLY_YAW = (-50 * Math.PI) / 180;

export interface InstallationSway {
  root: TransformNode;
  matrix: Matrix;
  update(
    seconds: number,
    motion: number,
    motionX: number,
    effects: number,
    aerialEnabled: boolean,
  ): void;
  reset(aerialEnabled?: boolean): void;
}

export function createInstallationSway(
  scene: Scene,
  aerialMeshes: readonly AbstractMesh[],
  center: Vector3,
): InstallationSway {
  const halyards = aerialMeshes.filter((mesh) => mesh.name === "Halyard route - unselected");
  if (halyards.length !== 1 || !halyards[0].getTotalVertices()) {
    throw new Error("The suspended installation needs one halyard attachment mesh.");
  }
  const halyard = halyards[0];
  halyard.computeWorldMatrix(true);
  // The halyard's upper end meets the fixed host crossbar directly above the orb.
  const pivot = new Vector3(
    center.x,
    halyard.getBoundingInfo().boundingBox.maximumWorld.y,
    center.z,
  );
  const root = new TransformNode("suspended installation sway", scene);
  // Use equivalent translation instead of a pivot matrix: Babylon 9.26.1 setParent
  // shares a temporary matrix with pivot computation and can lose a child's pose.
  const rotation = Matrix.Identity();
  const rotatedPivot = Vector3.Zero();
  // Explicit P059 parts keep the host gantry, external hazer and inactive CAD person fixed.
  const movable =
    /^(?:Outer wall|Inner wall|Open entry tunnel|Inner entry lip|Outer entry lip|Compliant floor|Nominal six-foot seating loop|Padded loop contact|Loop interface tab|Triangle member|Corner plate|Lifting attachment witness|Over-sphere webbing|Top collector ring|Swivel envelope|Halyard route|Projector head|Projector lens|Two-metre optical arm|Ventilated rain canopy|Canopy bracket|Proposed arm stay|Shell spacer tie)(?: |$)/;
  for (const mesh of aerialMeshes) {
    if (movable.test(mesh.name) && mesh.getTotalVertices()) mesh.setParent(root, true);
  }
  const matrix = Matrix.Identity();
  let lastSeconds: number | undefined;
  const reset = (aerialEnabled = false): void => {
    root.rotation.set(0, aerialEnabled ? AERIAL_ASSEMBLY_YAW : 0, 0);
    root.position.set(0, 0, 0);
    Matrix.RotationYawPitchRollToRef(root.rotation.y, 0, 0, rotation);
    Vector3.TransformNormalToRef(pivot, rotation, rotatedPivot);
    pivot.subtractToRef(rotatedPivot, root.position);
    matrix.copyFrom(root.computeWorldMatrix(true));
    lastSeconds = undefined;
  };
  return {
    root,
    matrix,
    update(seconds, motion, motionX, effects, aerialEnabled): void {
      const strength = Number.isFinite(effects) ? Math.max(0, Math.min(1, effects)) : 0;
      if (!aerialEnabled || !strength || !Number.isFinite(seconds)) {
        reset(aerialEnabled);
        return;
      }
      const amount = Number.isFinite(motion) ? Math.max(0, Math.min(1, motion)) : 0;
      const direction = Number.isFinite(motionX) ? Math.max(-1, Math.min(1, motionX)) : 0;
      const elapsed = lastSeconds === undefined ? 1 / 60 : seconds - lastSeconds;
      const delta = elapsed > 0 && elapsed <= 0.05 ? elapsed : 1 / 60;
      lastSeconds = seconds;
      const targetX = Math.sin(seconds * 0.8) * amount * strength * 0.012;
      const targetZ = (direction * 0.03 + Math.sin(seconds * 0.55) * 0.012) * amount * strength;
      const response = 1 - Math.exp(-3 * delta);
      root.rotation.x += (targetX - root.rotation.x) * response;
      root.rotation.z += (targetZ - root.rotation.z) * response;
      const angle = Math.hypot(root.rotation.x, root.rotation.z);
      if (angle > 0.035) {
        root.rotation.x *= 0.035 / angle;
        root.rotation.z *= 0.035 / angle;
      }
      root.rotation.y = AERIAL_ASSEMBLY_YAW;
      Matrix.RotationYawPitchRollToRef(root.rotation.y, root.rotation.x, root.rotation.z, rotation);
      Vector3.TransformNormalToRef(pivot, rotation, rotatedPivot);
      pivot.subtractToRef(rotatedPivot, root.position);
      matrix.copyFrom(root.computeWorldMatrix(true));
    },
    reset,
  };
}
