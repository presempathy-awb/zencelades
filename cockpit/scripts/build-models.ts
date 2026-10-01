import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { SceneSerializer } from "@babylonjs/core/Misc/sceneSerializer";
import { Scene } from "@babylonjs/core/scene";
import { buildModel } from "../src/models/support-models";
import { MODEL_STUDIES } from "../src/models/model-spec";

const output=resolve(import.meta.dir,"../public/studio-models");
await mkdir(output,{recursive:true});
const engine=new NullEngine(), records=[];
try {
  for(const study of MODEL_STUDIES) {
    const scene=new Scene(engine);buildModel(scene,study.id);
    for(const mesh of scene.meshes) {
      mesh.computeWorldMatrix(true);
      if(!mesh.getVerticesData("position")?.every(Number.isFinite)) throw new Error(`Invalid geometry: ${study.id}/${mesh.name}`);
    }
    const data=JSON.stringify(SceneSerializer.Serialize(scene));
    const name=`${study.id}.babylon`;
    await writeFile(resolve(output,name),data);
    records.push({...study,file:name,bytes:Buffer.byteLength(data),sha256:createHash("sha256").update(data).digest("hex"),meshes:scene.meshes.length,vertices:scene.getTotalVertices()});
    scene.dispose();
  }
  await writeFile(resolve(output,"manifest.json"),JSON.stringify({schema:1,units:"metres",up:"Y",format:"Babylon scene JSON",accuracy:"dimensioned layout studies; no fabrication or capacity approval",models:records},null,2)+"\n");
  console.log(`Built ${records.length} downloadable model studies with finite geometry and SHA-256 manifest.`);
} finally {engine.dispose();}
