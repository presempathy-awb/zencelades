import { expect, test } from "bun:test";
import { fitColumns, selectColumn, viewGroups } from "./cockpit-layout";

test("columns fit usable panes without changing the requested layout", () => {
  expect(fitColumns(4, 1920)).toBe(4);
  expect(fitColumns(4, 1440)).toBe(3);
  expect(fitColumns(3, 960)).toBe(2);
  expect(fitColumns(3, 389)).toBe(1);
  expect(fitColumns(1, 1920)).toBe(1);
});

test("choosing an open view swaps columns, preserving other selections", () => {
  const pages = ["/", "/model", "/budget", "/parts"];
  expect(selectColumn(pages, 0, "/model")).toEqual(["/model", "/", "/budget", "/parts"]);
  expect(selectColumn(pages, 2, "/parts")).toEqual(["/", "/model", "/parts", "/budget"]);
  expect(selectColumn(pages, 1, "/application")).toEqual([
    "/",
    "/application",
    "/budget",
    "/parts",
  ]);
  expect(selectColumn(pages, 1, "/unknown")).toEqual(pages);
  expect(pages).toEqual(["/", "/model", "/budget", "/parts"]);
});

test("every existing destination and scenario control remains selectable exactly once", () => {
  const routes = viewGroups.flatMap((group) => group.views.map(([path]) => path));
  expect(routes.sort()).toEqual(
    [
      "/",
      "/media",
      "/showtime",
      "/model",
      "/workflow",
      "/tasks",
      "/budget",
      "/parts",
      "/research",
      "/application",
      "/mounts",
      "/grants",
      "/pricing",
      "/catalog",
      "/naming",
      "/name-concepts",
      "/open-source",
      "/supports",
      "/alternates",
      "/settings",
    ].sort(),
  );
});
