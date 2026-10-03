import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { mountShowtime } from "./main";

test("importing Showtime is inert and mounting resolves elements only inside its host", () => {
  const selectors: string[] = [];
  const host = {
    querySelector: (selector: string) => {
      selectors.push(selector);
      return null;
    },
  } as unknown as ParentNode;

  expect(() => mountShowtime(host, "/film/film-media/")).toThrow("Missing Showtime element stage");
  expect(selectors).toEqual(["#stage"]);
});

test("the document defaults to full body/moon brightness and randomized motion without camera access", async () => {
  const markup = await readFile(new URL("../../showtime/index.html", import.meta.url), "utf8");
  const controls = new Map<
    string,
    { value: string | null; checked: boolean; pressed: string | null }
  >();
  let manualLabel = "";
  await new HTMLRewriter()
    .on("#movement-control", {
      text(chunk) {
        manualLabel += chunk.text;
      },
    })
    .on("input, button", {
      element(element) {
        const id = element.getAttribute("id");
        if (id)
          controls.set(id, {
            value: element.getAttribute("value"),
            checked: element.hasAttribute("checked"),
            pressed: element.getAttribute("aria-pressed"),
          });
      },
    })
    .transform(new Response(markup))
    .text();
  expect(controls.get("content-both")?.pressed).toBe("true");
  expect(controls.get("movement-random")?.pressed).toBe("true");
  expect(controls.get("movement-control")?.pressed).toBe("false");
  expect(manualLabel).toBe("Controls");
  expect(controls.get("blend")?.value).toBe("1");
  expect(controls.get("brightness")?.value).toBe("1");
  expect(controls.get("fade")?.checked).toBe(false);
  expect(
    ["realistic", "dusk", "day", "inspect", "wireframe"].filter(
      (id) => controls.get(`preset-${id}`)?.pressed === "true",
    ),
  ).toEqual(["realistic"]);
  expect(controls.get("projection-toggle")?.pressed).toBe("true");
  expect(controls.get("time-of-day")?.value).toBe("22");
});

test("native mounts release their resources and remount without duplicate listeners", async () => {
  const fixture = new URL("./main-lifecycle.fixture.ts", import.meta.url);
  const child = Bun.spawn([process.execPath, fixture.pathname], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  if (exitCode !== 0) throw new Error(`${stdout}\n${stderr}`.trim());
  expect(exitCode).toBe(0);
});
