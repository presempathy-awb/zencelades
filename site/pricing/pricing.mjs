import { calculate } from "./calculation.mjs";
export { calculate } from "./calculation.mjs";

async function start() {
  const response = await fetch("/pricing/options.json");
  if (!response.ok) throw new Error(`Budget data failed to load (${response.status})`);
  const baseline = await response.json();
  let options = structuredClone(baseline.options);
  let selected = "ground-sphere";
  const form = document.getElementById("pricing-form");
  const feedback = document.getElementById("feedback");
  const exportButton = document.getElementById("export");
  const dollars = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  const range = values => `${dollars(values[0])}–${dollars(values[1])}`;
  const element = (tag, text) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; return node; };
  const settings = () => Object.fromEntries(Object.entries(baseline.defaults).map(([key]) => [key, key === "capture" ? document.getElementById(key).checked : Number(document.getElementById(key).value)]));

  function renderItems() {
    const option = options.find(item => item.id === selected);
    document.getElementById("selected-title").textContent = option.name;
    document.getElementById("selected-description").textContent = option.description;
    const body = document.getElementById("line-items");
    body.replaceChildren();
    option.items.forEach((item, index) => {
      const row = element("tr");
      const heading = element("th", item.label); heading.scope = "row"; row.append(heading);
      for (const bound of ["low", "high"]) {
        const cell = element("td"); const input = element("input");
        input.type = "number"; input.min = "0"; input.max = "1000000"; input.step = "1"; input.required = true;
        input.value = item[bound]; input.dataset.item = String(index); input.dataset.bound = bound;
        input.setAttribute("aria-label", `${item.label} · ${bound} allowance in USD`);
        cell.append(input); row.append(cell);
      }
      body.append(row);
    });
  }

  function renderTotals() {
    exportButton.disabled = true;
    if (!form.checkValidity()) { feedback.textContent = "Enter values within the displayed ranges. The comparison retains the last valid estimate."; return; }
    const option = options.find(item => item.id === selected);
    const candidate = structuredClone(option);
    for (const input of document.querySelectorAll("[data-item]")) candidate.items[Number(input.dataset.item)][input.dataset.bound] = Number(input.value);
    const values = settings();
    try { calculate(candidate, values, baseline.capture); } catch (error) { feedback.textContent = error.message; return; }
    options = options.map(item => item.id === selected ? candidate : item);
    const rows = document.getElementById("comparison-rows"); rows.replaceChildren();
    let capped = false;
    for (const item of options) {
      const result = calculate(item, values, baseline.capture); capped ||= result.creditCapped;
      const row = element("tr"); const heading = element("th"); heading.scope = "row";
      const button = element("button", item.name); button.type = "button"; button.className = "choose"; button.dataset.option = item.id;
      button.setAttribute("aria-pressed", String(item.id === selected)); heading.append(button);
      row.append(heading, element("td", String(item.projectors)), element("td", range(result.total)), element("td", item.position)); rows.append(row);
    }
    const result = calculate(candidate, values, baseline.capture);
    const totals = document.getElementById("totals"); totals.replaceChildren();
    const summary = [["Projector hire", [result.rent, result.rent]], ["External capture", result.liveCapture ? [baseline.capture.low, baseline.capture.high] : [0, 0]], ["Subtotal after credit", result.subtotal], [`Contingency · ${values.contingency}%`, result.contingency], ["Tax allowance", [values.taxAllowance, values.taxAllowance]], ["Total cash allowance", result.total]];
    for (const [label, amounts] of summary) { const row = element("tr"); const heading = element("th", label); heading.scope = "row"; row.append(heading, ...amounts.map(amount => element("td", dollars(amount)))); totals.append(row); }
    document.getElementById("comparison-caption").textContent = `${values.days} hire days · ${values.contingency}% contingency · ${values.taxAllowance ? dollars(values.taxAllowance) + " tax allowance" : "tax excluded"}`;
    feedback.textContent = capped ? "Credit exceeds at least one low estimate; cash subtotal is floored at zero. Check that donated items are applicable to every layout." : "Estimate updated. Edits stay in this page until downloaded; no prices have been booked.";
    exportButton.disabled = false;
  }

  form.addEventListener("submit", event => event.preventDefault());
  form.addEventListener("input", renderTotals);
  document.getElementById("comparison-rows").addEventListener("click", event => {
    const button = event.target.closest("button[data-option]"); if (!button) return;
    if (exportButton.disabled) { feedback.textContent = "Correct the current allowance before switching layouts, or reset to baseline."; return; }
    selected = button.dataset.option; renderItems(); renderTotals();
    document.getElementById("selected-title").focus({ preventScroll: true });
    document.getElementById("selected-title").scrollIntoView({ block: "start" });
  });
  document.getElementById("reset").addEventListener("click", () => {
    options = structuredClone(baseline.options);
    for (const [key, value] of Object.entries(baseline.defaults)) { const input = document.getElementById(key); if (key === "capture") input.checked = value; else input.value = value; }
    renderItems(); renderTotals();
  });
  exportButton.addEventListener("click", () => {
    if (exportButton.disabled) return;
    const values = settings();
    const estimate = { ...baseline, defaults: values, options, exportedAt: new Date().toISOString(), results: options.map(option => ({ id: option.id, ...calculate(option, values, baseline.capture) })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(estimate, null, 2) + "\n"], { type: "application/json" }));
    const link = element("a"); link.href = url; link.download = "enceladus-pricing-estimate.json"; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  form.hidden = false; renderItems(); renderTotals();
}

if (typeof document !== "undefined") start().catch(error => {
  const feedback = document.createElement("p"); feedback.setAttribute("role", "alert");
  feedback.textContent = `Editable pricing unavailable: ${error.message}. The baseline comparison and downloads remain available.`;
  document.getElementById("comparison-rows").closest(".table-scroll").after(feedback);
});
