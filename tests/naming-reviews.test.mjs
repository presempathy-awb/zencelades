import test from "node:test";
import assert from "node:assert/strict";
import { reviewScores, reviewScore, averageWeights, migrateReviews, applyReviews, reviewDimensions } from "../site/naming/review-state.mjs";

const scores = value => Object.fromEntries(["preference", ...reviewDimensions.slice(2)].map(key => [key, value]));

test("editorial explanations refresh saved cards without relabelling reviews or altering user choices", () => {
  const candidate = { name: "moonlet", morphemes: ["moon", "let"], explanation: "Original reviewed story.", editorial_explanation: "Older editorial copy.", favorite: true, forgotten: true, score_overrides: { memory: 9 }, report: { verdict: "clean" } };
  const state = { names: { moonlet: candidate } };
  const before = structuredClone(candidate);
  const entry = { morphemes: [...candidate.morphemes], explanation: candidate.explanation, editorial_explanation: "A detailed new editorial story.", chatgpt: { scores: scores(8) }, grok: { scores: scores(6) } };
  const data = { revision: 2, candidates: { moonlet: entry } };
  applyReviews(state, data);
  assert.equal(candidate.editorial_explanation, entry.editorial_explanation);
  assert.equal(candidate.explanation, before.explanation);
  assert.equal(reviewScores(candidate)[10], 7);
  for (const key of ["favorite", "forgotten", "score_overrides", "report"]) assert.deepEqual(candidate[key], before[key]);
  candidate.morphemes = ["different"];
  applyReviews(state, data);
  assert.equal(candidate.editorial_explanation, undefined);
  assert.equal(candidate.reviews, undefined);
  candidate.morphemes = before.morphemes;
  candidate.explanation = "A different unreviewed story.";
  applyReviews(state, data);
  assert.equal(candidate.editorial_explanation, undefined);
  candidate.explanation = before.explanation;
  entry.editorial_explanation = "  ";
  applyReviews(state, data);
  assert.equal(candidate.editorial_explanation, undefined);
  assert.ok(candidate.reviews);
});

test("each AI can retain fifteen final picks across current and historical names", () => {
  const names = Array.from({ length: 16 }, (_, i) => `choice${i}`);
  const state = { names: Object.fromEntries(names.map(name => [name, { name }])) };
  const data = { candidates: {}, favorites: { chatgpt: names.map(name => ({ name })) } };
  applyReviews(state, data);
  assert.deepEqual(state.names.choice14.model_favorites, ["chatgpt"]);
  assert.deepEqual(state.names.choice15.model_favorites, []);
});

test("shared scores average both judges while preferences and personal overrides stay separate", () => {
  const candidate = { reviews: { chatgpt: { scores: scores(8) }, grok: { scores: scores(4) } } };
  assert.deepEqual(reviewScores(candidate), [8, 4, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]);
  assert.equal(reviewScore(candidate, [25, 25, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 60);
  candidate.score_overrides = { sayability: 10 };
  assert.equal(reviewScore(candidate, [0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 100);
  delete candidate.reviews.grok;
  assert.equal(reviewScores(candidate)[1], null);
  assert.equal(reviewScores(candidate)[3], null);
  assert.equal(reviewScore(candidate, Array(12).fill(1)), null);
  assert.equal(reviewScore(candidate, Array(12).fill(0)), null);
  assert.throws(() => averageWeights(Array(12).fill(0), Array(12).fill(1)));
  assert.deepEqual(averageWeights([100, ...Array(11).fill(0)], [0, 10, ...Array(10).fill(0)]), [50, 50, ...Array(10).fill(0)]);
});

test("migration preserves edits and shelves without converting water or light ratings to new criteria", () => {
  const original = [8, 7, 6, 9, 8, 9, 5, 7];
  const state = { names: { moonlet: { name: "moonlet", scores: [9, 7, 6, 2, 8, 1, 5, 7], favorite: false, forgotten: true, creation: true, report: { verdict: "clean" } } }, current: ["moonlet"], weights: [60, 10, 10, 5, 5, 5, 3, 2] };
  const before = structuredClone(state);
  migrateReviews(state, { moonlet: original });
  assert.deepEqual(state.legacy_weights, before.weights);
  assert.deepEqual(state.names.moonlet.scores, before.names.moonlet.scores);
  assert.deepEqual(state.names.moonlet.score_overrides, { preference: 9 });
  assert.equal(state.review_weights[0], 60);
  assert.equal(state.review_weights[4], 0);
  assert.equal(state.review_weights[6], 0);
  for (const key of ["favorite", "forgotten", "creation", "report"]) assert.deepEqual(state.names.moonlet[key], before.names.moonlet[key]);
  const migrated = structuredClone(state);
  migrateReviews(state, { moonlet: original });
  assert.deepEqual(state, migrated);
});

test("review refresh and model favorites never resurrect eliminated names or overwrite edits", () => {
  const state = { names: { alive: { name: "alive", morphemes: ["a", "live"], favorite: false, score_overrides: { memory: 9 } }, hidden: { name: "hidden", forgotten: true }, taken: { name: "taken", report: { verdict: "taken" } } }, current: ["alive"] };
  const data = { revision: 1, candidates: { alive: { morphemes: ["a", "live"], chatgpt: { scores: scores(8) }, grok: { scores: scores(6) } } }, favorites: { chatgpt: [{ name: "alive" }, { name: "hidden" }, { name: "taken" }], grok: [{ name: "alive" }] } };
  applyReviews(state, data);
  assert.equal(reviewScores(state.names.alive)[3], 9);
  assert.equal(state.names.alive.favorite, false);
  assert.deepEqual(state.names.alive.model_favorites, ["chatgpt", "grok"]);
  assert.deepEqual(state.names.hidden.model_favorites, []);
  assert.deepEqual(state.names.taken.model_favorites, []);
  assert.deepEqual(state.current, ["alive"]);
  state.names.alive.morphemes = ["different"];
  applyReviews(state, data);
  assert.equal(state.names.alive.reviews, undefined);
  state.names.alive.morphemes = ["a", "live"];
  state.names.alive.explanation = "A different story that has not been reviewed.";
  applyReviews(state, data);
  assert.equal(state.names.alive.reviews, undefined);
});
