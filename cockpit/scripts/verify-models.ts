import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { ImportMeshAsync } from "@babylonjs/core/Loading/sceneLoader";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/loaders/glTF";

const directory = resolve(import.meta.dir, "../public/studio-models");
const manifest = JSON.parse(await readFile(resolve(directory, "manifest.json"), "utf8"));
const engine = new NullEngine();
let verified = 0;
try {
  for (const record of manifest.models) {
    const native = await readFile(resolve(directory, record.file));
    const binary = await readFile(resolve(directory, record.glb.file));
    for (const [bytes, expected] of [
      [native, record.sha256],
      [binary, record.glb.sha256],
    ] as const) {
      if (createHash("sha256").update(bytes).digest("hex") !== expected)
        throw new Error(`Hash mismatch: ${record.id}`);
    }
    const scene = new Scene(engine);
    try {
      const imported = await ImportMeshAsync(binary, scene, {
        pluginExtension: ".glb",
        name: record.glb.file,
      });
      const names = new Set(imported.meshes.map((mesh) => mesh.name));
      const source = JSON.parse(native.toString("utf8"));
      for (const mesh of source.meshes) {
        if (!names.has(mesh.name)) throw new Error(`Lost component: ${record.id}/${mesh.name}`);
      }
      for (const mesh of imported.meshes.filter((item) => item.getTotalVertices() > 0)) {
        mesh.computeWorldMatrix(true);
        const box = mesh.getBoundingInfo().boundingBox;
        if (
          !mesh.getVerticesData("position")?.every(Number.isFinite) ||
          ![...box.minimumWorld.asArray(), ...box.maximumWorld.asArray()].every(Number.isFinite)
        )
          throw new Error(`Invalid imported geometry: ${record.id}/${mesh.name}`);
      }
      verified++;
    } finally {
      scene.dispose();
    }
  }
  console.log(
    JSON.stringify({
      verifiedModels: verified,
      hashes: "native + GLB",
      import: "components and finite world bounds",
      browser: "not exercised",
    }),
  );
} finally {
  engine.dispose();
}
