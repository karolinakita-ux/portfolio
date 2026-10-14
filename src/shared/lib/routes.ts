/**
 * Information architecture
 *   Work            /  ─┬─ /work/data-governance  (Data Governance theming case)
 *                       ├─ /work/project-planning
 *                       └─ /work/automotive
 *   About /about · Contact /contact · CV /cv (print-ready, not in the primary nav)
 *
 * Every view has its own path and browser-history entry, so Back / Forward (and
 * swipe-back on phones) move between views. The URL hash is a section anchor
 * (/about#career); it follows the section in view while scrolling.
 * Before 3.0.0 views lived in the hash (/#about): those links still resolve.
 *
 * A one-page build (relative base, `vite build --base ./`, e.g. the claude.ai artifact) has
 * no other paths to load, so there the path travels in the hash: #/about, #/about#career.
 * src/main.tsx switches this on with setHashRouting(true).
 */

let hashRouting = false;

/** Path in the hash (#/about) instead of the URL path. Set once, before the app renders. */
export const setHashRouting = (on: boolean): void => {
  hashRouting = on;
};

/** View ids, used everywhere in code instead of string literals. */
export const VIEW = {
  work: "work",
  about: "about",
  caseTheming: "case-theming",
  caseProjectPlanning: "case-project-planning",
  caseAutomotive: "case-automotive",
  contact: "contact",
  cv: "cv",
} as const;

export type View = (typeof VIEW)[keyof typeof VIEW];

/** Every view, in page order (sitemap, prerendering, audits). */
export const VIEWS: readonly View[] = Object.values(VIEW);

/**
 * URL path of each view. Changing a path breaks shared links: keep the old one
 * working through PATH_ALIASES.
 */
export const VIEW_PATHS = {
  [VIEW.work]: "/",
  [VIEW.about]: "/about",
  [VIEW.contact]: "/contact",
  [VIEW.cv]: "/cv",
  [VIEW.caseTheming]: "/work/data-governance",
  [VIEW.caseProjectPlanning]: "/work/project-planning",
  [VIEW.caseAutomotive]: "/work/automotive",
} as const satisfies Record<View, string>;

/** Section anchors that other views link to (the section's element id). */
export const SECTION = {
  workCases: "enterprise-cases",
} as const;

export interface NavigateOptions {
  /** Glide to the top or the anchor instead of jumping (ignored with prefers-reduced-motion). */
  smooth?: boolean;
}

/** Navigate to a view; `anchor` is a section id to land on instead of the top. */
export type Navigate = (view: View, anchor?: string | null, options?: NavigateOptions) => void;

/** Short names that resolve to a view: as a hash (old links, /#resume) or as a path (/resume). */
const ALIASES: Readonly<Record<string, View>> = {
  "": VIEW.work,
  home: VIEW.work,
  landing: VIEW.work,
  projects: VIEW.work,
  resume: VIEW.cv,
};

export const isView = (value: string): value is View => (VIEWS as readonly string[]).includes(value);

/** Resolves a view id or alias, or null when it names none. */
export const resolveView = (value: string): View | null => {
  if (isView(value)) return value;
  return Object.hasOwn(ALIASES, value) ? (ALIASES[value] ?? null) : null;
};

const trimSlash = (path: string): string => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/** The view at a URL path, or null for an unknown path. */
export const viewForPath = (pathname: string): View | null => {
  const path = trimSlash(pathname).toLowerCase();
  const match = VIEWS.find((view) => VIEW_PATHS[view] === path);
  if (match) return match;
  const segment = path.replace(/^\//, "");
  return segment.includes("/") ? null : resolveView(segment);
};

export interface LocationRoute {
  /** null: the path names no view. */
  view: View | null;
  /** Section id from the hash, or null. */
  anchor: string | null;
}

const decodeHash = (hash: string): string => {
  try {
    return decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return ""; // malformed percent-encoding
  }
};

type PathAndHash = Pick<Location, "pathname" | "hash">;

/** The path and section hash a location stands for; with hash routing both come from the hash. */
const routedLocation = ({ pathname, hash }: PathAndHash): PathAndHash => {
  if (!hashRouting) return { pathname, hash };
  const fragment = hash.replace(/^#/, "");
  if (!fragment.startsWith("/")) return { pathname: "/", hash }; // empty, or an old view hash (#about)
  const split = fragment.indexOf("#");
  return split < 0
    ? { pathname: fragment, hash: "" }
    : { pathname: fragment.slice(0, split), hash: fragment.slice(split) };
};

/** Reads view and anchor from a location; an old view hash on the root (/#about) wins over the path. */
export const readRoute = (location: PathAndHash): LocationRoute => {
  const { pathname, hash } = routedLocation(location);
  const view = viewForPath(pathname);
  const fragment = decodeHash(hash);
  if (view === VIEW.work && fragment) {
    const legacy = resolveView(fragment);
    if (legacy) return { view: legacy, anchor: null };
  }
  return { view, anchor: fragment || null };
};

/** Link target of a view, with an optional section anchor (#/about#career with hash routing). */
export const hrefForView = (view: View, anchor?: string | null): string => {
  const target = VIEW_PATHS[view] + (anchor ? "#" + anchor : "");
  return hashRouting ? "#" + target : target;
};

/** Address-bar URL of a view on the current page; keeps the query string (e.g. ?ref=cv). */
export const urlForView = (
  view: View,
  anchor: string | null,
  { pathname, search }: Pick<Location, "pathname" | "search">,
): string =>
  hashRouting
    ? pathname + search + hrefForView(view, anchor)
    : VIEW_PATHS[view] + search + (anchor ? "#" + anchor : "");

/** The current URL with its section anchor swapped (null drops it). */
export const urlWithAnchor = (
  location: Pick<Location, "pathname" | "search" | "hash">,
  anchor: string | null,
): string => {
  const { pathname, search } = location;
  if (!hashRouting) return pathname + search + (anchor ? "#" + anchor : "");
  return pathname + search + "#" + routedLocation(location).pathname + (anchor ? "#" + anchor : "");
};

/** Case studies live under Work, so the Work pill stays active there. */
export const navSectionFor = (view: View): View => (view.startsWith("case-") ? VIEW.work : view);

export const NAV_ITEMS: ReadonlyArray<{ view: View; label: string }> = [
  { view: VIEW.work, label: "Work" },
  { view: VIEW.about, label: "About" },
  { view: VIEW.contact, label: "Contact" },
];

export const SITE_NAME = "Karolina Kita";

/**
 * Document title per view (shown in the tab and in the history menu).
 * The CV title leads with the name: browsers use the title as the default
 * PDF file name.
 */
const VIEW_TITLES: Readonly<Record<View, string>> = {
  [VIEW.work]: SITE_NAME + " - Senior Product Designer",
  [VIEW.about]: "About - " + SITE_NAME,
  [VIEW.contact]: "Contact - " + SITE_NAME,
  [VIEW.cv]: SITE_NAME + " - CV",
  [VIEW.caseTheming]: "Data Governance Case Study - " + SITE_NAME,
  [VIEW.caseProjectPlanning]: "Project Planning Case Study - " + SITE_NAME,
  [VIEW.caseAutomotive]: "Automotive Ecosystem Case Study - " + SITE_NAME,
};

export const titleForView = (view: View): string => VIEW_TITLES[view];
