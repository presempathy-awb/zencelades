import test from "node:test";
import assert from "node:assert/strict";
import { removeWord, removeFamily, refillFamily, activeWords, addCatalogFamilies } from "../site/naming/editor-state.mjs";

const draft = () => ({ families: [{ id: "moon", enabled: true, words: ["moon", "luna"], selected: ["moon"] }, { id: "water", enabled: false, words: ["tide"], selected: ["tide"] }], excluded: [], removedFamilies: [] });
test("unchecked words and disabled families stay out of rolls", () => {
  assert.deepEqual(activeWords(draft()), ["moon"]);
});
test("removed words stay excluded through a refill", () => {
  const state = draft();
  removeWord(state, "moon", "moon");
  refillFamily(state, "moon", ["moon", "selene", "selene"]);
  assert.deepEqual(state.families[0].words, ["luna", "selene"]);
  assert.deepEqual(activeWords(state), ["selene"]);
  assert.deepEqual(state.excluded, ["moon"]);
});
test("removing a family remembers its words and identity", () => {
  const state = draft();
  removeFamily(state, "moon");
  assert.deepEqual(state.removedFamilies, ["moon"]);
  assert.deepEqual(state.excluded, ["moon", "luna"]);
  assert.deepEqual(activeWords(state), []);
});

test("new theme families preserve edits and exclusions and fit the checked-word budget", () => {
  const state = { families: Array.from({ length: 8 }, (_, i) => {
    const words = Array.from({ length: i === 7 ? 28 : 32 }, (_, j) => `word${String.fromCharCode(97+i)}${String.fromCharCode(97+Math.floor(j/26))}${String.fromCharCode(97+j%26)}`);
    return { id: `existing_${i}`, words, selected: [...words], enabled: true };
  }), excluded: ["warp"], removedFamilies: ["astral_projection"] };
  const original = JSON.stringify(state.families);
  const catalog = [
    { id: "space_travel", enabled: true, words: ["astro", "cosmo", "voyage", "stellar", "starship", "warp"], selected: [], pool: ["hyperdrive"] },
    { id: "protoplasm_early_life", enabled: true, words: ["proto", "plasm"], selected: [] },
    { id: "astral_projection", enabled: true, words: ["astral"], selected: [] },
  ];
  const result = addCatalogFamilies(state, catalog, catalog.map(f => f.id));
  assert.equal(result.added, 2);
  assert.equal(result.unchecked, 3);
  assert.equal(activeWords(state).length, 256);
  assert.equal(JSON.stringify(state.families.slice(0,8)), original);
  assert.equal(state.families.at(-1).enabled, false);
  assert.ok(!state.families.some(f => f.words.includes("warp") || f.id === "astral_projection"));
  assert.deepEqual(addCatalogFamilies(state, catalog, catalog.map(f => f.id)), { added: 0, unchecked: 0 });
});
