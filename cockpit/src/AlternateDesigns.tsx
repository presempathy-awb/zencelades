import type { JSX } from "react";

const truckImages = [
  [
    "/media/concept-board.png",
    "Original truck concept board",
    "Historical generated concept showing a truck-supported sphere at the shoreline",
  ],
  [
    "/downloads/source/uploads/ChatGPT%20Image%20Sep%2030,%202026,%2011_59_25%20AM.png",
    "Earlier truck and boom concept",
    "Original generated truck, boom and sphere concept sheet",
  ],
  [
    "/media/variant-a.png",
    "Dual-hitch study",
    "Model drawing of the proposed rear receiver and Andersen attachment concept",
  ],
  [
    "/media/variant-b.png",
    "Chassis-saddle study",
    "Model drawing of the proposed truck chassis attachment concept",
  ],
];

/** Keep deferred truck material accessible without presenting it as the current proposal. */
export default function AlternateDesigns(): JSX.Element {
  return (
    <div className="media-library">
      <p className="media-label">Preserved concepts · outside the Love Burn base build</p>
      <h1>Alternate designs.</h1>
      <p>
        The current proposal is the common triangle and ring, on lander legs or an aerial rig. The
        truck concepts below are deferred studies; their old dates, dimensions and budgets are
        historical.
      </p>
      <div className="model-gallery">
        {truckImages.map(([src, title, alt]) => (
          <figure key={src}>
            <a href={src}>
              <img src={src} alt={alt} loading="lazy" />
            </a>
            <figcaption>
              <strong>{title}</strong>
              <span>Unapproved concept · open the original at full size.</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <section className="media-films" aria-label="Historical film">
        <figure>
          <video controls preload="metadata" aria-label="Original truck-era cinematic concept">
            <source src="/media/previs.mp4" type="video/mp4" />
          </video>
          <figcaption>
            <strong>Original cinematic concept</strong>
            <span>Historical previsualization with original audio.</span>
            <a href="/downloads/source/uploads/enceladus_within_cinematic_previs_h264.mp4" download>
              Download original film
            </a>
          </figcaption>
        </figure>
      </section>
      <p>
        These images do not establish a working load, approved vehicle connection or permission for
        occupied suspension.
      </p>
      <footer className="media-downloads">
        <a href="#/model">Current lander & aerial models</a>
        <a href="#/mounts">Historical mount research</a>
        <a href="#/pricing">Alternate pricing studies</a>
        <a href="#/catalog">Complete original asset catalog</a>
      </footer>
    </div>
  );
}
