import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { FILM_INSERTS } from "../src/film/shots";

const root = resolve(import.meta.dirname, "../..");
const destination = resolve(root, "source/research/enceladus-cinema/web/film-media");
await mkdir(destination, { recursive: true });
for (const { src: filename, collection } of FILM_INSERTS) {
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
