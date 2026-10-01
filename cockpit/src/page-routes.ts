export const documentPages = [
  ["application", "Grant application"],
  ["mounts", "Mount studies"],
  ["grants", "Grant workshop"],
  ["pricing", "Pricing studies"],
  ["catalog", "Asset catalog"],
  ["naming", "Naming workbench"],
  ["name-concepts", "Name concepts"],
  ["open-source", "Open source & AI"],
] as const;

const pageRoutes: Record<string, string> = {
  "/": "/",
  "/about/": "/",
  "/studio/": "/model",
  "/models/": "/media",
  "/showtime/": "/showtime",
  ...Object.fromEntries(documentPages.map(([path]) => [`/${path}/`, `/${path}`])),
};

/** Resolve public page links without changing external or download destinations. */
export function cockpitHref(href: string, base: string): string {
  if (href.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//"))
    return href;
  const url = new URL(href, `https://zenceladus.com${base}`);
  const route = pageRoutes[url.pathname.replace(/index\.html$/, "").replace(/\/?$/, "/")];
  if (route !== undefined)
    return `/#${route}${url.hash ? `?section=${encodeURIComponent(url.hash.slice(1))}` : ""}`;
  return `${url.pathname}${url.search}${url.hash}`;
}
