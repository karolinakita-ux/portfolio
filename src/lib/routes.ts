/**
 * Information architecture
 *   Work (default, "/") ─┬─ #case-theming     (Data Governance)
 *                        ├─ #case-project-planning   (Project Planning)
 *                        └─ #case-automotive  (Automotive Ecosystem)
 *   #about · #contact · #cv (print-ready CV, not in the primary nav)
 *
 * Every view has its own browser-history entry, so Back / Forward (and the
 * swipe-back gesture on phones) move between views instead of leaving the site.
 * Work is the bare root; other views live in the URL hash, which keeps deep
 * links shareable without any server rewrites.
 */
export const VIEWS = ["work", "about", "case-theming", "case-project-planning", "case-automotive", "contact", "cv"] as const;

export type View = (typeof VIEWS)[number];

export interface NavigateOptions {
  /** Glide to the top or the anchor instead of jumping (ignored with prefers-reduced-motion). */
  smooth?: boolean;
}

/** Navigate to a view; `anchor` is an element id to land on instead of the top. */
export type Navigate = (view: View, anchor?: string | null, options?: NavigateOptions) => void;

/** Legacy ids and path-style names resolve to their current view. */
const VIEW_ALIASES: Readonly<Record<string, View>> = {
  "": "work",
  home: "work",
  landing: "work",
  projects: "work",
  resume: "cv",
};

export const isView = (value: string): value is View => (VIEWS as readonly string[]).includes(value);

/** Resolves an id or alias to a view, or null when it names none. */
export const resolveView = (value: string): View | null => {
  const id = Object.prototype.hasOwnProperty.call(VIEW_ALIASES, value) ? VIEW_ALIASES[value] : value;
  return id !== undefined && isView(id) ? id : null;
};

/** The view named in the current URL hash, or null when it names none. */
export const readViewFromLocation = (): View | null => {
  try {
    return resolveView(decodeURIComponent(window.location.hash.replace(/^#/, "")));
  } catch {
    return null; // malformed percent-encoding
  }
};

/** Work is the bare root; every other view is #view. */
export const urlForView = (view: View): string =>
  window.location.pathname + window.location.search + (view === "work" ? "" : "#" + view);

/** In-page href for a view (on <a> elements, for middle-click / open in new tab). */
export const hrefForView = (view: View): string => (view === "work" ? "#" : "#" + view);

/** Case studies live under Work, so the Work pill stays active there. */
export const navSectionFor = (view: View): View => (view.startsWith("case-") ? "work" : view);

export const NAV_ITEMS: ReadonlyArray<{ view: View; label: string }> = [
  { view: "work", label: "Work" },
  { view: "about", label: "About" },
  { view: "contact", label: "Contact" },
];

const SITE_NAME = "Karolina Kita";

/**
 * Document title per view (shown in the tab and in the history menu).
 * The CV title leads with the name: browsers use the title as the default
 * PDF file name.
 */
const VIEW_TITLES: Readonly<Record<View, string>> = {
  work: SITE_NAME + " - Senior Product Designer",
  about: "About - " + SITE_NAME,
  contact: "Contact - " + SITE_NAME,
  cv: SITE_NAME + " - CV",
  "case-theming": "Data Governance Case Study - " + SITE_NAME,
  "case-project-planning": "Project Planning Case Study - " + SITE_NAME,
  "case-automotive": "Automotive Ecosystem Case Study - " + SITE_NAME,
};

export const titleForView = (view: View): string => VIEW_TITLES[view];
