export const viewGroups = [
  {
    title: "Experience",
    views: [
      ["/", "Overview"],
      ["/media", "Media & renders"],
      ["/showtime", "Showtime"],
      ["/audio", "Music & sound prompts"],
    ],
  },
  {
    title: "Design",
    views: [
      ["/model", "3D model"],
      ["/supports", "Design options"],
      ["/alternates", "Alternate designs"],
      ["/mounts", "Mount studies"],
      ["/naming", "Naming workbench"],
      ["/name-concepts", "Name concepts"],
    ],
  },
  {
    title: "Build",
    views: [
      ["/budget", "Budget"],
      ["/parts", "Parts & inventory"],
      ["/tasks", "Build board"],
      ["/workflow", "Workflow"],
      ["/settings", "Scenario settings"],
      ["/pricing", "Alternate pricing"],
    ],
  },
  {
    title: "Resources",
    views: [
      ["/application", "Grant application"],
      ["/research", "Grants & resources"],
      ["/grants", "Grant workshop"],
      ["/catalog", "Asset catalog"],
      ["/open-source", "Open source & AI"],
    ],
  },
];

/** Fit whole work panes while retaining the user's preferred column count. */
export function fitColumns(preferred: number, width: number): number {
  return Math.max(1, Math.min(preferred, Math.floor(width / 480)));
}

/** Swap an already open view instead of duplicating its controls or draft. */
export function selectColumn(pages: string[], index: number, next: string): string[] {
  if (!viewGroups.some((group) => group.views.some(([path]) => path === next))) return pages;
  const updated = [...pages];
  const other = pages.indexOf(next);
  if (other !== -1) updated[other] = pages[index];
  updated[index] = next;
  return updated;
}
