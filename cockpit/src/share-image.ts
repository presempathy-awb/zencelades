// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright 2026 Andrew Briscoe and the zencelades contributors

/**
 * Link previews need an absolute share-card URL; the build emits a root-relative one.
 * The hook runs before the bundler swaps its asset placeholder for that path, so both forms count.
 */
export function absoluteShareImage(html: string, origin: string): string {
  return html.replace(/(<meta property="og:image" content=")(?=\/|__VITE_ASSET__)/, `$1${origin}`);
}
