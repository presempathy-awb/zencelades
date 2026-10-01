export function activeWords(state) {
  return state.families.flatMap(family => family.enabled ? family.selected.filter(word => family.words.includes(word) && !state.excluded.includes(word)) : []);
}

export function removeWord(state, id, word) {
  const family = state.families.find(item => item.id === id);
  if (!family) return;
  family.words = family.words.filter(item => item !== word);
  family.selected = family.selected.filter(item => item !== word);
  if (!state.excluded.includes(word)) state.excluded.push(word);
}

export function removeFamily(state, id) {
  const family = state.families.find(item => item.id === id);
  if (!family) return;
  for (const word of [...family.words]) removeWord(state, id, word);
  state.families = state.families.filter(item => item.id !== id);
  if (!state.removedFamilies.includes(id)) state.removedFamilies.push(id);
}

export function refillFamily(state, id, words) {
  const family = state.families.find(item => item.id === id);
  if (!family) return;
  const present = new Set(state.families.flatMap(item => item.words));
  for (const word of words) {
    if (present.has(word) || state.excluded.includes(word)) continue;
    family.words.push(word);
    family.selected.push(word);
    present.add(word);
  }
}

export function addCatalogFamilies(state, catalog, ids) {
  let remaining = Math.max(0, 256 - activeWords(state).length);
  const result = { added: 0, unchecked: 0 };
  for (const id of ids) {
    if (state.families.length >= 24) break;
    if (state.families.some(family => family.id === id) || state.removedFamilies.includes(id)) continue;
    const source = catalog.find(family => family.id === id);
    if (!source) continue;
    const words = source.words.filter(word => !state.excluded.includes(word));
    if (!words.length) continue;
    const selected = words.slice(0, remaining);
    remaining -= selected.length;
    state.families.push({ ...structuredClone(source), words, selected, enabled: selected.length > 0 });
    result.added++;
    result.unchecked += words.length - selected.length;
  }
  return result;
}
