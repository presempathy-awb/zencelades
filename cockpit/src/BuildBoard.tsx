import { memo, useCallback, useLayoutEffect, useMemo, useRef, type JSX } from "react";
import {
  buildPartCount,
  buildTasks,
  buildTaskStatusLabels,
  buildTaskStatuses,
  updateBuildTaskStatus,
  type BuildBoardState,
  type BuildTask,
  type BuildTaskStatus,
} from "./build-board";
import "./build-board.css";
import ChoiceButtons from "./ChoiceButtons";

export interface BuildBoardProps {
  state: BuildBoardState;
  onChange: (state: BuildBoardState) => void;
}

const tasksById = new Map(buildTasks.map((task) => [task.id, task]));

const TaskCard = memo(function TaskCard({
  task,
  status,
  prerequisites,
  onStatusChange,
}: {
  task: BuildTask;
  status: BuildTaskStatus;
  prerequisites: string;
  onStatusChange: (id: string, status: BuildTaskStatus) => void;
}): JSX.Element {
  return (
    <li className="build-task">
      <span className="build-task-id">{task.id}</span>
      <h4>{task.title}</h4>
      <p>
        <strong>Responsible role:</strong> {task.role}
      </p>
      <div
        className="build-task-status"
        id={`progress-${task.id}`}
        tabIndex={-1}
        aria-describedby="build-board-progress-help"
      >
        <ChoiceButtons
          label="Progress"
          describedBy="build-board-progress-help"
          value={status}
          options={buildTaskStatuses.map((option) => [option, buildTaskStatusLabels[option]])}
          onChange={(value) => onStatusChange(task.id, value)}
        />
      </div>
      <p className="build-task-prerequisites">
        <strong>Prerequisites:</strong> {prerequisites}
      </p>
      <details>
        <summary>What counts as done</summary>
        <p>{task.done}</p>
      </details>
    </li>
  );
});

/** Display actual build tasks with controlled progress and no browser persistence. */
export function BuildBoard({ state, onChange }: BuildBoardProps): JSX.Element {
  const movedTask = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (!movedTask.current) return;
    document.getElementById(`progress-${movedTask.current}`)?.focus();
    movedTask.current = null;
  }, [state.statuses]);
  const columns = useMemo(
    () =>
      buildTaskStatuses.map((status) => ({
        status,
        tasks: buildTasks.filter((task) => state.statuses[task.id] === status),
      })),
    [state.statuses],
  );
  const handleStatusChange = useCallback(
    (id: string, status: BuildTaskStatus): void => {
      movedTask.current = id;
      onChange(updateBuildTaskStatus(state, id, status));
    },
    [state, onChange],
  );

  return (
    <section className="build-board" aria-labelledby="build-board-title">
      <header className="build-board-heading">
        <h2 id="build-board-title">Build board</h2>
        <p>
          {buildTasks.length} build tasks · {buildPartCount} catalogued parts and alternatives
        </p>
        <p id="build-board-progress-help">
          Track the work, dependencies and completion evidence. Changing a card is a planning
          record; it does not approve purchases, fabrication, lifting or occupied tests. Conditional
          aerial, camera and haze steps remain visible until their stated criteria are met or the
          option is documented as omitted.
        </p>
      </header>
      <p className="build-board-summary" role="status" aria-live="polite">
        {columns
          .map(({ status, tasks }) => `${buildTaskStatusLabels[status]}: ${tasks.length}`)
          .join(" · ")}
      </p>
      <div className="build-board-columns">
        {columns.map(({ status, tasks }) => (
          <section key={status} className="build-board-column" aria-labelledby={`column-${status}`}>
            <h3 id={`column-${status}`}>
              {buildTaskStatusLabels[status]} <span>({tasks.length})</span>
            </h3>
            {tasks.length === 0 ? (
              <p className="build-board-empty">No tasks here yet.</p>
            ) : (
              <ul>
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    status={status}
                    prerequisites={
                      task.depends.length === 0
                        ? "None"
                        : task.depends
                            .map(
                              (id) =>
                                `${id}: ${tasksById.get(id)?.title ?? id} (${buildTaskStatusLabels[state.statuses[id]]})`,
                            )
                            .join("; ")
                    }
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
