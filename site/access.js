/* Shared by the published catalog and the project studio. No controls before authorization. */
(async () => {
  if (document.documentElement.dataset.nozorbAccessLoaded) return;
  document.documentElement.dataset.nozorbAccessLoaded = "true";
  const api = async (path, method = "GET", payload) => {
    const response = await fetch(`/access/api/${path}`, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: payload ? { "Content-Type": "application/json" } : {},
      body: payload ? JSON.stringify(payload) : undefined,
      signal: AbortSignal.timeout(10000),
    });
    if (response.status === 403) {
      document.getElementById("nozorb-access-button")?.remove();
      document.getElementById("nozorb-access-dialog")?.remove();
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "IP access is unavailable.");
    return result.data;
  };
  let session;
  try {
    session = await api("session");
  } catch {
    // The optional control stays absent when authorization cannot be established.
    return;
  }
  if (session.canManage !== true) return;

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "/access.css";
  document.head.append(style);
  const node = (tag, text, attributes = {}) => {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };
  const open = node("button", "IP access", { id: "nozorb-access-button", type: "button", "aria-haspopup": "dialog" });
  const dialog = node("dialog", "", { id: "nozorb-access-dialog", "aria-labelledby": "nozorb-access-title" });
  const title = node("h2", "IP access", { id: "nozorb-access-title" });
  const close = node("button", "Close", { type: "button" });
  const heading = node("div", "", { class: "access-heading" });
  heading.append(title, close);
  const description = node("p", "People sharing an allowed public IP can open this site without signing in. IP access never grants permission to manage this list.");
  const feedback = node("p", "", { role: "status", "aria-live": "polite" });
  const autoTitle = node("h3", "Following Tailnet devices");
  const autoList = node("ul");
  const manualTitle = node("h3", "Manually allowed");
  const manualList = node("ul");
  const form = node("form");
  const address = node("input", "", { id: "access-ip", name: "ip", placeholder: "Public IPv4 or IPv6 address", required: "", maxlength: "45", autocomplete: "off", spellcheck: "false" });
  const label = node("input", "", { id: "access-label", name: "label", placeholder: "For example, home", required: "", maxlength: "80", autocomplete: "off" });
  const add = node("button", "Allow IP", { type: "submit" });
  form.append(node("label", "Public IP", { for: "access-ip" }), address, node("label", "Label", { for: "access-label" }), label, add);
  const refresh = node("button", "Refresh", { type: "button" });
  dialog.append(heading, description, autoTitle, autoList, manualTitle, manualList, form, feedback, refresh);
  document.body.append(dialog);

  const mount = () => {
    const header = document.querySelector(".header-actions, .masthead nav, .masthead");
    if (!header) return false;
    header.append(open);
    return true;
  };
  if (!mount()) {
    const observer = new MutationObserver(() => { if (mount()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }

  async function load() {
    const data = await api("ips");
    autoList.replaceChildren(...data.automatic.map((item) => node("li", `${item.ip} · ${item.device}`)));
    if (!data.automatic.length) autoList.append(node("li", "No fresh public Tailnet addresses. Other visitors sign in normally."));
    manualList.replaceChildren(...data.manual.map((item) => {
      const row = node("li");
      const remove = node("button", "Remove", { type: "button", "aria-label": `Remove ${item.label}, ${item.ip}` });
      remove.addEventListener("click", async () => {
        remove.disabled = true;
        try {
          await api("ips", "DELETE", { ip: item.ip });
          await load();
          feedback.textContent = `Removed ${item.ip}. It may still be allowed if a Tailnet device is using it.`;
        } catch (error) {
          feedback.textContent = error.message;
          remove.disabled = false;
        }
      });
      row.append(node("span", `${item.label} · ${item.ip}`), remove);
      return row;
    }));
    if (!data.manual.length) manualList.append(node("li", "No manual addresses."));
  }
  open.addEventListener("click", async () => {
    dialog.showModal();
    feedback.textContent = "Loading…";
    try { await load(); feedback.textContent = ""; }
    catch (error) { feedback.textContent = error.message; }
  });
  close.addEventListener("click", () => dialog.close());
  refresh.addEventListener("click", async () => {
    try { await load(); feedback.textContent = "Address list refreshed."; }
    catch (error) { feedback.textContent = error.message; }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    add.disabled = true;
    try {
      await api("ips", "POST", { ip: address.value.trim(), label: label.value.trim() });
      await load();
      feedback.textContent = `Allowed ${address.value.trim()}.`;
      form.reset();
    } catch (error) { feedback.textContent = error.message; }
    finally { add.disabled = false; }
  });
})();
