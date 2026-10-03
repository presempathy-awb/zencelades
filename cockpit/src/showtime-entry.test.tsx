import { expect, test } from "bun:test";
import { renderToReadableStream } from "react-dom/server";
import { ShowtimeView } from "./MediaView";

test("Showtime opens the live stage while retaining the installation films", async () => {
  const stream = await renderToReadableStream(<ShowtimeView />);
  await stream.allReady;
  const html = await new Response(stream).text();
  expect(html).toContain('aria-label="Live Showtime projection"');
  expect(html).toContain("Installation context &amp; films");
  expect(html).toContain("/media/above-the-ice.mp4");
  expect(html).toContain("You are the man");
});
