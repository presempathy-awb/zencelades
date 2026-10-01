import test from "node:test";
import assert from "node:assert/strict";
import {
  createNamingDraft,
  readLegacyNamingBackup,
  parseNamingDraft,
} from "../site/naming/draft-state.mjs";

const palette = {
  families: [
    { id: "moon", label: "Moon", enabled: true, words: ["luna"], selected: ["luna"], pool: [] },
  ],
  excluded: [],
  removedFamilies: [],
};
const shelves = {
  names: { luna: { name: "luna", scores: [5, 6, 7, 8, 9, 4, 3, 2], favorite: true } },
  current: ["luna"],
  weights: [50, 12, 10, 8, 7, 5, 5, 3],
  review_schema: 1,
  review_weights: [50, 10, 8, 6, 4, 4, 4, 2, 3, 3, 2, 4],
};

function visit() {
  const draft = createNamingDraft();
  let currentPalette = structuredClone(palette),
    currentShelves = structuredClone(shelves);
  draft.register(
    "palette",
    () => currentPalette,
    (next) => {
      currentPalette = next;
    },
  );
  draft.register(
    "shelves",
    () => currentShelves,
    (next) => {
      currentShelves = next;
    },
  );
  return draft;
}

test("Naming edits and imports stay in one visit, while exports preserve both editors", () => {
  const first = visit();
  const edited = first.snapshot();
  edited.palette.excluded.push("ocean");
  edited.shelves.names.luna.favorite = false;
  edited.shelves.names.luna.report = { verdict: "unverified", evidence: [] };
  first.replace(edited);
  assert.deepEqual(first.snapshot(), edited);
  const second = visit();
  assert.equal(second.snapshot().shelves.names.luna.favorite, true);
  assert.deepEqual(second.snapshot().palette.excluded, []);
  assert.deepEqual(parseNamingDraft(JSON.stringify(first.snapshot())), edited);
});

test("legacy recovery exports exact old bytes without deleting or rewriting storage", () => {
  const values = new Map([
    ["enceladus-naming-palette-v1", JSON.stringify(palette)],
    ["enceladus-naming-shelves-v1", "{broken old JSON"],
  ]);
  const before = [...values];
  const backup = readLegacyNamingBackup(
    { getItem: (key) => values.get(key) ?? null },
    "thatsnozorb",
  );
  assert.equal(backup.shelves, "{broken old JSON");
  assert.deepEqual([...values], before);
  assert.throws(() => parseNamingDraft(JSON.stringify(backup)), /unreadable/i);
  values.set("enceladus-naming-shelves-v1", JSON.stringify(shelves));
  const repaired = readLegacyNamingBackup(
    { getItem: (key) => values.get(key) ?? null },
    "thatsnozorb",
  );
  assert.deepEqual(parseNamingDraft(JSON.stringify(repaired)), { schema: 1, palette, shelves });
});

test("malformed imports cannot partly replace a working palette or shelves", () => {
  const draft = visit(),
    before = draft.snapshot();
  for (const bad of [
    { ...before, palette: { families: null } },
    { ...before, shelves: { ...shelves, weights: [NaN] } },
    { ...before, shelves: { ...shelves, names: { bad: { name: "<script>", scores: [] } } } },
    { ...before, shelves: { ...shelves, review_weights: [] } },
  ]) {
    assert.throws(() => draft.replace(bad));
    assert.deepEqual(draft.snapshot(), before);
  }
  assert.throws(() => parseNamingDraft(" ".repeat(4194305)), /size/i);
});
