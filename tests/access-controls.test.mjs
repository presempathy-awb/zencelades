import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../site/access.js", import.meta.url), "utf8");

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.attributes = {};
    this.events = {};
    this.textContent = "";
    this.value = "";
    this.removed = false;
  }
  setAttribute(key, value) { this.attributes[key] = value; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(event, handler) { this.events[event] = handler; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  remove() { this.removed = true; }
  reset() { this.children.forEach((child) => { child.value = ""; }); }
}

async function setup(canManage) {
  const elements = [];
  const header = new Element("header");
  const document = {
    documentElement: { dataset: {} },
    head: new Element("head"),
    body: new Element("body"),
    createElement(tag) {
      const element = new Element(tag);
      elements.push(element);
      return element;
    },
    getElementById(id) { return elements.find((el) => el.attributes.id === id); },
    querySelector() { return header; },
  };
  let entries = [];
  let revoked = false;
  const fetch = async (url, options) => {
    if (url.endsWith("session")) return { ok: true, json: async () => ({ data: { canManage } }) };
    if (revoked) return { status: 403, ok: false, json: async () => ({ error: { message: "Sign-in required" } }) };
    const value = options.body ? JSON.parse(options.body) : null;
    if (options.method === "POST") entries.push(value);
    if (options.method === "DELETE") entries = entries.filter((item) => item.ip !== value.ip);
    return { ok: true, json: async () => ({ data: { manual: entries, automatic: [{ ip: "8.8.8.8", device: "Laptop" }] } }) };
  };
  await vm.runInNewContext(source, { document, fetch, AbortSignal, setTimeout });
  return { document, header, elements, revoke: () => { revoked = true; } };
}

for (const permission of [false, undefined, "true"]) {
  test(`no controls or list are mounted for permission ${permission}`, async () => {
    const ui = await setup(permission);
    assert.equal(ui.header.children.length, 0);
    assert.equal(ui.document.body.children.length, 0);
    assert.equal(ui.elements.length, 0);
  });
}

test("authorized controls add and remove an IP and disappear on revoked permission", async () => {
  const ui = await setup(true);
  const button = ui.document.getElementById("nozorb-access-button");
  const dialog = ui.document.getElementById("nozorb-access-dialog");
  await button.events.click();
  assert.equal(dialog.open, true);
  const lists = ui.elements.filter((el) => el.tag === "ul");
  assert.equal(lists[0].children[0].textContent, "8.8.8.8 · Laptop");
  assert.equal(lists[1].children[0].textContent, "No manual addresses.");
  ui.document.getElementById("access-ip").value = "1.1.1.1";
  ui.document.getElementById("access-label").value = "<b>Home</b>";
  const form = ui.elements.find((el) => el.tag === "form");
  await form.events.submit({ preventDefault() {} });
  assert.equal(lists[1].children[0].children[0].textContent, "<b>Home</b> · 1.1.1.1");
  await lists[1].children[0].children[1].events.click();
  assert.equal(lists[1].children[0].textContent, "No manual addresses.");
  ui.revoke();
  const refresh = ui.elements.find((el) => el.tag === "button" && el.textContent === "Refresh");
  await refresh.events.click();
  assert.equal(button.removed, true);
  assert.equal(dialog.removed, true);
});
