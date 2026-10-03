import { fileURLToPath } from "node:url";
import { verifyRecording } from "./recording-artifacts.mjs";

await verifyRecording(fileURLToPath(new URL("..", import.meta.url)));
console.log("Homepage recording matches current renderer/preset and output bytes.");
