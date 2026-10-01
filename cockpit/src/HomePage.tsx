import type { JSX, MouseEvent } from "react";
import artwork from "../../site/about/index.html?raw";
import "../../site/about/pages.css";
import "./home.css";

// This is reviewed, repository-owned markup, never uploaded or user-entered HTML.
// Reuse the complete artwork narrative so the SPA cannot silently drop sections.
const body = artwork.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1];
if (!body) throw new Error("Artwork homepage is missing its body");
const content = body
  .replaceAll('href="/studio/"', 'href="#/model"')
  .replaceAll('href="/pricing/"', 'href="#/budget"')
  .replaceAll('href="/about/"', 'href="#/"')
  .replaceAll('href="/"', 'href="#/"');

/** Artwork landing view inside the same application as the model and budget tools. */
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
