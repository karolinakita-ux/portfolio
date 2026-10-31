import type { NavItem, View } from "./routes.types.ts";

/**
 * Information architecture
 *   Work            /  ─┬─ /work/smart-ticket
 *                       ├─ /work/automotive
 *                       ├─ /work/project-planning
 *                       └─ /work/data-governance  (the Theme Generator case: the address keeps its code name)
 *   About /about · Contact /contact
 *   CV /cv (linked from the Work and About heroes and Contact; not in the primary nav)
 *   Privacy /privacy · Accessibility /accessibility (linked from the footer)
 *
 * Every view has its own path and browser-history entry, so Back / Forward (and
 * swipe-back on phones) move between views. The URL hash is a section anchor
 * (/about#career); it follows the section in view while scrolling.
 * Before 3.0.0 views lived in the hash (/#about): those links still resolve.
 * Reading and building URLs: routes.utils.ts. Page titles and the case studies' names: routes.content.ts.
 */

/** View ids, used everywhere in code instead of string literals. */
export const VIEW = {
  work: "work",
  about: "about",
  /** Keeps its old value: old /#case-theming links and the statistics' `case` value use it. */
  caseDataGovernance: "case-theming",
  caseProjectPlanning: "case-project-planning",
  caseAutomotive: "case-automotive",
  caseSmartTicket: "case-smart-ticket",
  contact: "contact",
  cv: "cv",
  privacy: "privacy",
  accessibility: "accessibility",
} as const;

/**
 * Every view (prerendering, audits), Work first. Not the case studies' order on the Work page, which the sitemap and
 * llms.txt follow: WORK_CASES in features/work.
 */
export const VIEWS: readonly View[] = Object.values(VIEW);

/**
 * URL path of each view. Changing a path breaks shared links: keep the old one
 * working through VIEW_ALIASES (and a 301 in public/_redirects). The one exception: 5.0.0
 * dropped the project planning case's old path on purpose, because it named the product.
 */
export const VIEW_PATHS = {
  [VIEW.work]: "/",
  [VIEW.about]: "/about",
  [VIEW.contact]: "/contact",
  [VIEW.cv]: "/cv",
  [VIEW.privacy]: "/privacy",
  [VIEW.accessibility]: "/accessibility",
  [VIEW.caseDataGovernance]: "/work/data-governance",
  [VIEW.caseProjectPlanning]: "/work/project-planning",
  [VIEW.caseAutomotive]: "/work/automotive",
  [VIEW.caseSmartTicket]: "/work/smart-ticket",
} as const satisfies Record<View, string>;

/**
 * Section anchors that other views or shared links point to: the element's id and the URL hash (/#enterprise-cases).
 * Keep them stable, and never the name of a view or alias: /#about opens About (an old hash link).
 */
export const SECTION = {
  workCases: "enterprise-cases",
  /** The Behind the Design banner below the Work page's case studies (ProcessBanner). */
  behindTheDesign: "behind-the-design",
} as const;

/**
 * Short names that resolve to a view: as a hash (old links, /#resume) or as a path (/resume).
 * /resume opens the CV (Netlify redirects it in public/_redirects). The CV page was gone in 4.0.0 - 5.13.4,
 * when /cv and /resume opened About; 5.14.0 brought it back.
 */
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
