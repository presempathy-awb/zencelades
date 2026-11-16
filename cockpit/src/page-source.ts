// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright 2026 Andrew Briscoe and the zencelades contributors

/**
 * Pages whose text travels with the app.
 *
 * A release of the live site carries only the app and its bundled assets, so a page that must
 * stay current is bundled. The build publishes these pages unchanged, so the bundled copy is the
 * published one. Every other page is fetched as published.
 */
const bundled: Record<string, () => Promise<{ default: string }>> = {
  "open-source": () => import("../../site/open-source/index.html?raw"),
};

/** The markup of one document page. */
export async function pageSource(
  page: string,
  signal?: AbortSignal,
  load: typeof fetch = fetch,
): Promise<string> {
  const local = bundled[page];
  if (local) return (await local()).default;
  const response = await load(`/page-content/${page}.html`, { signal });
  if (!response.ok) throw new Error(`Page content unavailable (${response.status})`);
  return response.text();
}
