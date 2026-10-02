import { type JSX, lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import artwork from "../../site/about/index.html?raw";
import "../../site/about/pages.css";
import "./home.css";

// This is reviewed, repository-owned markup, never uploaded or user-entered HTML.
// Reuse the complete artwork narrative so the SPA cannot silently drop sections.
const body = artwork.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1];
const footer = artwork.match(/<footer[^>]*>([\s\S]*)<\/footer>/)?.[1];
if (!body || !footer) throw new Error("Artwork homepage is missing its content");
const leadVisuals = body.match(/<div class="home-visuals">[\s\S]*?<\/div>/)?.[0];
if (!leadVisuals) throw new Error("Artwork homepage is missing its lead renders");
const pairedBody = body
  .replace(
    leadVisuals,
    `<div class="lead-media">${leadVisuals}<div class="homepage-showtime" data-home-showtime><div class="homepage-showtime-start"><button type="button" data-home-showtime-start>Start</button></div></div></div>`,
  )
  .replace(/<a class="showtime-teaser"[\s\S]*?<\/a>/, "");
const content = `<div class="artwork-content">${pairedBody}<footer>${footer}</footer></div>`
  .replaceAll('href="/studio/"', 'href="#/model"')
  .replaceAll('href="/pricing/"', 'href="#/budget"')
  .replaceAll('href="/about/"', 'href="#/"')
  .replaceAll('href="/models/"', 'href="#/media"')
  .replaceAll('href="/showtime/"', 'href="#/showtime"')
  .replaceAll('href="/"', 'href="#/"');

const LiveShowtime = lazy(() => import("./showtime/live-showtime"));

/** Artwork and renders inside the persistent cockpit shell. */
export default function HomePage(): JSX.Element {
  const root = useRef<HTMLDivElement>(null);
  const [showtimeSlot, setShowtimeSlot] = useState<HTMLElement | null>(null);
  const [showtimeEnabled, setShowtimeEnabled] = useState(false);
  useEffect(() => {
    const home = root.current;
    if (!home) return;
    let started = false;
    const handleHomeClick = (event: MouseEvent): void => {
      const start =
        event.target instanceof Element ? event.target.closest("[data-home-showtime-start]") : null;
      if (start && !started) {
        const slot = start.closest<HTMLElement>("[data-home-showtime]");
        if (!slot) return;
        started = true;
        slot.replaceChildren();
        setShowtimeSlot(slot);
        setShowtimeEnabled(true);
        return;
      }
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      const href = link?.getAttribute("href");
      if (!href?.startsWith("#") || href.startsWith("#/")) return;
      const section = document.getElementById(href.slice(1));
      if (!section) return;
      event.preventDefault();
      section.tabIndex = -1;
      section.focus({ preventScroll: true });
    };
    home.addEventListener("click", handleHomeClick);
    return () => home.removeEventListener("click", handleHomeClick);
  }, []);
  return (
    <>
      <div
        ref={root}
        className="artwork-home project-page"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {showtimeEnabled &&
        showtimeSlot &&
        createPortal(
          <Suspense fallback={<p role="status">Loading the live zorb…</p>}>
            <LiveShowtime isCompact />
          </Suspense>,
          showtimeSlot,
        )}
    </>
  );
}
