import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "../..");
const output = resolve(root, "cockpit/public/studio-data");
await mkdir(output, { recursive: true });
const files = {
  "assets/catalog.json": "catalog.json",
  "assets/v4-catalog.json": "v4-catalog.json",
  "assets/grant-sources.json": "grants.json",
  "assets/mount-sources.json": "mounts.json",
  "docs/truck-and-option-models.md": "truck-and-option-models.md",
  "deliveries/enceladus_v3/models/v3_A_literal_dual_hitch.glb": "original-a.glb",
  "deliveries/enceladus_v3/models/v3_B_chassis_saddle.glb": "original-b.glb",
  "deliveries/enceladus_v4_fixed15/models/v4_A_fixed15_centerline.glb": "original-v4.glb",
};
for (const [source, name] of Object.entries(files))
  await copyFile(resolve(root, source), resolve(output, name));
console.log(`Prepared ${Object.keys(files).length} project data/model files; originals unchanged.`);
await import("./build-models");
