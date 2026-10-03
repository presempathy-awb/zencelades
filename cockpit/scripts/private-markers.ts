import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readEffects, readMusicPrompt } from "../src/audio-prompts";

/** Use the studio's parsers for both build and release privacy checks. */
export async function privateMarkers(): Promise<string[]> {
  const root = resolve(import.meta.dir, "../..");
  const songs = (await readdir(resolve(root, "docs/audio/suno"))).filter((name) =>
    name.endsWith(".md"),
  );
  const music = await Promise.all(
    songs.map(async (name) =>
      readMusicPrompt(await readFile(resolve(root, "docs/audio/suno", name), "utf8"), name),
    ),
  );
  const effects = readEffects(
    await readFile(resolve(root, "docs/audio/elevenlabs-effects.md"), "utf8"),
  ).map((effect) => effect.prompt.slice(0, 45));
  if (music.length !== 8 || effects.length !== 16)
    throw new Error(
      `Expected 8 music and 16 effect prompts; got ${music.length} and ${effects.length}`,
    );
  const markers = [
    ...music.flatMap((song) =>
      [song.prompt, song.exclude, song.controls].map((text) => text.slice(0, 45)),
    ),
    ...effects,
  ];
  if (markers.some((marker) => marker.length < 30))
    throw new Error("Music/effect marker too short to identify its source");
  return [...new Set(markers)];
}

if (import.meta.main) console.log(JSON.stringify(await privateMarkers()));
