import type { ThemingCaseStudy } from "#features/case-studies/case-studies.types.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { lead } from "#shared/ui/lead/lead.tsx";

/* Case study - Enterprise White-Label Theme Generator (Data Governance). One product name everywhere: Work card, H1, SEO name, next links. Screenshot fields: see ShowcaseCard in case-studies.types.ts. */
export const THEMING_CASE: ThemingCaseStudy = {
  view: VIEW.caseTheming,
  id: "case",
  shortTitle: "Data Governance",
  eyebrow: ["Enterprise Systems", "Multi-Tenant Architecture & Accessibility"],
  title: "Enterprise White-Label Theme Generator: Balancing Custom Branding with Strict WCAG 2.1 AA Accessibility",
  meta: [
    { label: "My role", value: "UX/UI Designer" },
    {
      label: "Team",
      value:
        "1 Lead Designer, 1 Senior UX Designer, 1 UX/UI Designer (myself), Product Owners, QA Engineers, Frontend & Backend Engineering Team",
    },
    { label: "Duration", value: "October 2020 - December 2022 (2 years 2 months)" },
    { label: "Domain", value: "Multi-Tenant Enterprise / Healthcare / Federal Institutions" },
    {
      label: "Key Outcome",
      wide: true,
      value:
        "Automated accessible theme generation for multi-tenant deployments, ensuring WCAG 2.1 AA compliance across white-label customer themes and cutting theme setup time from days to minutes.",
    },
  ],
  notice: {
    tone: "warning",
    label: "Confidentiality note",
    text: "Client branding, proprietary datasets, and organization names have been anonymized under NDA. The workflows, rules, and interface patterns below represent the actual white-label architecture delivered for production.",
  },
  summaryTitle: "Executive Summary & Context",
  summary: [
    "The platform is an enterprise data governance tool deployed across multi-tenant environments, including healthcare organizations and public sector agencies.",
    "To support institutional white-labeling, executive management initially proposed an open color picker allowing administrators to freely rebrand the user interface. However, unrestricted customization posed a severe usability risk: non-designer admins could unintentionally choose low-contrast color combinations, making dense data views unreadable and violating mandatory accessibility requirements (WCAG 2.1 AA).",
  ],
  assumption:
    "Give client administrators complete freedom to apply their corporate brand colors to any interface component.",
  reality: [
    lead(
      "High risk of human error",
      "Untrained admins pairing light text with pastel buttons or dark cards on dark backgrounds.",
    ),
    lead(
      "Accessibility compliance failures",
      "Failing mandatory WCAG 2.1 AA contrast requirements (4.5:1 for body text, 3:1 for graphical elements).",
    ),
    lead(
      "Illegible critical data",
      "Low-contrast palettes making system status badges, table data, and interactive actions difficult to read for everyday users.",
    ),
  ],
  solutionIntro:
    "To prevent unrestricted branding from breaking usability, I designed a governed theming workflow. We gave client administrators control over key brand touchpoints, while embedding clear WCAG 2.1 AA guardrails, luminance rules, and validation checks to protect readability across enterprise workflows.",
  solution: [
    {
      id: "surfaces",
      asset: "cases/data-governance/solution-scoped-theming-v2.webp",
      alt: "Edit Theme modal with header bar, logo and colour fields, and an inline tooltip warning that the Take Action button must stay visible against the navigation bar.",
      title: "Configurable Surfaces & Inline Guidance",
      intro: "A focused modal letting administrators rebrand key touchpoints while preserving data readability.",
      bullets: [
        lead(
          "Scoped Brand Surfaces",
          "Limited customization to high-impact touchpoints - such as the Header Bar, Action Buttons, and Navigation Sidebar - keeping data-dense tables and canvas areas neutral.",
        ),
        lead(
          "Contextual Guidance",
          "Added inline tooltips and live previews within the modal, explaining how color choices impact usability during heavy daily workflows.",
        ),
        lead(
          "Structured Theming Modal",
          "Designed an intuitive editing dialog with clear field groupings, reducing setup errors for non-technical administrators.",
        ),
      ],
    },
    {
      id: "contrast",
      asset: "cases/data-governance/solution-contrast-inversion.webp",
      alt: "Button state matrix in four brand colours with hover, active and disabled overlays, and navigation bars using white or black opacity overlays.",
      title: "Automated Component States via Opacity Rules",
      intro:
        "A simple system rule for developers so administrators only pick one base color, while interactive states are generated automatically.",
      bullets: [
        lead(
          "No Manual State Tuning",
          "Instead of forcing admins to pick separate colors for hover, active, and disabled states, the system applies fixed dark or light transparency layers over their base brand color.",
        ),
        lead(
          "Adaptive Icon and Text Contrast",
          "Icons and labels automatically switch to light or dark variants based on the background luminance to keep visual contrast as high as possible.",
        ),
        lead(
          "Standardized Dev Handoff",
          "Documented exact overlay values (+30% black for hover, +30% white for active, and +60% white for disabled) so engineers could build consistent interactions across components.",
        ),
      ],
    },
    {
      id: "states",
      asset: "cases/data-governance/solution-opacity-states.webp",
      alt: "Sidebar and data table examples showing selected states at full accent colour, 35% opacity, and colour plus 8% black.",
      title: "Sidebar and Table Selection Rules",
      intro: "Extending the same overlay logic to navigation drawers and dense data tables.",
      bullets: [
        lead(
          "Subtle Row Selection",
          "Highlighted table rows and active sidebar items use a soft tint (35% opacity) of the admin's chosen color, keeping dense records legible.",
        ),
        lead(
          "Icon and State Consistency",
          "Icons and selection indicators adapt their tone alongside the background, ensuring active items stay distinct without clashing.",
        ),
        lead(
          "Predictable UI Behavior",
          "Applying a single opacity standard across all components prevented custom styling bugs and saved significant development time.",
        ),
      ],
    },
    {
      id: "cvd-matrix",
      asset: "cases/data-governance/solution-cvd-matrix-v2.webp",
      alt: "Grid of three themes - purple, red and blue - each previewed under normal vision, tritanopia, protanopia and deuteranopia.",
      title: "Advocating for Accessibility in Team Reviews",
      intro:
        "A visual comparison matrix I presented during a team meeting to demonstrate why color guardrails were critical for real users.",
      bullets: [
        lead(
          "Demonstrating Real Usability Risks",
          "Prepared side-by-side screens showing how custom brand themes (such as bold red) create visual confusion under Protanopia, Deuteranopia, and Tritanopia.",
        ),
        lead(
          "Highlighting Broken Interactions",
          "Showed the team that without safeguards, primary buttons could look disabled or unclickable, while urgent alerts stopped standing out.",
        ),
        lead(
          "Aligning the Team on Accessibility",
          "Used this practical comparison to convince stakeholders and developers that we needed built-in contrast rules, not an unconstrained color picker.",
        ),
      ],
    },
    {
      id: "global-views",
      asset: "cases/data-governance/solution-cvd-normal-vs-tritanopia-v2.webp",
      alt: "Two Information panels side by side: the current theme's accessibility preview under normal vision and under tritanopia.",
      title: "Side-Panel Accessibility Preview (Phase 2 Concept)",
      intro:
        "A proposed preview in the side panel to help administrators see the impact of their color choices on readability.",
      bullets: [
        lead(
          "Accessibility Tab in Side Panel",
          "Added an 'Accessibility' tab to the settings drawer so admins could quickly check how themes look under color blindness filters.",
        ),
        lead(
          "Showing Real Usability Issues",
          "Designed simple preview cards to show admins that low-contrast colors make text and buttons hard to read for other users.",
        ),
        lead(
          "Moved to Phase 2",
          "To launch the MVP on time with core validation rules, we saved this interactive preview for the next product release.",
        ),
      ],
    },
  ],
  safetyIntro:
    "Changing visual themes in an enterprise multi-tenant tool directly affects active users across organizations. To prevent critical mistakes and broken layouts, I designed three clear safety mechanisms into the publishing workflow.",
  safety: [
    {
      id: "immutability",
      asset: "cases/data-governance/safety-base-immutability-v2.webp",
      alt: "Branding page listing the default theme as current, with Duplicate as the only action in its menu.",
      title: "Protecting the Default System Theme",
      intro: "Preventing critical system errors by locking the baseline theme.",
      bullets: [
        lead(
          "No Deleting the Default Theme",
          "The core system theme cannot be edited or deleted, ensuring the application always has a stable, accessible fallback.",
        ),
        lead(
          "Duplicate to Customize",
          "Admins create new themes by duplicating an existing one, making it easy to test changes without risking the baseline setup.",
        ),
      ],
    },
    {
      id: "session-warning",
      asset: "cases/data-governance/safety-session-warning-modal-v2.webp",
      alt: "Set as Current Theme confirmation dialog explaining that logged-in users will see the new theme when they refresh.",
      title: "Clear Warnings Before Applying Changes",
      intro: "Explaining the immediate impact of publishing a theme to active users.",
      bullets: [
        lead(
          "Explicit Confirmation Modal",
          "Designed a confirmation step before activating a theme, clearly stating that changes apply to all tenant users on their next page refresh.",
        ),
        lead(
          "Reducing Accidental Publishing",
          "Prevents administrators from unintentionally altering the live interface during working hours without prior notice.",
        ),
      ],
    },
    {
      id: "css-sandbox",
      asset: "cases/data-governance/safety-css-sandbox-disclaimer-v2.webp",
      alt: "CSS Customization panel with a warning that overrides can break with monthly releases and require regression testing.",
      title: "Optional CSS Field with Maintenance Warnings",
      intro: "Keeping custom CSS as a secondary fallback for technical teams, not the primary tool.",
      bullets: [
        lead(
          "Secondary Add-on",
          "Provided an optional CSS code box for edge-case styling needs, moving it below the visual controls so users don't rely on raw code.",
        ),
        lead(
          "Clear Warning Notice",
          "Added an inline warning explaining that custom CSS rules could break layouts during monthly platform updates and require ongoing maintenance.",
        ),
      ],
    },
  ],
  deliveryIntro:
    "To launch quickly while keeping enterprise standards high, our team prioritized core functionality for the MVP and moved advanced educational tools to the next release.",
  delivery: [
    {
      title: "Self-Service Theming Shipped (MVP)",
      body: "Launched the administrative customizer, allowing enterprise clients to rebrand key portal areas on their own without filing custom engineering tickets.",
    },
    {
      title: "Automated Contrast & State Rules Live (MVP)",
      body: "Integrated baseline WCAG 2.1 AA rules, automatic text-color inversion, and standardized opacity layers to ensure components remained accessible by default.",
    },
    {
      title: "Publishing Safeguards in Production (MVP)",
      body: "Implemented UX safeguards to prevent critical errors: the default system theme remained locked, and a confirmation step warned admins before applying changes to active users.",
    },
    {
      title: "Side-Panel Accessibility Preview",
      badge: "Roadmap",
      body: "While design validation rules launched in the MVP, the interactive side-panel tab simulating color blindness was documented as a Phase 2 feature for future sprints.",
    },
  ],
  engineeringIntro:
    "Since this project was designed in Adobe XD before native design token plugins were widespread, maintaining consistency required clear and simple handoff documentation.",
  engineering: [
    {
      title: "Clear Opacity Rules Over Endless Hex Codes",
      body: "Provided a simple opacity reference (+30% black / +35% white for hover/active states; 35% accent opacity for table rows), avoiding the need to manually define hundreds of individual hex codes.",
    },
    {
      title: "Collaborative Implementation",
      body: "Worked closely with frontend developers so they could turn these opacity rules into a shared styling helper, keeping component behavior consistent across any client palette.",
    },
  ],
  takeaways: [
    {
      title: "Guardrails Protect Real Usability",
      body: "In enterprise tools, unlimited user freedom often leads to broken interfaces. Designing sensible boundaries - like locking core text contrast and restricting brand customization to key areas - protects legibility without frustrating administrators.",
    },
    {
      title: "Designing for High-Impact Mistakes",
      body: "When an administrative change affects hundreds of daily users, UX safety is essential. Adding confirmation warnings and locking the default system theme prevented critical mistakes while keeping the configuration workflow straightforward.",
    },
  ],
  // Last case in the Work order (Automotive → Project Planning → Data Governance).
  prev: { view: VIEW.caseProjectPlanning, label: "Enterprise Project Planning & Cost Management Platform" },
  next: { view: VIEW.work, action: "Back to All Work" },
};
