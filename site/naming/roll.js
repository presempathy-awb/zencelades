const search = document.querySelector('#name-search');
const mesh = document.querySelector('#mesh-level');
const count = document.querySelector('#name-count');
const groups = [...document.querySelectorAll('.roll-mesh')].map((element) => ({
  element,
  candidates: [...element.querySelectorAll('.candidate')].map((candidate) => ({
    element: candidate,
    text: candidate.textContent.toLocaleLowerCase(),
  })),
}));

function filterRoll() {
  const term = search.value.trim().toLocaleLowerCase();
  let visible = 0;
  for (const group of groups) {
    const selected = mesh.value === 'all' || group.element.dataset.mesh === mesh.value;
    let matches = 0;
    for (const candidate of group.candidates) {
      candidate.element.hidden = !selected || !candidate.text.includes(term);
      if (!candidate.element.hidden) matches += 1;
    }
    group.element.hidden = matches === 0;
    if (term || mesh.value !== 'all') group.element.open = true;
    visible += matches;
  }
  count.textContent = `${visible} candidate entries shown`;
}

search.addEventListener('input', filterRoll);
mesh.addEventListener('change', filterRoll);
filterRoll();
