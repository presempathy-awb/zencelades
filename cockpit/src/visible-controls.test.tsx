import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import ViewSelector from "./ViewSelector";
import ChoiceButtons from "./ChoiceButtons";

test("choice controls expose their progress constraint to assistive technology", () => {
  const html = renderToStaticMarkup(
    <ChoiceButtons
      label="Progress"
      value="todo"
      options={[["todo", "To do"]]}
      onChange={() => {}}
      describedBy="progress-help"
    />,
  );
  expect(html).toMatch(/<fieldset[^>]*aria-describedby="progress-help"/);
  expect(html).toMatch(/<button[^>]*aria-describedby="progress-help"/);
});

test("main cockpit sections and current views are directly operable buttons", () => {
  const html = renderToStaticMarkup(<ViewSelector path="/model" column={1} onSelect={() => {}} />);
  for (const label of [
    "Experience",
    "Design",
    "Build",
    "Resources",
    "3D model",
    "Design options",
    "Alternate designs",
    "Mount studies",
    "Naming workbench",
    "Name concepts",
  ]) {
    expect(html).toMatch(new RegExp(`<button[^>]*>${label}</button>`));
  }
  expect(html).toMatch(/<button[^>]*aria-pressed="true"[^>]*>3D model<\/button>/);
  expect(html).not.toContain("<select");
  const buttons = html.match(/<button\b[^>]*>/g) ?? [];
  expect(buttons.length).toBeGreaterThan(0);
  for (const button of buttons) {
    expect(button).not.toMatch(/\s(?:disabled|hidden)(?:\s|=|>)/);
    expect(button).not.toMatch(/aria-disabled="true"/);
  }
});
