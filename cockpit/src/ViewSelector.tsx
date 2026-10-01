import type { JSX } from "react";
import { viewGroups } from "./cockpit-layout";

/** Drill from a subject to its views without a long navigation strip. */
export default function ViewSelector({
  path,
  column,
  onSelect,
}: {
  path: string;
  column: number;
  onSelect: (path: string) => void;
}): JSX.Element {
  const group =
    viewGroups.find((item) => item.views.some(([route]) => route === path)) ?? viewGroups[0];
  return (
    <div className="view-selector">
      <span className="column-number" aria-hidden="true">
        {column}
      </span>
      <label>
        <span className="sr-only">Column {column} section</span>
        <select
          value={group.title}
          onChange={(event) => {
            const next = viewGroups.find((item) => item.title === event.target.value);
            if (next) onSelect(next.views[0][0]);
          }}
        >
          {viewGroups.map((item) => (
            <option key={item.title}>{item.title}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Column {column} view</span>
        <select value={path} onChange={(event) => onSelect(event.target.value)}>
          {group.views.map(([route, title]) => (
            <option key={route} value={route}>
              {title}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
