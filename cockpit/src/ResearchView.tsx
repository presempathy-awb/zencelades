import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Search } from "lucide-react";
import { type JSX, useMemo, useState } from "react";
import { optionContext } from "./option-context";
import ResourceLedger from "./ResourceLedger";
import type { Scenario } from "./scenario";
import { Button } from "./ui";

interface Entry {
  id: string;
  title: string;
  detail: string;
  href: string;
  meta: string;
}
async function loadEntries(kind: string, signal: AbortSignal): Promise<Entry[]> {
  const response = await fetch(`/studio-data/${kind}.json`, { signal });
  if (!response.ok) throw new Error(`Source data returned ${response.status}`);
  const data: unknown = await response.json();
  if (!data || typeof data !== "object") throw new Error("Invalid source data");
  const value = data as Record<string, unknown>;
  const isCatalog = kind === "catalog" || kind === "v4-catalog";
  const rows = isCatalog ? value.files : value.sources;
  if (!Array.isArray(rows)) throw new Error("Missing source list");
  return rows.map((row: unknown) => {
    if (!row || typeof row !== "object") throw new Error("Invalid source entry");
    const item = row as Record<string, unknown>;
    if (isCatalog) {
      if (
        typeof item.path !== "string" ||
        !/^(source\/uploads|source\/versions\/v4-fixed15|deliveries)\//.test(item.path) ||
        item.path.split("/").includes("..") ||
        typeof item.bytes !== "number"
      )
        throw new Error("Invalid catalog path");
      return {
        id: item.path,
        title: item.path.split("/").at(-1) ?? item.path,
        detail: String(item.role ?? item.path),
        href: `/downloads/${item.path.split("/").map(encodeURIComponent).join("/")}`,
        meta: `${String(item.category)} · ${new Intl.NumberFormat("en-US").format(item.bytes)} bytes`,
      };
    }
    if (
      typeof item.url !== "string" ||
      typeof item.id !== "string" ||
      !/^https?:\/\//.test(item.url) ||
      typeof item.title !== "string"
    )
      throw new Error("Invalid source URL");
    return {
      id: item.id,
      title: item.title,
      href: item.url,
      detail: String(item.evidence ?? item.note ?? ""),
      meta: String(item.publisher ?? item.kind ?? "Primary source"),
    };
  });
}
export default function ResearchView({
  scenario,
  onModelSelect,
}: {
  scenario: Scenario;
  onModelSelect: (id: string) => void;
}): JSX.Element {
  const [kind, setKind] = useState("seed");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(24);
  const [relatedOnly, setRelatedOnly] = useState(true);
  const context = useMemo(() => optionContext(scenario), [scenario]);
  const isArchive = kind === "catalog" || kind === "v4-catalog";
  const relevance = useMemo(
    () =>
      new Map(
        (kind === "seed" ? context.seed : kind === "grants" ? context.grants : context.mounts).map(
          (entry) => [entry.id, entry.why],
        ),
      ),
    [context, kind],
  );
  const query = useQuery({
    queryKey: ["studio-sources", kind],
    queryFn: ({ signal }) => loadEntries(kind, signal),
    staleTime: Infinity,
    retry: 1,
  });
  const filtered = useMemo(
    () =>
      query.data?.filter(
        (item) =>
          (isArchive || !relatedOnly || relevance.has(item.id)) &&
          `${item.title} ${item.detail} ${item.meta}`.toLowerCase().includes(search.toLowerCase()),
      ) ?? [],
    [query.data, isArchive, relatedOnly, relevance, search],
  );
  return (
    <section className="reading-panel">
      <ResourceLedger scenario={scenario} context={context} onModelSelect={onModelSelect} />
      <h2>Sources for {context.label}</h2>
      <p>
        Grant guides, mount research, 132 original records and 84 v4 Fixed15 records. Each version
        keeps its source and storage history. Grant and mount sources default to this option; the
        full source collection remains available. Relevance is a project assessment, not a source
        endorsement or physical/event approval.
      </p>
      <div className="library-controls">
        <label>
          Collection
          <select
            value={kind}
            onChange={(event) => {
              setKind(event.target.value);
              setLimit(24);
            }}
          >
            <option value="seed">Occupied seed concepts & support evidence</option>
            <option value="grants">Grant guides & art precedents</option>
            <option value="mounts">Mounts & rigging</option>
            <option value="catalog">Original v3 assets · 132 records</option>
            <option value="v4-catalog">v4 Fixed15 assets · 84 records</option>
          </select>
        </label>
        <label>
          Source scope
          <select
            value={isArchive ? "all" : relatedOnly ? "related" : "all"}
            disabled={isArchive}
            onChange={(event) => {
              setRelatedOnly(event.target.value === "related");
              setLimit(24);
            }}
          >
            <option value="related">Related to {context.label}</option>
            <option value="all">All sources in this collection</option>
          </select>
        </label>
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search library</span>
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setLimit(24);
            }}
            placeholder="Search this collection"
          />
        </label>
      </div>
      {isArchive && (
        <p>
          Archive collections retain every original file. They are historical references and do not
          describe the selected option’s current scope or budget.
        </p>
      )}
      {kind === "v4-catalog" && (
        <p>
          Fixed 15 ft receiver-to-suspension reach, with four cameras retained in the supplied
          design. The new structure and occupied version remain unpriced. The cockpit estimates
          describe separate support alternatives.{" "}
          <a href="/documents/v4-fixed15-understanding.md">Read the v4 comparison</a>.
        </p>
      )}
      {query.isPending && <p role="status">Loading the source register…</p>}
      {query.isError && (
        <div role="alert">
          <p>{query.error.message}</p>
          <Button onClick={() => void query.refetch()}>Retry</Button>
        </div>
      )}
      {!query.isPending && !query.isError && (
        <p className="muted">
          {filtered.length} entries ·{" "}
          {isArchive
            ? "complete archive"
            : relatedOnly
              ? `related to ${context.label}`
              : "all sources"}{" "}
          · source register checked September 30, 2026
        </p>
      )}
      <ul className="source-list">
        {filtered.slice(0, limit).map((item) => (
          <li key={`${item.href}-${item.title}`}>
            <span className="eyebrow">{item.meta}</span>
            <a href={item.href} target="_blank" rel="noreferrer">
              {item.title}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <p>{item.detail}</p>
            {!isArchive && relevance.has(item.id) && (
              <p>
                <strong>Why it relates:</strong> {relevance.get(item.id)}
              </p>
            )}
          </li>
        ))}
      </ul>
      {filtered.length === 0 && query.isSuccess && <p>No sources match this search.</p>}
      {filtered.length > limit && (
        <Button variant="outline" onClick={() => setLimit(limit + 24)}>
          Show more sources
        </Button>
      )}
      <div className="library-links">
        <a href="/mounts/">Full mount study</a>
        <a href="/grants/">Grant workshop</a>
        <a href="/catalog/">Original catalog</a>
        <a href="/downloads/deliveries/enceladus_v4_fixed15/docs/Fixed15_Design_Review.pdf">
          v4 design review
        </a>
        <a href="/naming/">Naming workbench</a>
      </div>
    </section>
  );
}
