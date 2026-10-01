import { defaultWeights, weightedScore, rememberNames } from "./ranking-state.mjs";

import { reviewDimensions, reviewLabels as labels, chatgptWeights, definitions, reviewScores, reviewScore, averageWeights, migrateReviews, applyReviews, rankReviewed as rankNames } from "./review-state.mjs";

const project = document.documentElement.dataset.project ?? "thatsnozorb";
const storageKey = project === "thatsnozorb" ? "enceladus-naming-shelves-v1" : `${project}-naming-shelves-v1`;
const host = document.querySelector("#name-studio");
const status = document.querySelector("#ranking-status");
let state = { names: {}, current: [], weights: [...defaultWeights] };
let visible = 40;
let ready = false;
let startingWeights = [...chatgptWeights];
let reviewData = { candidates: {}, favorites: {} };
let presets = { chatgpt: [...chatgptWeights] };
const pendingRolls = [];
host.querySelectorAll("button, input, select, textarea").forEach(control => { control.disabled = true; });

function node(tag, text, className) {
  const result = document.createElement(tag);
  if (text !== undefined) result.textContent = text;
  if (className) result.className = className;
  return result;
}
function action(text, run) {
  const result = node("button", text);
  result.type = "button";
  result.addEventListener("click", run);
  return result;
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); }
  catch { status.textContent = "Storage is full or unavailable. Export your shelves before closing this tab."; }
}
function displayScore(candidate) {
  const score = reviewScore(candidate, state.review_weights);
  return score === null ? (state.review_weights.every(weight => weight === 0) ? "Unranked · all weights are zero" : "Awaiting review · some weighted scores are missing") : `${score.toFixed(1)} / 100`;
}
function researchLinks(name) {
  const links = node("p", undefined, "research-links");
  for (const [label, href] of [
    ["Brave", `https://search.brave.com/search?q=${encodeURIComponent('"' + name + '"')}`],
    ["GitHub", `https://github.com/search?q=${encodeURIComponent(name + " in:name")}&type=repositories`],
    ["npm", `https://www.npmjs.com/search?q=${encodeURIComponent(name)}`],
    [".com", `https://rdap.org/domain/${encodeURIComponent(name)}.com`],
  ]) {
    const link = node("a", label); link.href = href; link.target = "_blank"; link.rel = "noopener noreferrer"; links.append(link);
  }
  return links;
}
function verdict(candidate) {
  const result = candidate.report?.verdict ?? candidate.verdict;
  if (result === "taken") return "Existing use found · inspect context";
  if (result === "clean") return "No exact hit in the checked sources";
  if (result === "unverified") return "Research incomplete · keep exploring";
  return "Research pending · optional";
}
async function research(candidate, button) {
  button.disabled = true;
  status.textContent = `Researching ${candidate.name} on Brave, GitHub, npm and .com…`;
  try {
    const response = await fetch("/naming/api/workbench", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project: document.documentElement.dataset.project ?? "thatsnozorb", action: "verify", words: [candidate.name] }), signal: AbortSignal.timeout(120000) });
    if (!response.ok) throw new Error(await response.text());
    const result = await response.json();
    if (!result.report) throw new Error("No research receipt returned");
    candidate.report = result.report; save(); render();
    status.textContent = `${candidate.name}: ${verdict(candidate)}. Missing sources never block another roll.`;
  } catch (error) { status.textContent = `Research failed: ${error.message}. Earlier evidence is preserved.`; }
  finally { button.disabled = false; }
}
function card(candidate, rank) {
  const article = node("article", undefined, "ranked-name");
  const heading = node("h3", `${rank ? rank + ". " : ""}${candidate.name}`);
  article.append(heading, node("p", displayScore(candidate), "weighted-score"));
  article.append(node("p", candidate.mix ?? candidate.source ?? "Submitted name", "mix"));
  if (candidate.join_levels?.length) article.append(node("p", `${candidate.morphemes.length} words · join levels ${candidate.join_levels.join(" → ")}`, "editor-note"));
  const explanation = candidate.editorial_explanation ?? candidate.explanation;
  if (explanation) article.append(node("p", explanation));
  for (const reviewer of candidate.model_favorites ?? []) {
    const choice = reviewData.favorites?.[reviewer]?.find(item => item.name === candidate.name);
    if (choice?.reason) article.append(node("p", `${reviewer === "chatgpt" ? "ChatGPT" : "Grok"} final pick: ${choice.reason}`, "editor-note"));
  }
  article.append(node("p", verdict(candidate), "editor-note"));
  const buttons = node("div", undefined, "name-actions");
  buttons.append(action(candidate.favorite ? "★ Saved favorite" : "☆ Save favorite", () => { candidate.favorite = !candidate.favorite; save(); render(); }));
  const earlier = candidate.collection === "Live roll" && !state.current.includes(candidate.name);
  buttons.append(action(candidate.forgotten || earlier ? "Restore name" : "Forget for now", () => {
    if (candidate.forgotten || earlier) { candidate.forgotten = false; if (!state.current.includes(candidate.name)) state.current.push(candidate.name); }
    else candidate.forgotten = true;
    applyReviews(state, reviewData); save(); render();
  }));
  buttons.append(action("Roll 40 relatives", () => {
    if (candidate.name.length > 24) { status.textContent = "For relatives, submit a shorter seed of up to 24 letters."; return; }
    document.dispatchEvent(new CustomEvent("naming:submit", { detail: { words: [candidate.name] } }));
    document.querySelector("#palette-editor").scrollIntoView({ behavior: "instant" });
  }));
  const check = action("Research name", () => research(candidate, check)); buttons.append(check);
  article.append(buttons);
  const details = node("details"); details.append(node("summary", "Twelve scores, both reviewers & research"));
  if (candidate.editorial_explanation) {
    details.append(node("p", "The explanation above was expanded by ChatGPT after scoring. Both reviewers’ scores, including Cool explanation, still assess the original wording below.", "editor-note"));
    const original = node("details"); original.append(node("summary", "Original explanation scored by both reviewers"), node("p", candidate.explanation)); details.append(original);
  }
  details.append(node("p", "Shared categories use (ChatGPT + Grok) ÷ 2. Their preferences remain separate. An edited ranking score overrides that category only; clear the input to restore the model score.", "editor-note"));
  for (const reviewer of ["chatgpt", "grok"]) {
    const review = candidate.reviews?.[reviewer];
    if (review?.rationale) details.append(node("p", `${reviewer === "chatgpt" ? "ChatGPT" : "Grok"}: ${review.rationale}`));
  }
  const table = node("table");
  const head = node("tr"); for (const text of ["Dimension", "ChatGPT", "Grok", "Ranking score / 10", "Points / 100"]) head.append(node("th", text));
  const thead = node("thead"); thead.append(head); table.append(thead);
  const body = node("tbody");
  const scores = reviewScores(candidate);
  const total = state.review_weights.reduce((a, b) => a + b, 0);
  labels.forEach((label, index) => {
    const key = reviewDimensions[index];
    const row = node("tr"); const title = node("th", label); title.title = definitions[index]; row.append(title);
    const a = candidate.reviews?.chatgpt?.scores;
    const b = candidate.reviews?.grok?.scores;
    row.append(node("td", index === 1 ? "—" : String(a?.[key] ?? "Pending")), node("td", index === 0 ? "—" : String(b?.[index === 1 ? "preference" : key] ?? "Pending")));
    const cell = node("td"); const input = node("input"); input.type = "number"; input.min = "0"; input.max = "10"; input.step = ".1"; input.value = scores[index] ?? ""; input.placeholder = "Pending"; input.setAttribute("aria-label", `${label} ranking score for ${candidate.name}`);
    input.addEventListener("change", () => {
      candidate.score_overrides ??= {};
      if (input.value === "") delete candidate.score_overrides[key];
      else {
        const score = input.valueAsNumber;
        if (!Number.isFinite(score) || score < 0 || score > 10) { input.value = scores[index] ?? ""; return; }
        candidate.score_overrides[key] = score;
      }
      save(); render();
    });
    cell.append(input);
    if (Object.hasOwn(candidate.score_overrides ?? {}, key)) cell.append(node("small", " Your edit"));
    row.append(cell, node("td", total && scores[index] !== null ? (scores[index] * state.review_weights[index] / total * 10).toFixed(1) : "—")); body.append(row);
  });
  table.append(body); const scroll = node("div", undefined, "score-table-scroll"); scroll.tabIndex = 0; scroll.setAttribute("aria-label", `Score comparison for ${candidate.name}`); scroll.append(table); details.append(scroll);
  if (candidate.scores) {
    const legacy = node("details"); legacy.append(node("summary", "Original eight scores (retained)"), node("p", candidate.score_source ?? "Original spelling/root estimates"), node("p", `Preference, sayability, memory, water play, moon, light/morphing, roots, sound: ${candidate.scores.join(" / ")}`)); details.append(legacy);
  }
  details.append(researchLinks(candidate.name));
  if (candidate.report) {
    for (const evidence of candidate.report.evidence ?? []) details.append(node("p", `${evidence.layer}: ${evidence.status} · ${evidence.detail || "No exact match"} · ${evidence.checked_at}${evidence.exact_matches?.length ? " · " + evidence.exact_matches.join(", ") : ""}${evidence.fuzzy_matches?.length ? " · Similar: " + evidence.fuzzy_matches.join(", ") : ""}`));
    for (const evidence of candidate.report.earlier_collisions ?? []) {
      if ((candidate.report.evidence ?? []).some(current => current.layer === evidence.layer && current.status === "positive")) continue;
      details.append(node("p", `Earlier existing-use evidence · ${evidence.layer}: ${evidence.detail ?? "Exact match"} · ${evidence.checked_at} · ${(evidence.exact_matches ?? []).join(", ")}`));
    }
    if (candidate.report.missing_layers?.length) details.append(node("p", `Missing: ${candidate.report.missing_layers.join(", ")}. These are unknown, not available.`));
  }
  article.append(details); return article;
}
function renderShelf(id, candidates) {
  const shelf = document.querySelector(id); shelf.replaceChildren();
  for (const candidate of rankNames(candidates, state.review_weights)) shelf.append(card(candidate));
  if (!candidates.length) shelf.append(node("p", "Nothing here yet. Saved names stay between rolls."));
}
function render() {
  const names = Object.values(state.names);
  const collection = document.querySelector("#ranking-collection").value;
  const query = document.querySelector("#ranking-search").value.toLowerCase().trim();
  let filtered = names.filter(c => !c.forgotten && (c.report?.verdict ?? c.verdict) !== "taken" && (!query || `${c.name} ${c.mix ?? ""}`.toLowerCase().includes(query)));
  if (collection === "current") filtered = filtered.filter(c => state.current.includes(c.name));
  else if (collection === "revivals") filtered = filtered.filter(c => c.model_favorites?.length);
  else if (collection !== "all") filtered = filtered.filter(c => c.collection === collection);
  const ranked = rankNames(filtered, state.review_weights);
  const list = document.querySelector("#ranked-names"); list.replaceChildren();
  ranked.slice(0, visible).forEach((candidate, index) => list.append(card(candidate, index + 1)));
  document.querySelector("#ranking-count").textContent = `${ranked.length} names · showing ${Math.min(visible, ranked.length)} · rankings update with the weights`;
  document.querySelector("#ranking-more").hidden = ranked.length <= visible;
  renderShelf("#codex-favorites", names.filter(c => c.favorite && !c.forgotten));
  for (const reviewer of ["chatgpt", "grok"]) renderShelf(`#${reviewer}-revivals`, names.filter(c => !c.forgotten && (c.report?.verdict ?? c.verdict) !== "taken" && c.model_favorites?.includes(reviewer)));
  renderShelf("#andrew-creations", names.filter(c => c.creation));
  const archived = names.filter(c => c.forgotten || (c.report?.verdict ?? c.verdict) === "taken" || (c.collection === "Live roll" && !state.current.includes(c.name)));
  const archive = document.querySelector("#forgotten-names"); archive.replaceChildren();
  document.querySelector("#forgotten-count").textContent = `Forgotten / earlier rolls · ${archived.length}`;
  for (const candidate of rankNames(archived, state.review_weights)) archive.append(card(candidate));
}
function renderWeights() {
  const list = document.querySelector("#score-weights"); list.replaceChildren();
  labels.forEach((label, i) => {
    const field = node("label", label); const input = node("input"); input.type = "range"; input.min = "0"; input.max = "100"; input.step = ".1"; input.value = state.review_weights[i]; input.setAttribute("aria-label", `${label} weight`);
    const output = node("output"); output.dataset.weight = i;
    input.addEventListener("input", () => { state.review_weights[i] = Number(input.value); updateWeightLabels(); save(); render(); });
    field.append(input, output); list.append(field);
  });
  updateWeightLabels();
}
function updateWeightLabels() {
  const total = state.review_weights.reduce((a, b) => a + b, 0);
  document.querySelectorAll("[data-weight]").forEach(output => {
    const index = Number(output.dataset.weight); output.textContent = total ? `${(state.review_weights[index] / total * 100).toFixed(1)}%` : "0% · unranked";
  });
}
document.querySelector("#weights-reset").addEventListener("click", () => { state.review_weights = [...startingWeights]; save(); renderWeights(); render(); });
for (const reviewer of ["chatgpt", "grok", "average"]) document.querySelector(`#weights-${reviewer}`).addEventListener("click", () => {
  if (!presets[reviewer]) { status.textContent = "That weight proposal has not arrived yet."; return; }
  state.review_weights = [...presets[reviewer]]; save(); renderWeights(); render();
  status.textContent = `${reviewer === "average" ? "Mean of the two normalized weight proposals" : reviewer === "grok" ? "Grok’s suggested weights" : "ChatGPT’s suggested weights"} applied. Keep moving the sliders to make it yours.`;
});
document.querySelector("#ranking-collection").addEventListener("change", () => { visible = 40; render(); });
document.querySelector("#ranking-search").addEventListener("input", () => { visible = 40; render(); });
document.querySelector("#ranking-more").addEventListener("click", () => { visible += 40; render(); });
document.querySelector("#submit-creations").addEventListener("submit", event => {
  event.preventDefault();
  const words = [...new Set(document.querySelector("#creation-words").value.toLowerCase().split(/[\s,]+/).filter(Boolean))];
  if (!words.length || words.length > 20 || words.some(word => !/^[a-z]{2,24}$/.test(word))) { status.textContent = "Enter 1–20 names, each 2–24 letters, separated by spaces or commas."; return; }
  rememberNames(state, words.map(name => ({ name, creation: true, collection: "Andrew's creations", source: "Andrew's creation" })));
  save(); render(); document.dispatchEvent(new CustomEvent("naming:submit", { detail: { words } }));
});
document.querySelector("#shelves-export").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
  const link = node("a"); link.href = url; link.download = "moon-naming-shelves.json"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
function receiveRoll(candidates) {
  rememberNames(state, candidates.map(c => ({ ...c, collection: "Live roll", source: "Shakesplurian live roll" })), true);
  applyReviews(state, reviewData);
  document.querySelector("#ranking-collection").value = "current"; visible = 40; save(); render();
  status.textContent = `${candidates.length} new names saved. Earlier rolls and special shelves are preserved. Unreviewed names await scores; original estimates remain in their details.`;
}
document.addEventListener("naming:roll", event => { if (ready) receiveRoll(event.detail); else pendingRolls.push(event.detail); });

try {
  const [researchResponse, historyResponse, reviewsResponse] = await Promise.all([fetch("/naming/research-rolls.json"), fetch("/naming/report.json"), fetch("/naming/reviews.json")]);
  if (!researchResponse.ok || !historyResponse.ok || !reviewsResponse.ok) throw new Error("Could not load naming collections");
  const research = await researchResponse.json(); const history = await historyResponse.json();
  reviewData = await reviewsResponse.json();
  if (reviewData.weights?.chatgpt) {
    averageWeights(reviewData.weights.chatgpt, chatgptWeights);
    presets.chatgpt = [...reviewData.weights.chatgpt]; startingWeights = [...presets.chatgpt];
  }
  if (reviewData.weights?.grok) { presets.grok = reviewData.weights.grok; presets.average = averageWeights(presets.chatgpt, presets.grok); }
  const saved = localStorage.getItem(storageKey);
  if (research.weights) { weightedScore(Array(8).fill(5), research.weights); if (!saved) state.weights = [...research.weights]; }
  const collections = new Set([...research.authored, ...research.groups.flatMap(g => g.candidates)].map(c => c.collection));
  const choices = document.querySelector("#ranking-collection");
  for (const collection of collections) { if (collection && ![...choices.options].some(o => o.value === collection)) choices.add(new Option(collection, collection)); }
  if (saved) {
    const parsed = JSON.parse(saved);
    if (!parsed.names || !Array.isArray(parsed.current) || !Array.isArray(parsed.weights)) throw new Error("Saved shelves have an unreadable shape; storage has been left untouched");
    weightedScore(Array(8).fill(5), parsed.weights);
    for (const candidate of Object.values(parsed.names)) weightedScore(candidate.scores, parsed.weights);
    state = parsed;
  }
  rememberNames(state, history.groups.flatMap(g => g.candidates).map(c => ({ ...c, collection: "Earlier exploration", ...(c.name === "cryzorcean" ? { favorite: true, scores: [10,8,9,9,10,7,8,10], score_source: "Codex editorial assessment of Andrew’s three-word creation" } : {}) })));
  rememberNames(state, research.authored);
  for (const group of research.groups) rememberNames(state, group.candidates);
  rememberNames(state, (research.archive ?? []).map(c => ({ ...c, forgotten: true, collection: "Replaced after research" })));
  rememberNames(state, ["cryocean", "zorbit", "cryzorcean"].map(name => ({ name, creation: true, source: "Andrew's creation" })));
  rememberNames(state, Object.entries(reviewData.availability?.reports ?? {}).filter(([name]) => Object.hasOwn(state.names, name)).map(([name, report]) => ({ name, report })));
  const baselines = Object.fromEntries([...history.groups.flatMap(g => g.candidates), ...research.authored, ...research.groups.flatMap(g => g.candidates)].filter(c => c.scores).map(c => [c.name, c.scores]));
  baselines.cryzorcean = [10,8,9,9,10,7,8,10];
  migrateReviews(state, baselines); applyReviews(state, reviewData);
  if (!saved && !research.weights) state.review_weights = [...startingWeights];
  const glossary = document.querySelector("#score-definitions");
  labels.forEach((label, index) => glossary.append(node("dt", label), node("dd", definitions[index])));
  document.querySelector("#weight-rationale").textContent = `ChatGPT: ${reviewData.weight_rationale?.chatgpt ?? "Half the weight stays on ChatGPT preference, with Grok adding an independent taste signal. The remaining categories balance a usable spoken name with a coherent artwork story."} Grok: ${reviewData.weight_rationale?.grok ?? "Proposal pending."}`;
  ready = true; host.removeAttribute("aria-busy"); host.querySelectorAll("button, input, select, textarea").forEach(control => { control.disabled = false; }); document.querySelector("#weights-grok").disabled = !presets.grok; document.querySelector("#weights-average").disabled = !presets.average; renderWeights(); render(); save();
  status.textContent = "Names loaded. Shared scores average both reviewers; preferences are separate. Old water/light scores remain archived, and edits to unchanged categories are preserved. Scores are creative judgments, not availability claims. Shelves and weights are saved in this browser; export a backup to keep a portable copy.";
  for (const candidates of pendingRolls) receiveRoll(candidates);
} catch (error) { status.textContent = `${error.message}. Saved storage has not been overwritten.`; }
