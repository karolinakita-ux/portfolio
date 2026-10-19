import type { CaseStudy } from "#features/case-studies/case-studies.types.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";

/* Case study - Automotive B2B Marketplace. Screenshot fields: see ShowcaseCard in case-studies.types.ts. */
export const AUTOMOTIVE_CASE: CaseStudy = {
  view: VIEW.caseAutomotive,
  id: "auto",
  shortTitle: "Automotive Marketplace",
  eyebrow: ["European Automotive B2B", "Discovery, Research & Product Strategy"],
  title: "Automotive B2B Marketplace: Research-Backed Redesign",
  meta: [
    { label: "My role", value: "Senior UX Designer" },
    { label: "Duration", value: "June 2025 - September 2026" },
    { label: "Domain", value: "Automotive B2B Marketplace & Fleet Remarketing" },
    {
      label: "Team",
      value:
        "Design Lead, 2 Senior UX Designers (my focus: buyer flows; peer designer: seller flows), UX Researcher (joined mid-project), Product & Engineering team",
    },
    {
      label: "Key Outcome",
      wide: true,
      value:
        "Redesigned core B2B transactional workflows across bidding, margin estimation, and checkout, resolving critical legacy usability blockers with comprehensive specifications for engineering.",
    },
  ],
  notice: {
    tone: "warning",
    label: "Confidentiality note",
    text: "Due to NDAs, client identifiers and proprietary business data have been anonymized. The workflows below illustrate the research synthesis, interaction flows, and wireframes delivered.",
  },
  summaryTitle: "Executive Summary & Problem Space",
  summary: [
    "The existing platform was outdated, riddled with UX issues, and suffered from confusing user communication, making daily dealer operations frustrating and inefficient.",
    "Working within the design team, I analyzed cross-market survey data, conducted user interviews, and ran a heuristic audit of the live platform. Focusing specifically on the buyer journey, I redesigned core transactional features - delivering fully styled UI mockups and detailed documentation to guide the engineering team through implementation.",
  ],
  sections: [
    {
      id: "auto-discovery",
      title: "User Research & Data Synthesis",
      intro:
        "To understand how dealers actually buy cars, I analyzed survey feedback from 6 European markets and ran in-depth interviews with local users.",
      cards: [
        {
          id: "survey",
          asset: "cases/automotive/research-surveymonkey-markets.webp",
          alt: "Survey data quality table: mandatory questions and answer length could not be tracked; regional coverage is complete at 87.5% (7 of 8 markets), with responses per country: Germany 231, France 96, Italy 87, Netherlands 66, Spain 35, Portugal 19, Poland 11.",
          title: "Multi-Market Survey Analysis",
          intro:
            "Analyzed quantitative feedback from dealers across Spain, France, Germany, Portugal, the UK, and Poland, mapping out common bottlenecks in vehicle search, filtering, and checkout.",
        },
        {
          id: "interviews",
          asset: "cases/automotive/qualitative-interviews-synthesis.webp",
          alt: "Franchise dealer research board for Poland: grouped quotes from dealer interviews, a table that turns each finding into a platform implication, and charts of preferred communication channels.",
          title: "1-on-1 Customer Interviews",
          intro:
            "Collaborated with the marketing team to prepare an interview guide and conducted 1-on-1 interviews with Polish dealers to uncover daily frustrations and real-world workflows.",
          blocks: [
            {
              title: "Actionable Findings",
              body: "Synthesized the quantitative and qualitative data into clear personas and journey maps, giving the product team a shared baseline for the redesign.",
            },
          ],
        },
      ],
    },
    {
      id: "auto-personas",
      title: "Personas & Usability Audit",
      intro:
        "Using survey data and interview insights, I built core user personas and audited the live platform to pinpoint where the interface was failing.",
      cards: [
        {
          id: "persona",
          asset: "cases/automotive/b2b-persona-dealer.webp",
          alt: "Service provider persona built from survey data: profile and goals, charts of respondent roles, business locations and vehicles bought per month, and lists of behaviour traits and priorities.",
          title: "B2B User Personas",
          intro:
            "Mapped out realistic personas based on actual dealer habits - contrasting high-volume independent dealerships with corporate fleet managers to account for different buying frequencies and volume needs.",
        },
        {
          id: "heuristics",
          asset: "cases/automotive/heuristic-evaluation-matrix.webp",
          alt: "Heuristic evaluation matrix detailing existing platform usability friction",
          title: "Heuristic Evaluation",
          intro:
            "Audited the live application against standard usability heuristics. Identified recurring usability blockers, including poor system feedback, misleading navigation labels, and buried critical actions.",
        },
        {
          id: "buy-in",
          asset: "cases/automotive/executive-stakeholder-presentation.webp",
          alt: "Audit summary slide for the heuristic Visibility of System Status: 8 problems (21.62% of all issues), 1 catastrophic and 7 major, with notes on missing feedback to the user.",
          title: "Prioritizing Improvements",
          intro:
            "Combined interview pain points with audit findings to prioritize fixes with product leadership, creating a clear roadmap for the redesigned core workflows.",
        },
      ],
    },
    {
      id: "auto-benchmarking",
      title: "Benchmarking & Transactional Workflows",
      intro:
        "Beyond vehicle listings and search, I focused on the transactional flow - bidding, checkout, delivery logistics, and financial tooling. Because purchasing directly required an active dealer account, I based our solutions on industry benchmarks, leading payment patterns, and established UX standards.",
      cards: [
        {
          id: "benchmark",
          asset: "cases/automotive/competitive-benchmarking-notes.webp",
          alt: "Benchmarking notes with best practices from OPENLANE, Volvo, AutoTrader, Copart, IAA and Bring a Trailer",
          title: "Checkout & B2B Purchase Benchmarking",
          intro:
            "Audited leading platforms to define best practices for B2B transactions. I analyzed vehicle status badges, transparent pricing breakdowns, and checkout flows, documenting proven patterns and common UX pitfalls to guide our architecture.",
        },
        {
          id: "workflows",
          asset: "cases/automotive/profit-estimator-flow.webp",
          alt: "Price Margin screen with a vehicle selector, acquisition, reconditioning and resale cost fields, a VAT scheme toggle, and a summary card showing net profit and ROI.",
          title: "Workflow Architecture & Financial Tools",
          intro:
            "Translated research into low-fidelity flows and wireframes. Collaborated closely with our UX Researcher and product team to balance business requirements with intuitive buyer steps, including post-bid logistics, invoices, and a dedicated Profit Estimator for margin calculations.",
        },
        {
          id: "hifi",
          asset: "cases/automotive/hifi-screens-documentation.webp",
          alt: "Four high-fidelity screens - basket, per-vehicle payment options, purchased vehicles and order details - each shown beside persona notes on how the screen supports that user.",
          title: "High-Fidelity UI & Feature Documentation",
          intro:
            "Delivered fully styled UI mockups paired with detailed feature documentation. Alongside core UI states and edge cases, I broke down the user psychology behind key decisions - explaining cognitive load and decision friction - while referencing industry benchmarks so developers understood the rationale behind each screen.",
        },
        {
          id: "badges-contrast",
          asset: "cases/automotive/wcag-contrast-audit.webp",
          alt: "WCAG AA and AAA contrast ratio verification matrix for B2B marketplace status badges",
          title: "Badge System & Contrast Compliance",
          intro:
            "Dense B2B listings rely heavily on status chips - such as deal ratings, auction status, and price drops. I organized the vehicle badge component library and tested foreground and background pairings against WCAG AA and AAA standards. This guaranteed fast visual scanning and high readability for dealers using low-contrast office or warehouse screens.",
        },
        {
          id: "prototype-qa",
          asset: "cases/automotive/prototype-audit-tracker.webp",
          alt: "Prototype audit table listing issues 22 to 29 with severity ratings, beside a write-up of issue 27, a split-payment checkout screen that does not update, with observation, severity and recommended fixes.",
          title: "AI Prototype QA & Heuristic Audit",
          intro:
            "Our Design Lead generated a static front-end prototype via Claude from the mockups. Before handing it over to users, I conducted an internal quality audit on the build to check that both the accessible UI components and the checkout flows worked as designed, cataloging 29 specific issues across UI consistency, WCAG compliance, and transaction logic (such as split-payment gaps and cart state errors). Resolving these flaws ensured our researcher tested a solid, functional flow rather than a buggy draft.",
        },
      ],
    },
    {
      id: "auto-delivery",
      title: "Usability Testing & Sprint Delivery",
      intro:
        "With the prototype stabilized and logic flaws resolved, our researcher validated the core workflows with UK dealers, and we handed the final specifications over to engineering.",
      cards: [
        {
          id: "usability",
          asset: "cases/automotive/usability-testing-findings.webp",
          alt: "Usability testing synthesis for 6 UK dealers: a validation matrix of tested flows, task completion of 91.6% against about 48% on the legacy portal, and SEQ scores for the profit estimator, cart and payment setup.",
          title: "Scenario-Based Usability Validation",
          intro:
            "Our dedicated UX Researcher ran 1:1 moderated usability sessions with UK B2B dealers using the updated prototype. Key transactional flows achieved a 91.6% task completion rate (up from ~48% on the legacy system) and a 5.8/7 Single Ease Question (SEQ) score on the Profit Estimator. Testing confirmed that upfront fee transparency and automated margin calculations eliminated the need for external spreadsheets.",
        },
        {
          id: "handoff",
          asset: "cases/automotive/dev-handoff-specs.webp",
          alt: "Vehicle price and action panel with Buy Now, bid and CAP valuation details, beside its specification: description, UX rationale and a field-by-field table explaining each price line.",
          title: "Technical Feasibility & Dev Handoff",
          intro:
            "Collaborated directly with engineering during sprint planning and backlog refinement. Alongside UI mockups, I documented clear UX rationales, component states, and exact VAT calculation rules for each vehicle action. This gave developers the business and psychological context behind every element, preventing costly edge-case misunderstandings during implementation.",
        },
      ],
      highlights: [
        {
          title: "Transactional Flow Integrity",
          body: "Resolved critical checkout loops and payment allocation gaps during prototype auditing, preventing costly refactoring during production engineering.",
        },
        {
          title: "Validated Dealer Workflows",
          body: "Moderated scenario testing confirmed that upfront delivery fees, margin calculations, and multi-vehicle carts solved the primary friction points of the legacy portal.",
        },
        {
          title: "Clear Technical Handoff",
          body: "Delivered component states paired with explicit UX rationales and tax calculation rules, giving developers unambiguous implementation specs.",
        },
      ],
    },
  ],
  reflections: {
    title: "Key Takeaways & Reflections",
    intro:
      "Designing complex B2B products comes down to managing business constraints and keeping delivery aligned with user realities. Moving beyond static layouts highlighted three core lessons:",
    points: [
      [
        "Clear Rationale Speeds Up Engineering",
        "Explaining the UX reasons behind interface elements early prevents misunderstandings during sprint delivery and saves time for developers.",
      ],
      [
        "Interactive Prototypes Catch Real Edge Cases",
        "Clicking through a working prototype reveals broken logic, missing states, and dead ends that are easy to miss in static Figma frames.",
      ],
      [
        "Predictability Drives User Trust",
        "In transactional platforms, clarity matters much more than visual novelty. Making daily core tasks simple creates far more value than adding secondary features.",
      ],
    ],
  },
  // First case in the Work order: left link returns to the list, right link continues to MeetEstim.
  prev: { view: VIEW.work, action: "Back to All Work" },
  next: {
    view: VIEW.caseMeetestim,
    action: "Next Case Study: MeetEstim",
    label: "Enterprise Project Planning & Cost Management Platform",
  },
};
