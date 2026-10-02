import { expect, test } from "bun:test";
import { readMusicPrompt, readEffects } from "./audio-prompts";

test("music copy fields preserve prose independently from provider settings", () => {
  const song = readMusicPrompt(
    "# Ice\nUse: Surface\nTempo/key targets: 96 BPM, D minor\nMix family: 96 BPM\n\n## Style prompt\n```text\nCrystalline drums.\n```\n## Exclude\n```text\nvoices\n```",
    "ice",
  );
  expect(song.title).toBe("Ice");
  expect(song.prompt).toBe("Crystalline drums.");
  expect(song.exclude).toBe("voices");
  expect(song.use).toBe("Surface");
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
});
