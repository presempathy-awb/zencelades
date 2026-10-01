import { activeWords, removeWord, removeFamily, refillFamily, addCatalogFamilies } from "./editor-state.mjs";
import { namingDraftFor } from "./draft-state.mjs";
/** @param {Document | ShadowRoot} root */
export async function initEditor(root = document) {
const host = root.querySelector("#palette-editor");
const status = root.querySelector("#palette-status");
const results = root.querySelector("#fresh-names");
let state;
let catalog;
let online = false;
let busy = false;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, label, action) {
  const node = element("button", text);
  node.type = "button";
  if (label) node.setAttribute("aria-label", label);
  node.addEventListener("click", action);
  return node;
}

function save(message) {
  status.textContent = `${message || "Palette changed."} Temporary draft; export before reloading.`;
}

async function api(action, extra = {}) {
  const response = await fetch("/naming/api/workbench", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project: document.documentElement.dataset.project ?? "thatsnozorb", action, families: state?.families ?? [], excluded: state?.excluded ?? [], ...extra }),
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function operation(action) {
  if (busy) return;
  busy = true;
  host.setAttribute("aria-busy", "true");
  render();
  try { await action(); }
  catch (error) { status.textContent = `Request failed: ${error.message}. Your draft is preserved.`; }
  finally { busy = false; host.setAttribute("aria-busy", "false"); render(); }
}

function render() {
  const list = root.querySelector("#editable-families");
  list.replaceChildren();
  for (const family of state.families) {
    const field = element("fieldset", undefined, "palette-family");
    const legend = element("legend", family.id === "play_delight" ? "Water play" : family.label || family.id.replaceAll("_", " "));
    field.append(legend);
    const controls = element("div", undefined, "family-actions");
    const label = element("label");
    const enabled = element("input");
    enabled.type = "checkbox"; enabled.checked = family.enabled;
    enabled.addEventListener("change", () => { family.enabled = enabled.checked; save(); render(); });
    label.append(enabled, document.createTextNode(" Use this family"));
    const remove = button("×", `Remove ${legend.textContent} family`, () => {
      removeFamily(state, family.id); save("Family removed. Its words will stay out of refills."); render();
    });
    controls.append(label, remove);
    field.append(controls);
    const words = element("div", undefined, "word-palette");
    for (const word of family.words) {
      const chip = element("span", undefined, "word-chip");
      const wordLabel = element("label");
      const check = element("input");
      check.type = "checkbox"; check.checked = family.selected.includes(word);
      check.disabled = !family.enabled;
      check.addEventListener("change", () => {
        family.selected = check.checked ? [...new Set([...family.selected, word])] : family.selected.filter(item => item !== word);
        save(); updateCount();
      });
      wordLabel.append(check, document.createTextNode(word));
      chip.append(wordLabel, button("×", `Remove ${word} from ${legend.textContent}`, () => {
        removeWord(state, family.id, word); save(`${word} removed and remembered. Refill will supply different words.`); render();
      }));
      words.append(chip);
    }
    const refill = button("Refill ×’d words", `Refill removed words in ${legend.textContent}`, () => operation(async () => {
      const response = await api("refill", { family_id: family.id, count: Math.min(12, Math.max(1, 12 - family.words.length)) });
      refillFamily(state, family.id, response.words ?? []);
      save(response.message);
    }));
    refill.disabled = busy || !online || family.words.length >= 32;
    field.append(words, refill);
    list.append(field);
  }
  for (const node of root.querySelectorAll(".api-action")) node.disabled = busy || !online;
  root.querySelector("#add-family").disabled = busy || state.families.length >= 24;
  root.querySelector("#palette-reset").disabled = busy;
  root.querySelector("#add-cosmic-life").disabled = busy;
  updateCount();
}

function updateCount() {
  root.querySelector("#palette-count").textContent = `${state.families.filter(family => family.enabled && family.selected.length).length} active families · ${activeWords(state).length} checked words · ${state.excluded.length} words removed`;
}

function renderNames(candidates) {
  results.replaceChildren(element("p", `${candidates.length} names added to the ranked studio. Earlier rolls are remembered.`));
  const link = element("a", "See the ranked roll and eight scores"); link.href = "#name-studio"; results.append(link);
  root.dispatchEvent(new CustomEvent("naming:roll", { detail: candidates }));
}
async function roll(seedWords = []) {
  status.textContent = "Shakesplurian is meshing the checked words…";
  const seed = crypto.getRandomValues(new Uint32Array(1))[0];
  const response = await api("roll", { count: 40, word_count: Number(root.querySelector("#palette-word-count").value), mesh_level: Number(root.querySelector("#palette-mesh").value), seed_words: seedWords, seed });
  renderNames(response.candidates ?? []);
  status.textContent = `${response.candidates?.length ?? 0} names returned. ${response.message}`;
}
root.querySelector("#palette-roll").addEventListener("click", () => operation(() => roll()));
root.addEventListener("naming:submit", event => {
  if (!online || busy) { status.textContent = "Wait for the current request or API connection, then use Roll 40 relatives from the name in this draft."; return; }
  const words = event.detail.words.filter(word => !state.excluded.includes(word));
  if (words.length !== event.detail.words.length) { status.textContent = "A submitted word was removed from the palette. Restore it before using it as a seed; its creation remains in this working draft."; return; }
  const id = `submitted_${crypto.randomUUID().slice(0, 8)}`;
  if (state.families.length >= 24 || activeWords(state).length + words.length > 256) { status.textContent = "Pause a family or uncheck some words before adding these seeds (24 families, 256 checked words). Your creation remains in this working draft."; return; }
  state.families.push({ id, label: "Submitted names for this roll", words, selected: [...words], enabled: true });
  save("Submitted names added to the palette. Each descendant begins with one of those inputs.");
  operation(() => roll(words));
});

root.querySelector("#add-cosmic-life").addEventListener("click", () => {
  const result = addCatalogFamilies(state, catalog, ["protoplasm_early_life", "life_growth", "genesis_emergence", "space_travel", "astral_projection"]);
  save(`Added ${result.added} families. ${result.unchecked ? `${result.unchecked} new words start unchecked to stay within the 256-word limit. ` : ""}Existing choices and × removals are preserved. Families already present or removed stay as they were; the palette holds 24 families.`);
  render();
});

root.querySelector("#water-play-refresh").addEventListener("click", () => {
  const fresh = catalog.find(family => family.id === "play_delight");
  if (!fresh) return;
  const existing = state.families.find(family => family.id === "play_delight");
  const words = fresh.words.filter(word => !state.excluded.includes(word));
  if (existing) {
    const combined = [...new Set([...existing.words, ...words])];
    if (combined.length > 32) { status.textContent = "Remove some water-play words before adding more; the family holds 32."; return; }
    existing.words = combined;
    existing.selected = [...new Set([...existing.selected, ...words])];
  } else {
    if (state.families.length >= 24) { status.textContent = "Remove a family first; the palette holds 24."; return; }
    state.families.push({ ...structuredClone(fresh), words, selected: [...words] });
  }
  save("Water-play words added; earlier choices and removals are preserved."); render();
});

root.querySelector("#palette-reset").addEventListener("click", () => {
  state = { families: structuredClone(catalog.slice(0, 12)), excluded: [], removedFamilies: [] };
  save("Original twelve families restored. Removed words can now return."); render();
});

const dialog = root.querySelector("#family-dialog");
root.querySelector("#add-family").addEventListener("click", () => {
  const choices = root.querySelector("#family-choice"); choices.replaceChildren();
  choices.append(new Option("Write a new family", "custom"));
  for (const family of catalog) {
    if (!state.families.some(item => item.id === family.id) && !state.removedFamilies.includes(family.id)) choices.append(new Option(family.label, family.id));
  }
  root.querySelector("#custom-family-fields").hidden = false;
  dialog.showModal();
});
root.querySelector("#family-choice").addEventListener("change", event => {
  root.querySelector("#custom-family-fields").hidden = event.target.value !== "custom";
});
root.querySelector("#family-cancel").addEventListener("click", () => dialog.close());
root.querySelector("#family-form").addEventListener("submit", event => {
  event.preventDefault();
  const selected = root.querySelector("#family-choice").value;
  if (selected !== "custom") {
    if (!online) { status.textContent = "Start the naming API to add a catalog family."; dialog.close(); return; }
    operation(async () => {
      const response = await api("family", { family_id: selected });
      const family = response.families[0];
      family.words = family.words.filter(word => !state.excluded.includes(word));
      family.selected = [...family.words]; state.families.push(family);
      save(`Added ${family.label}.`); dialog.close();
    });
    return;
  }
  const label = root.querySelector("#family-label").value.trim();
  const words = [...new Set(root.querySelector("#family-words").value.toLowerCase().split(/[\s,]+/).filter(Boolean))];
  if (!label || label.length > 80 || !words.length || words.length > 32 || words.some(word => !/^[a-z]{2,24}$/.test(word))) {
    root.querySelector("#family-error").textContent = "Name the family and enter 1–32 words, each 2–24 letters."; return;
  }
  const filtered = words.filter(word => !state.excluded.includes(word));
  if (!filtered.length) { root.querySelector("#family-error").textContent = "These words were removed earlier. Use different words or restore the original palette."; return; }
  state.families.push({ id: `custom_${crypto.randomUUID().slice(0, 8)}`, label, enabled: true, words: filtered, selected: [...filtered], pool: [] });
  save(`Added ${label}.`); dialog.close(); render();
});

try {
  const fallback = await fetch("/naming/palette.json");
  if (!fallback.ok) throw new Error("Could not load the authored palette");
  catalog = (await fallback.json()).families;
  state = { families: structuredClone(catalog.slice(0, 12)), excluded: [], removedFamilies: [] };
  namingDraftFor(root).register("palette", () => state, next => { state = next; render(); }, () => busy);
  render();
  try { catalog = (await api("catalog")).families; online = true; status.textContent = "Connected to Shakesplurian. Your checked palette is ready to roll."; }
  catch { status.textContent = "Palette editing is ready. This static preview has no naming API; open the workbench preview to refill, add catalog families, roll and check names."; }
  render();
} catch (error) { status.textContent = error.message; }
}

if (typeof document !== "undefined" && document.getElementById("palette-editor")) void initEditor();
