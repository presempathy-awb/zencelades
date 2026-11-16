// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright 2026 Andrew Briscoe and the zencelades contributors
import { expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import HomePage from "./HomePage";
import { absoluteShareImage } from "./share-image";

const root = resolve(import.meta.dir, "../..");
const read = (path: string): string => readFileSync(resolve(root, path), "utf8");

/** Text sources under a folder, skipping build output. */
function sources(dir: string, pattern: RegExp): string[] {
  return readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory())
      return ["dist", "private-studio", "brand"].includes(entry.name) ? [] : sources(path, pattern);
    return pattern.test(entry.name) ? [path] : [];
  });
}

test("the shell every route is served through carries the icons and the share card", () => {
  const head = read("cockpit/index.html").split("</head>")[0];
  const attr = (tag: RegExp, name: string): string =>
    head.match(tag)?.[0].match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? "";
  // Paths under /src/ are bundled by the build, so a release carries them with the shell.
  for (const path of [
    attr(/<link[^>]*rel="icon"[^>]*>/, "href"),
    attr(/<link[^>]*rel="apple-touch-icon"[^>]*>/, "href"),
    attr(/<meta[^>]*property="og:image"[^>]*>/, "content"),
  ]) {
    expect(path).toStartWith("/src/brand/");
    expect(`${path} ${existsSync(resolve(root, "cockpit", path.slice(1)))}`).toBe(`${path} true`);
  }
  expect(attr(/<meta[^>]*name="twitter:card"[^>]*>/, "content")).toBe("summary_large_image");
});

test("the built share card is an absolute URL, as link previews require", () => {
  const built = '<meta property="og:image" content="/studio-assets/og-AbC123.jpg"/>';
  expect(absoluteShareImage(built, "https://zenceladus.com")).toBe(
    '<meta property="og:image" content="https://zenceladus.com/studio-assets/og-AbC123.jpg"/>',
  );
  const pending = '<meta property="og:image" content="__VITE_ASSET__a1b2__"/>';
  expect(absoluteShareImage(pending, "https://zenceladus.com")).toBe(
    '<meta property="og:image" content="https://zenceladus.com__VITE_ASSET__a1b2__"/>',
  );
  const done = '<meta property="og:image" content="https://zenceladus.com/x.jpg"/>';
  expect(absoluteShareImage(done, "https://zenceladus.com")).toBe(done);
  const other =
    '<meta property="og:url" content="/x"/><link rel="icon" href="/studio-assets/f.png"/>';
  expect(absoluteShareImage(other, "https://zenceladus.com")).toBe(other);
});

test("nothing points at /brand/, which a release does not publish", () => {
  // Releases carry only the shell and its bundled assets (scripts/private_studio.py).
  const files = [
    "cockpit/index.html",
    "cockpit/private/index.html",
    ...sources("cockpit/src", /\.(tsx?|css)$/).filter((path) => !path.endsWith("brand.test.tsx")),
    ...sources("site", /\.(html|css|m?js)$/),
  ];
  expect(files.length).toBeGreaterThan(40);
  for (const path of files)
    expect(`${path} ${/["'(=]\/brand\//.test(read(path))}`).toBe(`${path} false`);
});

test("the artwork page opens with the logo", () => {
  const html = renderToStaticMarkup(<HomePage />);
  const logo = html.match(/<img[^>]*class="brand-lockup"[^>]*>/)?.[0] ?? "";
  expect(logo).toContain('alt="Zencelades"');
  expect(logo).toMatch(/src="[^"]*lockup-1600[^"]*\.webp"/);
  expect(html.indexOf(logo)).toBeLessThan(html.indexOf("Step inside another world."));
});
