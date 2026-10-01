import { expect, test } from "bun:test";
import { cockpitHref } from "./page-routes";

test("project page links stay in the cockpit while files and external links keep their destinations", () => {
  expect(cockpitHref("/application/#budget", "/models/")).toBe("/#/application?section=budget");
  expect(cockpitHref("/open-source/", "/")).toBe("/#/open-source");
  expect(cockpitHref("19-zenceladus.png", "/name-concepts/")).toBe(
    "/name-concepts/19-zenceladus.png",
  );
  expect(cockpitHref("/attachments/file.glb?v=abc", "/models/")).toBe(
    "/attachments/file.glb?v=abc",
  );
  expect(cockpitHref("https://example.org/art", "/")).toBe("https://example.org/art");
  expect(cockpitHref("#files", "/models/")).toBe("#files");
  expect(cockpitHref("/pricing/", "/")).toBe("/#/pricing");
});
