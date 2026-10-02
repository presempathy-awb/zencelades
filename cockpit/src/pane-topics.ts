export interface TopicRange {
  title: string;
  start: number;
  end: number;
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
  const titles = nodes.map((node, index) => {
    if (node.matches("h2,h3")) return index <= 1 ? "" : (node.textContent?.trim() ?? "");
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
  const label = document.createElement("label");
  label.textContent = "Section";
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Page section");
  for (const [i, topic] of topics.entries()) select.add(new Option(topic.title, String(i)));
  label.append(select);
  const count = document.createElement("span");
  count.className = "topic-count";
  const show = (index: number): void => {
    const topic = topics[index];
    if (!topic) return;
    nodes.forEach((node, i) => {
      node.hidden = previous[i] || i < topic.start || i >= topic.end;
    });
    select.value = String(index);
    count.textContent = `${index + 1} / ${topics.length}`;
    content.closest(".pane-reading-area")?.scrollTo(0, 0);
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
    button.onclick = () => show((Number(select.value) + delta + topics.length) % topics.length);
    return button;
  });
  select.onchange = () => show(Number(select.value));
  bar.append(label, ...controls, count);
  const reveal = (event?: Event): void => {
    const link = event?.target instanceof Element ? event.target.closest("a[href]") : null;
    const href = link?.getAttribute("href");
    const id =
      href?.startsWith("#") && !href.startsWith("#/")
        ? href.slice(1)
        : !event
          ? new URLSearchParams(location.hash.split("?")[1]).get("section")
          : null;
    if (!id) return;
    let decoded = id;
    try {
      if (href) decoded = decodeURIComponent(id);
    } catch {
      return;
    }
    const target = content.querySelector(`#${CSS.escape(decoded)}`);
    const index = topics.findIndex((topic) =>
      nodes
        .slice(topic.start, topic.end)
        .some((node) => node === target || (target && node.contains(target))),
    );
    if (index >= 0) {
      event?.preventDefault();
      show(index);
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
