import { weightedScore } from "./ranking-state.mjs";
import { migrateReviews, reviewScore } from "./review-state.mjs";

// Published Naming data already exceeds 1 MiB; allow its formatted export and edits.
export const maxNamingDraftBytes = 4 * 1024 * 1024;

function object(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Naming draft has an unreadable object");
  return value;
}
function strings(value) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string"))
    throw new Error("Naming draft has an unreadable list");
}

/** Validate a portable Naming document before either editor is replaced. */
export function parseNamingDraft(text) {
  const bytes = new TextEncoder().encode(text).length;
  if (bytes > maxNamingDraftBytes)
    throw new Error(`Naming draft size ${bytes} bytes exceeds the 4 MiB limit`);
  let draft = object(JSON.parse(text));
  if (draft.schema === "legacy-naming-backup") {
    try {
      draft = { schema: 1, palette: JSON.parse(draft.palette), shelves: JSON.parse(draft.shelves) };
    } catch {
      throw new Error(
        "Legacy draft is unreadable; the recovery file and browser storage remain unchanged",
      );
    }
  }
  if (draft.schema !== 1) throw new Error("Unsupported Naming draft schema");
  const palette = object(draft.palette),
    shelves = object(draft.shelves);
  if (!Array.isArray(palette.families)) throw new Error("Naming palette has unreadable families");
  strings(palette.excluded);
  strings(palette.removedFamilies);
  const ids = new Set();
  for (const row of palette.families) {
    const family = object(row);
    if (
      typeof family.id !== "string" ||
      !family.id ||
      ids.has(family.id) ||
      typeof family.enabled !== "boolean"
    )
      throw new Error("Invalid or duplicate Naming family");
    ids.add(family.id);
    if (family.label !== undefined && typeof family.label !== "string")
      throw new Error("Invalid Naming family label");
    strings(family.words);
    strings(family.selected);
    if (family.pool !== undefined) strings(family.pool);
  }
  object(shelves.names);
  strings(shelves.current);
  weightedScore(Array(8).fill(5), shelves.weights);
  for (const [key, row] of Object.entries(shelves.names)) {
    const candidate = object(row);
    if (!/^[a-z]{2,48}$/.test(key) || candidate.name !== key)
      throw new Error("Invalid Naming candidate");
    weightedScore(candidate.scores, shelves.weights);
    for (const field of ["morphemes", "model_favorites"])
      if (candidate[field] != null) strings(candidate[field]);
    if (candidate.report) {
      object(candidate.report);
      for (const field of ["evidence", "earlier_collisions"]) {
        if (candidate.report[field] != null) {
          if (!Array.isArray(candidate.report[field])) throw new Error("Invalid research receipt");
          for (const evidence of candidate.report[field]) {
            object(evidence);
            for (const names of ["exact_matches", "fuzzy_matches"])
              if (evidence[names] != null) strings(evidence[names]);
          }
        }
      }
      if (candidate.report.missing_layers != null) strings(candidate.report.missing_layers);
    }
  }
  if (shelves.current.some((name) => !Object.hasOwn(shelves.names, name)))
    throw new Error("Naming roll references a missing candidate");
  if (shelves.review_schema !== 1) migrateReviews(shelves);
  reviewScore({}, shelves.review_weights);
  return { schema: 1, palette, shelves };
}

/** Own only this visit's editor references; no browser or network persistence. */
export function createNamingDraft() {
  const editors = new Map();
  return {
    register(part, read, replace, busy = () => false) {
      if (!["palette", "shelves"].includes(part)) throw new Error("Unknown Naming editor");
      editors.set(part, { read, replace, busy });
    },
    snapshot() {
      if (editors.size !== 2) throw new Error("Wait for the palette and shelves to finish loading");
      return parseNamingDraft(
        JSON.stringify({
          schema: 1,
          palette: editors.get("palette").read(),
          shelves: editors.get("shelves").read(),
        }),
      );
    },
    replace(value) {
      if (editors.size !== 2) throw new Error("Wait for both Naming editors before importing");
      if ([...editors.values()].some((editor) => editor.busy()))
        throw new Error("Wait for the current Naming request before replacing this draft");
      const checked = parseNamingDraft(JSON.stringify(value));
      editors.get("palette").replace(checked.palette);
      editors.get("shelves").replace(checked.shelves);
    },
  };
}

const drafts = new WeakMap();
/** Keep a mounted cockpit Naming page stable while switching columns. */
export function namingDraftFor(root) {
  if (!drafts.has(root)) drafts.set(root, createNamingDraft());
  return drafts.get(root);
}

/** Read old browser drafts only after an explicit recovery action; preserve raw bytes. */
export function readLegacyNamingBackup(storage, project) {
  const prefix = project === "thatsnozorb" ? "enceladus" : project;
  return {
    schema: "legacy-naming-backup",
    palette: storage.getItem(`${prefix}-naming-palette-v1`),
    shelves: storage.getItem(`${prefix}-naming-shelves-v1`),
  };
}
