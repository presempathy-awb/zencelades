import { mountShowtime } from "./main";
import "./showtime.css";

const mediaBase = new URL("film-media/", new URL(import.meta.env.BASE_URL, document.baseURI)).href;
let cleanup: (() => void) | undefined;

function mount(): void {
  cleanup?.();
  cleanup = mountShowtime(document, mediaBase);
}

function unmount(): void {
  cleanup?.();
  cleanup = undefined;
}

mount();
window.addEventListener("pagehide", unmount);
window.addEventListener("pageshow", (event) => {
  if (event.persisted && !cleanup) mount();
});
