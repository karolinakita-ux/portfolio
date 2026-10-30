import type { CaseStudy } from "#features/case-studies/case-studies.types.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";

import { caseShots } from "./content.utils.ts";

/** Every Automotive screenshot has a Light and a Dark version. */
const { shot } = caseShots("automotive");

/* Case study - Automotive B2B Ecosystem. Screenshot fields: see ShowcaseCard in case-studies.types.ts. */
export const AUTOMOTIVE_CASE: CaseStudy = {
  view: VIEW.caseAutomotive,
  id: "auto",
  shortTitle: "Automotive Marketplace",
  eyebrow: ["European Automotive B2B", "Discovery, Research & Product Strategy"],
  title: "Automotive B2B Ecosystem: From Dealer Research Across Europe to a Validated Redesign",
  meta: [
    { label: "My role", value: "Senior UX Designer" },
    {
      label: "Team",
      value:
        "Team Leader (Design Lead), 2 Senior UX Designers (my focus: buyer flows; peer designer: seller flows), UX Researcher (joined mid-project), Product & Engineering team",
    },
    { label: "Timeline", value: "June 2025 - September 2026" },
    { label: "Domain", value: "Automotive B2B Marketplace & Fleet Remarketing" },
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
    text: "Client and competitor names, logos and vehicle identifiers have been anonymised (“Tradelane” is a fictional brand). Data, findings and workflows are shown as delivered.",
  },
  summaryTitle: "Overview & Problem",
  summary: [
    {
      body: "Dealers across Europe buy used cars on this trade platform every day, but it was hard to use. Navigation was outdated, the buying experience felt different in each market, and the product had no research or design standards behind it. Everyday tasks, such as buying several cars in one order, were slow and confusing.",
    },
    {
      body: "I worked on the problem from research to final design. I analysed 545 survey responses from dealers in 7 European markets, interviewed dealers 1:1 in their own language, and reviewed the live platform, finding 37 usability issues. Our Team Leader built a working prototype with Claude, and I audited it (29 findings). Our UX Researcher then tested it with UK dealers, who completed 91.6% of tasks. I translated the findings from both the research and my audit into refined designs in Figma, and every decision was documented in Figma specs and Confluence, ready for engineering.",
    },
  ],
  sections: [
    {
      id: "auto-discovery",
      title: "Research Across 7 European Markets",
      intro:
        "Before designing anything, I needed to understand how dealers buy across Europe. I started with the dealer survey and checked its data quality before drawing any conclusions.",
      cards: [
        {
          ...shot("multi-market-survey"),
          alt: "Data-quality audit of 545 dealer survey responses: a quality metrics table, responses by country with Germany the largest group, what the audit means for the findings, and a reading guide by sample size.",
          title: "Multi-Market Data Synthesis",
          intro:
            "Before trusting the survey, I checked its quality. 545 dealers answered from 7 of 8 target markets, but over 40% came from Germany, and Portugal and Poland had under 20 answers each. I treated those two as early signals, not facts, and followed up with 1:1 interviews in Poland. I also stated what the survey couldn’t measure, so the results weren’t over-read.",
        },
        {
          ...shot("qualitative-interviews"),
          alt: "What Polish dealers need from a trade platform: grouped interview quotes, a table linking each finding to a platform change and a priority, preferred contact channels and a synthesis note.",
          title: "1:1 Interviews in Polish",
          intro:
            "Poland’s survey sample was too small to rely on, so I interviewed Polish franchise dealers 1:1 in their own language. A guide prepared with marketing left room for open follow-ups, which surfaced 15 topics, from imports to fair listing ranking.",
          blocks: [
            {
              title: "Turning Findings into Priorities",
              body: "I linked each finding to a platform change and a priority: fix the basics first (complete car data, fair ranking, a mobile app version), then add growth features. The Product Owner called it the clearest research documentation they had seen.",
            },
          ],
        },
      ],
    },
    {
      id: "auto-personas",
      title: "Personas, Journeys & Usability Audit",
      intro:
        "With survey data and interview recordings in hand, I built personas, mapped the dealer journey and audited the live platform against Nielsen’s 10 usability heuristics.",
      cards: [
        {
          ...shot("b2b-persona"),
          alt: "Persona of Erica Martinez, Dealer Principal: profile, charts of roles and business locations, vehicles bought per month, preferred communication, behaviour traits, priorities and engagement channels.",
          title: "Personas Built from Survey Data",
          intro:
            "I grouped survey answers into dealer segments and turned each into a persona. Shown here is Erica, a Dealer Principal. Most dealers like her buy 1 - 10 cars a month (63%), half work from rural sites, and their top priorities are reliable logistics, better support and transparent costs. Those priorities carry through the later design work, such as the required transport step at checkout.",
        },
        {
          ...shot("journey-map"),
          alt: "Dealer Principal journey map on a vehicle page, from “is this car worth my time?” to after the sale: five stages with thoughts, actions, pain points and design opportunities, and the three platforms audited.",
          title: "Dealer Principal Journey Map",
          intro:
            "I mapped the Dealer Principal’s five steps on a vehicle page - what she thinks, does and struggles with - based on audits of three live platforms (UK, Australia, EU). Each pain point has a design opportunity; post-sale support is flagged for further research.",
        },
        {
          ...shot("heuristic-audit"),
          alt: "Where the 37 logged issues cluster: violations per Nielsen heuristic, led by visibility of system status (8) and aesthetic and minimalist design (7), with the audit method from evaluation to presentation.",
          title: "Usability Audit of the Live Platform",
          intro:
            "I reviewed the live platform against Nielsen’s 10 heuristics and logged 37 issues. Most fell into two groups: unclear system status (8 issues, 21.6%) and cluttered screens (7, 18.9%). This matched what dealers told me in interviews - the platform felt “poor, unintuitive, overloaded”.",
        },
        {
          ...shot("executive-buy-in"),
          alt: "Executive readout for visibility of system status: definition, problem summary, a severity profile of 1 catastrophic and 7 major problems, failure themes and the outcome, buy-in for a complete platform redesign.",
          title: "Making the Case to Leadership",
          intro:
            "I presented the research and audit to leadership one problem area at a time, rated by severity. For example, unclear system status covered 8 problems: 1 catastrophic and 7 major. Turning user frustration into clear evidence helped secure buy-in for a full redesign.",
        },
      ],
    },
    {
      id: "auto-benchmarking",
      title: "Benchmarking, Flows & Specifications",
      intro:
        "Before sketching layouts, I studied six leading automotive platforms to learn which patterns work on a vehicle page and which to avoid.",
      cards: [
        {
          ...shot("competitive-benchmark"),
          alt: "Benchmark of six anonymised automotive platforms: five proven vehicle-page patterns, each traced to the platforms that use it, what the benchmark showed and how it applies to our page.",
          title: "Competitive Benchmarking",
          intro:
            "I compared six anonymised platforms: wholesale remarketing, a manufacturer used-car site, retail classifieds and three types of auction. Five proven patterns made it into our vehicle page: clear navigation, sharing and export, grouped data, prominent buy buttons and in-context help.",
        },
        {
          ...shot("purchase-flow"),
          alt: "Swimlane flow from basket to a funded order across five lanes - dealer, platform, payments provider, customer support and logistics - including basket changes, transport and payment assignment.",
          title: "Purchase Flow for Multi-Car Orders",
          intro:
            "I mapped the full purchase flow across five roles: dealer, platform, payments, support and logistics. Dealers can build a basket of several cars and undo removals. Transport is a required step that fixes the invoice total, and each car can be paid differently - dealer finance, card or bank transfer. Checkout stays locked until every pound is assigned.",
        },
        {
          ...shot("wireframes-to-specs"),
          alt: "Level 4 specification of the price and action panel: an annotated panel for a 2021 hybrid SUV with net price, 20% VAT, damages and total, the page’s information levels and a field-by-field sign-off table.",
          title: "From Wireframes to Specifications",
          intro:
            "I reviewed low-fidelity layouts with product managers and engineers, then turned them into detailed specs. The vehicle page has seven levels of information (L0 to L6). Level 4, the price panel, shows net price, 20% VAT, damages and VAT status separately, each with a short rationale for sign-off.",
        },
        {
          ...shot("badge-system"),
          alt: "Vehicle status badge specification: four badge families (damage and risk, price and value, sales channel and offer type, demand and activity), display rules for cards and vehicle pages, and the priority order.",
          title: "Vehicle Status Badges",
          intro:
            "I defined four badge types in priority order: damage and risk, price and value, sales type, and demand. Cards show up to 3 badges and vehicle pages up to 5, so screens stay easy to scan. A badge seen on a card always appears on the vehicle page too.",
        },
        {
          ...shot("edge-case-filters"),
          alt: "The manufacturer filter in four states: a selected make never hides behind “Show more”, it moves into the short list, narrowing 123 vehicles to 25.",
          title: "Designing for Edge Cases",
          intro:
            "I also designed for situations that break the default layout. For example, if a dealer selects a car make hidden under “Show more”, it moves into the short list, so an active filter is never out of sight (123 → 25 results).",
        },
        {
          ...shot("contrast-audit"),
          alt: "Colour contrast audit: brand teal at 1.92:1 fails as text, the darkest teal reaches 4.59:1, a rule for thin elements, and six status chip colour pairs that all pass AA and AAA.",
          title: "Accessibility & Colour Contrast",
          intro:
            "I checked status labels, tables and buttons against WCAG 2.2 AA before handoff. The brand teal failed as text (1.92:1), so I set a rule: thin elements of 3 px or less use the darkest teal (4.59:1). All six status-label colour pairs pass AAA.",
        },
      ],
    },
    {
      id: "auto-prototype",
      title: "Auditing the Coded Prototype",
      intro:
        "Our Team Leader built the prototype in code, which let us test interactions early. Before it went in front of dealers, I audited it against our design tokens, usability heuristics and WCAG.",
      cards: [
        {
          ...shot("prototype-audit"),
          alt: "Prototype audit of 29 findings across three severity tiers: scope, target persona, the severity scale and an issue tracker listing each finding by area with its severity.",
          title: "29-Point Prototype Audit",
          intro:
            "I reviewed the coded prototype and logged 29 issues: 18 high severity (must be fixed before testing or release), 1 major and 10 medium. They ranged from cart logic errors to a button that failed colour contrast.",
        },
        {
          ...shot("state-management"),
          alt: "Cart and checkout states: switching an offer back to Buy Now, a split-payment balance that blocks the order until every vehicle is funded, reserved vehicles that offer a notification instead, and checkout edge cases.",
          title: "Making Every Action Reversible",
          intro:
            "Four high-severity issues involved cart and checkout logic. I redesigned them in Figma so a dealer can switch an offer back to Buy Now in one click, can’t pay until every car has a payment method, and can’t add a reserved car to the basket - they can ask to be notified instead.",
        },
      ],
    },
    {
      id: "auto-delivery",
      title: "Testing & Final Design",
      intro:
        "Our UX Researcher tested the coded prototype with UK dealers on real buying tasks. I then turned the research and audit findings into the final high-fidelity screens in Figma.",
      cards: [
        {
          ...shot("usability-validation"),
          alt: "Usability testing with UK dealers: 91.6% task completion, ease scores for the multi-vehicle cart, profit estimator and payment setup, a validation matrix of the tested flows and task highlights.",
          title: "Testing with UK Dealers",
          intro:
            "Six UK dealers completed 91.6% of tasks on the prototype, compared with about 48% on the old platform. Ease scores out of 7: multi-car basket 6.1, profit estimator 5.8, payment setup 5.4. Testing also exposed a split-payment logic gap, which I resolved in the Figma designs before release.",
        },
        {
          ...shot("final-basket-checkout"),
          alt: "Final UI for buying several vehicles: a basket that excludes a sold car and applies a bundle price, and a checkout that assigns one payment method per vehicle until nothing is left unassigned.",
          title: "Final Design: Basket & Checkout",
          intro:
            "If a car in the basket sells, it is flagged and removed from the total. Adding a third car unlocks a 5% bundle price. At checkout, each car can use its own payment method - card or dealer finance - and the order can’t be placed until the full amount is covered.",
        },
        {
          ...shot("final-pricing-profit"),
          alt: "Final UI for pricing and VAT: a vehicle page with net price, 20% VAT and total beside the bid panel, and a profit estimator that applies VAT only to the margin under the UK margin scheme.",
          title: "Final Design: Clear Pricing & Profit",
          intro:
            "The vehicle page shows net price, 20% VAT and VAT status next to the bidding panel. After purchase, a profit estimator works out resale profit under the UK margin scheme, where VAT is due only on the margin, and shows the break-even price.",
        },
      ],
    },
  ],
  reflections: {
    title: "Reflections - Driving the Product Process Beyond Visual Deliverables",
    intro:
      "This project showed me that good product design goes well beyond screens. The most valuable work happened between the steps: checking whether data could be trusted, auditing the prototype, and turning research and audit findings into design decisions before they reached engineering.",
    layout: "numbered",
    points: [
      [
        "Documentation that explains “why”",
        "Every key flow, edge case and state was recorded with its evidence - heuristic, benchmark or user need - so the team could see why each decision was made.",
      ],
      [
        "Working closely with engineering",
        "Regular syncs with front-end developers resolved edge cases and kept the design system consistent, so handoff stayed clear and the build matched the design.",
      ],
      [
        "Turning findings into refined designs",
        "My prototype audit and the UX Researcher’s sessions with six UK dealers (91.6% task completion) pointed to the same fixes, such as a split-payment logic gap, which I resolved in Figma before release, not after.",
      ],
    ],
  },
  // Second case in the Work order (Smart Ticket → Automotive → Project Planning → Data Governance).
  prev: { view: VIEW.caseSmartTicket, label: "Smart Ticket: Mobile Ticketing & Transit Operations" },
  next: { view: VIEW.caseProjectPlanning, label: "Enterprise Project Planning & Cost Management Platform" },
};
