import { expect, test } from "bun:test";
import {
  buildTasks,
  createBuildBoardState,
  parseBuildBoardState,
  updateBuildTaskStatus,
} from "./build-board";

test("a new board makes no claim of completed work and retains the original prerequisites", () => {
  const board = createBuildBoardState();
  expect(Object.keys(board.statuses)).toHaveLength(24);
  expect(Object.values(board.statuses).every((status) => status === "todo")).toBe(true);
  expect(buildTasks.find((task) => task.id === "ZC-W07")?.depends).toEqual(["ZC-W05", "ZC-W06"]);
  expect(buildTasks.find((task) => task.id === "ZC-W22")?.depends).toEqual(["ZC-W20", "ZC-W21"]);
});

test("changing progress preserves other tasks and saved data round trips independently", () => {
  const initial = createBuildBoardState();
  const changed = updateBuildTaskStatus(initial, "ZC-W01", "in-progress");
  expect(changed.statuses["ZC-W01"]).toBe("in-progress");
  expect(changed.statuses["ZC-W02"]).toBe("todo");
  expect(initial.statuses["ZC-W01"]).toBe("todo");
  const restored = parseBuildBoardState(JSON.parse(JSON.stringify(changed)));
  expect(restored).toEqual(changed);
  restored.statuses["ZC-W01"] = "done";
  expect(changed.statuses["ZC-W01"]).toBe("in-progress");
});

test("invalid imported progress is refused rather than silently resetting tasks", () => {
  const initial = createBuildBoardState();
  const missing = { ...initial.statuses };
  delete missing["ZC-W01"];
  for (const input of [
    null,
    [],
    { ...initial, schema_version: 2 },
    { ...initial, statuses: missing },
    { ...initial, statuses: { ...initial.statuses, "ZC-W99": "todo" } },
    { ...initial, statuses: { ...initial.statuses, "ZC-W01": "approved" } },
    { ...initial, statuses: { ...initial.statuses, "ZC-W01": null } },
    { ...initial, statuses: [] },
  ]) {
    expect(() => parseBuildBoardState(input)).toThrow();
  }
  expect(() => updateBuildTaskStatus(initial, "ZC-W99", "done")).toThrow();
  expect(initial.statuses["ZC-W01"]).toBe("todo");
});
