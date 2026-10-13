import { VIEW } from "#shared/lib/routes.ts";

import type { Testimonial, WorkCase } from "./work.types.ts";

/** Hero buttons below the intro. The arrows are icons, not part of the label. */
export const HERO_ACTIONS = {
  cases: "Explore Case Studies",
  figma: "Inspect Figma Workspace",
};

export const WORK_INTRO =
  "A closer look at how I tackle complex B2B workflows, structure dense data, and collaborate with product teams to solve real business problems.";

/** Link under the quotes: they are excerpts, the full texts are on LinkedIn. */
export const RECOMMENDATIONS_LINK_LABEL = "Read the full recommendations on LinkedIn";

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "stewart-wilson",
    quote:
      "Karolina has a strong, balanced skillset as a UX designer and was able to quickly build an understanding of our complex, enterprise product domain, delivering significant improvements through discovery, design, and design system standards.",
    name: "Stewart Wilson",
    initials: "SW",
    profileUrl: "https://www.linkedin.com/in/stewart-wilson-ba92112a/",
    role: "UX Director",
    company: { name: "Precisely", url: "https://www.linkedin.com/company/preciselydata/" },
  },
  {
    id: "gavin-harvey",
    quote:
      "One of Karolina’s biggest strengths is her ability to understand complex problems, break them down and develop solutions to a very high standard. Her documentation was consistently outstanding, clearly capturing research findings and design thinking.",
    name: "Gavin Harvey",
    initials: "GH",
    profileUrl: "https://www.linkedin.com/in/harveygavin/",
    role: "Lead Product Designer",
    company: { name: "Cox Automotive", url: "https://www.linkedin.com/company/coxautomotiveeurope/" },
  },
];

const CASES: readonly WorkCase[] = [
  {
    id: "theming-system",
    asset: "cases/data-governance/thumbnail.webp",
    alt: "Three Edit Theme panels from a data governance platform, showing header, navigation and general colour settings used to brand each tenant.",
    eyebrow: ["B2B Platform", "Feature Design"],
    title: "Enterprise White-Label Theme Generator",
    summary:
      "Replaced a raw CSS configuration panel with a visual theme generator for non-technical users. Automated text color selection based on contrast so custom themes stayed readable, and provided developers with clear rules for calculating interactive states like hovers.",
    cta: "View Case Study",
    view: VIEW.caseTheming,
  },
  {
    id: "meetestim-suite",
    asset: "cases/meetestim/thumbnail.webp",
    alt: "Meetestim month overview: a participant calendar with a mini month picker beside a weekly schedule of meetings.",
    eyebrow: ["Enterprise SaaS", "Design System & Product Design"],
    title: "MeetEstim - Project Planning & Cost Management Platform",
    summary:
      "Designed an enterprise resource planning and budget estimation platform from discovery to release. Built a scalable Figma component library aligned with PrimeNG, mentored a junior designer, and transformed complex spreadsheet workflows into an intuitive planning tool.",
    cta: "View Case Study",
    view: VIEW.caseMeetestim,
  },
  {
    id: "automotive-discovery",
    asset: "cases/automotive/thumbnail.webp",
    alt: "Research documentation tree beside a UX benchmarking page that lists best practices to adopt and flaws to avoid on vehicle search.",
    eyebrow: ["European Automotive B2B", "UX Research & Interface Design"],
    title: "Automotive B2B Marketplace Redesign",
    summary:
      "Redesigned the core vehicle purchasing flow across 6 European markets. Synthesized qualitative interviews and competitor data into a streamlined transaction architecture, eliminating checkout friction and reducing cognitive overload for commercial buyers.",
    cta: "View Discovery Case",
    view: VIEW.caseAutomotive,
  },
];

/** Work page order: most recent and highest-impact first. */
const WORK_CASE_ORDER = ["automotive-discovery", "meetestim-suite", "theming-system"] as const;

export const WORK_CASES: readonly WorkCase[] = WORK_CASE_ORDER.map((id) => CASES.find((item) => item.id === id)).filter(
  (item): item is WorkCase => item !== undefined,
);

/** Work page banner below the case-study grid. */
export const PROCESS_BANNER = {
  title: "Behind the Design",
  body: "I treat design handoff seriously. Components and flows are organized with clear states, responsive layouts, and practical documentation so developers don't have to guess how things should behave.",
  linkLabel: "Explore the Figma Workspace",
};
