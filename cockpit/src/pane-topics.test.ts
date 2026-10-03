import { expect, test } from "bun:test";
import { topicRanges, sectionId } from "./pane-topics";

test("section links handle routed queries and bare fragments without treating routes as IDs", () => {
  expect(sectionId("#/?section=renders")).toBe("renders");
  expect(sectionId("#/?section=two%20words")).toBe("two words");
  expect(sectionId("#two%20words")).toBe("two words");
  expect(sectionId("#/model")).toBeNull();
  expect(sectionId("#bad%ZZ")).toBeNull();
});

test("drill-down includes introduction and every content item exactly once", () => {
  expect(topicRanges(["", "", "Funding", "", "Parts", ""])).toEqual([
    { title: "Overview", start: 0, end: 2 },
    { title: "Funding", start: 2, end: 4 },
    { title: "Parts", start: 4, end: 6 },
  ]);
  expect(topicRanges(["Intro", "", "More"])).toEqual([
    { title: "Intro", start: 0, end: 2 },
    { title: "More", start: 2, end: 3 },
  ]);
  expect(topicRanges([])).toEqual([]);
});
