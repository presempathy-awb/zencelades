import type { JSX, MouseEvent } from "react";
import gallery from "../../site/models/index.html?raw";
import showtime from "../../site/showtime/index.html?raw";
import "./media.css";

// Trusted build-time project markup; retain every gallery attachment and caption.
const galleryBody = gallery.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1];
if (!galleryBody) throw new Error("Model gallery is missing its content");
const content = galleryBody
  .replaceAll("<h1>", "<h2>")
  .replaceAll("</h1>", "</h2>")
  .replaceAll('href="/studio/"', 'href="#/model"')
  .replaceAll('href="/showtime/"', 'href="#/showtime"')
  .replaceAll('href="/pricing/"', 'href="#/budget"')
  .replaceAll('href="#files"', 'href="/models/#files"');
const showtimeBody = showtime.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1];
if (!showtimeBody) throw new Error("Showtime is missing its content");
const showtimeContent = showtimeBody.replace(
  "@@PITCH@@",
  '<p>The pitch recording is tracked on the <a href="/showtime/" target="_blank" rel="noreferrer">published Showtime page ↗</a>. The films below carry the idea.</p>',
);

/** Browse the original films, renders and downloadable model assemblies. */
export default function MediaView(): JSX.Element {
  return (
    <div className="media-library">
      <header className="media-intro">
        <div>
          <p className="media-label">Zencelades / Moving image & form</p>
          <h1>The moon, in every medium.</h1>
          <p>
            Watch the films, inspect the renders, and take the models into your own tools. Concept
            imagery and dimensioned studies remain labeled separately.
          </p>
        </div>
        <a className="media-link" href="#/showtime">
          Open the projection stage ↗
        </a>
      </header>
      <p>
        <a href="#/alternates">Alternate designs · truck concepts & original film ↗</a>
      </p>
      <section className="media-films" aria-label="Project films">
        <figure>
          <video controls preload="metadata" aria-label="Above the ice Enceladus film">
            <source src="/media/above-the-ice.mp4" type="video/mp4" />
          </video>
          <figcaption>
            <strong>Above the ice</strong>
            <span>44-second silent film from NASA visualizations</span>
            <a href="#/showtime">Film context & projection controls</a>
          </figcaption>
        </figure>
      </section>
      <div className="media-gallery" dangerouslySetInnerHTML={{ __html: content }} />
      <footer className="media-downloads">
        <a href="/attachments/Zencelades-3D-Schematics.pdf">3D schematic packet · PDF</a>
        <a href="/application/">Grant application material</a>
        <a href="/open-source/">Open source & AI disclosure</a>
        <a href="/models/#files">Editable model downloads</a>
      </footer>
    </div>
  );
}

/** Keep the independently published projection stage intact inside the cockpit. */
export function ShowtimeView(): JSX.Element {
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
    <section className="media-library showtime-panel" aria-label="Showtime projection workspace">
      <div className="showtime-bar">
        <span>Showtime · the projection stage</span>
        <a href="/showtime/" target="_blank" rel="noreferrer">
          Open Showtime in a new tab ↗
        </a>
      </div>
      <p className="showtime-note">
        The sequence below describes the intended artwork experience. Participant capture, mapping,
        controls and occupied operation still need physical verification.
      </p>
      <div onClick={scrollToSection} dangerouslySetInnerHTML={{ __html: showtimeContent }} />
    </section>
  );
}
