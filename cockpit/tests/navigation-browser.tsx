import { createRoot } from "react-dom/client";
import { mountTopics } from "../src/pane-topics";
import TopicPane from "../src/TopicPane";
import "../src/viewport.css";
import "./navigation-browser.css";

const fixture = document.getElementById("fixture")!;
const results = document.getElementById("results")!;
document.getElementById("run")!.onclick = async () => {
  const checks: string[] = [];
  const check = (name: string, ok: boolean) => checks.push(`${ok ? "PASS" : "FAIL"}: ${name}`);
  fixture.replaceChildren();
  const reader = document.createElement("div");
  reader.className = "pane-reading-area test-reader";
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  const content = document.createElement("main");
  content.innerHTML =
    '<p><a href="#deep">Jump deep</a></p><h2>Early heading</h2><section><h2>Details</h2><p class="gap">Long content</p><h3 id="deep">Deep target</h3></section>';
  const styles = document.createElement("link");
  styles.rel = "stylesheet";
  styles.href = "navigation-browser.css";
  shadow.append(styles, content);
  reader.append(host);
  const bar = document.createElement("nav");
  fixture.append(bar, reader);
  await new Promise<void>((resolve, reject) => {
    styles.onload = () => resolve();
    styles.onerror = () => reject(new Error("Fixture stylesheet unavailable"));
  });
  const cleanup = mountTopics(content, bar);
  check(
    "early heading remains a named section",
    [...bar.querySelectorAll("button")].some((b) => b.textContent === "Early heading"),
  );
  content.querySelector<HTMLAnchorElement>("a")!.click();
  const target = content.querySelector<HTMLElement>("#deep")!;
  const rect = target.getBoundingClientRect(),
    bounds = reader.getBoundingClientRect();
  check(
    "deep anchor is visible across shadow boundary",
    rect.top >= bounds.top && rect.bottom <= bounds.bottom,
  );
  check("deep anchor takes focus", shadow.activeElement === target);
  check("outer page stays fixed", document.documentElement.scrollTop === 0);
  cleanup();
  fixture.replaceChildren();
  const root = createRoot(fixture);
  root.render(
    <TopicPane sections={false}>
      <form>
        <h2>First</h2>
        <input required aria-label="First field" />
        <div className="test-gap" />
        <h2>Second</h2>
        <input required aria-label="Second field" />
      </form>
    </TopicPane>,
  );
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
  const pane = fixture.querySelector<HTMLElement>(".pane-reading-area")!;
  const fields = [...fixture.querySelectorAll("input")];
  check(
    "both settings controls remain in the same form",
    fields.length === 2 && fields.every((field) => !field.closest("[hidden]")),
  );
  check("native reader allows scrolling to controls", getComputedStyle(pane).overflowY === "auto");
  fields[1].scrollIntoView({ block: "nearest" });
  check(
    "last control reachable without outer scroll",
    fields[1].getBoundingClientRect().bottom <= pane.getBoundingClientRect().bottom &&
      document.documentElement.scrollTop === 0,
  );
  results.textContent = checks.join("\n");
  root.unmount();
};
