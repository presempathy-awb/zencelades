import test from "node:test";
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { initNamingDraftControls } from "../site/naming/draft-controls.mjs";
import { namingDraftFor } from "../site/naming/draft-state.mjs";

class Element extends EventTarget {
  constructor(tag) {
    super();
    this.tag = tag;
    this.children = [];
    this.attributes = {};
    this.isConnected = true;
    this.disabled = false;
    this.textContent = "";
  }
  setAttribute(key, value) {
    this.attributes[key] = value;
  }
  append(...children) {
    this.children.push(...children);
  }
  click() {
    if (!this.disabled) this.dispatchEvent(new Event("click"));
  }
}
async function until(check) {
  for (let n = 0; n < 100; n++) {
    if (check()) return;
    await delay(1);
  }
  assert.ok(check(), "control did not settle");
}

test("Naming controls require explicit account saves and preserve edits on conflict and expiry", async () => {
  const oldDocument = globalThis.document,
    oldFetch = globalThis.fetch;
  const elements = [];
  const host = { before: (panel) => elements.push(panel) };
  const root = { querySelector: (selector) => (selector === "#name-studio" ? host : null) };
  const draft = namingDraftFor(root);
  let palette = { families: [], excluded: [], removedFamilies: [] };
  let shelves = {
    names: {},
    current: [],
    weights: [50, 12, 10, 8, 7, 5, 5, 3],
    review_schema: 1,
    review_weights: [50, 10, 8, 6, 4, 4, 4, 2, 3, 3, 2, 4],
  };
  draft.register(
    "palette",
    () => palette,
    (next) => {
      palette = next;
    },
  );
  draft.register(
    "shelves",
    () => shelves,
    (next) => {
      shelves = next;
    },
  );
  let user = null,
    saved = null,
    fail = null,
    writes = 0;
  try {
    globalThis.document = {
      createElement: (tag) => {
        const el = new Element(tag);
        elements.push(el);
        return el;
      },
    };
    globalThis.fetch = async (url, options) => {
      if (url === "/account/api/session")
        return Response.json({
          data: {
            user,
            signInURL: "/outpost.goauthentik.io/start?rd=%2F",
            signOutURL: "/outpost.goauthentik.io/sign_out",
          },
        });
      assert.equal(url, "/account/api/naming/current");
      assert.equal(options.headers["X-Account-Subject"], user.id);
      if (fail)
        return Response.json(
          { error: { code: fail, message: "Keep current edits" } },
          { status: fail === "sign_in_required" ? 401 : 409 },
        );
      if (options.method === "PUT") {
        const body = JSON.parse(options.body);
        assert.equal(body.expectedRevision, saved?.revision ?? 0);
        saved = {
          revision: (saved?.revision ?? 0) + 1,
          document: body.document,
          updatedAt: "2026-10-01T00:00:00Z",
        };
        writes++;
      }
      return Response.json({ data: saved });
    };
    initNamingDraftControls(root);
    const button = (text) => elements.find((x) => x.tag === "button" && x.textContent === text);
    const status = elements.find((x) => x.attributes?.role === "status");
    await until(() => status.textContent.includes("Guest edits"));
    const save = button("Save Naming to account"),
      load = button("Load saved Naming · replace draft"),
      refresh = button("Refresh Naming account");
    assert.ok(save.disabled);
    assert.ok(load.disabled);
    assert.equal(writes, 0);
    palette.excluded.push("guest-edit");
    const working = draft.snapshot();
    user = { id: "alice", username: "artist" };
    saved = { revision: 3, document: structuredClone(working), updatedAt: "2026-10-01T00:00:00Z" };
    saved.document.palette.excluded = ["saved-edit"];
    refresh.click();
    await until(() => status.textContent.includes("A saved Naming"));
    assert.ok(save.disabled);
    assert.deepEqual(draft.snapshot(), working);
    load.click();
    await until(() => status.textContent.includes("Loaded Naming revision 3"));
    assert.deepEqual(palette.excluded, ["saved-edit"]);
    palette.excluded.push("new-edit");
    save.click();
    await until(() => status.textContent.includes("Saved Naming revision 4"));
    assert.deepEqual(saved.document, draft.snapshot());
    assert.equal(writes, 1);
    palette.excluded.push("retain-conflict");
    const keep = draft.snapshot();
    fail = "revision_conflict";
    save.click();
    await until(() => status.textContent.includes("unchanged"));
    assert.ok(save.disabled);
    assert.deepEqual(draft.snapshot(), keep);
    fail = "sign_in_required";
    load.click();
    await until(() => !refresh.disabled);
    assert.ok(save.disabled);
    assert.ok(load.disabled);
    assert.deepEqual(draft.snapshot(), keep);
    assert.equal(writes, 1);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldDocument === undefined) delete globalThis.document;
    else globalThis.document = oldDocument;
  }
});
