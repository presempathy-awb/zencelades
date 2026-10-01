import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import type { Geometry, Point } from "./geometry";

export const BASKET_MODEL_IDS = [
  "seed-zorb",
  "basket-webbing",
  "basket-tripod",
  "basket-aerial-rig",
  "basket-camera-arms",
  "basket-live-overlay",
];
export type ProjectorCount = 0 | 1 | 2 | 3;
export type SphereDiameter = 2.5 | 3;

/** Nominal P035/P036 geometry; no tube, sling or hardware specification. */
export function basketLayout(diameter: SphereDiameter = 3): {
  ringRadius: number;
  ringY: number;
  triangleY: number;
  triangleSide: number;
  ringOverhang: number;
  cornerRadiusToEnclose: number;
  centreY: number;
  corners: Point[];
  straps: Point[][];
  collector: Point;
} {
  const sphereRadius = diameter / 2,
    centreY = 1.7;
  const ringRadius = (6 * 0.3048) / 2,
    cornerRadius = 1.8;
  const ringY = centreY - Math.sqrt(sphereRadius ** 2 - ringRadius ** 2);
  const triangleY = ringY - 0.09;
  const corners: Point[] = [0, 1, 2].map((index) => {
    // Front is -Z: two flanking corners and the third at the +Z rear.
    const angle = (index * Math.PI * 2) / 3 + Math.PI / 2;
    return [cornerRadius * Math.cos(angle), triangleY, cornerRadius * Math.sin(angle)];
  });
  const collector: Point = [0, centreY + sphereRadius + 0.22, 0];
  // Tangent–arc–tangent routing represents webbing bearing on the skin.
  // The small display offset prevents z-fighting; it is not physical clearance.
  const displayRadius = sphereRadius + 0.012;
  const dy = triangleY - centreY;
  const from =
    Math.atan2(dy, cornerRadius) + Math.acos(displayRadius / Math.hypot(cornerRadius, dy));
  const to = Math.asin(displayRadius / (collector[1] - centreY));
  const straps = corners.map((corner): Point[] => {
    const angle = Math.atan2(corner[2], corner[0]);
    const arc: Point[] = Array.from({ length: 33 }, (_, index) => {
      const theta = from + ((to - from) * index) / 32;
      const radial = displayRadius * Math.cos(theta);
      return [
        radial * Math.cos(angle),
        centreY + displayRadius * Math.sin(theta),
        radial * Math.sin(angle),
      ];
    });
    return [corner, ...arc, collector];
  });
  return {
    ringRadius,
    ringY,
    triangleY,
    centreY,
    corners,
    straps,
    collector,
    triangleSide: Math.sqrt(3) * cornerRadius,
    ringOverhang: ringRadius - cornerRadius / 2,
    cornerRadiusToEnclose: ringRadius * 2,
  };
}

/** Draw Andrew's ring/triangle and optional webbing; member widths are display only. */
export function basketGeometry(
  scene: Scene,
  g: Geometry,
  id: string,
  projectors?: ProjectorCount,
  diameter: SphereDiameter = 3,
): void {
  const layout = basketLayout(diameter);
  const suspended = ["basket-webbing", "basket-tripod", "basket-aerial-rig"].includes(id);
  const projected = ["seed-zorb", "basket-aerial-rig", "basket-live-overlay"].includes(id);
  const count = projectors ?? (projected ? 3 : 0);
  // Keep the flanking corners first; no mast is placed in the front entry bay.
  const activeCorners = [1, 2, 0].slice(0, count);
  const circle = (radius: number, y: number): Point[] =>
    Array.from({ length: 97 }, (_, index) => {
      const angle = (index * Math.PI * 2) / 96;
      return [radius * Math.cos(angle), y, radius * Math.sin(angle)];
    });
  g.tube(
    "seat-loop-nominal-six-foot-unrated",
    circle(layout.ringRadius, layout.ringY),
    0.025,
    "#344e60",
  );
  g.tube(
    "broad-contact-padding-envelope",
    circle(layout.ringRadius, layout.ringY + 0.025),
    0.055,
    "#659e97",
  );
  for (const [index, corner] of layout.corners.entries()) {
    const next = layout.corners[(index + 1) % 3];
    g.beam(`low-triangle-side-${index}`, corner, next, 0.045);
    if (activeCorners.includes(index)) {
      const angle = Math.atan2(corner[2], corner[0]);
      const radial = 1.8 + 2 * Math.cos(Math.PI / 6);
      const headAt: Point = [
        radial * Math.cos(angle),
        layout.triangleY + 1,
        radial * Math.sin(angle),
      ];
      g.beam(`triangle-projector-arm-${index}`, corner, headAt, 0.05);
      const head = g.box(`triangle-projector-head-${index}`, [0.34, 0.16, 0.28], headAt, "#202e39");
      head.lookAt(new Vector3(0, layout.centreY, 0));
      g.box(
        `arm-rain-cover-${index}`,
        [0.5, 0.022, 0.46],
        [headAt[0], headAt[1] + 0.19, headAt[2]],
        "#738797",
      );
      if (suspended)
        g.beam(`proposed-arm-stay-${index}`, headAt, layout.collector, 0.012, "#cf9a46");
    }
    const mid: Point = [(corner[0] + next[0]) / 2, layout.triangleY, (corner[2] + next[2]) / 2];
    // Visible seat interfaces bridge the nominal ring overhang; joints are unresolved.
    g.beam(
      `seat-interface-envelope-${index}`,
      mid,
      [mid[0] * 1.13, layout.ringY, mid[2] * 1.13],
      0.05,
      "#659e97",
    );
    if (!suspended) {
      const foot: Point = [corner[0] * 1.2, 0.08, corner[2] * 1.2];
      g.box(
        `detachable-lower-interface-${index}`,
        [0.18, 0.12, 0.18],
        [corner[0], corner[1] - 0.06, corner[2]],
        "#8a6743",
      );
      g.beam(
        `lander-leg-envelope-${index}`,
        [corner[0], corner[1] - 0.08, corner[2]],
        foot,
        0.075,
        "#586977",
      );
      g.beam(
        `lander-brace-envelope-${index}`,
        [(corner[0] * 3 + next[0]) / 4, corner[1], (corner[2] * 3 + next[2]) / 4],
        foot,
        0.025,
        "#8a6743",
      );
      g.finish(
        MeshBuilder.CreateCylinder(
          `lander-pad-envelope-${index}`,
          { diameter: 0.5, height: 0.07, tessellation: 6 },
          scene,
        ),
        [foot[0], 0.045, foot[2]],
        "#8a6743",
      );
    }
  }
  if (projected) {
    g.box("owned-external-hazer-provisional", [0.8, 0.34, 0.6], [0, 0.21, 1.25], "#202e39");
    for (const x of [-0.29, 0.29])
      g.box(`hazer-ground-skid-${x}`, [0.09, 0.04, 0.64], [x, 0.02, 1.25], "#738797");
  }
  if (id === "basket-live-overlay") {
    const camera = g.box(
      "inside-camera-witness-0",
      [0.12, 0.09, 0.08],
      [0.65, 1.85, 0.15],
      "#202e39",
    );
    camera.lookAt(new Vector3(0, layout.centreY, 0));
  }
  if (id === "basket-camera-arms") {
    const corner = layout.corners[0];
    const camera: Point = [corner[0] * 1.13, 1.05, corner[2] * 1.13];
    g.box("optional-camera-bracket-envelope", [0.16, 0.11, 0.16], corner, "#8a6743");
    g.beam("optional-camera-arm-envelope", corner, camera, 0.03, "#586977");
    g.box("optional-external-camera-witness", [0.2, 0.14, 0.14], camera, "#273d49");
    g.beam(
      "camera-view-direction-witness",
      camera,
      [camera[0] * 0.91, camera[1], camera[2] * 0.91],
      0.07,
      "#111c25",
    );
    g.tube(
      "camera-cable-service-slack-study",
      [camera, [corner[0] + 0.2, 0.55, corner[2]], corner],
      0.005,
      "#20282c",
    );
  }
  if (!suspended) return;
  for (const [index, path] of layout.straps.entries()) {
    const angle = Math.atan2(layout.corners[index][2], layout.corners[index][0]);
    const halfWidth = 0.045; // Display width only, not a selected sling width.
    const edges = [-1, 1].map((side) =>
      path.map(
        (point) =>
          new Vector3(
            point[0] - side * halfWidth * Math.sin(angle),
            point[1],
            point[2] + side * halfWidth * Math.cos(angle),
          ),
      ),
    );
    g.finish(
      MeshBuilder.CreateRibbon(
        `loaded-webbing-over-skin-${index}`,
        {
          pathArray: edges,
          sideOrientation: Mesh.DOUBLESIDE,
        },
        scene,
      ),
      [0, 0, 0],
      "#cf9a46",
    );
  }
  const topY = layout.collector[1];
  const topRing: Point[] = Array.from({ length: 33 }, (_, index) => {
    const angle = (index * Math.PI * 2) / 32;
    return [0.08 * Math.cos(angle), topY + 0.08 + 0.08 * Math.sin(angle), 0];
  });
  g.tube("collector-ring-unrated", topRing, 0.012, "#8a6743");
  g.beam("swivel-interface-unselected", [0, topY + 0.16, 0], [0, topY + 0.31, 0], 0.045, "#8a6743");
  g.beam("halyard-route-unselected", [0, topY + 0.31, 0], [0, 4.8, 0], 0.015, "#cf9a46");
  if (id === "basket-tripod") {
    for (let index = 0; index < 3; index++) {
      const angle = (index * Math.PI * 2) / 3 + Math.PI / 6;
      const foot: Point = [3.4 * Math.cos(angle), 0.06, 3.4 * Math.sin(angle)];
      g.beam(`external-host-tripod-${index}`, foot, [0, 4.85, 0], 0.085, "#586977");
      g.box(`host-bearing-pad-${index}`, [0.6, 0.08, 0.6], [foot[0], 0.04, foot[2]], "#718890");
    }
  } else if (id === "basket-aerial-rig") {
    for (const x of [-2.3, 2.3]) {
      for (const z of [-1.9, 1.9]) {
        const foot: Point = [x * 1.22, 0.06, z];
        g.beam(`aerial-rig-leg-${x}-${z}`, foot, [x, 4.8, 0], 0.08, "#586977");
        g.box(`aerial-rig-pad-${x}-${z}`, [0.55, 0.08, 0.55], [foot[0], 0.04, z], "#718890");
      }
      g.beam(
        `aerial-rig-spread-restraint-envelope-${x}`,
        [x * 1.22, 0.09, -1.9],
        [x * 1.22, 0.09, 1.9],
        0.018,
        "#cf9a46",
      );
    }
    g.beam("aerial-rig-crossbar-envelope", [-2.3, 4.8, 0], [2.3, 4.8, 0], 0.12, "#586977");
  } else {
    g.box("host-required-not-provided", [0.5, 0.08, 0.25], [0, 4.84, 0], "#cf9a46");
  }
}
