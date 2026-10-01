import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";

export type Point = [number, number, number];
/** Scene-scoped materials and primitives shared by truck and support assemblies. */
export function geometry(scene: Scene, root: TransformNode) {
  const materials = new Map<string, StandardMaterial>();
  const mat = (color: string): StandardMaterial => {
    const previous = materials.get(color); if (previous) return previous;
    const value = new StandardMaterial(color, scene);
    value.diffuseColor = Color3.FromHexString(color);
    value.specularColor = new Color3(0.22, 0.22, 0.22);
    materials.set(color, value); return value;
  };
  const finish = (mesh: Mesh, at: Point, color: string): Mesh => {
    mesh.parent = root; mesh.position.set(...at); mesh.material = mat(color); return mesh;
  };
  const box = (name: string, size: Point, at: Point, color = "#344e60"): Mesh =>
    finish(MeshBuilder.CreateBox(name, { width: size[0], height: size[1], depth: size[2] }, scene), at, color);
  const beam = (name: string, a: Point, b: Point, diameter = 0.07, color = "#344e60"): Mesh => {
    const from = new Vector3(...a), to = new Vector3(...b), direction = to.subtract(from);
    if (direction.length() < 0.000001) throw new Error(`Zero length member: ${name}`);
    const mesh = finish(MeshBuilder.CreateCylinder(name, { height: direction.length(), diameter, tessellation: 12 }, scene), from.add(to).scale(0.5).asArray() as Point, color);
    mesh.rotationQuaternion = Quaternion.FromUnitVectorsToRef(Vector3.Up(), direction.normalize(), new Quaternion());
    return mesh;
  };
  const sphere = (name: string, diameter: number, at: Point, color = "#dfedf4"): Mesh =>
    finish(MeshBuilder.CreateSphere(name, { diameter, segments: 24 }, scene), at, color);
  const tube = (name: string, path: Point[], radius: number, color: string): Mesh =>
    finish(MeshBuilder.CreateTube(name, { path: path.map(p => new Vector3(...p)), radius, tessellation: 8, cap: Mesh.CAP_ALL }, scene), [0, 0, 0], color);
  // Convex section loft; section vertices follow the same winding.
  const loft = (name: string, rings: Point[][], color: string): Mesh => {
    const n = rings[0].length, positions = rings.flat(2), indices: number[] = [];
    for (let r = 0; r < rings.length - 1; r++) for (let k = 0; k < n; k++) {
      const a = r*n+k, b = r*n+(k+1)%n, c = a+n, d = b+n;
      indices.push(a, b, c, b, d, c);
    }
    for (let k = 1; k < n-1; k++) {
      indices.push(0, k+1, k);
      const end = (rings.length-1)*n; indices.push(end, end+k, end+k+1);
    }
    const data = new VertexData(); data.positions = positions; data.indices = indices;
    const normals: number[] = []; VertexData.ComputeNormals(positions, indices, normals); data.normals = normals;
    const mesh = new Mesh(name, scene); data.applyToMesh(mesh); mesh.convertToFlatShadedMesh();
    return finish(mesh, [0, 0, 0], color);
  };
  return { box, beam, sphere, tube, loft, mat, finish };
}
export type Geometry = ReturnType<typeof geometry>;
