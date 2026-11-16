// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright 2026 Andrew Briscoe and the zencelades contributors
import { expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import HomePage from "./HomePage";

const root = resolve(import.meta.dir, "../..");
const read = (path: string): string => readFileSync(resolve(root, path), "utf8");

/** Every authored page under site/, however deep. */
function sitePages(dir = "site"): string[] {
  return readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    // dist and private-studio are build output, not authored pages.
    if (entry.isDirectory())
      return ["dist", "private-studio"].includes(entry.name) ? [] : sitePages(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

test("the shell every route is served through carries the icons and the share card", () => {
  const head = read("cockpit/index.html").split("</head>")[0];
  const attr = (tag: RegExp, name: string): string =>
    head.match(tag)?.[0].match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? "";
  expect(attr(/<link[^>]*rel="icon"[^>]*>/, "href")).toStartWith("/brand/");
  expect(attr(/<link[^>]*rel="apple-touch-icon"[^>]*>/, "href")).toStartWith("/brand/");
  expect(new URL(attr(/<meta[^>]*property="og:image"[^>]*>/, "content")).pathname).toStartWith(
    "/brand/",
  );
  expect(attr(/<meta[^>]*name="twitter:card"[^>]*>/, "content")).toBe("summary_large_image");
});

test("no page or view points at a logo file the site does not publish", () => {
  const sources = [
    "cockpit/index.html",
    "cockpit/src/App.tsx",
    "site/about/pages.css",
    ...sitePages(),
  ];
  const named = sources.flatMap((path) =>
    [...read(path).matchAll(/\/brand\/([\w.-]+)/g)].map((match) => ({ path, file: match[1] })),
  );
  expect(named.length).toBeGreaterThan(0);
  for (const { path, file } of named)
    expect(`${path}: ${file} ${existsSync(resolve(root, "cockpit/public/brand", file))}`).toBe(
      `${path}: ${file} true`,
    );
});

test("every authored page names the favicon, for when it is opened outside the shell", () => {
  const documents = sitePages().filter((path) => read(path).includes("<head")); // not the embedded fragments
  expect(documents.length).toBeGreaterThan(10);
  for (const path of documents)
    expect(`${path} ${read(path).includes('rel="icon"')}`).toBe(`${path} true`);
});

test("the artwork page opens with the logo", () => {
  const html = renderToStaticMarkup(<HomePage />);
  expect(html).toMatch(/<img[^>]*class="brand-lockup"[^>]*alt="Zencelades"/);
  expect(html.indexOf('class="brand-lockup"')).toBeLessThan(
    html.indexOf("Step inside another world."),
  );
});
