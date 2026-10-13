/**
 * Information architecture
 *   Work            /  ─┬─ /work/data-governance  (Data Governance theming case)
 *                       ├─ /work/meetestim
 *                       └─ /work/automotive
 *   About /about · Contact /contact · CV /cv (print-ready, not in the primary nav)
 *
 * Every view has its own path and browser-history entry, so Back / Forward (and
 * swipe-back on phones) move between views. The URL hash is a section anchor
 * (/about#career); it follows the section in view while scrolling.
 * Before 3.0.0 views lived in the hash (/#about): those links still resolve.
 */

/** View ids, used everywhere in code instead of string literals. */
export const VIEW = {
  work: "work",
  about: "about",
  caseTheming: "case-theming",
  caseMeetestim: "case-meetestim",
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
  [VIEW.caseMeetestim]: "/work/meetestim",
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

/** Reads view and anchor from a location; an old view hash on the root (/#about) wins over the path. */
export const readRoute = ({ pathname, hash }: Pick<Location, "pathname" | "hash">): LocationRoute => {
  const view = viewForPath(pathname);
  const fragment = decodeHash(hash);
  if (view === VIEW.work && fragment) {
    const legacy = resolveView(fragment);
    if (legacy) return { view: legacy, anchor: null };
  }
  return { view, anchor: fragment || null };
};

/** Link target of a view, with an optional section anchor. */
export const hrefForView = (view: View, anchor?: string | null): string =>
  VIEW_PATHS[view] + (anchor ? "#" + anchor : "");

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
  [VIEW.caseMeetestim]: "MeetEstim Case Study - " + SITE_NAME,
  [VIEW.caseAutomotive]: "Automotive Ecosystem Case Study - " + SITE_NAME,
};

export const titleForView = (view: View): string => VIEW_TITLES[view];
