import type { Testimonial, WorkCase } from "./types.ts";

/** Hero buttons below the intro. The arrows are icons, not part of the label. */
export const HERO_ACTIONS = {
  cases: "Explore Case Studies",
  figma: "Inspect Figma Workspace",
};

export const WORK_INTRO =
  "A closer look at how I tackle complex B2B workflows, structure dense data, and collaborate with product teams to solve real business problems.";

export const TESTIMONIALS: ReadonlyArray<Testimonial> = [
  {
    id: "stewart-wilson",
    quote:
      "Karolina has a strong, balanced skillset as a UX designer and was able to quickly build an understanding of our complex, enterprise product domain, delivering significant improvements through discovery, design, and design system standards.",
    name: "Stewart Wilson",
    initials: "SW",
    role: "UX Director | Precisely",
  },
  {
    id: "gavin-harvey",
    quote:
      "One of Karolina’s biggest strengths is her ability to understand complex problems, break them down and develop solutions to a very high standard. Her documentation was consistently outstanding, clearly capturing research findings and design thinking.",
    name: "Gavin Harvey",
    initials: "GH",
    role: "Lead Product Designer | Cox Automotive",
  },
];

const CASES: ReadonlyArray<WorkCase> = [
  {
    id: "theming-system",
    asset: "thumb-case-theming-system.png",
    alt: "Three Edit Theme panels from a data governance platform, showing header, navigation and general colour settings used to brand each tenant.",
    eyebrow: ["B2B Platform", "Feature Design"],
    title: "Enterprise White-Label Theme Generator",
    summary:
      "Replaced a raw CSS configuration panel with a visual theme generator for non-technical users. Automated text color selection based on contrast so custom themes stayed readable, and provided developers with clear rules for calculating interactive states like hovers.",
    cta: "View Case Study",
    view: "case-theming",
  },
  {
    id: "project-planning",
    asset: "thumb-case-project-planning-suite.png",
    alt: "Project planning month overview: a participant calendar with a mini month picker beside a weekly schedule of meetings.",
    eyebrow: ["Enterprise SaaS", "Design System & Product Design"],
    title: "Project Planning & Cost Management Platform",
    summary:
      "Designed an enterprise resource planning and budget estimation platform from discovery to release. Built a scalable Figma component library aligned with PrimeNG, mentored a junior designer, and transformed complex spreadsheet workflows into an intuitive planning tool.",
    cta: "View Case Study",
    view: "case-project-planning",
  },
  {
    id: "automotive-discovery",
    asset: "thumb-case-automotive-confluence.png",
    alt: "Research documentation tree beside a UX benchmarking page that lists best practices to adopt and flaws to avoid on vehicle search.",
    eyebrow: ["European Automotive B2B", "UX Research & Interface Design"],
    title: "Automotive B2B Marketplace Redesign",
    summary:
      "Redesigned the core vehicle purchasing flow across 6 European markets. Synthesized qualitative interviews and competitor data into a streamlined transaction architecture, eliminating checkout friction and reducing cognitive overload for commercial buyers.",
    cta: "View Discovery Case",
    view: "case-automotive",
  },
];

/** Work page order: most recent and highest-impact first. */
const WORK_CASE_ORDER = ["automotive-discovery", "project-planning", "theming-system"] as const;

export const WORK_CASES: ReadonlyArray<WorkCase> = WORK_CASE_ORDER.map((id) =>
  CASES.find((item) => item.id === id),
).filter((item): item is WorkCase => item !== undefined);

/** Work page banner below the case-study grid. */
export const PROCESS_BANNER = {
  title: "Behind the Design",
  body: "I treat design handoff seriously. Components and flows are organized with clear states, responsive layouts, and practical documentation so developers don't have to guess how things should behave.",
  linkLabel: "Explore the Figma Workspace",
};
