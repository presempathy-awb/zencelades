export const dimensions = ["preference", "sayability", "memory", "water", "moon", "light", "roots", "character"];
export const defaultWeights = [50, 12, 10, 8, 7, 5, 5, 3];
export const labels = ["Personal preference", "Sayability", "Memorability", "Water play", "Ocean moon", "Light & morphing", "Root clarity", "Distinctive sound"];

/** Normalize the eight weights; a zero total deliberately has no rank. */
export function weightedScore(scores, weights) {
  if (scores.length !== 8 || weights.length !== 8 || scores.some(n => !Number.isFinite(n) || n < 0 || n > 10) || weights.some(n => !Number.isFinite(n) || n < 0)) throw new Error("Eight valid scores and weights required");
  const total = weights.reduce((sum, n) => sum + n, 0);
  return total ? Math.round(scores.reduce((sum, n, i) => sum + n * weights[i], 0) / total * 100) / 10 : null;
}

/** Provisional rules for unreviewed rolls; preference stays neutral until edited. */
export function provisionalScores(candidate) {
  const name = candidate.name.toLowerCase();
  const roots = candidate.morphemes ?? [];
  const cues = roots.join(" ") + " " + name;
  const clamp = n => Math.max(1, Math.min(10, n));
  const say = clamp(10 - Math.max(0, name.length - 9) * .35 - (name.match(/[bcdfghjklmnpqrstvwxz]{3,}/g)?.length ?? 0));
  return [5, Math.round(say), Math.round(clamp(10 - Math.abs(name.length - 9) * .4)),
    /splash|splosh|sploosh|paddl|puddle|dunk|wade|squish|squirt|froth|swish|slosh/.test(cues) ? 9 : /water|ocean|tide|wave|aqu|foam|plum/.test(cues) ? 7 : 3,
    /cryo|encel|luna|lune|moon|saturn|orbit|rime/.test(cues) ? 9 : /orb|zorb|plum/.test(cues) ? 7 : 3,
    /lens|lumen|lume|glow|gleam|morph|prism|halo|phase|melt|thaw/.test(cues) ? 9 : 4,
    roots.length ? Math.round(clamp(3 + roots.filter(root => name.includes(root)).length / roots.length * 7)) : 5,
    Math.round(clamp(6 + (name.includes("z") ? 2 : 0) + (name.includes("cryo") ? 1 : 0) - Math.max(0, name.length - 15) * .2))];
}

/** Merge by spelling, preserving personal edits, shelves and all previous rolls. */
export function rememberNames(state, candidates, newRoll = false) {
  const receiptTime = report => Math.max(0, ...[report?.checked_at, ...(report?.evidence ?? []).map(item => item.checked_at)].map(value => Date.parse(value) || 0));
  const current = [];
  for (const candidate of candidates) {
    const name = candidate.name.toLowerCase();
    if (!/^[a-z]{2,48}$/.test(name)) continue;
    const previous = Object.hasOwn(state.names, name) ? state.names[name] : undefined;
    state.names[name] = { ...candidate, name, scores: candidate.scores ?? provisionalScores(candidate), ...previous };
    if (previous) state.names[name].report = previous.report;
    if (typeof candidate.explanation === "string" && candidate.explanation.trim() && Number.isSafeInteger(candidate.explanation_revision) && candidate.explanation_revision > (previous?.explanation_revision ?? 0)) {
      state.names[name].explanation = candidate.explanation;
      state.names[name].explanation_revision = candidate.explanation_revision;
    }
    const preservesCollision = (previous?.report?.verdict ?? previous?.verdict) !== "taken" || candidate.report?.verdict === "taken";
    if (candidate.report && preservesCollision && (candidate.report.verdict === "taken" || !previous?.report || receiptTime(candidate.report) > receiptTime(previous.report))) state.names[name].report = candidate.report;
    if (candidate.creation) state.names[name].creation = true;
    if (candidate.favorite && !previous) state.names[name].favorite = true;
    current.push(name);
  }
  if (newRoll) state.current = [...new Set(current)];
  return state;
}

/** Stable overall order, with spelling as the tie break. */
export function rankNames(names, weights) {
  return [...names].sort((a, b) => (weightedScore(b.scores, weights) ?? 0) - (weightedScore(a.scores, weights) ?? 0) || a.name.localeCompare(b.name));
}
