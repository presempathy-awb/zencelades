import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { privateMarkers } from "./private-markers";

const root = resolve(import.meta.dir, "../..");
const markers = await privateMarkers();
async function texts(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await texts(path)));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}
for (const path of await texts(resolve(root, "cockpit/dist"))) {
  const content = await readFile(path, "utf8");
  const normalized = content.replace(
    /(?<!\\)\\(?:u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2}))/g,
    (_, unicode: string | undefined, hex: string | undefined) =>
      String.fromCharCode(Number.parseInt(unicode ?? hex!, 16)),
  );
  if (
    markers.some(
      (marker) =>
        normalized.includes(marker) || normalized.includes(JSON.stringify(marker).slice(1, -1)),
    )
  )
    throw new Error(`Private prompt content is in the public build: ${path}`);
}
const privateText = (
  await Promise.all(
    (
      await texts(resolve(root, "cockpit/private-dist"))
    )
      .filter((path) => path.endsWith(".js"))
      .map((path) => readFile(path, "utf8")),
  )
).join("\n");
if (!markers.every((marker) => privateText.includes(marker)))
  throw new Error("Private JavaScript is missing a music or effect prompt");
console.log(
  `Checked ${markers.length} current style, exclude, controls and effect excerpts in cockpit/dist (including common JS escapes); all excerpts occur in private JavaScript independently of copied documents. This is marker coverage, not proof against arbitrary encodings or historical text.`,
);
