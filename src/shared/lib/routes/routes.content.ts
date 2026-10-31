import { VIEW } from "./routes.constants.ts";
import type { CaseNames, CaseView, View } from "./routes.types.ts";

export const SITE_NAME = "Karolina Kita";

/** Names that two fields below share, written once. */
const SMART_TICKET = "Smart Ticket: Mobile Ticketing & Transit Operations";
const THEME_GENERATOR = "Enterprise White-Label Theme Generator";

/**
 * Each case study's names, in the Work page order: the one place they are written. The case page (H1,
 * breadcrumb), the previous / next links, the Work card, the browser tab, llms.txt and the structured data
 * (WebPage, BreadcrumbList, CreativeWork) all read them from here; src/app/case-names.test.tsx fails when a
 * surface spells one itself. Fields: CaseNames in routes.types.ts.
 */
export const CASE_NAMES: Readonly<Record<CaseView, CaseNames>> = {
  [VIEW.caseSmartTicket]: { title: SMART_TICKET, cardTitle: SMART_TICKET, shortTitle: "Smart Ticket" },
  [VIEW.caseAutomotive]: {
    title: "Automotive B2B Marketplace: From Dealer Research Across Europe to a Validated Redesign",
    cardTitle: "Automotive B2B Marketplace Redesign",
    shortTitle: "Automotive Marketplace",
  },
  [VIEW.caseProjectPlanning]: {
    title: "Enterprise Project Planning & Cost Management Platform",
    cardTitle: "Project Planning & Cost Management Platform",
    shortTitle: "Project Planning",
  },
  [VIEW.caseDataGovernance]: {
    title: THEME_GENERATOR + ": Balancing Custom Branding with Strict WCAG 2.1 AA Accessibility",
    cardTitle: THEME_GENERATOR,
    shortTitle: "Theme Generator",
  },
};

/** A case study's browser tab: its short title. */
const caseTab = (view: CaseView): string => CASE_NAMES[view].shortTitle + " Case Study - " + SITE_NAME;

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
  [VIEW.caseDataGovernance]: caseTab(VIEW.caseDataGovernance),
  [VIEW.caseProjectPlanning]: caseTab(VIEW.caseProjectPlanning),
  [VIEW.caseAutomotive]: caseTab(VIEW.caseAutomotive),
  [VIEW.caseSmartTicket]: caseTab(VIEW.caseSmartTicket),
};
