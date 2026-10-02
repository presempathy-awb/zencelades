import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import ViewSelector from "./ViewSelector";

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
});
