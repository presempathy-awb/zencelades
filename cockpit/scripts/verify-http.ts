import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const origin = new URL(process.argv[2] ?? "");
if (
  !/^(https?:)$/.test(origin.protocol) ||
  origin.username ||
  origin.password ||
  origin.pathname !== "/"
)
  throw new Error("Pass a plain HTTP(S) origin");
const root = resolve(import.meta.dir, "../dist");
async function files(directory: string, prefix = ""): Promise<string[]> {
  const result: string[] = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.isDirectory())
      result.push(...(await files(join(directory, item.name), `${prefix}${item.name}/`)));
    else if (item.isFile()) result.push(`${prefix}${item.name}`);
    else throw new Error(`Unexpected linked artifact: ${item.name}`);
  }
  return result;
}
const entries = await files(root);
const digest = (data: Uint8Array): string => createHash("sha256").update(data).digest("hex");
// Reproduce the browser's shader-module burst: the old five-connection preview
// backlog reset requests here and left a blank WebGL scene.
const modules = entries.filter((path) => path.startsWith("studio-assets/") && path.endsWith(".js"));
await Promise.all(
  modules.map(async (path) => {
    const response = await fetch(new URL(`/${path}`, origin), {
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Concurrent module request failed: ${path}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (digest(bytes) !== digest(await readFile(join(root, path))))
      throw new Error(`Concurrent module bytes differ: ${path}`);
  }),
);
// Read serially: integrity verification does not need to stress the local preview listener.
for (const path of entries) {
  const response = await fetch(new URL(path === "index.html" ? "/" : `/${path}`, origin), {
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  const served = new Uint8Array(await response.arrayBuffer());
  const expected = await readFile(join(root, path));
  if (digest(served) !== digest(expected)) throw new Error(`Different served bytes: ${path}`);
  if (
    path === "index.html" &&
    (response.headers.get("x-content-type-options") !== "nosniff" ||
      !response.headers.get("content-security-policy")?.includes("default-src 'self'"))
  )
    throw new Error("Expected security headers missing");
}
for (const path of [
  "/catalog/",
  "/pricing/",
  "/pricing/calculation.mjs",
  "/mounts/",
  "/grants/",
  "/naming/",
]) {
  const response = await fetch(new URL(path, origin), {
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Legacy route failed: ${path}: ${response.status}`);
}
console.log(
  JSON.stringify(
    {
      origin: origin.origin,
      studioFilesMatched: entries.length,
      legacyRoutes: 6,
      browserInteraction: "not tested by this HTTP check",
    },
    null,
    2,
  ),
);
