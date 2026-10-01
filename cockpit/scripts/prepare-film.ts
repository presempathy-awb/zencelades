import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const source = resolve(root, "source/research/enceladus-videos");
const destination = resolve(root, "source/research/enceladus-cinema/web/film-media");
const catalog = await Bun.file(resolve(root, "assets/enceladus-videos/catalog.json")).json();
await mkdir(destination, { recursive: true });
for (const filename of [
  "surface-to-space.mp4",
  "geyser-flythrough.mp4",
  "cassini-plume-2005.mp4",
]) {
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
