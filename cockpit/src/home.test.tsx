import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import HomePage from "./HomePage";
import MediaView, { ShowtimeView } from "./MediaView";

test("artwork fits within the cockpit landmark while retaining renders and narrative", () => {
  const html = renderToStaticMarkup(<HomePage />);
  expect(html).not.toContain("<main");
  expect(html).not.toContain('<header class="masthead"');
  expect(html).toContain("Step inside another world.");
  expect(html).toContain("The audience makes the show.");
  expect(html).toContain("concept-suspended.png");
  expect(html).toContain("concept-landed.png");
  expect(html).toContain("zencelades-2p5m-suspended-iso.png");
  expect(html).toContain("zencelades-2p5m-lander-iso.png");
});

test("media workspace exposes both films, all gallery images and editable assemblies", () => {
  const html = renderToStaticMarkup(<MediaView />);
  expect(html.match(/<video /g)).toHaveLength(2);
  expect(html.match(/<img /g)).toHaveLength(10);
  expect(html.match(/<h1>/g)).toHaveLength(1);
  expect(html).not.toContain("<main");
  for (const size of ["2p5m", "3p0m"]) {
    for (const host of ["lander", "suspended"]) {
      expect(html).toContain(`zencelades-${size}-${host}.glb`);
      expect(html).toContain(`zencelades-${size}-${host}.blend`);
    }
  }
  const showtime = renderToStaticMarkup(<ShowtimeView />);
  expect(showtime).not.toContain("<iframe");
  expect(showtime.match(/<video /g)).toHaveLength(2);
  expect(showtime).toContain('href="/showtime/"');
});
