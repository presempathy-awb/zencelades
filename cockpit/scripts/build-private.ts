import { cp } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");
const result = Bun.spawn(["bun", "x", "vite", "build", "--config", "vite.private.config.ts"], {
  cwd: root,
  stdout: "inherit",
  stderr: "inherit",
});
if ((await result.exited) !== 0) throw new Error("Private studio build failed");
await cp(resolve(root, "../docs/audio"), resolve(root, "private-dist/documents/audio"), {
  recursive: true,
});
