import { expect, test } from "bun:test";
import { readMusicPrompt, readEffects } from "./audio-prompts";
import { readdirSync, readFileSync } from "node:fs";

test("music copy fields preserve prose independently from provider settings", () => {
  const song = readMusicPrompt(
    "# Ice\nUse: Surface\nTempo/key targets: 96 BPM, D minor\nMix family: 96 BPM\n\n## Style prompt\n```text\nCrystalline drums.\n```\n## Exclude\n```text\nvoices\n```\n## Suno controls\nInstrumental on.",
    "ice",
  );
  expect(song.title).toBe("Ice");
  expect(song.prompt).toBe("Crystalline drums.");
  expect(song.exclude).toBe("voices");
  expect(song.use).toBe("Surface");
  expect(song.controls).toBe("Instrumental on.");
  expect(() =>
    readMusicPrompt("# Ice\n```text\nMusic\n```\n```text\nVoices\n```", "no-controls"),
  ).toThrow();
  expect(() => readMusicPrompt("# Missing prompt", "broken")).toThrow();
});

test("effects retain individual loop and duration targets and reject bad rows", () => {
  const effects = readEffects(
    "| sfx-01 · Water | Ocean | 20 | On | Gentle water. |\n| sfx-02 · Ice | Reveal | 3 | Off | Soft tick. |",
  );
  expect(effects).toEqual([
    {
      id: "sfx-01",
      title: "Water",
      use: "Ocean",
      seconds: 20,
      loop: true,
      prompt: "Gentle water.",
    },
    { id: "sfx-02", title: "Ice", use: "Reveal", seconds: 3, loop: false, prompt: "Soft tick." },
  ]);
  expect(() => readEffects("| sfx-01 · Bad | Ocean | 99 | On | Test |")).toThrow();
  expect(() =>
    readEffects("| sfx-01 · Water | Ocean | 20 | On | Water | silently lost |"),
  ).toThrow();
});

test("the authored pack keeps all eight songs and sixteen complete effect cues", () => {
  const root = new URL("../../docs/audio/", import.meta.url);
  const songs = readdirSync(new URL("suno/", root)).filter((file) => file.endsWith(".md"));
  expect(songs).toHaveLength(8);
  for (const file of songs) {
    const song = readMusicPrompt(readFileSync(new URL(`suno/${file}`, root), "utf8"), file);
    expect(song.controls.length).toBeGreaterThan(20);
    expect(song.prompt.length).toBeGreaterThan(100);
    expect(song.exclude.length).toBeGreaterThan(10);
  }
  expect(readEffects(readFileSync(new URL("elevenlabs-effects.md", root), "utf8"))).toHaveLength(
    16,
  );
});
