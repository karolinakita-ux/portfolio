import type { NavItem, View } from "./routes.types.ts";

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
 * Reading and building URLs: routes.utils.ts.
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

/** Every view, in page order (sitemap, prerendering, audits). */
export const VIEWS: readonly View[] = Object.values(VIEW);

/**
 * URL path of each view. Changing a path breaks shared links: keep the old one
 * working through VIEW_ALIASES.
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
  /** The privacy note on the Contact page; the footer links to it. */
  privacy: "privacy",
} as const;

/** Short names that resolve to a view: as a hash (old links, /#resume) or as a path (/resume). */
export const VIEW_ALIASES: Readonly<Record<string, View>> = {
  "": VIEW.work,
  home: VIEW.work,
  landing: VIEW.work,
  projects: VIEW.work,
  resume: VIEW.cv,
};

export const NAV_ITEMS: readonly NavItem[] = [
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
export const VIEW_TITLES: Readonly<Record<View, string>> = {
  [VIEW.work]: SITE_NAME + " - Senior Product Designer",
  [VIEW.about]: "About - " + SITE_NAME,
  [VIEW.contact]: "Contact - " + SITE_NAME,
  [VIEW.cv]: SITE_NAME + " - CV",
  [VIEW.caseTheming]: "Data Governance Case Study - " + SITE_NAME,
  [VIEW.caseMeetestim]: "MeetEstim Case Study - " + SITE_NAME,
  [VIEW.caseAutomotive]: "Automotive Ecosystem Case Study - " + SITE_NAME,
};
