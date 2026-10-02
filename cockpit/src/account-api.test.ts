import { afterEach, beforeEach, expect, test, spyOn } from "bun:test";
import { accountSession, loadAccountScenario, saveAccountScenario } from "./account-api";
import { initialScenario } from "./scenario";

let fetchSpy: ReturnType<typeof spyOn<typeof globalThis, "fetch">>;
beforeEach(() => {
  fetchSpy = spyOn(globalThis, "fetch");
});
afterEach(() => {
  fetchSpy.mockRestore();
});

function respond(
  implementation: (input: string | URL | Request, options?: RequestInit) => Promise<Response>,
): void {
  fetchSpy.mockImplementation(Object.assign(implementation, { preconnect: () => {} }));
}

test("loads the whole account snapshot through domain validation", async () => {
  const scenario = initialScenario();
  scenario.note = "Saved design";
  scenario.parts.cameras = 2;
  scenario.funding.ownerPossible = 250;
  respond(async () =>
    Response.json({ data: { revision: 3, document: scenario, updatedAt: "2026-10-01T00:00:00Z" } }),
  );
  expect((await loadAccountScenario("alice"))?.scenario).toEqual(scenario);
  respond(async () =>
    Response.json({
      data: { revision: 3, document: { schema: 1 }, updatedAt: "2026-10-01T00:00:00Z" },
    }),
  );
  await expect(loadAccountScenario("alice")).rejects.toThrow();
});

test("save is bound to the displayed account and revision", async () => {
  const scenario = initialScenario();
  let request: RequestInit | undefined;
  respond(async (_url: string | URL | Request, options?: RequestInit) => {
    request = options;
    return Response.json({
      data: { revision: 2, document: scenario, updatedAt: "2026-10-01T00:00:00Z" },
    });
  });
  expect((await saveAccountScenario("alice", 1, scenario)).revision).toBe(2);
  expect(request?.credentials).toBe("same-origin");
  expect(new Headers(request?.headers).get("X-Account-Subject")).toBe("alice");
  expect(JSON.parse(String(request?.body))).toEqual({ expectedRevision: 1, document: scenario });
});

test("expiry and conflicts remain actionable errors", async () => {
  for (const [status, code] of [
    [401, "sign_in_required"],
    [409, "revision_conflict"],
    [409, "account_changed"],
    [503, "storage_unavailable"],
  ] as const) {
    respond(async () => Response.json({ error: { code, message: "Keep your draft" } }, { status }));
    await expect(loadAccountScenario("alice")).rejects.toMatchObject({
      status,
      code,
      message: "Keep your draft",
    });
  }
});

test("non-JSON account responses keep draft recovery actionable", async () => {
  const scenario = initialScenario();
  for (const status of [200, 502]) {
    for (const operation of [
      () => accountSession(),
      () => loadAccountScenario("alice"),
      () => saveAccountScenario("alice", 1, scenario),
    ]) {
      respond(async () => new Response("<!DOCTYPE html><title>Gateway</title>", { status }));
      await expect(operation()).rejects.toMatchObject({
        status,
        code: "invalid_response",
        message:
          "Account service returned an unreadable response. Keep this draft and export it before leaving.",
      });
    }
  }
});

test("session rejects external login URLs and malformed identities", async () => {
  const data = {
    user: null,
    signInURL: "/outpost.goauthentik.io/start?rd=%2F",
    signOutURL: "/outpost.goauthentik.io/sign_out",
  };
  respond(async () => Response.json({ data }));
  expect((await accountSession()).user).toBeNull();
  respond(async () => Response.json({ data: { ...data, signInURL: "https://outside.example" } }));
  await expect(accountSession()).rejects.toThrow();
  respond(async () => Response.json({ data: { ...data, user: { id: "", username: "artist" } } }));
  await expect(accountSession()).rejects.toThrow();
});
