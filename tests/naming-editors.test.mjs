import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { initEditor } from "../site/naming/editor.mjs";
import { initRanking } from "../site/naming/ranking.mjs";
import { namingDraftFor } from "../site/naming/draft-state.mjs";

class Element extends EventTarget {
  constructor(tag = "div") {
    super();
    this.tag = tag;
    this.children = [];
    this.attributes = {};
    this.options = [];
    this.dataset = {};
    this.value = "all";
    this.textContent = "";
  }
  setAttribute(key, value) {
    this.attributes[key] = value;
  }
  removeAttribute(key) {
    delete this.attributes[key];
  }
  append(...children) {
    this.children.push(...children);
  }
  replaceChildren(...children) {
    this.children = children;
  }
  add(option) {
    this.options.push(option);
  }
  querySelectorAll() {
    return [];
  }
}
class Root extends EventTarget {
  constructor() {
    super();
    this.elements = new Map();
  }
  querySelector(selector) {
    if (!this.elements.has(selector)) this.elements.set(selector, new Element());
    return this.elements.get(selector);
  }
  querySelectorAll() {
    return [];
  }
}

test("actual editor initialization and edits do not restore or rewrite guest browser storage", async () => {
  const old = Object.fromEntries(
    ["document", "fetch", "localStorage", "Option"].map((key) => [
      key, Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  const stored = new Map([
    ["enceladus-naming-palette-v1", "old palette bytes"],
    ["enceladus-naming-shelves-v1", "old shelves bytes"],
  ]);
  const before = [...stored];
  const family = {
    id: "moon",
    label: "Moon",
    enabled: true,
    words: ["luna"],
    selected: ["luna"],
    pool: [],
  };
  const fixtures = {
    "palette.json": { families: [family] },
    "research-rolls.json": { authored: [], groups: [] },
    "report.json": { groups: [] },
    "reviews.json": { candidates: {}, favorites: {} },
  };
  try {
    globalThis.document = {
      documentElement: { dataset: {} },
      createElement: (tag) => new Element(tag),
      createTextNode: (text) => text,
    };
    globalThis.Option = class {
      constructor(text, value) {
        this.textContent = text;
        this.value = value;
      }
    };
    globalThis.localStorage = {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value),
    };
    globalThis.fetch = async (url) => {
      if (url === "/naming/api/workbench") return Response.json({ families: [family] });
      const name = String(url).split("/").at(-1);
      if (process.env.NAMING_FIXTURE_ROOT)
        return Response.json(
          JSON.parse(await readFile(`${process.env.NAMING_FIXTURE_ROOT}/${name}`, "utf8")),
        );
      if (!fixtures[name]) throw new Error(`Unexpected test request: ${url}`);
      return Response.json(fixtures[name]);
    };
    const first = new Root();
    await Promise.all([initEditor(first), initRanking(first)]);
    const authored = namingDraftFor(first).snapshot();
    const edited = structuredClone(authored);
    edited.palette.excluded.push("ocean");
    edited.shelves.names.zorbit.favorite = true;
    namingDraftFor(first).replace(edited);
    // Exercise a real control path that previously called localStorage.setItem.
    first.querySelector("#weights-chatgpt").dispatchEvent(new Event("click"));
    const second = new Root();
    await Promise.all([initEditor(second), initRanking(second)]);
    assert.deepEqual(namingDraftFor(second).snapshot(), authored);
    assert.deepEqual([...stored], before);
    assert.equal(namingDraftFor(first).snapshot().shelves.names.zorbit.favorite, true);
    if (process.env.NAMING_FIXTURE_ROOT)
      console.log(
        `Published Naming snapshot: ${Buffer.byteLength(JSON.stringify(authored))} bytes`,
      );
  } finally {
    for (const [key, value] of Object.entries(old)) {
      if (value === undefined) delete globalThis[key];
      else Object.defineProperty(globalThis, key, value);
    }
  }
});
