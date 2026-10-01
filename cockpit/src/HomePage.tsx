import type { JSX, MouseEvent } from "react";
import artwork from "../../site/about/index.html?raw";
import "../../site/about/pages.css";
import "./home.css";

// This is reviewed, repository-owned markup, never uploaded or user-entered HTML.
// Reuse the complete artwork narrative so the SPA cannot silently drop sections.
const body = artwork.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1];
const footer = artwork.match(/<footer[^>]*>([\s\S]*)<\/footer>/)?.[1];
if (!body || !footer) throw new Error("Artwork homepage is missing its content");
const content = `<div class="artwork-content">${body}</div><footer>${footer}</footer>`
  .replaceAll('href="/studio/"', 'href="#/model"')
  .replaceAll('href="/pricing/"', 'href="#/budget"')
  .replaceAll('href="/about/"', 'href="#/"')
  .replaceAll('href="/models/"', 'href="#/media"')
  .replaceAll('href="/showtime/"', 'href="#/showtime"')
  .replaceAll('href="/"', 'href="#/"');

/** Artwork and renders inside the persistent cockpit shell. */
export default function HomePage(): JSX.Element {
  const scrollToSection = (event: MouseEvent<HTMLDivElement>): void => {
    const link = event.target instanceof Element ? event.target.closest("a") : null;
    const href = link?.getAttribute("href");
    if (!href?.startsWith("#") || href.startsWith("#/")) return;
    const section = document.getElementById(href.slice(1));
    if (!section) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: "instant" });
    section.tabIndex = -1;
    section.focus({ preventScroll: true });
  };
  return (
    <div
      className="artwork-home project-page"
      onClick={scrollToSection}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
