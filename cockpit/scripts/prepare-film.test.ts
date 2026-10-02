import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { HUMAN_PORTRAIT } from "../src/film/human";
import { FILM_INSERTS } from "../src/film/shots";

const LANDER_MODEL_PATH = "deliveries/grant-3d-p059/zencelades-2p5m-lander.glb";
const LANDER_MODEL_BYTES = Uint8Array.of(0x47, 0x4c, 0x42);
const LANDER_MODEL_SHA256 = "340a469d206504e9ff1aea58823c2c57d252c3575d6dbc9e3f70d5bbf21ae701";
const SUSPENDED_MODEL_PATH = "deliveries/grant-3d-p059/zencelades-2p5m-suspended.glb";
const SUSPENDED_MODEL_BYTES = Uint8Array.of(0x47, 0x4c, 0x42, 0x53);
const SUSPENDED_MODEL_SHA256 = "066f58b47dbc370b7c3bcdb5920f64ba81e7c279b7cceffa4294102b76520f91";
const SURFACE_FILENAME = "enceladus-cassini-global-2024-1024.jpg";
const SURFACE_BYTES = Uint8Array.of(0xff, 0xd8, 0xff, 0xd9);
const SURFACE_SHA256 = "32461d5bd1773012acef0ba15636752949bd7c2ce50f9172159d9f56cf0dd9af";
const sourceDirectory = import.meta.dirname;

interface Fixture {
  root: string;
  script: string;
  landerModelOutput: string;
  suspendedModelOutput: string;
  surfaceOutput: string;
}

interface FixtureOptions {
  landerHash?: string;
  suspendedHash?: string;
  surfaceHash?: string;
  includeSuspendedProvenance?: boolean;
  includeUnknownModel?: boolean;
}

function sha256(bytes: Uint8Array): string {
  return new Bun.CryptoHasher("sha256").update(bytes).digest("hex");
}

async function createFixture(options: FixtureOptions = {}): Promise<Fixture> {
  const {
    landerHash = LANDER_MODEL_SHA256,
    suspendedHash = SUSPENDED_MODEL_SHA256,
    surfaceHash = SURFACE_SHA256,
    includeSuspendedProvenance = true,
    includeUnknownModel = false,
  } = options;
  const root = await mkdtemp(resolve(tmpdir(), "prepare-film-test-"));
  const script = resolve(root, "cockpit/scripts/prepare-film.ts");
  const filmSource = resolve(root, "cockpit/src/film");
  await mkdir(dirname(script), { recursive: true });
  await mkdir(filmSource, { recursive: true });
  await copyFile(resolve(sourceDirectory, "prepare-film.ts"), script);
  await copyFile(resolve(sourceDirectory, "../src/film/human.ts"), resolve(filmSource, "human.ts"));
  await copyFile(resolve(sourceDirectory, "../src/film/shots.ts"), resolve(filmSource, "shots.ts"));

  const catalogs = new Map<string, { relative_path: string; content_sha256: string }[]>();
  const media = [
    ...FILM_INSERTS,
    { src: HUMAN_PORTRAIT, collection: "enceladus-human" },
    { src: SURFACE_FILENAME, collection: "enceladus-surface" },
  ];
  for (const { src, collection } of media) {
    const bytes =
      collection === "enceladus-surface"
        ? SURFACE_BYTES
        : new TextEncoder().encode(`fixture:${collection}:${src}`);
    const relativePath = `originals/${src}`;
    const source = resolve(root, "source/research", collection, relativePath);
    await mkdir(dirname(source), { recursive: true });
    await writeFile(source, bytes);
    const entries = catalogs.get(collection) ?? [];
    entries.push({
      relative_path: relativePath,
      content_sha256: collection === "enceladus-surface" ? surfaceHash : sha256(bytes),
    });
    catalogs.set(collection, entries);
  }
  for (const [collection, sources] of catalogs) {
    const catalog = resolve(root, "assets", collection, "catalog.json");
    await mkdir(dirname(catalog), { recursive: true });
    await writeFile(catalog, JSON.stringify({ sources }));
  }

  for (const [path, bytes] of [
    [LANDER_MODEL_PATH, LANDER_MODEL_BYTES],
    [SUSPENDED_MODEL_PATH, SUSPENDED_MODEL_BYTES],
  ] as const) {
    const model = resolve(root, path);
    await mkdir(dirname(model), { recursive: true });
    await writeFile(model, bytes);
  }
  const projectionCatalog = resolve(root, "assets/enceladus-projection/catalog.json");
  await mkdir(dirname(projectionCatalog), { recursive: true });
  const inputs = [{ path: LANDER_MODEL_PATH, content_sha256: landerHash }];
  if (includeSuspendedProvenance) {
    inputs.push({ path: SUSPENDED_MODEL_PATH, content_sha256: suspendedHash });
  }
  const supportedModels = [
    { mode: "lander", path: LANDER_MODEL_PATH },
    { mode: "aerial", path: SUSPENDED_MODEL_PATH },
  ];
  if (includeUnknownModel) {
    supportedModels.push({ mode: "unknown", path: "deliveries/unknown.glb" });
  }
  await writeFile(projectionCatalog, JSON.stringify({ inputs, supported_models: supportedModels }));
  return {
    root,
    script,
    landerModelOutput: resolve(
      root,
      "source/research/enceladus-cinema/web/film-media/zencelades-2p5m-lander.glb",
    ),
    suspendedModelOutput: resolve(
      root,
      "source/research/enceladus-cinema/web/film-media/zencelades-2p5m-suspended.glb",
    ),
    surfaceOutput: resolve(
      root,
      "source/research/enceladus-cinema/web/film-media",
      SURFACE_FILENAME,
    ),
  };
}

function prepare(fixture: Fixture): ReturnType<typeof spawnSync> {
  return spawnSync(process.execPath, [fixture.script], {
    cwd: fixture.root,
    encoding: "utf8",
    timeout: 5_000,
  });
}

test("prepare-film copies both catalog-verified 2.5 m models and the global moon map", async () => {
  const fixture = await createFixture();
  try {
    const result = prepare(fixture);

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(new Uint8Array(await readFile(fixture.landerModelOutput))).toEqual(LANDER_MODEL_BYTES);
    expect(new Uint8Array(await readFile(fixture.suspendedModelOutput))).toEqual(
      SUSPENDED_MODEL_BYTES,
    );
    expect(new Uint8Array(await readFile(fixture.surfaceOutput))).toEqual(SURFACE_BYTES);
    expect(result.stdout).toContain("Verified and prepared zencelades-2p5m-lander.glb");
    expect(result.stdout).toContain("Verified and prepared zencelades-2p5m-suspended.glb");
  } finally {
    await rm(fixture.root, { recursive: true });
  }
});

test("prepare-film rejects a mismatched global map digest without copying it", async () => {
  const fixture = await createFixture({ surfaceHash: "0".repeat(64) });
  try {
    const result = prepare(fixture);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`Source digest mismatch: originals/${SURFACE_FILENAME}`);
    expect(await Bun.file(fixture.surfaceOutput).exists()).toBe(false);
  } finally {
    await rm(fixture.root, { recursive: true });
  }
});

test("prepare-film rejects a mismatched lander digest without copying the model", async () => {
  const fixture = await createFixture({ landerHash: "0".repeat(64) });
  try {
    const result = prepare(fixture);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`Source digest mismatch: ${LANDER_MODEL_PATH}`);
    expect(await Bun.file(fixture.landerModelOutput).exists()).toBe(false);
  } finally {
    await rm(fixture.root, { recursive: true });
  }
});

test("prepare-film rejects a mismatched suspended digest without copying it", async () => {
  const fixture = await createFixture({ suspendedHash: "0".repeat(64) });
  try {
    const result = prepare(fixture);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`Source digest mismatch: ${SUSPENDED_MODEL_PATH}`);
    expect(await Bun.file(fixture.suspendedModelOutput).exists()).toBe(false);
  } finally {
    await rm(fixture.root, { recursive: true });
  }
});

test("prepare-film rejects missing suspended provenance", async () => {
  const fixture = await createFixture({ includeSuspendedProvenance: false });
  try {
    const result = prepare(fixture);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(`Missing provenance for ${SUSPENDED_MODEL_PATH}`);
    expect(await Bun.file(fixture.suspendedModelOutput).exists()).toBe(false);
  } finally {
    await rm(fixture.root, { recursive: true });
  }
});

test("prepare-film rejects an unknown model declared by the projection catalog", async () => {
  const fixture = await createFixture({ includeUnknownModel: true });
  try {
    const result = prepare(fixture);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown projection model: unknown");
  } finally {
    await rm(fixture.root, { recursive: true });
  }
});
