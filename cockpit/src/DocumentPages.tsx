import { type JSX, useEffect, useRef, useState } from "react";
import { cockpitHref, documentPages } from "./page-routes";
import "./documents.css";

/** Preserve complete published pages and their controls inside the shared shell. */
export default function DocumentPages({ path }: { path: string }): JSX.Element {
  const [visited, setVisited] = useState<string[]>([]);
  useEffect(() => {
    if (documentPages.some(([id]) => path === `/${id}`)) {
      setVisited((pages) => (pages.includes(path) ? pages : [...pages, path]));
    }
  }, [path]);
  return (
    <>
      {visited.map((page) => (
        <DocumentPage key={page} page={page.slice(1)} active={path === page} />
      ))}
    </>
  );
}

function DocumentPage({ page, active }: { page: string; active: boolean }): JSX.Element {
  const host = useRef<HTMLDivElement>(null);
  const [failure, setFailure] = useState("");
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    const abort = new AbortController();
    const root = element.shadowRoot ?? element.attachShadow({ mode: "open" });
    root.replaceChildren();
    setFailure("");
    setReady(false);
    const load = async (): Promise<void> => {
      const response = await fetch(`/page-content/${page}.html`, { signal: abort.signal });
      if (!response.ok) throw new Error(`Page content unavailable (${response.status})`);
      const html = new DOMParser().parseFromString(await response.text(), "text/html");
      if (disposed) return;
      const main = html.querySelector("main");
      if (!main) throw new Error("This page has no published content");
      const base = `/${page}/`;
      for (const link of html.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')) {
        const copy = document.createElement("link");
        copy.rel = "stylesheet";
        copy.href = new URL(link.getAttribute("href") ?? "", new URL(base, location.origin)).href;
        root.append(copy);
      }
      const shell = document.createElement("link");
      shell.rel = "stylesheet";
      shell.href = "/page-content/shell.css";
      root.append(shell);
      const body = document.createElement("div");
      body.className = `legacy-main ${html.body.className}`;
      body.id = main.id;
      body.innerHTML = main.innerHTML;
      const extras = [...html.body.children].filter(
        (node) => node !== main && !node.matches("header, footer, script, .skip"),
      );
      body.prepend(...extras);
      const footer = html.querySelector("body > footer");
      if (footer) body.append(footer);
      for (const asset of body.querySelectorAll<HTMLElement>("[src], [poster]")) {
        for (const attribute of ["src", "poster"]) {
          const value = asset.getAttribute(attribute);
          if (value)
            asset.setAttribute(attribute, new URL(value, new URL(base, location.origin)).href);
        }
      }
      for (const link of body.querySelectorAll<HTMLAnchorElement>("a[href]")) {
        link.setAttribute("href", cockpitHref(link.getAttribute("href") ?? "", base));
      }
      // Published project markup only. Script activation is an explicit list below.
      body.querySelectorAll("script").forEach((script) => script.remove());
      body.addEventListener("click", (event) => {
        const link = event.target instanceof Element ? event.target.closest("a") : null;
        const href = link?.getAttribute("href");
        if (!href?.startsWith("#") || href.startsWith("#/")) return;
        const target = root.getElementById(decodeURIComponent(href.slice(1)));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "instant" });
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      });
      root.append(body);
      if (page === "naming") {
        const [roll, editor, ranking] = await Promise.all([
          import("../../site/naming/roll.js"),
          import("../../site/naming/editor.mjs"),
          import("../../site/naming/ranking.mjs"),
        ]);
        if (disposed) return;
        await Promise.all([
          roll.initRoll(root),
          editor.initEditor(root),
          ranking.initRanking(root),
        ]);
      } else if (page === "pricing") {
        const { initPricing } = await import("../../site/pricing/pricing.mjs");
        if (disposed) return;
        await initPricing(root);
      } else if (page === "catalog") {
        const { initCatalog } = await import("../../site/catalog.js");
        if (disposed) return;
        await initCatalog(root);
      }
      if (!disposed) setReady(true);
    };
    void load().catch((error: unknown) => {
      if (!disposed) setFailure(error instanceof Error ? error.message : "Page could not load");
    });
    return () => {
      disposed = true;
      abort.abort();
    };
  }, [page, attempt]);
  useEffect(() => {
    if (!active || !ready) return;
    const scroll = (): void => {
      const section = new URLSearchParams(location.hash.split("?")[1]).get("section");
      if (section)
        host.current?.shadowRoot?.getElementById(section)?.scrollIntoView({ behavior: "instant" });
    };
    scroll();
    window.addEventListener("hashchange", scroll);
    return () => window.removeEventListener("hashchange", scroll);
  }, [active, ready]);
  return (
    <section
      hidden={!active}
      className="document-page"
      aria-label={documentPages.find(([id]) => id === page)?.[1]}
    >
      {failure ? (
        <div role="alert">
          <p>{failure}</p>
          <button type="button" onClick={() => setAttempt(attempt + 1)}>
            Retry page
          </button>
        </div>
      ) : (
        !ready && <p role="status">Loading the complete page…</p>
      )}
      <div className="document-host" ref={host} />
    </section>
  );
}
