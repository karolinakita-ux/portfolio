import type { FaqItem, Milestone, Principle } from "./types.ts";

export const ABOUT_INTRO: ReadonlyArray<string> = [
  "I am a Product and UX/UI Designer with a background in psychology. Since 2018, I have been turning complicated software into clear, practical tools that people actually enjoy using. My psychology foundation helps me understand how people think, make decisions, and deal with cognitive overload in fast-paced work environments.",
  "I specialize in data-heavy enterprise workflows, B2B SaaS platforms, and multi-brand design systems. Working closely with product managers and engineers, I bridge the gap between human behavior, design consistency, and technical feasibility.",
];

/** Authored oldest → newest; the About timeline reads newest first. `lesson` (quote block) is optional. */
export const MILESTONES: ReadonlyArray<Milestone> = [
  {
    id: "academic",
    period: "2015 - 2020",
    title: "Academic Foundation in Psychology",
    org: "University of Zielona Góra - Master's Degree in Psychology",
    focus:
      "Built a strong foundation in human behavior, decision-making, and research methodology. Conducted quantitative and qualitative studies, learning how to analyze user needs objectively and design interfaces that reduce cognitive strain.",
    tags: ["Cognitive Psychology", "Quantitative Research", "Qualitative Research", "Behavioral Analysis", "Research Methodology"],
  },
  {
    id: "fintech",
    period: "2018 - 2019",
    title: "FinTech Research & Interaction Foundations",
    org: "Cinkciarz.pl - Junior UX Researcher & Designer",
    focus:
      "Conducted usability testing, user interviews, and competitor benchmarking. Designed multi-step currency exchange workflows, transaction calculators, and supported the creation of early internal UI component libraries.",
    tags: ["Usability Testing", "User Interviews", "Competitor Analysis", "Interaction Design", "Design Systems"],
  },
  {
    id: "enterprise",
    period: "2019 - 2026",
    title: "Enterprise Platforms & B2B Solutions",
    org: "GlobalLogic Poland - Senior UX/UI Designer",
    focus:
      "Designing core workflows for large-scale European automotive platforms, fleet telematics, and data governance portals. Owned complex data tables, multi-variable filtering systems, and role-based access models (RBAC). Documented edge cases, interaction states, and system behaviors to ensure seamless delivery alongside engineering and product teams.",
    tags: ["Enterprise UX", "Data Tables & Filters", "Permissions (RBAC)", "Developer Handoff", "WCAG 2.1 AA"],
  },
  {
    id: "architecture",
    period: "2023 - Present",
    title: "Design Systems & Product Design",
    org: "Programado - Senior Product Designer (Consulting / Contract)",
    focus:
      "Leading the design and evolution of scalable design systems tailored to enterprise front-end frameworks (such as PrimeNG and Angular). Defining design tokens, theming structures (light/dark modes), and accessibility standards to help product teams deliver consistent interfaces faster.",
    tags: ["Design Systems", "Design Tokens", "Component Guidelines", "Accessible UI (WCAG 2.1 AA)", "PrimeNG Alignment"],
  },
];

export const FAQ: { title: string; intro: string; items: ReadonlyArray<FaqItem> } = {
  title: "How I Think & Work",
  intro: "A few common questions about my design approach, background, and how I collaborate with teams.",
  items: [
    {
      id: "dribbble",
      question: "Why do you focus on case studies rather than visual platforms like Dribbble?",
      answer:
        "Enterprise software cannot be fully explained in a single static visual. Most of my work involves confidential B2B tools, detailed tables, permissions, and complex workflows covered by NDAs. I prefer sharing in-depth case studies that explain the problem, real constraints, and the reasoning behind each design decision.",
    },
    {
      id: "psychology",
      question: "How does a background in psychology shape your design work?",
      answer:
        "Psychology helps me understand how people process information, make choices, and handle heavy workloads. In complex business tools, good design reduces mental fatigue by organizing information clearly and preventing mistakes before they happen.",
    },
    {
      id: "engineers",
      question: "How do you collaborate with cross-functional teams?",
      answer: "Great software is always a team effort:",
      points: [
        [
          "Product Managers",
          "Partner early to understand business goals, prioritize requirements, and define realistic delivery phases.",
        ],
        [
          "Frontend Developers",
          "Work closely on technical feasibility, component libraries, and clear handoff documentation so designs are straightforward to build.",
        ],
        [
          "QA Specialists",
          "Provide clear states, edge cases, and accessibility guidelines (WCAG 2.1 AA) to make testing smooth and predictable.",
        ],
      ],
    },
    {
      id: "problems",
      question: "What kinds of problems do you enjoy working on most?",
      answer:
        "I enjoy projects with heavy data and complex logic, like automotive platforms, management portals, and financial tools. Turning messy, complicated workflows into simple, predictable tools that save people time is what I find most rewarding.",
    },
  ],
};

export const PRINCIPLES: ReadonlyArray<Principle> = [
  {
    id: "utility",
    title: "Clarity First",
    body: "Complex tools don't have to feel messy. I organize information so users can quickly find what they need without feeling lost in buttons and tables.",
  },
  {
    id: "edge-cases",
    title: "Thinking Beyond the Happy Path",
    body: "Real life is full of edge cases. I always design for empty states, slow loading times, long lists, and error screens so the app stays helpful when things go wrong.",
  },
  {
    id: "cognition",
    title: "Using Psychology in Practice",
    body: "My psychology background helps me understand how people focus and make choices. I use this to keep screens simple and prevent users from feeling tired or overwhelmed.",
  },
  {
    id: "validation",
    title: "Talking to Developers Early",
    body: "Great design means nothing if it cannot be built easily. I share early ideas and sketches with engineers to make sure our solutions make sense in code.",
  },
];
