import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import { geometry, type Point } from "./geometry";
import { andersen, receiver, truck } from "./truck-model";
import { BED_FRONT, BED_REAR, MODEL_STUDIES, RAM, REAR_END } from "./model-spec";
import { seedGeometry } from "./seed-models";
import { BASKET_MODEL_IDS, type ProjectorCount, type SphereDiameter } from "./basket-model";

export interface BuiltModel {
  root: TransformNode;
  target: Point;
  radius: number;
  dimensions: { label: string; a: Point; b: Point }[];
}
/** Build the named study without lighting, ground or camera for portable export. */
export function buildModel(
  scene: Scene,
  id: string,
  projectorCount?: ProjectorCount,
  sphereDiameter: SphereDiameter = 3,
): BuiltModel {
  const study = MODEL_STUDIES.find((value) => value.id === id);
  if (!study) throw new Error(`Unknown model: ${id}`);
  const root = new TransformNode(`study-${id}`, scene),
    g = geometry(scene, root);
  root.metadata = {
    ...study,
    units: "metres",
    axes: "Y up, truck nose -X; rear axle datum X=0",
    status: "layout reference; no capacity or fit approval",
    ...(projectorCount !== undefined && BASKET_MODEL_IDS.includes(id) ? { projectorCount } : {}),
    ...(BASKET_MODEL_IDS.includes(id) ? { sphereDiameter } : {}),
  };
  const result: BuiltModel = { root, target: [0, 1.7, 0], radius: 11, dimensions: [] };
  if (id === "love-burn") {
    seedGeometry(scene, g, "basket-aerial-rig", 0, 2.5);
    root.metadata = {
      ...root.metadata,
      sphereDiameter: 2.5,
      projectorCount: 2,
      mounting: "stands",
    };
    for (const side of [-1, 1]) {
      // Proposal's standard-throw study: four metres from shell to lens.
      const x = side * 5.25;
      g.box(`grant-projector-foot-${side}`, [0.8, 0.08, 0.8], [x, 0.04, 0]);
      g.beam(`grant-projector-stand-${side}`, [x, 0.08, 0], [x, 1.7, 0], 0.05);
      const head = g.box(
        `grant-projector-head-${side}`,
        [0.34, 0.16, 0.28],
        [x, 1.7, 0],
        "#202e39",
      );
      head.lookAt(new Vector3(0, 1.7, 0));
      g.box(`grant-projector-cover-${side}`, [0.5, 0.022, 0.46], [x, 1.97, 0], "#738797");
      g.box(`grant-phone-witness-${side}`, [0.07, 0.14, 0.02], [side * 0.5, 1.8, 0.4], "#202e39");
    }
    result.target = [0, 2.2, 0];
    result.radius = 15;
    result.dimensions = [
      {
        label: "2.5 m proposal sphere · stand layout, not fabrication dimensions",
        a: [-1.25, 0, 1.8],
        b: [1.25, 0, 1.8],
      },
    ];
    return result;
  }
  if (
    [
      "seed-surround",
      "seed-zorb",
      "basket-webbing",
      "basket-tripod",
      "occupied-cradle",
      "basket-aerial-rig",
      "basket-camera-arms",
      "basket-live-overlay",
    ].includes(id)
  ) {
    const diameter = BASKET_MODEL_IDS.includes(id) ? sphereDiameter : 3;
    seedGeometry(scene, g, id, projectorCount, diameter);
    result.radius = ["basket-tripod", "basket-aerial-rig"].includes(id)
      ? 13
      : ["basket-webbing", "occupied-cradle"].includes(id)
        ? 11
        : 8;
    result.target = [
      0,
      ["basket-tripod", "basket-aerial-rig", "basket-webbing", "occupied-cradle"].includes(id)
        ? 2.6
        : 1.5,
      0,
    ];
    result.dimensions = [
      {
        label: `${diameter} m nominal scenic envelope · not a fabrication dimension`,
        a: [-diameter / 2, 0, 1.8],
        b: [diameter / 2, 0, 1.8],
      },
    ];
    return result;
  }
  const ball = (at: Point, diameter = 3): void => {
    g.sphere("unoccupied-projection-shell", diameter, at);
    // Meridian cues are display guides, not measured projection coverage.
    for (let n = 0; n < 4; n++) {
      const phi = (n * Math.PI) / 4,
        path: Point[] = [];
      for (let k = 0; k <= 48; k++) {
        const a = (2 * Math.PI * k) / 48,
          r = diameter / 2 + 0.006;
        path.push([
          at[0] + r * Math.cos(a) * Math.cos(phi),
          at[1] + r * Math.sin(a),
          at[2] + r * Math.cos(a) * Math.sin(phi),
        ]);
      }
      g.tube(`sphere-guide-${n}`, path, 0.005, "#91b1c1");
    }
  };
  const pads = (x: number, z: number): void => {
    g.box(`ground-pad-${x}-${z}`, [0.8, 0.07, 0.8], [x, 0.035, z], "#798b94");
  };
  const portal = (x: number, span = 5.0, height = 5.2): void => {
    for (const s of [-1, 1]) {
      pads(x, (s * span) / 2);
      g.beam(`portal-leg-${s}`, [x, 0.08, (s * span) / 2], [x, height, (s * span) / 2], 0.15);
      g.beam(
        `portal-foot-${s}`,
        [x - 0.7, 0.12, (s * span) / 2],
        [x + 0.7, 0.12, (s * span) / 2],
        0.13,
      );
      g.beam(
        `portal-knee-${s}`,
        [x, height - 0.8, (s * span) / 2],
        [x, height, s * (span / 2 - 0.8)],
        0.07,
      );
    }
    g.beam("portal-crossbar", [x, height, -span / 2], [x, height, span / 2], 0.18);
  };
  const hang = (top: Point, center: Point): void => {
    g.beam("suspension-drop", top, [center[0], center[1] + 1.5, center[2]], 0.017, "#8f683a");
    // Empty globe only. The membrane attachment is intentionally unspecified.
    ball(center);
  };
  const projectors = (center: Point, count: number): void => {
    for (let n = 0; n < count; n++) {
      const a = (2 * Math.PI * n) / count + 0.4,
        x = center[0] + 4.0 * Math.cos(a),
        z = center[2] + 4.0 * Math.sin(a);
      for (const s of [-1, 1])
        g.beam(`projector-foot-${n}-${s}`, [x, 0.6, z], [x + s * 0.45, 0.05, z + 0.3], 0.035);
      g.beam(`projector-mast-${n}`, [x, 0.08, z], [x, 1.9, z], 0.05);
      g.box(`projector-${n}`, [0.45, 0.21, 0.31], [x, 2.0, z], "#007d92");
      g.sphere(`projector-lens-${n}`, 0.1, [x, 2.0, z - 0.17], "#163b4c");
    }
  };
  if (id === "factory-receiver") {
    receiver(g);
    result.target = [-0.14, 0, 0];
    result.radius = 1.8;
    const a = 0.0635 / 2;
    result.dimensions = [
      { label: "2½ in / 63.5 mm aperture", a: [0.01, -a, -a], b: [0.01, -a, a] },
    ];
    return result;
  }
  if (id === "andersen-original") {
    andersen(g);
    result.target = [0, 0.28, 0];
    result.radius = 1.7;
    result.dimensions = [
      { label: "35⅝ in / 904.9 mm base width", a: [0, 0, -0.4524375], b: [0, 0, 0.4524375] },
      { label: "31½ in / 800.1 mm base length", a: [-0.3571875, 0, 0.5], b: [0.4429125, 0, 0.5] },
    ];
    return result;
  }
  const truckIds = [
    "ram-2021",
    "fixed-bed",
    "fixed-cantilever",
    "receiver-crane",
    "bed-crane",
    "chassis-short",
    "truck-portal",
    "fixed15-study",
  ];
  if (truckIds.includes(id)) {
    truck(scene, root);
    result.target = [-0.6, 1.8, 0];
    result.radius = 12;
    result.dimensions = [
      {
        label: "6.348 m overall",
        a: [-RAM.wheelbase - RAM.frontOverhang, 0.05, -1.65],
        b: [REAR_END, 0.05, -1.65],
      },
      {
        label: "4.074 m wheelbase (press table)",
        a: [-RAM.wheelbase, 0.04, 1.6],
        b: [0, 0.04, 1.6],
      },
      {
        label: "1.9385 m bed floor",
        a: [BED_FRONT, RAM.bedFloor + 0.05, 0.4],
        b: [BED_REAR, RAM.bedFloor + 0.05, 0.4],
      },
    ];
    if (id === "ram-2021") return result;
  }
  let globe: Point = [0, 1.72, 0];
  let count = 2;
  if (id === "ground-light" || id === "ground-sphere") {
    const radius = id === "ground-light" ? 1 : 1.5;
    globe = [0, radius + 0.22, 0];
    ball(globe, radius * 2);
    for (const s of [-1, 1]) g.box(`cradle-${s}`, [1.65, 0.38, 0.18], [0, 0.19, s * 0.45]);
    g.box("cradle-base", [1.9, 0.08, 1.25], [0, 0.04, 0]);
    if (id === "ground-light") {
      count = 0;
      g.sphere("internal-light-indicator", 0.18, [0, 1.22, 0], "#009cb8");
    }
  } else if (id === "ground-half") {
    const half = g.finish(
      MeshBuilder.CreateSphere(
        "open-half-screen",
        { diameter: 3, segments: 32, arc: 0.5, sideOrientation: Mesh.DOUBLESIDE },
        scene,
      ),
      [0, 1.55, 0],
      "#deedf3",
    );
    half.rotation.y = Math.PI / 2;
    for (const s of [-1, 1]) g.beam(`screen-foot-${s}`, [-0.3, 0.08, s], [0.7, 0.08, s], 0.09);
    g.box("screen-base", [0.6, 0.12, 2.6], [0, 0.06, 0]);
    count = 1;
  } else if (id === "fixed-pedestal") {
    globe = [0, 2.5, 0];
    ball(globe);
    g.box("pedestal", [0.5, 1.05, 0.5], [0, 0.525, 0]);
    g.box("pedestal-cradle", [1.25, 0.18, 1.25], [0, 1.02, 0]);
    g.box("pedestal-base", [2.3, 0.12, 2.3], [0, 0.06, 0]);
  } else if (id === "fixed-bed") {
    globe = [0.15, 3.25, 0];
    ball(globe);
    for (const x of [-0.5, 0.8])
      for (const z of [-0.62, 0.62])
        g.beam(`bed-upright-${x}-${z}`, [x, RAM.bedFloor, z], [x, 1.8, z], 0.08);
    g.box("bed-support-platform", [1.65, 0.08, 1.45], [0.15, 1.78, 0]);
    result.dimensions.push({
      label: "3 m sphere: overhangs bed",
      a: [-1.35, 3.25, 0],
      b: [1.65, 3.25, 0],
    });
  } else if (["existing-hang", "own-gantry", "truck-portal", "trailer-portal"].includes(id)) {
    const x = id === "truck-portal" ? 3.3 : 0,
      deck = id === "trailer-portal" ? 0.7 : 0;
    globe = [x, 3.05 + deck, 0];
    count = id === "existing-hang" ? 2 : 4;
    if (id !== "existing-hang") portal(x, 5, 5.2 + deck);
    else g.box("host-point-envelope-unverified", [1.3, 0.2, 0.2], [0, 5.25, 0], "#8f683a");
    hang([x, 5.2 + deck, 0], globe);
    if (id === "truck-portal") {
      result.target = [0, 2.5, 0];
      result.radius = 16;
    }
    if (id === "trailer-portal") {
      g.box("trailer-deck-envelope", [3.8, 0.16, 2.1], [0, deck, 0], "#776b59");
      for (const z of [-1.18, 1.18])
        for (const x of [-0.6, 0.6]) {
          const wheel = g.finish(
            MeshBuilder.CreateCylinder(
              `trailer-wheel-${x}-${z}`,
              { diameter: 0.62, height: 0.2, tessellation: 24 },
              scene,
            ),
            [x, 0.31, z],
            "#202b31",
          );
          wheel.rotation.x = Math.PI / 2;
        }
      for (const x of [-1.7, 1.7])
        for (const z of [-1.9, 1.9]) {
          g.beam(`trailer-outrigger-${x}-${z}`, [x, deck, Math.sign(z)], [x, 0.12, z], 0.09);
          pads(x, z);
        }
      g.beam("trailer-tongue-left", [-1.9, 0.7, -0.8], [-3.2, 0.6, 0], 0.1);
      g.beam("trailer-tongue-right", [-1.9, 0.7, 0.8], [-3.2, 0.6, 0], 0.1);
    }
  } else if (id === "aerial-rig") {
    globe = [0, 3.3, 0];
    count = 4;
    for (const x of [-2.75, 2.75])
      for (const z of [-2.75, 2.75]) {
        g.beam(`aerial-leg-${x}-${z}`, [x, 0.08, z], [Math.sign(x) * 0.65, 6, 0], 0.075);
        pads(x, z);
      }
    g.beam("aerial-top-bar", [-0.8, 6, 0], [0.8, 6, 0], 0.08);
    for (const z of [-2.75, 2.75])
      g.beam(`aerial-base-tie-${z}`, [-2.75, 0.09, z], [2.75, 0.09, z], 0.02, "#a37b40");
    hang([0, 6, 0], globe);
    result.target = [0, 2.8, 0];
    result.radius = 13;
    result.dimensions = [
      { label: "Illustrative 6 m attachment height", a: [3.2, 0, 0], b: [3.2, 6, 0] },
    ];
  } else if (id.startsWith("tree-")) {
    const tree = (x: number): void => {
      g.beam(`tree-trunk-${x}`, [x, 0, 0], [x + 0.15, 6.5, 0], 0.65, "#685a46");
      for (const s of [-1, 1]) {
        g.beam(`tree-branch-${x}-${s}`, [x, 4.1, 0], [x + s * 2.4, 6.0, s * 0.8], 0.3, "#685a46");
        g.sphere(`tree-canopy-${x}-${s}`, 2.7, [x + s * 1.8, 6.8, s * 0.7], "#71908a");
      }
    };
    if (id === "tree-single") {
      tree(-2.8);
      globe = [-0.4, 3.55, 0.8];
      g.box("tree-protection-envelope", [0.35, 0.45, 0.5], [-0.4, 6, 0.8], "#a37b40");
      hang([-0.4, 6, 0.8], globe);
    } else {
      tree(-4);
      tree(4);
      globe = [0, 2.5, 0];
      g.tube(
        "highline-sag-unrated",
        [
          [-4, 5.6, 0],
          [-2, 5, 0],
          [0, 4.8, 0],
          [2, 5, 0],
          [4, 5.6, 0],
        ],
        0.022,
        "#a37b40",
      );
      hang([0, 4.8, 0], globe);
    }
    result.target = [0, 3.0, 0];
    result.radius = 17;
  } else if (id === "receiver-crane" || id === "bed-crane") {
    const rear = id === "receiver-crane",
      x = rear ? REAR_END + 0.9271 : BED_REAR - 0.2,
      z = rear ? 0 : 0.66;
    const bottom = rear ? 0.18 : RAM.bedFloor,
      top = rear ? 1.75 : 2.05,
      reach = rear ? 1.2192 : 1.355725;
    g.beam("crane-column", [x, bottom, z], [x, top, z], 0.11);
    g.beam(
      "material-crane-boom",
      [x, top, z],
      [x + reach * 0.85, top + reach * 0.5267827, z],
      0.09,
      "#aa813b",
    );
    g.beam(
      "crane-hoist-line",
      [x + reach * 0.85, top + reach * 0.5267827, z],
      [x + reach * 0.85, 0.75, z],
      0.012,
      "#8f683a",
    );
    g.box(
      "material-load-envelope-not-sphere",
      [0.35, 0.35, 0.35],
      [x + reach * 0.85, 0.56, z],
      "#6a8f9c",
    );
    if (rear) {
      g.beam(
        "receiver-offset-envelope",
        [REAR_END, RAM.receiverHeight, 0],
        [x, RAM.receiverHeight, 0],
        0.08,
      );
      pads(x, z);
    } else g.box("bed-crane-base-unverified-frame-interface", [0.35, 0.07, 0.35], [x, bottom, z]);
    result.target = [-0.3, 1.5, 0];
    result.radius = 12;
    count = 0;
  } else {
    // Fixed truck studies: keep the long-reach variant explicit and separate.
    const fixed15 = id === "fixed15-study",
      pin = REAR_END - RAM.receiverPinInset;
    const out = fixed15 ? pin + 4.572 : REAR_END + 2.2,
      height = fixed15 ? 4.6 : 5.25;
    globe = [out, 2.8, 0];
    count = 4;
    for (const z of [-0.25, 0.25]) {
      g.beam(`mast-${z}`, [REAR_END - 0.22, 0.62, z], [REAR_END - 0.22, height + 0.6, z], 0.09);
      g.beam(`lower-chord-${z}`, [REAR_END - 0.22, height, z], [out, height, z], 0.07);
      g.beam(`upper-chord-${z}`, [REAR_END - 0.22, height + 0.6, z], [out, height + 0.6, z], 0.07);
      for (let i = 0; i < 6; i++) {
        const a = REAR_END - 0.22 + ((out - REAR_END + 0.22) * i) / 6,
          b = REAR_END - 0.22 + ((out - REAR_END + 0.22) * (i + 1)) / 6;
        g.beam(
          `truss-diagonal-${z}-${i}`,
          [a, height + (i % 2) * 0.6, z],
          [b, height + ((i + 1) % 2) * 0.6, z],
          0.035,
        );
      }
      g.beam(
        `direct-backstay-${z}`,
        [0, RAM.bedFloor + 0.3, z],
        [REAR_END - 0.22, height + 0.6, z],
        0.018,
        "#a37b40",
      );
      g.beam(`chassis-interface-envelope-${z}`, [0, 0.62, z], [REAR_END - 0.22, 0.62, z], 0.1);
    }
    g.beam("tip-spreader", [out, height, -0.3], [out, height, 0.3], 0.065);
    hang([out, height, 0], globe);
    result.target = [fixed15 ? 1 : 0, 2.4, 0];
    result.radius = fixed15 ? 19 : 16;
    if (fixed15)
      result.dimensions.push({
        label: "15 ft / 4.572 m receiver pin → suspension",
        a: [pin, 0.16, 1.4],
        b: [out, 0.16, 1.4],
      });
  }
  projectors(globe, count);
  return result;
}

/** Guides belong to the viewer and are excluded from exported object geometry. */
export function dimensionGuides(scene: Scene, model: BuiltModel): TransformNode {
  const root = new TransformNode("dimension-guides", scene),
    g = geometry(scene, root);
  for (const { label, a, b } of model.dimensions) {
    const line = MeshBuilder.CreateLines(
      label,
      { points: [new Vector3(...a), new Vector3(...b)] },
      scene,
    );
    line.parent = root;
    g.sphere(`${label}-start`, 0.035, a, "#007d92");
    g.sphere(`${label}-end`, 0.035, b, "#007d92");
  }
  return root;
}
