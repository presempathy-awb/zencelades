export interface TopicRange {
  title: string;
  start: number;
  end: number;
}

/** Decode either a cockpit section query or a native fragment. */
export function sectionId(hash: string): string | null {
  if (hash.startsWith("#/")) return new URLSearchParams(hash.split("?")[1]).get("section");
  if (!hash.startsWith("#") || hash.length === 1) return null;
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
}

/** Native scrolling crosses shadow roots and keeps the target in its nearest panel. */
export function focusSection(target: HTMLElement | null): void {
  if (!target) return;
  if (target.tabIndex < 0) target.tabIndex = -1;
  target.scrollIntoView({ block: "nearest", inline: "nearest" });
  target.focus({ preventScroll: true });
}

/** Partition existing content at headings without dropping an introduction or tail. */
export function topicRanges(titles: string[]): TopicRange[] {
  const ranges: TopicRange[] = [];
  titles.forEach((title, i) => {
    if (i === 0 || title) {
      if (ranges.length) ranges[ranges.length - 1].end = i;
      ranges.push({ title: title || "Overview", start: i, end: titles.length });
    }
  });
  return ranges;
}

/** Add a section selector to trusted published markup, preserving its live controls. */
export function mountTopics(content: HTMLElement, bar: HTMLElement): () => void {
  const nodes = [...content.children].filter(
    (node): node is HTMLElement =>
      node instanceof HTMLElement && !node.matches("style, script, link"),
  );
  const titles = nodes.map((node) => {
    if (node.matches("h2,h3")) return node.textContent?.trim() ?? "";
    if (node.matches("section,header,footer,.media-gallery,.showtime-bar"))
      return (
        node.querySelector("h1,h2,h3")?.textContent?.trim() ||
        node.getAttribute("aria-label") ||
        (node.tagName === "FOOTER" ? "Sources & downloads" : "")
      );
    return "";
  });
  const topics = topicRanges(titles);
  const previous = nodes.map((node) => node.hidden);
  bar.replaceChildren();
  const drilldown = document.createElement("details");
  drilldown.className = "choice-drilldown";
  const summary = document.createElement("summary");
  const choices = document.createElement("div");
  choices.className = "choice-buttons";
  choices.setAttribute("role", "group");
  choices.setAttribute("aria-label", "Page section");
  let selected = 0;
  const buttons = topics.map((topic, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = topic.title;
    button.onclick = () => show(index);
    return button;
  });
  choices.append(...buttons);
  drilldown.append(summary, choices);
  const count = document.createElement("span");
  count.className = "topic-count";
  const show = (index: number): void => {
    const topic = topics[index];
    if (!topic) return;
    nodes.forEach((node, i) => {
      node.hidden = previous[i] || i < topic.start || i >= topic.end;
    });
    selected = index;
    summary.textContent = `Section: ${topic.title}`;
    buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
    count.textContent = `${index + 1} / ${topics.length}`;
    const root = content.getRootNode();
    const reader =
      content.closest(".pane-reading-area") ??
      (root instanceof ShadowRoot ? root.host.closest(".pane-reading-area") : null);
    reader?.scrollTo(0, 0);
  };
  const controls = (
    [
      [-1, "Previous section"],
      [1, "Next section"],
    ] as const
  ).map(([delta, name]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = delta < 0 ? "←" : "→";
    button.setAttribute("aria-label", name);
    button.onclick = () => show((selected + delta + topics.length) % topics.length);
    return button;
  });
  bar.append(...controls, count, drilldown);
  const reveal = (event?: Event): void => {
    if (
      event instanceof MouseEvent &&
      (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
    )
      return;
    const link = event?.target instanceof Element ? event.target.closest("a[href]") : null;
    const href = link?.getAttribute("href");
    const id = event
      ? href?.startsWith("#") && !href.startsWith("#/")
        ? sectionId(href)
        : null
      : sectionId(location.hash);
    if (!id) return;
    const target = content.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    const index = topics.findIndex((topic) =>
      nodes
        .slice(topic.start, topic.end)
        .some((node) => node === target || (target && node.contains(target))),
    );
    if (index >= 0) {
      event?.preventDefault();
      show(index);
      focusSection(target);
    }
  };
  content.addEventListener("click", reveal, true);
  const onHashChange = (): void => reveal();
  window.addEventListener("hashchange", onHashChange);
  show(0);
  reveal();
  return () => {
    nodes.forEach((node, i) => {
      node.hidden = previous[i];
    });
    content.removeEventListener("click", reveal, true);
    window.removeEventListener("hashchange", onHashChange);
    bar.replaceChildren();
  };
}
