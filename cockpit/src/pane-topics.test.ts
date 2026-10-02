import { expect, test } from "bun:test";
import { topicRanges } from "./pane-topics";

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
