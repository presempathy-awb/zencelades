import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { HUMAN_PORTRAIT } from "../src/film/human";
import { FILM_INSERTS } from "../src/film/shots";

const root = resolve(import.meta.dirname, "../..");
const destination = resolve(root, "source/research/enceladus-cinema/web/film-media");
await mkdir(destination, { recursive: true });
const media = [
  ...FILM_INSERTS,
  { src: HUMAN_PORTRAIT, collection: "enceladus-human" },
  { src: "enceladus-cassini-global-2024-1024.jpg", collection: "enceladus-surface" },
];
for (const { src: filename, collection } of media) {
  const source = resolve(root, `source/research/${collection}`);
  const catalog = await Bun.file(resolve(root, `assets/${collection}/catalog.json`)).json();
  const path = `originals/${filename}`;
  const entries = catalog.sources as { relative_path: string; content_sha256: string }[];
  const entry = entries.find((e) => e.relative_path === path);
  if (!entry) throw new Error(`Missing provenance for ${path}`);
  const file = Bun.file(resolve(source, path));
  const hash = new Bun.CryptoHasher("sha256").update(await file.arrayBuffer()).digest("hex");
  if (hash !== entry.content_sha256) throw new Error(`Source digest mismatch: ${path}`);
  await copyFile(resolve(source, path), resolve(destination, filename));
  console.log(`Verified and prepared ${filename}`);
}

const modelOutputs = {
  lander: {
    path: "deliveries/grant-3d-p059/zencelades-2p5m-lander.glb",
    filename: "zencelades-2p5m-lander.glb",
  },
  aerial: {
    path: "deliveries/grant-3d-p059/zencelades-2p5m-suspended.glb",
    filename: "zencelades-2p5m-suspended.glb",
  },
} as const;
type ModelMode = keyof typeof modelOutputs;
interface ProjectionModel {
  mode: string;
  path: string;
}
interface ProjectionCatalog {
  inputs: { path: string; content_sha256: string }[];
  supported_models: ProjectionModel[];
}

const projectionCatalog = (await Bun.file(
  resolve(root, "assets/enceladus-projection/catalog.json"),
).json()) as ProjectionCatalog;
for (const model of projectionCatalog.supported_models) {
  if (!(model.mode in modelOutputs)) throw new Error(`Unknown projection model: ${model.mode}`);
  const expected = modelOutputs[model.mode as ModelMode];
  if (model.path !== expected.path) {
    throw new Error(`Unknown projection model path: ${model.path}`);
  }
}
for (const [mode, model] of Object.entries(modelOutputs) as [
  ModelMode,
  (typeof modelOutputs)[ModelMode],
][]) {
  const declared = projectionCatalog.supported_models.find((entry) => entry.mode === mode);
  if (!declared) throw new Error(`Missing supported projection model: ${mode}`);
  const provenance = projectionCatalog.inputs.find((entry) => entry.path === model.path);
  if (!provenance) throw new Error(`Missing provenance for ${model.path}`);
  const source = Bun.file(resolve(root, model.path));
  const hash = new Bun.CryptoHasher("sha256").update(await source.arrayBuffer()).digest("hex");
  if (hash !== provenance.content_sha256) {
    throw new Error(`Source digest mismatch: ${model.path}`);
  }
  await copyFile(resolve(root, model.path), resolve(destination, model.filename));
  console.log(`Verified and prepared ${model.filename}`);
}
