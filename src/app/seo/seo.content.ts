import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

/**
 * Search and link-preview copy per page: the meta description (shown under the title in
 * Google) and the og/twitter description. Same copy rules as the site (checked in
 * content-rules.test.ts): plain English, short hyphens, at most 160 characters.
 * Page titles live in src/shared/lib/routes/routes.constants.ts (VIEW_TITLES): the tab, og:title and twitter:title.
 */
export const PAGE_DESCRIPTIONS: Readonly<Record<View, string>> = {
  [VIEW.work]:
    "Senior Product Designer with 8+ years, mostly on B2B and enterprise platforms: UX research, complex workflows and token-based design systems. MSc in Psychology.",
  [VIEW.about]:
    "Background, principles and career of Karolina Kita, a Senior Product Designer with a psychology degree who works on enterprise workflows and design systems.",
  [VIEW.contact]:
    "Contact Karolina Kita, Senior Product Designer and Design Systems Specialist, open to new opportunities: email, LinkedIn, availability and working hours.",
  [VIEW.cv]:
    "CV of Karolina Kita, Senior Product Designer with 8+ years, mostly on B2B and enterprise platforms: design systems and UX research. Also as a PDF.",
  [VIEW.privacy]:
    "How Karolina Kita’s portfolio handles your data: no cookies, visitor statistics with Umami only if you allow them, hosting on Netlify, and your GDPR rights.",
  [VIEW.accessibility]:
    "How Karolina Kita’s portfolio works with a keyboard, screen readers, zoom, larger text and contrast settings. Known limits and how to report a problem.",
  [VIEW.caseDataGovernance]:
    "Case study: a visual theme generator for a B2B data governance platform that picks readable text colours automatically, so custom tenant themes stay accessible.",
  [VIEW.caseProjectPlanning]:
    "Case study: an enterprise platform for time tracking, meeting cost, project budgets and portfolio reporting, built on PrimeNG design tokens.",
  [VIEW.caseSmartTicket]:
    "Case study: a mobile ticketing app with offline QR passes and 2-step boarding, plus a transit operations console, rebuilt on WCAG 2.2 design tokens.",
  [VIEW.caseAutomotive]:
    "Case study: research-backed redesign of a B2B vehicle marketplace across 7 European markets, from interviews and benchmarking to the checkout flow.",
};

/**
 * Each page's name in llms.txt and, for a case study, the name of the work in its structured data (CreativeWork):
 * the title of its card on the Work page. The structured-data breadcrumb uses the labels visitors see instead
 * (seo.utils.ts): a case study's shortTitle, and these names for the other pages.
 */
export const PAGE_NAMES: Readonly<Record<View, string>> = {
  [VIEW.work]: "Work",
  [VIEW.about]: "About",
  [VIEW.contact]: "Contact",
  [VIEW.cv]: "CV",
  [VIEW.privacy]: "Privacy",
  [VIEW.accessibility]: "Accessibility",
  [VIEW.caseDataGovernance]: "Enterprise White-Label Theme Generator",
  [VIEW.caseProjectPlanning]: "Project Planning & Cost Management Platform",
  [VIEW.caseAutomotive]: "Automotive B2B Marketplace Redesign",
  [VIEW.caseSmartTicket]: "Smart Ticket: Mobile Ticketing & Transit Operations",
};

/**
 * When the work of each case study happened, as its Timeline or Duration line says, in ISO 8601 for schema.org's
 * temporalCoverage: "2023/.." is open-ended ("2023 - present"). seo.utils.test.ts checks them against the page.
 */
export const CASE_PERIODS: Readonly<Partial<Record<View, string>>> = {
  [VIEW.caseSmartTicket]: "2022-10/2026",
  [VIEW.caseAutomotive]: "2025-06/2026-09",
  [VIEW.caseProjectPlanning]: "2023/..",
  [VIEW.caseDataGovernance]: "2020-10/2022-12",
};
