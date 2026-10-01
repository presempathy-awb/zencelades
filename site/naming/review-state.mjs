import { dimensions as legacyDimensions, defaultWeights, provisionalScores } from "./ranking-state.mjs";

export const reviewDimensions = ["preference", "grok_preference", "sayability", "memory", "cleverness", "moon", "wordplay", "roots", "character", "inventiveness", "explanation", "holistic"];
export const reviewLabels = ["ChatGPT preference", "Grok preference", "Sayability", "Memorability", "Cleverness", "Ocean moon", "Wordplay", "Root clarity", "Distinctive sound", "Inventiveness", "Cool explanation", "Holistic project fit"];
export const chatgptWeights = [50, 10, 8, 6, 4, 4, 4, 2, 3, 3, 2, 4];
export const definitions = [
  "ChatGPT’s personal taste. The earlier personal-preference score keeps its value; only its label changes.",
  "Grok’s independent personal taste, kept separate from ChatGPT’s.",
  "Can someone pronounce it on first sight and say it clearly across a festival?",
  "Will someone remember and repeat the spelling after hearing the name once?",
  "Does the idea make a satisfying, witty connection? This replaces the old water-play criterion.",
  "Does it evoke Enceladus, Saturn, ice or a hidden ocean?",
  "How good is the pun, double reading, sound overlap or blend? This replaces light and morphing.",
  "Can someone honestly recover the stated ingredients from the actual name?",
  "Does it have a recognizable sound and identity? This is not an availability check.",
  "Is it a fresh, coherent invention rather than a familiar formula or an arbitrary tangle?",
  "Is its explanation vivid, credible and fun to retell without inventing an etymology?",
  "Does the whole name fit the artwork’s moon, water, projection, life and shared delight? It need not mention every theme."
];

const validScore = value => Number.isFinite(value) && value >= 0 && value <= 10;

function validateWeights(weights) {
  if (!Array.isArray(weights) || weights.length !== 12 || weights.some(value => !Number.isFinite(value) || value < 0)) throw new Error("Twelve nonnegative weights required");
}

/** Return personal preferences separately, and the mean of two actual shared judgments. */
export function reviewScores(candidate) {
  return reviewDimensions.map((key, index) => {
    if (validScore(candidate.score_overrides?.[key])) return candidate.score_overrides[key];
    const a = candidate.reviews?.chatgpt?.scores;
    const b = candidate.reviews?.grok?.scores;
    if (index === 0) return validScore(a?.preference) ? a.preference : null;
    if (index === 1) return validScore(b?.preference) ? b.preference : null;
    return validScore(a?.[key]) && validScore(b?.[key]) ? (a[key] + b[key]) / 2 : null;
  });
}

/** Rank only when every positively weighted category has an actual score. */
export function reviewScore(candidate, weights) {
  validateWeights(weights);
  const scores = reviewScores(candidate);
  const total = weights.reduce((sum, value) => sum + value, 0);
  if (!total || scores.some((score, index) => score === null && weights[index] > 0)) return null;
  return Math.round(scores.reduce((sum, score, index) => sum + (score ?? 0) * weights[index], 0) / total * 100) / 10;
}

/** Average two normalized weight proposals, so neither scale dominates. */
export function averageWeights(first, second) {
  validateWeights(first); validateWeights(second);
  const a = first.reduce((sum, value) => sum + value, 0);
  const b = second.reduce((sum, value) => sum + value, 0);
  if (!a || !b) throw new Error("A weight proposal must have a positive total");
  return first.map((value, index) => 50 * (value / a + second[index] / b));
}

/** Preserve original arrays; migrate only edits to categories with unchanged meanings. */
export function migrateReviews(state, baselines = {}) {
  if (state.review_schema === 1) { validateWeights(state.review_weights); return; }
  state.legacy_weights = [...state.weights];
  state.review_weights = JSON.stringify(state.weights) === JSON.stringify(defaultWeights)
    ? [...chatgptWeights]
    : reviewDimensions.map(key => legacyDimensions.includes(key) ? state.weights[legacyDimensions.indexOf(key)] : 0);
  for (const candidate of Object.values(state.names)) {
    const baseline = baselines[candidate.name] ?? provisionalScores(candidate);
    candidate.score_overrides = {};
    legacyDimensions.forEach((key, index) => {
      if (reviewDimensions.includes(key) && validScore(candidate.scores?.[index]) && candidate.scores[index] !== baseline[index]) candidate.score_overrides[key] = candidate.scores[index];
    });
  }
  state.review_schema = 1;
}

/** Attach validated assessments without changing research, user shelves or current rolls. */
export function applyReviews(state, data) {
  for (const entry of Object.values(data.candidates)) {
    for (const reviewer of ["chatgpt", "grok"]) {
      const review = entry[reviewer];
      if (!review) continue;
      const expected = ["preference", ...reviewDimensions.slice(2)];
      if (!review.scores || Object.keys(review.scores).length !== 11 || expected.some(key => !validScore(review.scores[key]))) throw new Error(`Invalid ${reviewer} assessment`);
    }
  }
  for (const candidate of Object.values(state.names)) {
    const entry = data.candidates[candidate.name];
    delete candidate.editorial_explanation;
    if (entry && JSON.stringify(entry.morphemes ?? []) === JSON.stringify(candidate.morphemes ?? []) && (entry.explanation ?? "") === (candidate.explanation ?? "")) {
      candidate.reviews = { chatgpt: entry.chatgpt, grok: entry.grok };
      candidate.review_revision = data.revision;
      if (typeof entry.editorial_explanation === "string" && entry.editorial_explanation.trim()) candidate.editorial_explanation = entry.editorial_explanation;
    } else delete candidate.reviews;
    candidate.model_favorites = [];
    if (candidate.forgotten || (candidate.report?.verdict ?? candidate.verdict) === "taken") continue;
    for (const reviewer of ["chatgpt", "grok"]) {
      if ((data.favorites?.[reviewer] ?? []).slice(0, 15).some(item => item.name === candidate.name)) candidate.model_favorites.push(reviewer);
    }
  }
}

/** Sort complete weighted scores first, with a stable spelling tie break. */
export function rankReviewed(candidates, weights) {
  return candidates.map(candidate => ({ candidate, score: reviewScore(candidate, weights) }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.candidate.name.localeCompare(b.candidate.name))
    .map(item => item.candidate);
}
