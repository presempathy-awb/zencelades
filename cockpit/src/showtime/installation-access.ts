import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";

export interface InstallationAccess {
  meshes: readonly Mesh[];
  light: PointLight;
  setTimeOfDay: (hours: number) => void;
}

function accessMaterial(scene: Scene, name: string, color: string): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = Color3.FromHexString(color);
  material.specularColor = new Color3(0.025, 0.025, 0.025);
  return material;
}

function roundedTread(scene: Scene, name: string): Mesh {
  const positions: number[] = [];
  const indices: number[] = [];
  const width = 0.68;
  const depth = 0.27;
  const thickness = 0.036;
  const bevel = 0.008;
  const cornerRadius = 0.024;
  const ringSize = 20;
  for (const [y, inset] of [
    [-thickness, bevel],
    [-thickness + bevel, 0],
    [-bevel, 0],
    [0, bevel],
  ]) {
    const radius = cornerRadius - inset;
    const x = width / 2 - cornerRadius;
    const z = depth / 2 - cornerRadius;
    for (let corner = 0; corner < 4; corner += 1) {
      const centerX = corner === 0 || corner === 3 ? x : -x;
      const centerZ = corner < 2 ? z : -z;
      for (let segment = 0; segment <= 4; segment += 1) {
        const angle = (corner + segment / 4) * (Math.PI / 2);
        positions.push(centerX + Math.cos(angle) * radius, y, centerZ + Math.sin(angle) * radius);
      }
    }
  }
  for (let ring = 0; ring < 3; ring += 1) {
    for (let segment = 0; segment < ringSize; segment += 1) {
      const next = (segment + 1) % ringSize;
      const lower = ring * ringSize;
      const upper = lower + ringSize;
      indices.push(
        lower + segment,
        lower + next,
        upper + segment,
        upper + segment,
        lower + next,
        upper + next,
      );
    }
  }
  const bottomCenter = positions.length / 3;
  positions.push(0, -thickness, 0);
  const topCenter = positions.length / 3;
  positions.push(0, 0, 0);
  for (let segment = 0; segment < ringSize; segment += 1) {
    const next = (segment + 1) % ringSize;
    indices.push(
      bottomCenter,
      next,
      segment,
      topCenter,
      3 * ringSize + segment,
      3 * ringSize + next,
    );
  }
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  const geometry = new VertexData();
  geometry.positions = positions;
  geometry.normals = normals;
  geometry.indices = indices;
  const mesh = new Mesh(name, scene);
  geometry.applyToMesh(mesh);
  return mesh;
}

/** Build fixed side steps and gentle boarding cues beside the installation's front entrance. */
export function createInstallationAccess(
  scene: Scene,
  center: Vector3,
  physicalMeshes: readonly AbstractMesh[],
): InstallationAccess {
  const meshes: Mesh[] = [];
  const frame = accessMaterial(scene, "access frame material", "#34444c");
  const tread = accessMaterial(scene, "access rubber tread material", "#28373e");
  const traction = accessMaterial(scene, "access traction material", "#121c20");
  const cue = accessMaterial(scene, "access warm edge material", "#b7aa86");
  cue.specularColor.set(0, 0, 0);
  const finish = (mesh: Mesh, position: Vector3, material: StandardMaterial): Mesh => {
    mesh.position.copyFrom(position);
    mesh.material = material;
    mesh.isPickable = false;
    meshes.push(mesh);
    return mesh;
  };
  const rail = (name: string, from: Vector3, to: Vector3, diameter: number): Mesh => {
    const axis = to.subtract(from);
    const mesh = finish(
      MeshBuilder.CreateCylinder(
        name,
        { height: axis.length(), diameter, tessellation: 12 },
        scene,
      ),
      from.add(to).scale(0.5),
      frame,
    );
    mesh.rotationQuaternion = Quaternion.FromUnitVectorsToRef(
      Vector3.Up(),
      axis.normalize(),
      new Quaternion(),
    );
    return mesh;
  };

  // SHORTCUT: P059 boarding concept; survey the lip, ground, loads and rig sway before fabrication.
  // Both P059 entry lips start at 1.09496 m. Six 180 mm rises leave a 15 mm visual lip gap.
  for (let index = 0; index < 6; index += 1) {
    const top = (index + 1) * 0.18;
    const z = center.z + 1.34 + (5.5 - index) * 0.27;
    const x = center.x + 0.79;
    finish(
      MeshBuilder.CreateBox(
        `access riser ${index + 1}`,
        { width: 0.65, height: top - 0.036, depth: 0.255 },
        scene,
      ),
      new Vector3(x, (top - 0.036) / 2, z),
      frame,
    );
    finish(roundedTread(scene, `access tread ${index + 1}`), new Vector3(x, top, z), tread);
    const nosing = finish(
      MeshBuilder.CreateCylinder(
        `access nosing ${index + 1}`,
        { height: 0.62, diameter: 0.013, tessellation: 10 },
        scene,
      ),
      new Vector3(x, top - 0.008, z + 0.123),
      cue,
    );
    nosing.rotation.z = Math.PI / 2;
    for (let strip = 0; strip < 5; strip += 1) {
      finish(
        MeshBuilder.CreateBox(
          `access traction strip ${index + 1}.${strip + 1}`,
          { width: 0.605, height: 0.001, depth: 0.012 },
          scene,
        ),
        new Vector3(x, top - 0.0005, z + (strip - 2) * 0.04),
        traction,
      );
    }
  }
  const upperHandhold = new Vector3(center.x + 1.175, 1.86, center.z + 1.475);
  const lowerHandhold = new Vector3(center.x + 1.175, 0.96, center.z + 2.825);
  rail("access side handhold", upperHandhold, lowerHandhold, 0.032);
  for (const [index, end] of [upperHandhold, lowerHandhold].entries()) {
    rail(`access handhold post ${index + 1}`, new Vector3(end.x, 0.012, end.z), end, 0.025);
    finish(
      MeshBuilder.CreateSphere(
        `access rounded handhold end ${index + 1}`,
        { diameter: 0.032 },
        scene,
      ),
      end,
      frame,
    );
    finish(
      MeshBuilder.CreateCylinder(
        `access handhold foot ${index + 1}`,
        { diameter: 0.09, height: 0.012, tessellation: 12 },
        scene,
      ),
      new Vector3(end.x, 0.006, end.z),
      frame,
    );
  }

  const light = new PointLight(
    "installation boarding light",
    new Vector3(center.x + 0.36, 0.62, center.z + 1.02),
    scene,
  );
  light.diffuse = new Color3(1, 0.75, 0.43);
  light.specular = new Color3(0.08, 0.06, 0.035);
  light.range = 3.1;
  light.includedOnlyMeshes = [...new Set([...physicalMeshes, ...meshes])];
  const setTimeOfDay = (hours: number): void => {
    if (scene.isDisposed) return;
    const boundedHours = Number.isFinite(hours) ? Math.max(0, Math.min(24, hours)) : 22;
    const sunHeight = Math.cos(((boundedHours - 12) / 24) * Math.PI * 2);
    const bright = Math.max(0, Math.min(1, sunHeight * 2));
    const daylight = bright * bright * (3 - 2 * bright);
    const warm = Math.max(0, 1 - Math.abs(sunHeight) / 0.26);
    const dusk = warm * warm * (3 - 2 * warm) * (1 - daylight);
    light.intensity = 0.34 - daylight * 0.26 - dusk * 0.14;
    const emission = 0.075 - daylight * 0.05 - dusk * 0.02;
    cue.emissiveColor.set(emission, emission * 0.73, emission * 0.38);
  };
  setTimeOfDay(22);
  return { meshes, light, setTimeOfDay };
}
