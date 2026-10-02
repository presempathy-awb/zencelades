import type { JSX } from "react";
import { viewGroups } from "./cockpit-layout";
import ChoiceButtons from "./ChoiceButtons";

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
      <ChoiceButtons
        label={`Column ${column} section`}
        value={group.title}
        options={viewGroups.map((item) => [item.title, item.title])}
        onChange={(value) => {
          const next = viewGroups.find((item) => item.title === value);
          if (next) onSelect(next.views[0][0]);
        }}
      />
      <ChoiceButtons
        label={`Column ${column} view`}
        value={path}
        options={group.views.map(([route, title]) => [route, title])}
        onChange={onSelect}
      />
    </div>
  );
}
