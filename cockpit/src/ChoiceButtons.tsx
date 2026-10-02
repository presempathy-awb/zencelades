import type { JSX } from "react";
import "./choices.css";

/** Visible, keyboard-operable choices with the selected value announced. */
export default function ChoiceButtons<T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<readonly [T, string]>;
  onChange: (value: T) => void;
  disabled?: boolean;
}): JSX.Element {
  return (
    <fieldset className="choice-control" disabled={disabled}>
      <legend>{label}</legend>
      <div className="choice-buttons">
        {options.map(([id, title]) => (
          <button key={id} type="button" aria-pressed={id === value} onClick={() => onChange(id)}>
            {title}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
