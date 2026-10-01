import test from "node:test";
import assert from "node:assert/strict";
import { weightedScore, rememberNames, rankNames, defaultWeights } from "../site/naming/ranking-state.mjs";

test("research refresh uses the whole receipt date and preserves personal state", () => {
  const old = { verdict: "unverified", evidence: [{ checked_at: "2026-09-30T20:00:00Z" }] };
  const state = { names: { moonlet: { name: "moonlet", report: old, forgotten: true, favorite: true } }, current: [] };
  const fresh = { verdict: "clean", checked_at: "2026-10-01T00:00:00Z", evidence: [{ checked_at: "2026-09-30T20:00:00Z" }, { checked_at: "2026-09-30T23:00:00Z" }] };
  rememberNames(state, [{ name: "moonlet", report: fresh }]);
  assert.equal(state.names.moonlet.report.verdict, "clean");
  assert.equal(state.names.moonlet.forgotten, true);
  assert.equal(state.names.moonlet.favorite, true);
  rememberNames(state, [{ name: "moonlet", report: old }]);
  assert.equal(state.names.moonlet.report.verdict, "clean");
  state.names.moonlet.report = { ...old, verdict: "taken" };
  rememberNames(state, [{ name: "moonlet", report: fresh }]);
  assert.equal(state.names.moonlet.report.verdict, "taken", "a later no-hit snapshot must not erase known existing use");
  state.names.moonlet.report = fresh;
  rememberNames(state, [{ name: "moonlet", report: { ...old, verdict: "taken" } }]);
  assert.equal(state.names.moonlet.report.verdict, "taken", "newly supplied existing-use evidence must survive a newer no-hit snapshot");
  state.names.moonlet = { name: "moonlet", verdict: "taken" };
  rememberNames(state, [{ name: "moonlet", report: fresh }]);
  assert.equal(state.names.moonlet.report?.verdict ?? state.names.moonlet.verdict, "taken");
});

test("eight weights normalize, preference starts at half, and changes rerank", () => {
  const preferred = { name: "cryzorcean", scores: [10, 2, 2, 2, 2, 2, 2, 2] };
  const readable = { name: "moonpaddle", scores: [2, 10, 10, 10, 10, 10, 10, 10] };
  assert.equal(weightedScore(preferred.scores, defaultWeights), 60);
  assert.equal(weightedScore(preferred.scores, defaultWeights.map(w => w * 2)), 60);
  assert.equal(rankNames([readable, preferred], [100, 0, 0, 0, 0, 0, 0, 0])[0].name, "cryzorcean");
  assert.equal(rankNames([preferred, readable], [0, 100, 0, 0, 0, 0, 0, 0])[0].name, "moonpaddle");
  assert.equal(weightedScore(preferred.scores, Array(8).fill(0)), null);
  assert.throws(() => weightedScore([NaN], defaultWeights));
});

test("rerolls archive earlier results while keeping favorites, creations, edits and receipts", () => {
  const state = { names: {}, current: [] };
  rememberNames(state, [{ name: "Cryzorcean", scores: Array(8).fill(8), creation: true, favorite: true, report: { verdict: "taken" } }], true);
  state.names.cryzorcean.forgotten = true;
  state.names.cryzorcean.scores[0] = 10;
  rememberNames(state, [{ name: "plunavera" }], true);
  assert.deepEqual(state.current, ["plunavera"]);
  assert.equal(state.names.cryzorcean.creation, true);
  assert.equal(state.names.cryzorcean.favorite, true);
  rememberNames(state, [{ name: "cryzorcean", scores: Array(8).fill(3) }]);
  const restored = JSON.parse(JSON.stringify(state));
  assert.equal(restored.names.cryzorcean.scores[0], 10);
  assert.equal(restored.names.cryzorcean.forgotten, true);
  assert.equal(restored.names.cryzorcean.report.verdict, "taken");
  assert.equal(Object.keys(restored.names).length, 2);
  restored.names.cryzorcean.favorite = false;
  rememberNames(restored, [{ name: "cryzorcean", favorite: true }]);
  assert.equal(restored.names.cryzorcean.favorite, false, "published defaults must not undo an unsaved favorite");
});

test("new editorial explanations refresh saved names without replacing personal choices", () => {
  const state = { names: {}, current: [], weights: [60,10,10,5,5,5,3,2] };
  rememberNames(state, [{ name: "cryzorcean", explanation: "Old copy", scores: Array(8).fill(8), creation: true, report: { verdict: "taken" } }], true);
  Object.assign(state.names.cryzorcean, { favorite: false, forgotten: true });
  state.names.cryzorcean.scores[0] = 10;
  const before = structuredClone(state);
  rememberNames(state, [{ name: "cryzorcean", explanation: "Ice, sphere and ocean share a compressed seam.", explanation_revision: 1, scores: Array(8).fill(3), favorite: true }]);
  assert.equal(state.names.cryzorcean.explanation, "Ice, sphere and ocean share a compressed seam.");
  assert.equal(state.names.cryzorcean.explanation_revision, 1);
  for (const key of ["scores", "creation", "favorite", "forgotten", "report"]) assert.deepEqual(state.names.cryzorcean[key], before.names.cryzorcean[key]);
  assert.deepEqual(state.current, before.current);
  assert.deepEqual(state.weights, before.weights);
  rememberNames(state, [{ name: "cryzorcean", explanation: "Stale copy" }]);
  assert.equal(state.names.cryzorcean.explanation, "Ice, sphere and ocean share a compressed seam.");
  rememberNames(state, [{ name: "cryzorcean", explanation: "", explanation_revision: 2 }]);
  assert.equal(state.names.cryzorcean.explanation, "Ice, sphere and ocean share a compressed seam.");
});
