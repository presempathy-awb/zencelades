import { type JSX, type ReactNode, useEffect, useRef } from "react";
import { mountTopics } from "./pane-topics";

/** Keep navigation fixed while long section details remain independently readable. */
export default function TopicPane({
  children,
  sections = true,
}: {
  children: ReactNode;
  sections?: boolean;
}): JSX.Element {
  const host = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = host.current,
      toolbar = bar.current;
    if (!node || !toolbar || !sections) return;
    let cleanup: (() => void) | undefined;
    let previous: Element | null = null;
    const refresh = (): void => {
      const content = node.querySelector<HTMLElement>(".artwork-content") ?? node.firstElementChild;
      if (content === previous || !(content instanceof HTMLElement)) return;
      cleanup?.();
      previous = content;
      cleanup = mountTopics(content, toolbar);
    };
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(node, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cleanup?.();
    };
  }, [sections]);
  return (
    <div className={`topic-pane ${sections ? "" : "native-pane"}`}>
      <nav hidden={!sections} ref={bar} className="pane-topic-bar" aria-label="Page sections" />
      <div ref={host} className="pane-reading-area" tabIndex={0} aria-label="Section content">
        {children}
      </div>
    </div>
  );
}
