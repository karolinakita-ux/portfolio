/**
 * CV content - single source of truth for the #cv view and its A4 / PDF export.
 *
 * ATS rules for anything added here (checked in src/app/content-rules.test.ts):
 *   - Plain text only: no icons, emoji, curly quotes or long dashes. Use " - ".
 *   - Dates are ISO ("2023-09", or "2015" for year-only); CvView formats them
 *     as "Sep 2023 - Present", which parsers read reliably.
 *   - Bullets are { lead, text } pairs, rendered as "<strong>Lead:</strong> text"
 *     (the portfolio's bold lead-in rule).
 *   - Optional fields (phone, location, previousTitle, details) render only when set.
 */
import { PROFILE } from "#shared/content/profile.ts";

import type { Cv } from "./cv.types.ts";

export const CV: Cv = {
  header: {
    name: PROFILE.name,
    title: "Senior Product Designer & UX Architect",
    location: "Poland (CET / UTC+1) - Remote",
    phone: "",
    email: PROFILE.email,
    // ?ref=cv: visits from the CV (PDF) show up in the site statistics (link-ref).
    portfolio: { label: "karolina.kita.company", href: "https://karolina.kita.company/?ref=cv" },
    linkedin: { label: "linkedin.com/in/karolinakita", href: PROFILE.linkedinUrl },
  },

  summary:
    "Senior Product Designer and UX Architect with 8+ years designing mission-critical enterprise platforms - data governance, European automotive B2B marketplaces, fleet and mobility admin suites, and dense SaaS operations tools. An M.Sc. in Psychology grounds the work in cognitive load, mental models and evidence-based research, from multi-market surveys to heuristic audits. Architects token-driven design systems with strict 1:1 Figma-to-code parity, light/dark modes and WCAG 2.1 AA/AAA compliance, and uses AI-augmented workflows (Claude, Claude Code, MCP) for rapid functional prototyping and engineering-ready specifications.",

  competencies: [
    {
      group: "Domains",
      items: [
        "Enterprise B2B SaaS",
        "Data Governance",
        "Multi-Tenant Platforms",
        "Automotive B2B Marketplaces",
        "Fleet Telematics & Smart Mobility",
        "Workforce & Capacity Planning",
        "FinTech",
      ],
    },
    {
      group: "Design & Prototyping",
      items: [
        "Product Design",
        "Interaction Design",
        "Information Architecture",
        "High-Density Data Tables",
        "Complex Filtering",
        "Responsive Web Apps",
        "AI-Assisted Functional Prototyping",
      ],
    },
    {
      group: "Systems & Documentation",
      items: [
        "Design Systems Architecture",
        "Design Tokens & Figma Variables",
        "1:1 Figma-to-Code Parity",
        "Light/Dark Theming",
        "Component Contracts",
        "State Machines & Edge-Case Specs",
        "WCAG 2.1 AA/AAA",
      ],
    },
    {
      group: "UX Research",
      items: [
        "Usability Testing",
        "User Interviews",
        "Survey Analysis",
        "Heuristic Evaluation",
        "Competitive Benchmarking",
        "Personas",
        "Card Sorting",
        "Discovery Workshops",
        "Statistical Analysis",
      ],
    },
    {
      group: "Tooling",
      items: [
        "Figma",
        "Adobe XD",
        "Claude & Claude Code",
        "MCP Servers",
        "Miro",
        "SurveyMonkey",
        "Confluence",
        "PrimeNG / Angular",
        "HTML, CSS, React & Tailwind (prototyping)",
        "Markdown",
      ],
    },
  ],

  experience: [
    {
      id: "programado",
      company: "Programado",
      title: "Senior Product Designer / UX Architect",
      start: "2023-09",
      end: null,
      bullets: [
        {
          lead: "Enterprise Capacity Tools",
          text: "Lead designer of a workforce capacity and scheduling platform - calendar ingestion from Google Calendar and Microsoft 365, executive PMO dashboards tracking budget variance across 35+ active projects, and goal-to-task breakdown with Gantt timelines.",
        },
        {
          lead: "AI-Assisted Functional Prototyping",
          text: "Builds working code prototypes with Claude Code and MCP servers to validate interaction models, state handling and edge cases with stakeholders before development starts.",
        },
        {
          lead: "Design System Architecture",
          text: "Architected token-driven design systems from scratch with 1:1 Figma-to-code parity mapped to PrimeNG / Angular - two-tier primitive and semantic aliasing, light/dark variable modes and a primary palette passing WCAG 2.1 AAA (7.09:1).",
        },
        {
          lead: "Technical Handoff Specs",
          text: "Writes structured Markdown specifications - component contracts, state machines, edge cases and accessibility benchmarks - so engineering and QA implement and verify without guesswork.",
        },
      ],
    },
    {
      id: "globallogic",
      company: "GlobalLogic",
      title: "Senior UI/UX Designer",
      previousTitle: "UI/UX Designer",
      start: "2019-09",
      end: "2026-10",
      bullets: [
        {
          lead: "Data Governance Platforms",
          text: "Designed a multi-tenant theming engine for healthcare and public-sector clients - luminance-based text contrast, formula-derived interaction states and immutable base themes - enabling self-service branding with zero WCAG 2.1 AA contrast regressions.",
        },
        {
          lead: "Enterprise Media Scheduling",
          text: "Designed high-density scheduling views, complex data tables and multi-variable filtering for operations teams working to time-critical schedules.",
        },
        {
          lead: "Smart Mobility & Admin Suite",
          text: "Designed fleet telematics dashboards and administration consoles with role-based access control (RBAC) permission models and scannable data grids.",
        },
        {
          lead: "European Automotive Platforms",
          text: "Led discovery for a B2B used-vehicle marketplace - survey analysis across 6 markets, customer interviews, personas, heuristic audit and competitive benchmarking - securing executive buy-in for a full redesign; designed multi-vehicle purchase, transport and split-payment flows.",
        },
        {
          lead: "Design System Governance",
          text: "Maintained Figma component libraries and introduced standardized Markdown documentation for edge cases, state machines and system logic, aligning product managers and frontend engineers.",
        },
        {
          lead: "Mentorship",
          text: "Mentored junior designers through design reviews, documentation standards and production handoffs.",
        },
      ],
    },
    {
      id: "cinkciarz",
      company: "Cinkciarz.pl",
      title: "Junior UX Researcher / Designer",
      start: "2018-07",
      end: "2019-09",
      bullets: [
        {
          lead: "Usability Research",
          text: "Ran moderated usability tests, guerrilla sessions and competitive benchmarking against neobanks and traditional banks to locate friction in currency exchange journeys.",
        },
        {
          lead: "Early UI Component Libraries",
          text: "Contributed to the company's first design system, building reusable components for multi-step transaction flows and high-security currency calculators.",
        },
        {
          lead: "Funnel Optimization",
          text: "Combined research findings with product data to simplify multi-step currency transaction flows and reduce drop-off.",
        },
      ],
    },
  ],

  education: [
    {
      id: "uz",
      institution: "University of Zielona Góra",
      degree: "Master of Science (M.Sc.) in Psychology",
      start: "2015",
      end: "2020",
      details:
        "Grade: 5.0 / 5.0. Focus: cognitive ergonomics, mental models, quantitative research on large samples (N > 500) and statistical hypothesis testing.",
    },
  ],
};
