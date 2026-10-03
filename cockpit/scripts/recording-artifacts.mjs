import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

/** Hash actual input bytes in stable path order, excluding earlier exports. */
export async function inputHashes(directory, prefix = "") {
  const result = {};
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith("homepage-")) continue;
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Linked recording input: ${name}`);
    if (entry.isDirectory())
      Object.assign(result, await inputHashes(join(directory, entry.name), `${name}/`));
    else result[name] = digest(await readFile(join(directory, entry.name)));
  }
  return result;
}

/** Compute the content digest used by the recording receipt. */
export const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Bind a recording to its renderer, assets manifest and selected preset. */
export async function sourceHashes(cockpit) {
  const result = {
    ...(await inputHashes(join(cockpit, "src/showtime"), "src/showtime/")),
    ...(await inputHashes(join(cockpit, "src/film"), "src/film/")),
  };
  for (const name of [
    "showtime/index.html",
    "scripts/homepage-preset.json",
    "../assets/enceladus-projection/catalog.json",
    "../assets/enceladus-videos/catalog.json",
    "../assets/enceladus-extra/catalog.json",
    "../assets/enceladus-human/catalog.json",
    "../assets/enceladus-surface/catalog.json",
  ])
    result[name] = digest(await readFile(join(cockpit, name)));
  return result;
}

/** Refuse an absent, stale or corrupted homepage recording before the SPA build. */
export async function verifyRecording(cockpit) {
  const output = resolve(cockpit, "../source/research/enceladus-cinema/web");
  const receipt = JSON.parse(await readFile(join(output, "homepage-recording.json"), "utf8"));
  if (JSON.stringify(receipt.sources) !== JSON.stringify(await sourceHashes(cockpit)))
    throw new Error("Homepage recording is stale; run just record-showtime");
  for (const [name, key] of [
    ["homepage-loop.mp4", "movieSha256"],
    ["homepage-poster.jpg", "posterSha256"],
  ]) {
    if (digest(await readFile(join(output, name))) !== receipt[key])
      throw new Error(`Homepage recording digest mismatch: ${name}`);
  }
  return receipt;
}
