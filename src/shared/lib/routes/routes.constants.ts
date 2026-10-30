import type { NavItem, View } from "./routes.types.ts";

/**
 * Information architecture
 *   Work            /  ─┬─ /work/smart-ticket  (Smart Ticket: mobile ticketing and transit operations)
 *                       ├─ /work/data-governance  (Data Governance theming case)
 *                       ├─ /work/project-planning
 *                       └─ /work/automotive
 *   About /about · Contact /contact
 *   CV /cv (linked from the Work and About heroes and Contact; not in the primary nav)
 *   Privacy /privacy · Accessibility /accessibility (linked from the footer)
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
  caseProjectPlanning: "case-project-planning",
  caseAutomotive: "case-automotive",
  caseSmartTicket: "case-smart-ticket",
  contact: "contact",
  cv: "cv",
  privacy: "privacy",
  accessibility: "accessibility",
} as const;

/** Every view, in page order (sitemap, prerendering, audits). */
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
  [VIEW.caseTheming]: "/work/data-governance",
  [VIEW.caseProjectPlanning]: "/work/project-planning",
  [VIEW.caseAutomotive]: "/work/automotive",
  [VIEW.caseSmartTicket]: "/work/smart-ticket",
} as const satisfies Record<View, string>;

/** Section anchors that other views link to (the section's element id). */
export const SECTION = {
  workCases: "enterprise-cases",
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

export const SITE_NAME = "Karolina Kita";

/**
 * Document title per view (shown in the tab and in the history menu).
 * The CV's title leads with the name: it is the PDF's title (scripts/cv-pdf.ts) and the file name browsers
 * suggest when the page is saved as a PDF.
 */
export const VIEW_TITLES: Readonly<Record<View, string>> = {
  [VIEW.work]: SITE_NAME + " - Senior Product Designer",
  [VIEW.about]: "About - " + SITE_NAME,
  [VIEW.contact]: "Contact - " + SITE_NAME,
  [VIEW.cv]: SITE_NAME + " - CV",
  [VIEW.privacy]: "Privacy - " + SITE_NAME,
  [VIEW.accessibility]: "Accessibility - " + SITE_NAME,
  [VIEW.caseTheming]: "Data Governance Case Study - " + SITE_NAME,
  [VIEW.caseProjectPlanning]: "Project Planning Case Study - " + SITE_NAME,
  [VIEW.caseAutomotive]: "Automotive Ecosystem Case Study - " + SITE_NAME,
  [VIEW.caseSmartTicket]: "Smart Ticket Case Study - " + SITE_NAME,
};
