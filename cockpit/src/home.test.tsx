import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import HomePage from "./HomePage";
import MediaView, { ShowtimeView } from "./MediaView";
import AlternateDesigns from "./AlternateDesigns";

test("artwork fits within the cockpit landmark while retaining renders and narrative", () => {
  const html = renderToStaticMarkup(<HomePage />);
  expect(html).not.toContain("<main");
  expect(html).not.toContain('<header class="masthead"');
  expect(html).toContain("Step inside another world.");
  expect(html).toContain("The audience makes the show.");
  expect(html).toContain("concept-suspended-hoop-v3.png");
  expect(html).toContain("concept-landed.png");
  expect(html).toContain("zencelades-2p5m-suspended-iso.png");
  expect(html).toContain("zencelades-2p5m-lander-iso.png");
});

test("homepage offers the Showtime moon film as a plain muted looping link", () => {
  const html = renderToStaticMarkup(<HomePage />);
  const teaser = html.match(/<a class="showtime-teaser"[\s\S]*?<\/a>/)?.[0] ?? "";
  expect(teaser).toContain('href="#/showtime"');
  expect(teaser).toContain("/media/above-the-ice.mp4");
  expect(teaser).toMatch(/<video[^>]*autoplay/);
  expect(teaser).toMatch(/<video[^>]*muted/);
  expect(teaser).toMatch(/<video[^>]*loop/);
  expect(teaser).toMatch(/<video[^>]*playsinline/);
  expect(teaser).not.toMatch(/<video[^>]*controls/);
});

test("media keeps the moon film, current gallery and assemblies while historical film moves to alternatives", () => {
  const html = renderToStaticMarkup(<MediaView />);
  expect(html.match(/<video /g)).toHaveLength(1);
  expect(html).not.toContain("/media/previs.mp4");
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
  expect(showtime.match(/<video /g)).toHaveLength(1);
  expect(showtime).not.toContain("/media/previs.mp4");
  expect(showtime).toContain('href="/showtime/"');
});

test("truck imagery and the original film remain available only as alternate designs", () => {
  const alternatives = renderToStaticMarkup(<AlternateDesigns />);
  const main = renderToStaticMarkup(<HomePage />) + renderToStaticMarkup(<MediaView />);
  for (const file of [
    "concept-board.png",
    "11_59_25",
    "variant-a.png",
    "variant-b.png",
    "previs.mp4",
  ]) {
    expect(alternatives).toContain(file);
    expect(main).not.toContain(file);
  }
  expect(alternatives).toContain("Alternate designs");
});
