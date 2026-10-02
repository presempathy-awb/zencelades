const film = document.getElementById("showtime-home-video");
const preference = matchMedia("(prefers-reduced-motion: reduce)");
if (film instanceof HTMLVideoElement) {
  const applyPreference = () => {
    if (preference.matches) film.pause();
    else {
      film.muted = true;
      // Browsers may decline autoplay; native playback controls remain available.
      film.play().catch(() => {
        film.controls = true;
      });
    }
  };
  preference.addEventListener("change", applyPreference);
  applyPreference();
}
