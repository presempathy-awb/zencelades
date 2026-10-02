import { expect, test } from "bun:test";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { createInstallationView } from "./installation-view";

test("inspection exposes the interior while wireframe and realistic restore the same materials", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const rig = MeshBuilder.CreateBox("rig", {}, scene);
    const body = MeshBuilder.CreateSphere("body", {}, scene);
    const wall = MeshBuilder.CreateSphere("projection wall", {}, scene);
    const material = new StandardMaterial("original finish", scene);
    const projected = new StandardMaterial("imagery", scene);
    rig.material = body.material = material;
    wall.material = projected;
    rig.visibility = 0.8;
    const view = createInstallationView([rig, body, wall], [body, wall]);
    view.setMode("inspect");
    expect(rig.visibility).toBeLessThan(0.3);
    expect(body.visibility).toBe(1);
    expect(wall.visibility).toBe(1);
    expect(material.wireframe).toBe(false);
    expect(rig.edgesRenderer?.isEnabled).toBe(true);
    view.setMode("wireframe");
    expect(material.wireframe).toBe(true);
    expect(projected.wireframe).toBe(true);
    expect(rig.visibility).toBe(0.8);
    view.setMode("realistic");
    expect(material.wireframe).toBe(false);
    expect(projected.wireframe).toBe(false);
    expect(rig.visibility).toBe(0.8);
    expect(rig.edgesRenderer?.isEnabled).toBe(false);
    expect(rig.material).toBe(material);
    expect(body.material).toBe(material);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});
