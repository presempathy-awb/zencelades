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
    else if (/\.(?:html|js|mjs|json|md|txt|map)$/.test(entry.name)) result.push(path);
  }
  return result;
}
for (const path of await texts(resolve(root, "cockpit/dist"))) {
  const content = await readFile(path, "utf8");
  if (markers.some((marker) => content.includes(marker)))
    throw new Error(`Private prompt content is in the public build: ${path}`);
}
const privateText = (
  await Promise.all(
    (await texts(resolve(root, "cockpit/private-dist"))).map((path) => readFile(path, "utf8")),
  )
).join("\n");
if (!markers.every((marker) => privateText.includes(marker)))
  throw new Error("Private build is missing a music or effect prompt");
console.log(
  "Public build has no prompt content; private build retains all eight songs and sixteen effects.",
);
