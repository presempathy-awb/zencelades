import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import type { Geometry, Point } from "./geometry";
import {
  basketGeometry,
  basketLayout,
  BASKET_MODEL_IDS,
  type ProjectorCount,
  type CameraCount,
  type SphereDiameter,
} from "./basket-model";

/** Scenic envelopes only: cross-sections, skin contact and all capacities are unresolved. */
export function seedGeometry(
  scene: Scene,
  g: Geometry,
  id: string,
  projectors?: ProjectorCount,
  diameter: SphereDiameter = 3,
  cameras?: CameraCount,
): void {
  const surround = id === "seed-surround";
  const hanging = id === "occupied-cradle";
  const basket = BASKET_MODEL_IDS.includes(id);
  const base = hanging ? 0.7 : 0;
  const centre = basket ? basketLayout(diameter).centreY : base + 1.5;
  const humanBase = surround ? 0.02 : centre - 0.85;
  // Seated witness for zorb studies; standing witness for the scenic surround.
  const torsoY = humanBase + (surround ? 1.1 : 0.55);
  g.box("participant-torso-envelope", [0.4, 0.55, 0.25], [0, torsoY, 0], "#be6c3e");
  g.sphere("participant-head-envelope", 0.25, [0, torsoY + 0.42, 0], "#be6c3e");
  for (const side of [-1, 1]) {
    const knee: Point = [side * 0.14, humanBase + 0.4, surround ? 0 : -0.38];
    g.beam(`participant-thigh-${side}`, [side * 0.14, torsoY - 0.25, 0], knee, 0.14, "#be6c3e");
    g.beam(
      `participant-shin-${side}`,
      knee,
      [side * 0.14, humanBase + 0.08, knee[2]],
      0.12,
      "#be6c3e",
    );
  }
  if (surround) {
    for (const x of [-1.1, 1.1]) {
      const ring: Point[] = [];
      for (let n = 0; n <= 48; n++) {
        const angle = (Math.PI * 2 * n) / 48;
        ring.push([x, centre + 1.3 * Math.sin(angle), 1.3 * Math.cos(angle)]);
      }
      g.tube(`scenic-side-ring-${x}`, ring, 0.025, "#344e60");
      g.box(`scenic-foot-envelope-${x}`, [0.3, 0.1, 2.2], [x, 0.05, 0]);
    }
    for (const angle of [0, Math.PI / 2, Math.PI])
      g.beam(
        `scenic-link-${angle}`,
        [-1.1, centre + 1.3 * Math.sin(angle), 1.3 * Math.cos(angle)],
        [1.1, centre + 1.3 * Math.sin(angle), 1.3 * Math.cos(angle)],
        0.05,
      );
    const panels = g.finish(
      MeshBuilder.CreateSphere(
        "partial-scenic-panels-open-entry",
        { diameter: 3, arc: 0.55, segments: 24, sideOrientation: Mesh.DOUBLESIDE },
        scene,
      ),
      [0, centre, 0],
      "#8ccbd7",
    );
    panels.rotation.y = Math.PI / 2;
    g.mat("#8ccbd7").alpha = 0.2;
    g.box("clear-entry-ground-marker", [1.1, 0.008, 1.4], [0, 0.004, -1.4], "#47a99d");
  } else {
    const outerDiameter = basket ? diameter : 3;
    // Inner space is a proportional display envelope, not a measured product interior.
    for (const diameter of [outerDiameter, (outerDiameter * 2) / 3]) {
      const shell = g.finish(
        MeshBuilder.CreateSphere(
          `double-wall-cutaway-${diameter}`,
          { diameter, arc: 0.75, segments: 24, sideOrientation: Mesh.DOUBLESIDE },
          scene,
        ),
        [0, centre, 0],
        "#a9cedb",
      );
      shell.rotation.y = Math.PI / 4;
    }
    g.mat("#a9cedb").alpha = 0.2;
    if (basket) basketGeometry(scene, g, id, projectors, diameter, cameras);
    else {
      for (const x of [-1.15, 1.15])
        g.box(`external-restraint-envelope-${x}`, [0.22, 0.4, 2.3], [x, base + 0.2, 0]);
      g.box("ground-or-cradle-pad-envelope", [2.6, 0.1, 2.5], [0, base + 0.05, 0], "#718890");
    }
    if (hanging) {
      for (const x of [-1.65, 1.65]) {
        g.beam(`independent-lifting-upright-${x}`, [x, base, 0], [x, base + 3.5, 0], 0.08);
        g.beam(`cradle-outrigger-${x}`, [0, base, 0], [x, base, 0], 0.08);
        g.beam(
          `unrated-bridle-envelope-${x}`,
          [x, base + 3.5, 0],
          [0, base + 4.3, 0],
          0.025,
          "#a37b40",
        );
      }
      g.beam("lifting-crossbar-envelope", [-1.65, base + 3.5, 0], [1.65, base + 3.5, 0], 0.08);
      g.box("host-point-unverified", [0.6, 0.15, 0.3], [0, base + 4.4, 0], "#a37b40");
    }
  }
  for (const x of [-1.7, 1.7])
    g.box(`external-led-envelope-${x}`, [0.18, 0.18, 0.18], [x, 0.12, 0], "#007d92");
}
