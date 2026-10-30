import { VIEW } from "#shared/lib/routes/routes.constants.ts";

import type { Testimonial, WorkCase } from "./work.types.ts";

/** The hero's intro under the H1. */
export const HERO_LEAD =
  "I have spent 8+ years, mostly on B2B and enterprise platforms, turning messy, data-heavy workflows into clear, usable digital products. With a background in psychology, I focus on how people actually think and work - combining practical research with solid design systems that engineers can easily build.";

/**
 * Hero buttons below the intro: one primary, one secondary. The arrow is an icon, not part of the label. The Figma
 * workspace, the code and Storybook are linked from the Behind the Design banner (PROCESS_BANNER).
 */
export const HERO_ACTIONS = {
  cases: "Explore Case Studies",
  cv: "View CV",
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
    id: "smart-ticket",
    asset: "cases/smart-ticket/thumbnail-light.webp",
    darkAsset: "cases/smart-ticket/thumbnail-dark.webp",
    alt: "The Smart Ticket operations console with fare revenue and an hourly boarding chart, beside a phone showing an active offline ticket with a QR code.",
    eyebrow: ["Public Mobility", "Mobile App & Operations Console"],
    title: "Smart Ticket: Mobile Ticketing & Transit Operations",
    summary:
      "Rebuilt a 2022 transit ticketing concept into a token-based system: offline QR passes, buy-now-start-later boarding and a privacy-safe web console for transit operations, checked against WCAG 2.2 and European transit data standards.",
    cta: "View Case Study",
    view: VIEW.caseSmartTicket,
  },
  {
    id: "theming-system",
    asset: "cases/data-governance/thumbnail-light.webp",
    darkAsset: "cases/data-governance/thumbnail-dark.webp",
    alt: "The same data table in a read-only base theme and in a custom tenant theme under a tritanopia simulation, beside contrast guardrails that pick readable text colours automatically.",
    eyebrow: ["B2B Platform", "Feature Design"],
    title: "Enterprise White-Label Theme Generator",
    summary:
      "Replaced a raw CSS configuration panel with a visual theme generator for non-technical users. Automated text color selection based on contrast so custom themes stayed readable, and provided developers with clear rules for calculating interactive states like hovers.",
    cta: "View Case Study",
    view: VIEW.caseDataGovernance,
  },
  {
    id: "project-planning",
    asset: "cases/project-planning/thumbnail-light.webp",
    darkAsset: "cases/project-planning/thumbnail-dark.webp",
    alt: "Sample project dashboards: a goals and milestones timeline, a budget burn table, and budget guardrails that flag projects at 80% and 100% of their budget.",
    eyebrow: ["Enterprise SaaS", "Design System & Product Design"],
    title: "Project Planning & Cost Management Platform",
    summary:
      "Designed a desktop platform for time tracking, meeting cost, project budgets and portfolio reporting, built on PrimeNG design tokens with Light and Dark modes. Mentored a UX intern and labelled every new piece of business logic as a proposal for client sign-off.",
    cta: "View Case Study",
    view: VIEW.caseProjectPlanning,
  },
  {
    id: "automotive-discovery",
    asset: "cases/automotive/thumbnail-light.webp",
    darkAsset: "cases/automotive/thumbnail-dark.webp",
    alt: "A contrast check of the marketplace status chips, a vehicle basket with mixed funding and a vehicle detail page with Great Deal and Bid & Buy Now tags.",
    eyebrow: ["European Automotive B2B", "UX Research & Interface Design"],
    title: "Automotive B2B Marketplace Redesign",
    summary:
      "Researched how dealers in 7 European markets buy used cars, audited the live platform and a coded prototype, and designed the buyer flows from basket to checkout. In testing, six UK dealers completed 91.6% of tasks.",
    cta: "View Discovery Case",
    view: VIEW.caseAutomotive,
  },
];

/** Work page order: most recent and highest-impact first. */
const WORK_CASE_ORDER = ["smart-ticket", "automotive-discovery", "project-planning", "theming-system"] as const;

export const WORK_CASES: readonly WorkCase[] = WORK_CASE_ORDER.map((id) => CASES.find((item) => item.id === id)).filter(
  (item): item is WorkCase => item !== undefined,
);

/** Work page banner below the case-study grid. */
export const PROCESS_BANNER = {
  title: "Behind the Design",
  body: "I treat design handoff seriously. Components and flows are organized with clear states, responsive layouts, and practical documentation so developers don't have to guess how things should behave.",
  linkLabel: "Explore the Figma Workspace",
  /** Shown while PROFILE.repositoryUrl is set. */
  sourceLinkLabel: "Explore the Code on GitHub",
  /** Shown while PROFILE.storybookUrl is set. Short enough for one line in the banner at 375px. */
  componentsLinkLabel: "Explore the Storybook Library",
};
