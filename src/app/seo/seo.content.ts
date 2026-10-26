import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

/**
 * Search and link-preview copy per page: the meta description (shown under the title in
 * Google) and the og/twitter description. Same copy rules as the site (checked in
 * content-rules.test.ts): plain English, short hyphens, at most 160 characters.
 * Page titles live in routes.ts (titleForView).
 */
export const PAGE_DESCRIPTIONS: Readonly<Record<View, string>> = {
  [VIEW.work]:
    "Senior Product Designer with 8+ years on B2B and enterprise platforms: UX research, complex workflows and token-driven design systems. MSc in Psychology.",
  [VIEW.about]:
    "Background, principles and career of Karolina Kita, a Product and UX/UI Designer with a psychology degree who works on enterprise workflows and design systems.",
  [VIEW.contact]:
    "Contact Karolina Kita, Senior Product Designer and Design Systems specialist, open to new opportunities: email, LinkedIn, availability and working hours.",
  [VIEW.privacy]:
    "How Karolina Kita's portfolio handles your data: no cookies, visitor statistics with Umami only if you allow them, hosting on Netlify, and your GDPR rights.",
  [VIEW.accessibility]:
    "How Karolina Kita's portfolio works with a keyboard, screen readers, zoom, larger text and contrast settings. Known limits and how to report a problem.",
  [VIEW.caseTheming]:
    "Case study: a visual theme generator for a B2B data governance platform that picks readable text colours automatically, so custom tenant themes stay accessible.",
  [VIEW.caseProjectPlanning]:
    "Case study: an enterprise project planning and cost management platform, designed from discovery to release with a Figma library for PrimeNG.",
  [VIEW.caseAutomotive]:
    "Case study: research-backed redesign of a B2B vehicle marketplace across 6 European markets, from interviews and benchmarking to the checkout flow.",
};

/** The home page's name in the breadcrumb of pages outside Work (About, Contact, Privacy), as on the page. */
export const HOME_NAME = "Home";

/** Short page names for breadcrumbs in structured data. */
export const PAGE_NAMES: Readonly<Record<View, string>> = {
  [VIEW.work]: "Work",
  [VIEW.about]: "About",
  [VIEW.contact]: "Contact",
  [VIEW.privacy]: "Privacy",
  [VIEW.accessibility]: "Accessibility",
  [VIEW.caseTheming]: "Enterprise White-Label Theme Generator",
  [VIEW.caseProjectPlanning]: "Project Planning & Cost Management Platform",
  [VIEW.caseAutomotive]: "Automotive B2B Marketplace Redesign",
};
