import { expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inputHashes, verifyRecording } from "./recording-artifacts.mjs";

test("recording verification rejects changed renderer, preset or movie bytes", async () => {
  const root = await mkdtemp(join(tmpdir(), "showtime-receipt-test-"));
  const cockpit = join(root, "cockpit");
  const output = join(root, "source/research/enceladus-cinema/web");
  const files = {
    "src/showtime/main.ts": "renderer",
    "src/film/main.ts": "film",
    "showtime/index.html": "page",
    "scripts/homepage-preset.json": "{}",
    "../assets/enceladus-projection/catalog.json": "{}",
    "../assets/enceladus-videos/catalog.json": "{}",
    "../assets/enceladus-extra/catalog.json": "{}",
    "../assets/enceladus-human/catalog.json": "{}",
    "../assets/enceladus-surface/catalog.json": "{}",
  };
  try {
    for (const [name, bytes] of Object.entries(files)) {
      await mkdir(join(cockpit, name, ".."), { recursive: true });
      await writeFile(join(cockpit, name), bytes);
    }
    await mkdir(output, { recursive: true });
    await writeFile(join(output, "homepage-loop.mp4"), "movie");
    await writeFile(join(output, "homepage-poster.jpg"), "poster");
    await writeFile(
      join(output, "homepage-recording.json"),
      JSON.stringify({
        sources: {
          "src/showtime/main.ts":
            "6bd52b204f5b4cffb267597f37d0fa62bae229341394dfec0e5d42439d8b722c",
          "src/film/main.ts": "d0607f7ad2628b2af9158dfba06ce87166e66b15bf68f8f358f9aa27ccb7c321",
          "showtime/index.html": "3660315a9af3df255d8f19ab077e4797822b41488a0e2a04bc6af71213c23274",
          "scripts/homepage-preset.json":
            "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
          "../assets/enceladus-projection/catalog.json":
            "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
          "../assets/enceladus-videos/catalog.json":
            "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
          "../assets/enceladus-extra/catalog.json":
            "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
          "../assets/enceladus-human/catalog.json":
            "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
          "../assets/enceladus-surface/catalog.json":
            "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
        },
        movieSha256: "8a6ba32c9bed6ce703f999f9af6ec23686d44e144e4da572d94c8daca4a9cbab",
        posterSha256: "293b9207228b7854bc3ccb2959ebea1583e066d41983124a5b381d6fdf6575f8",
      }),
    );
    expect((await verifyRecording(cockpit)).movieSha256).toBe(
      "8a6ba32c9bed6ce703f999f9af6ec23686d44e144e4da572d94c8daca4a9cbab",
    );
    for (const name of [
      "src/showtime/main.ts",
      "scripts/homepage-preset.json",
      "../assets/enceladus-projection/catalog.json",
    ] as const) {
      await writeFile(join(cockpit, name), "changed");
      await expect(verifyRecording(cockpit)).rejects.toThrow("recording is stale");
      await writeFile(join(cockpit, name), files[name]);
    }
    await writeFile(join(output, "homepage-loop.mp4"), "changed");
    await expect(verifyRecording(cockpit)).rejects.toThrow("digest mismatch");
    await writeFile(join(output, "homepage-loop.mp4"), "movie");
    await writeFile(join(output, "homepage-poster.jpg"), "changed");
    await expect(verifyRecording(cockpit)).rejects.toThrow("digest mismatch");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("capture inputs exclude old exports and refuse linked files", async () => {
  const root = await mkdtemp(join(tmpdir(), "showtime-inputs-test-"));
  try {
    await writeFile(join(root, "page.html"), "page");
    await writeFile(join(root, "homepage-loop.mp4"), "old output");
    expect(await inputHashes(root)).toEqual({
      "page.html": "3660315a9af3df255d8f19ab077e4797822b41488a0e2a04bc6af71213c23274",
    });
    await symlink(join(root, "page.html"), join(root, "linked.html"));
    await expect(inputHashes(root)).rejects.toThrow("Linked recording input");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
