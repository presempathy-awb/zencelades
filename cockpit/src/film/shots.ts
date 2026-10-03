import type { TransitionKind } from "./transitions";
export interface FilmInsert {
  start: number;
  end: number;
  src: string;
  sourceId: string;
  collection: "enceladus-videos" | "enceladus-extra";
  label: string;
  transition: TransitionKind;
}
export const FILM_INSERTS: FilmInsert[] = [
  {
    start: 6,
    end: 9,
    src: "surprising-enceladus.mp4",
    sourceId: "E13",
    collection: "enceladus-extra",
    label: "NASA / Goddard Space Flight Center · ocean-world presentation",
    transition: "shards",
  },
  {
    start: 11,
    end: 17,
    src: "surface-to-space.mp4",
    sourceId: "E02",
    collection: "enceladus-videos",
    label: "NASA / Goddard Conceptual Image Lab · artist visualization",
    transition: "ring",
  },
  {
    start: 18,
    end: 21,
    src: "ice-layer-pan.mp4",
    sourceId: "E03",
    collection: "enceladus-videos",
    label: "NASA / Goddard Conceptual Image Lab · imagined ice layers",
    transition: "fracture",
  },
  {
    start: 29,
    end: 34,
    src: "geyser-flythrough.mp4",
    sourceId: "E01",
    collection: "enceladus-videos",
    label: "NASA / Goddard Conceptual Image Lab · artist visualization",
    transition: "plume",
  },
  {
    start: 42,
    end: 46,
    src: "ocean-vents.mp4",
    sourceId: "E04",
    collection: "enceladus-videos",
    label: "NASA / Goddard Conceptual Image Lab · imagined ocean vents",
    transition: "dive",
  },
  {
    start: 48,
    end: 51,
    src: "cassini-plume-2005.mp4",
    sourceId: "E08",
    collection: "enceladus-videos",
    label: "Cassini observations · NASA / JPL-Caltech / SSI",
    transition: "shards",
  },
  {
    start: 52,
    end: 56,
    src: "webb-plume-torus.mp4",
    sourceId: "E11",
    collection: "enceladus-videos",
    label: "NASA / ESA / CSA · Leah Hustak (STScI) · artist visualization",
    transition: "ring",
  },
];
