import type { CaseStudy } from "#features/case-studies/case-studies.types.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { lead } from "#shared/ui/lead/lead.tsx";
import { Swatch } from "#shared/ui/Swatch/Swatch.tsx";

import { caseShots } from "./content.utils.ts";

/*
 * Case study - Project Planning & Cost Management. The client is not named anywhere (copy, alt text, file names,
 * screenshots, comments); the screens are a sanitised rebuild with sample data. The layout follows Figma node
 * 2716:3801 (Kita Branding file, now on the Archive page). Claims are checked against the Planning & Cost
 * Management Platform Figma file (notes, status pills and variables); screens marked "Proposal - needs sign-off"
 * there are called proposals here. Screenshot fields: see ShowcaseCard in case-studies.types.ts; every screenshot
 * has a Light and a Dark version.
 */
const { shot } = caseShots("project-planning");

export const PROJECT_PLANNING_CASE: CaseStudy = {
  view: VIEW.caseProjectPlanning,
  id: "planning",
  shortTitle: "Project Planning",
  eyebrow: ["B2B Enterprise SaaS", "Design System & PrimeNG", "Resource Management"],
  title: "Enterprise Project Planning & Cost Management Platform",
  meta: [
    {
      label: "My Role",
      value: "Senior UX / Product Designer - end-to-end UX, design system architecture and engineering alignment",
    },
    {
      label: "Team",
      value: "Product owners, a business analyst, frontend and backend developers, and a UX intern I mentored",
    },
    { label: "Timeline", value: "2023 - present · initial release and ongoing evolution of the system" },
    { label: "Platform", value: "Desktop web application built on PrimeNG (Angular)" },
    {
      label: "Key Outcome",
      wide: true,
      value:
        "Designed one workspace for time tracking, meeting cost, project budgets and portfolio reporting on a 3-tier PrimeNG token system with Light and Dark mode. Logged time and meeting costs roll up into project budgets and PMO dashboards, and every new piece of business logic is labelled as a proposal for sign-off.",
    },
  ],
  notice: {
    tone: "info",
    label: "About these screens",
    text: "The screens and design artefacts in this case study are a curated, sanitised and refactored subset of a much larger production system, adapted for this portfolio. Real company names, logos and proprietary financial data have been generalised or removed under NDA, and the screens use realistic enterprise sample data in standard European formats (PLN currency, DD/MM/YYYY dates, 24-hour time).",
  },
  summaryTitle: "Executive Summary",
  summaryLead: "Budgets rarely break in one big mistake. They erode in everyday work.",
  summary: [
    {
      title: "The Problem",
      body: "Teams planned hours in static spreadsheets. Long meetings, unclear task dependencies and unlogged calls slowly used up project margins and nobody saw it until the monthly report, when it was too late to change course.",
    },
    {
      title: "My Part",
      body: "I led product design from problem definition to delivery. With the product owners, the business analyst and the developers, I turned complex resource workflows into one desktop app: a time tracker that stays visible, a calendar with day-level time entries, a meetings page that shows what each meeting costs, budget burn on every project and a portfolio view for the PMO - all on one PrimeNG token system. Screens that need new business logic are marked as proposals for the client to sign off.",
    },
  ],
  features: [
    {
      id: "planning-foundations",
      eyebrow: "Brand Foundation & PrimeNG Tokens",
      title: "A Calm Interface for People Who Read Numbers All Day",
      lead: "One palette, one type family and one token system, verified for contrast.",
      bullets: [
        lead(
          "Palette with a job",
          <>
            Deep navy (<Swatch hex="#005D8F" />
            #005D8F, primary/500) is used only for actions and selection. Cool slate neutrals (surface/50 to 950)
            separate areas by tone and light 1 px borders instead of heavy lines, which keeps dense screens calm through
            a full working day.
          </>,
        ),
        lead(
          "Verified contrast",
          "White on primary reaches 7.09:1 (WCAG AAA). After an audit I moved danger text to red/800 (4.43 → 5.99:1), so every status tag passes AA. The timeline’s Today marker reaches 14.63:1.",
        ),
        lead(
          "Colour is never alone",
          "Every state has a text label, and risks add a warning icon, so status reads without colour - for colour-blind users and in Dark mode.",
        ),
        lead(
          "Three-tier tokens",
          "Primitive → semantic → component tokens map 1:1 to PrimeNG’s Aura preset. Screens use only semantic and component tokens, so components need no custom CSS overrides and the switch between Light and Dark mode happens in one place.",
        ),
      ],
      media: [
        {
          ...shot("brand-primary-actions"),
          frameless: true,
          alt: "Brand primary tokens for interactive actions: primary #005D8F, hover, active, contrast and subtle, each with its token name, hex value, contrast ratio and AAA badge.",
          title: "Brand primary - interactive actions",
        },
        {
          ...shot("semantic-status-tags"),
          frameless: true,
          alt: "Semantic status tokens: Approved, At risk, Rejected, Sent and Not started tags with their contrast ratios, and decorative green, orange, red and neutral accents for bars and markers.",
          title: "Semantic status - tags and indicators",
        },
      ],
    },
    {
      id: "planning-calendar",
      eyebrow: "Calendar Architecture",
      title: "Scheduling and Time Logging in One Calendar",
      lead: "People plan, attend and log time without switching context.",
      bullets: [
        lead(
          "Weekly timetable",
          "A 7-day grid shows every meeting across projects. A Participant / Organizer switch separates the meetings you run from the ones you only attend.",
        ),
        lead(
          "Context on the left",
          "A mini-calendar, a project filter and the selected day’s meeting list let people jump to any date without losing the grid.",
        ),
        lead(
          "Current-time line",
          "A line across today’s column marks the current time, so people stay oriented during a busy day.",
        ),
        lead(
          "Log time in place",
          "Clicking a day header opens a side drawer with that day’s work-time entries and their source (stopwatch, manual or from a report), where people add, edit or delete entries.",
        ),
        lead(
          "Meeting cost",
          "A separate Meetings page lists synced meetings with their cost: duration × attendees × each attendee’s department average hourly rate.",
        ),
      ],
      media: [
        {
          ...shot("calendar-week-view"),
          alt: "Month overview in week view: a Participant and Organizer switch, a project filter, a mini calendar with meeting counts, the selected day’s meetings and a weekly grid of meetings with a current-time line.",
          title: "Month overview - week view",
        },
      ],
    },
    {
      id: "planning-roadmap",
      eyebrow: "Project Roadmap & Goal Hierarchy",
      title: "Goals & Milestones Timeline (Proposal)",
      lead: "A proposed view that answers “are we on track?” for every goal in a project. Its goal-tracking logic is new, so it waits for the client’s sign-off.",
      bullets: [
        lead(
          "Two layers, one row",
          "On the left, an expandable tree of goals, key results and milestones with owner and status. On the right, a Gantt-style timeline aligned row by row.",
        ),
        lead(
          "Actual vs expected",
          "Each bar shows actual progress against the expected pace at today (linear from goal start to target date). A goal is at risk when it trails that pace by 10 percentage points or more.",
        ),
        lead(
          "Flexible scale",
          "Weeks, Months or Quarters, a Today button and a neutral Today marker with 14.63:1 contrast.",
        ),
        lead(
          "Risks with a reason",
          "Milestones show as diamonds with dependencies. An at-risk milestone opens a popover with the blocker, the delay and who reported it.",
        ),
        lead(
          "Details without leaving",
          "Clicking a row opens a goal drawer (Details, Updates, Logged time, Comments) while the timeline stays visible. Owners log progress in a dialog that validates the value as they type.",
        ),
      ],
      media: [
        {
          ...shot("goals-milestones-timeline"),
          alt: "Goals and milestones timeline: a tree of goals, key results and milestones with owners and status tags beside a Gantt chart with progress bars, milestone diamonds, dependencies, a Today marker and an at-risk popover.",
          title: "Goals & milestones timeline",
        },
      ],
    },
    {
      id: "planning-cockpits",
      eyebrow: "Dashboards, Budget Tracking & Team Policies",
      title: "From One Project’s Budget to the Whole Portfolio",
      lead: "Finance, delivery and the PMO look at the same numbers, at the level of detail they need.",
      bullets: [
        lead(
          "Portfolio KPIs",
          "The PMO dashboard opens with cards for active projects, labour cost, meeting cost, tasks, delayed and over-budget projects, compared with the previous period.",
        ),
        lead(
          "Budget burn in the table",
          "Budget-used bars sit in each project row next to logged time and meeting cost. Budgets over 100% and overdue end dates are highlighted.",
        ),
        lead(
          "Organisation cost breakdown",
          "A drill-down sunburst (portfolio → project → goal) with a table of cost, share and difference against plan.",
        ),
        lead(
          "Healthy meeting rules",
          "Each department sets a maximum meeting duration, a maximum number of attendees and whether weekly work reports are required. A proposed approval flow lets managers approve or reject reports, with a reason for a rejection.",
        ),
      ],
      media: [
        {
          ...shot("cost-distribution"),
          alt: "Cost distribution: a drill-down sunburst chart beside a table of programmes with cost in PLN, share and difference against plan.",
          title: "PMO - cost distribution",
        },
        {
          ...shot("projects-budget-table"),
          alt: "Projects table with search and filters: main projects and sub-projects with type and status tags, budget used bars in blue, orange and red, logged time, meeting cost and end dates.",
          title: "Projects - budget burn table",
        },
      ],
    },
  ],
  sections: [],
  impact: {
    id: "planning-outcomes",
    eyebrow: "Design Outcomes",
    title: "What the Design System Delivers",
    stats: [
      {
        value: "Light and Dark mode",
        label:
          "One token collection for both modes: the same screens and components switch mode through token values instead of being redrawn.",
      },
      {
        value: "AA+",
        label: "Every status tag pair passes WCAG AA in Light and Dark mode; primary actions reach AAA (7.09:1).",
      },
    ],
    bullets: [
      lead("Mentoring", "Guided a UX intern through design tokens, design-to-dev handoff and component documentation."),
      lead(
        "Density without noise",
        "Dense tables separate rows with tonal surfaces and 1 px light lines instead of heavy borders, and status is never shown by colour alone.",
      ),
    ],
  },
  // The app's wordmark in this file and in the thumbnail and calendar screenshots may be shown (Karolina,
  // 2026-10-30); the name itself stays out of the text.
  designFile: {
    url: "https://www.figma.com/design/9MsNHhhfzYQ7WKvtF9Tyfq/Planning---Cost-Management-Platform?node-id=74-349&t=TUiC9h9fuFMWG88F-1",
    title: "Inspect the Design Files",
    body: "The Figma file holds the design system and tokens, the core desktop screens checked in Light and Dark mode, and the components with their variants. Open it to look at spacing, states and specs up close.",
    linkLabel: "Explore the Figma File",
  },
  // Third case in the Work order (Smart Ticket → Automotive → Project Planning → Data Governance).
  prev: { view: VIEW.caseAutomotive },
  next: { view: VIEW.caseDataGovernance },
};
