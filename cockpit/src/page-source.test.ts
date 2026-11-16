// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright 2026 Andrew Briscoe and the zencelades contributors
import { expect, test } from "bun:test";
import { pageSource } from "./page-source";

test("the disclosure page travels with the app, so a release publishes its text", async () => {
  const refuse = (() => {
    throw new Error("fetched");
  }) as unknown as typeof fetch;
  const html = await pageSource("open-source", undefined, refuse);
  expect(html).toContain("Where AI contributes.");
  expect(html).toContain("The Zencelades logo is a trademark");
});

test("other pages are fetched as published, and a missing one is an error", async () => {
  const seen: string[] = [];
  const found = (async (url: string) => {
    seen.push(url);
    return new Response("<main>x</main>");
  }) as unknown as typeof fetch;
  expect(await pageSource("pricing", undefined, found)).toBe("<main>x</main>");
  expect(seen).toEqual(["/page-content/pricing.html"]);
  const missing = (async () => new Response("", { status: 404 })) as unknown as typeof fetch;
  await expect(pageSource("pricing", undefined, missing)).rejects.toThrow(
    "Page content unavailable (404)",
  );
});
