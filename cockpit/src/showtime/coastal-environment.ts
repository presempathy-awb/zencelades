import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";

export interface CoastalEnvironment {
  root: TransformNode;
  groundMaterial: StandardMaterial;
  setLighting: (daylight: number, dusk: number, naturalLight: number) => void;
}

/** Build a static, artistic beachfront camp with a clear installation area. */
export function createCoastalEnvironment(scene: Scene): CoastalEnvironment {
  const root = new TransformNode("coastal environment", scene);
  const material = (name: string, color: Color3): StandardMaterial => {
    const skin = new StandardMaterial(name, scene);
    skin.diffuseColor = color;
    skin.specularColor = new Color3(0.025, 0.035, 0.045);
    return skin;
  };
  const groundMaterial = material("dark ground", new Color3(0.012, 0.019, 0.025));
  groundMaterial.specularPower = 96;
  const water = material("coastal water", new Color3(0.025, 0.09, 0.14));
  water.specularColor = new Color3(0.18, 0.3, 0.38);
  water.specularPower = 128;
  const foam = material("coastal foam", new Color3(0.32, 0.47, 0.5));
  foam.alpha = 0.45;
  foam.backFaceCulling = false;
  const wood = material("coastal timber", new Color3(0.16, 0.105, 0.064));
  const leaves = material("coastal foliage", new Color3(0.08, 0.19, 0.095));
  leaves.backFaceCulling = false;
  const grass = material("coastal beach grass", new Color3(0.18, 0.23, 0.09));
  grass.backFaceCulling = false;
  const canvas = [
    material("coastal cream canvas", new Color3(0.68, 0.56, 0.37)),
    material("coastal coral canvas", new Color3(0.48, 0.22, 0.16)),
  ];
  const lamps = material("coastal warm lamps", new Color3(1, 0.62, 0.2));
  const own = (mesh: Mesh, skin: StandardMaterial): Mesh => {
    mesh.parent = root;
    mesh.material = skin;
    mesh.isPickable = false;
    return mesh;
  };
  const merge = (parts: Mesh[], name: string, skin: StandardMaterial): void => {
    const mesh = Mesh.MergeMeshes(parts, true, true);
    if (!mesh) throw new Error(`The ${name} scenery could not be assembled.`);
    mesh.name = name;
    own(mesh, skin);
  };
  const beam = (name: string, from: Vector3, to: Vector3, width: number): Mesh => {
    const direction = to.subtract(from);
    const mesh = own(
      MeshBuilder.CreateCylinder(
        name,
        {
          height: direction.length(),
          diameterBottom: width,
          diameterTop: width * 0.75,
          tessellation: 7,
        },
        scene,
      ),
      wood,
    );
    mesh.position.copyFrom(from.add(to).scale(0.5));
    mesh.rotationQuaternion = Quaternion.FromUnitVectorsToRef(
      Vector3.Up(),
      direction.normalize(),
      new Quaternion(),
    );
    return mesh;
  };
  const ground = own(
    MeshBuilder.CreateGround("night playa", { width: 72, height: 96 }, scene),
    groundMaterial,
  );
  ground.position.x = 30;
  const ocean = own(
    MeshBuilder.CreateGround("coastal ocean", { width: 160, height: 160, subdivisions: 48 }, scene),
    water,
  );
  ocean.position.x = -86;
  const positions = ocean.getVerticesData("position");
  const indices = ocean.getIndices();
  if (!positions || !indices) throw new Error("The coastal ocean has no geometry.");
  for (let index = 0; index < positions.length; index += 3)
    positions[index + 1] =
      -0.045 + Math.sin(positions[index] * 0.7 + positions[index + 2] * 0.2) * 0.013;
  const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals);
  ocean.setVerticesData("position", positions);
  ocean.setVerticesData("normal", normals);
  ocean.refreshBoundingInfo();
  const surf: Mesh[] = [];
  for (let wave = 0; wave < 3; wave++) {
    const paths = [0, 1].map((edge) =>
      Array.from({ length: 65 }, (_, index) => {
        const z = -64 + index * 2;
        return new Vector3(
          -6.05 - wave * 0.65 + Math.sin(z * 0.17 + wave) * 0.15 - edge * 0.09,
          0.012 - wave * 0.009,
          z,
        );
      }),
    );
    surf.push(
      own(MeshBuilder.CreateRibbon(`coastal surf ${wave}`, { pathArray: paths }, scene), foam),
    );
  }
  merge(surf, "coastal shoreline", foam);

  const timber: Mesh[] = [];
  const fronds: Mesh[] = [];
  const palmPositions = [
    [-4.6, -7.3],
    [-4.6, 7.3],
    [5.8, 12],
    [10, -7],
    [12, 6],
    [-1, 18],
  ];
  for (const [palm, [x, z]] of palmPositions.entries()) {
    const height = 4.1 + (palm % 3) * 0.35;
    const bend = palm % 2 === 0 ? 0.25 : -0.25;
    const middle = new Vector3(x + bend, height * 0.55, z);
    const top = new Vector3(x + bend * 2, height, z + 0.15);
    timber.push(beam(`coastal palm trunk ${palm} lower`, new Vector3(x, 0, z), middle, 0.23));
    timber.push(beam(`coastal palm trunk ${palm} upper`, middle, top, 0.16));
    for (let leaf = 0; leaf < 7; leaf++) {
      const angle = (leaf / 7) * Math.PI * 2 + palm * 0.31;
      const leafPositions: number[] = [];
      const leafIndices: number[] = [];
      for (let segment = 0; segment <= 8; segment++) {
        const along = segment / 8;
        const distance = along * 2.2;
        const width = Math.sin(along * Math.PI) * 0.19;
        for (const side of [-1, 1])
          leafPositions.push(
            top.x + Math.sin(angle) * distance + Math.cos(angle) * width * side,
            top.y + Math.sin(along * Math.PI) * 0.45 - along * along * 0.9,
            top.z + Math.cos(angle) * distance - Math.sin(angle) * width * side,
          );
        if (segment < 8) {
          const corner = segment * 2;
          leafIndices.push(corner, corner + 1, corner + 2, corner + 1, corner + 3, corner + 2);
        }
      }
      const data = new VertexData();
      data.positions = leafPositions;
      data.indices = leafIndices;
      data.normals = [];
      VertexData.ComputeNormals(leafPositions, leafIndices, data.normals);
      const mesh = new Mesh(`coastal palm leaf ${palm} ${leaf}`, scene);
      data.applyToMesh(mesh);
      fronds.push(own(mesh, leaves));
    }
  }
  merge(fronds, "coastal palm fronds", leaves);
  const grassPositions: number[] = [];
  const grassIndices: number[] = [];
  for (const [patch, [x, z]] of [
    [5.8, 5.8],
    [7, -6],
    [-4.8, 10],
    [-4.7, -10],
    [1, 13],
  ].entries()) {
    for (let blade = 0; blade < 28; blade++) {
      const baseX = x + Math.sin(blade * 2.4 + patch) * 0.8;
      const baseZ = z + Math.cos(blade * 1.7) * 0.65;
      const start = grassPositions.length / 3;
      grassPositions.push(
        baseX - 0.04,
        0,
        baseZ,
        baseX + 0.04,
        0,
        baseZ,
        baseX + Math.sin(blade) * 0.12,
        0.23 + (blade % 4) * 0.07,
        baseZ + 0.09,
      );
      grassIndices.push(start, start + 1, start + 2);
    }
  }
  const grassData = new VertexData();
  grassData.positions = grassPositions;
  grassData.indices = grassIndices;
  grassData.normals = [];
  VertexData.ComputeNormals(grassPositions, grassIndices, grassData.normals);
  const grassMesh = new Mesh("coastal grass", scene);
  grassData.applyToMesh(grassMesh);
  own(grassMesh, grass);

  for (const [tent, [x, z]] of [
    [9, 5.7],
    [11, -7],
    [2, 14],
    [-1.5, 22],
  ].entries()) {
    const roof = own(
      MeshBuilder.CreateCylinder(
        `coastal tent canopy ${tent + 1}`,
        {
          height: 1.35,
          diameterTop: 0,
          diameterBottom: 4,
          tessellation: 4,
        },
        scene,
      ),
      canvas[tent % 2],
    );
    roof.position.set(x, 2.5, z);
    roof.rotation.y = Math.PI / 4;
    for (const dx of [-1.35, 1.35])
      for (const dz of [-1.35, 1.35])
        timber.push(
          beam(
            `coastal tent leg ${tent}`,
            new Vector3(x + dx, 0, z + dz),
            new Vector3(x + dx, 1.85, z + dz),
            0.055,
          ),
        );
    const back = own(
      MeshBuilder.CreateBox(
        `coastal tent backdrop ${tent}`,
        { width: 2.7, height: 1.5, depth: 0.035 },
        scene,
      ),
      canvas[tent % 2],
    );
    back.position.set(x, 0.85, z + 1.35);
  }
  const bulbs: Mesh[] = [];
  const poles = [
    new Vector3(6.5, 3.2, 8.5),
    new Vector3(13, 3.5, 10),
    new Vector3(5, 3.2, 17),
    new Vector3(-2.5, 3.5, 23),
    new Vector3(7, 3.3, -10),
    new Vector3(15, 3.6, -8),
  ];
  for (const [index, top] of poles.entries())
    timber.push(beam(`coastal string pole ${index}`, new Vector3(top.x, 0, top.z), top, 0.075));
  for (const [strand, [start, end]] of [
    [0, 1],
    [1, 2],
    [2, 3],
    [4, 5],
  ].entries()) {
    const path = Array.from({ length: 13 }, (_, index) => {
      const along = index / 12;
      const point = Vector3.Lerp(poles[start], poles[end], along);
      point.y -= Math.sin(along * Math.PI) * 0.35;
      return point;
    });
    own(
      MeshBuilder.CreateTube(
        `coastal light cable ${strand}`,
        { path, radius: 0.012, tessellation: 4 },
        scene,
      ),
      wood,
    );
    for (const [index, point] of path.entries()) {
      if (index === 0 || index === 12) continue;
      const bulb = own(
        MeshBuilder.CreateSphere(
          `coastal bulb ${strand} ${index}`,
          { diameter: 0.09, segments: 6 },
          scene,
        ),
        lamps,
      );
      bulb.position.copyFrom(point);
      bulb.position.y -= 0.045;
      bulbs.push(bulb);
    }
  }
  merge(timber, "coastal trunks and poles", wood);
  merge(bulbs, "coastal string bulbs", lamps);
  const setLighting = (daylight: number, dusk: number, naturalLight: number): void => {
    if (scene.isDisposed) return;
    water.diffuseColor.set(
      0.025 + daylight * 0.07 + dusk * 0.06,
      0.09 + daylight * 0.26 + dusk * 0.02,
      0.14 + daylight * 0.34 + dusk * 0.05,
    );
    water.emissiveColor.set(
      0.008 + dusk * 0.01,
      0.021 + daylight * 0.012,
      0.033 + daylight * 0.016,
    );
    foam.emissiveColor.set(
      0.018 + daylight * 0.025,
      0.042 + daylight * 0.04,
      0.055 + daylight * 0.045,
    );
    const night = 1 - daylight * 0.8;
    groundMaterial.emissiveColor.set(0.04 * night, 0.031 * night, 0.018 * night);
    leaves.emissiveColor.set(0.01 * night, 0.028 * night, 0.015 * night);
    grass.emissiveColor.set(0.018 * night, 0.028 * night, 0.011 * night);
    wood.emissiveColor.set(0.022 * night, 0.013 * night, 0.007 * night);
    for (const skin of canvas) skin.emissiveColor.set(0.052 * night, 0.03 * night, 0.014 * night);
    for (const skin of [water, foam, groundMaterial, leaves, grass, wood, ...canvas])
      skin.emissiveColor.scaleInPlace(naturalLight);
    lamps.emissiveColor.set(0.95 - daylight * 0.8, 0.42 - daylight * 0.35, 0.085 - daylight * 0.06);
  };
  setLighting(0, 0, 1);
  return { root, groundMaterial, setLighting };
}
