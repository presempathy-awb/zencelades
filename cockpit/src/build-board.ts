import taskCatalog from "../../assets/build-tasks.json";
import partCatalog from "../../assets/build-parts.json";

export const buildTaskStatuses = ["todo", "in-progress", "done"] as const;
export type BuildTaskStatus = (typeof buildTaskStatuses)[number];

export interface BuildTask {
  id: string;
  title: string;
  role: string;
  depends: readonly string[];
  done: string;
}

export interface BuildBoardState {
  schema_version: 1;
  statuses: Record<string, BuildTaskStatus>;
}

export const buildTasks: readonly BuildTask[] = taskCatalog.tasks;
export const buildPartCount = partCatalog.parts.length;
export const buildTaskStatusLabels: Record<BuildTaskStatus, string> = {
  todo: "Todo",
  "in-progress": "In progress",
  done: "Done",
};
const taskIds = new Set(buildTasks.map((task) => task.id));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Create an unstarted board without implying any physical work has been completed. */
export function createBuildBoardState(): BuildBoardState {
  return {
    schema_version: 1,
    statuses: Object.fromEntries(buildTasks.map((task) => [task.id, "todo"])),
  };
}

/** Validate persisted or imported board progress without discarding unknown or missing tasks. */
export function parseBuildBoardState(value: unknown): BuildBoardState {
  if (!isRecord(value) || value.schema_version !== 1 || !isRecord(value.statuses)) {
    throw new Error("Build board requires schema version 1 and task statuses.");
  }
  const statuses: Record<string, BuildTaskStatus> = {};
  for (const [id, status] of Object.entries(value.statuses)) {
    if (!taskIds.has(id)) throw new Error(`Unknown build task: ${id}.`);
    if (typeof status !== "string" || !buildTaskStatuses.includes(status as BuildTaskStatus)) {
      throw new Error(`Invalid progress for ${id}. Use Todo, In progress or Done.`);
    }
    statuses[id] = status as BuildTaskStatus;
  }
  for (const id of taskIds) {
    if (!Object.hasOwn(statuses, id)) throw new Error(`Build board is missing ${id}.`);
  }
  return { schema_version: 1, statuses };
}

/** Record a task status; this is a planning record, never an engineering approval. */
export function updateBuildTaskStatus(
  state: BuildBoardState,
  id: string,
  status: BuildTaskStatus,
): BuildBoardState {
  if (!taskIds.has(id)) throw new Error(`Unknown build task: ${id}.`);
  return parseBuildBoardState({
    ...state,
    statuses: { ...state.statuses, [id]: status },
  });
}
