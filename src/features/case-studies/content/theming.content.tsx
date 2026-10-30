import type { ShowcaseCard, ThemingCaseStudy } from "#features/case-studies/case-studies.types.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { lead } from "#shared/ui/lead/lead.tsx";

/** Every Data Governance screenshot has a Light and a Dark version: `<name>-light.webp` / `<name>-dark.webp`. */
const shot = (name: string): Pick<ShowcaseCard, "asset" | "darkAsset"> => ({
  asset: `cases/data-governance/${name}-light.webp`,
  darkAsset: `cases/data-governance/${name}-dark.webp`,
});

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
    text: "Client branding, proprietary datasets and organisation names have been anonymised under NDA (“Tallyst”, “Harbor Bank” and “Northwind Health” are fictional names). The screens are rebuilt with sample data and follow the white-label rules delivered for production; the colour-vision preview they show was designed for Phase 2.",
  },
  summaryTitle: "Executive Summary",
  summary: [
    {
      title: "The context",
      body: "The platform is an enterprise data governance tool deployed across multi-tenant environments, including healthcare organizations and public sector agencies.",
    },
    {
      title: "The problem",
      body: "To support institutional white-labeling, executive management initially proposed an open color picker allowing administrators to freely rebrand the user interface. However, unrestricted customization posed a severe usability risk: non-designer admins could unintentionally choose low-contrast color combinations, making dense data views unreadable and violating mandatory accessibility requirements (WCAG 2.1 AA).",
    },
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
      "Failing mandatory WCAG 2.1 AA contrast requirements (4.5:1 for body text, 3:1 for large text and interface components).",
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
      ...shot("theme-editor-header"),
      alt: "Theme editor for Harbor Bank on its Header bar section: logo and browser icon uploads, background, breadcrumb link and button colours with contrast ratings (AAA 12.3:1, AA 6.8:1, AAA 10.1:1), notes that text and labels are set automatically, and a live preview.",
      title: "Configurable Surfaces & Inline Guidance",
      intro: "A focused theme editor letting administrators rebrand key touchpoints while preserving data readability.",
      bullets: [
        lead(
          "Scoped Brand Surfaces",
          "Limited customization to a few named surfaces - the header bar, action buttons, navigation sidebar and table selection - while table text and canvas areas stay on neutral system colors.",
        ),
        lead(
          "Contextual Guidance",
          "Every color field shows its contrast rating and a short note on what it affects, and a live preview updates as admins edit, before anything reaches users.",
        ),
        lead(
          "Structured Theme Editor",
          "Grouped the settings into clear sections - General, Header bar, Navigation sidebar, Content & tables and Custom CSS - with drafts and autosave, reducing setup errors for non-technical administrators.",
        ),
      ],
    },
    {
      id: "contrast",
      ...shot("derived-states-buttons-nav"),
      alt: "State rules for four brand colours: each Create button in default, hover (+30% black), pressed (+30% white) and disabled (40% opacity) states with its label contrast ratio, and navigation tabs on dark and light backgrounds.",
      title: "Automated Component States from One Base Color",
      intro:
        "A simple system rule for developers: administrators pick one base color, and every interactive state is calculated from it.",
      bullets: [
        lead(
          "No Manual State Tuning",
          "Instead of asking admins for separate hover, pressed and disabled colors, the system mixes the base color: +30% black for hover, +30% white for pressed and 40% opacity for disabled.",
        ),
        lead(
          "Automatic Label Contrast",
          "Labels and icons switch between white and near-black (#12141A), whichever contrasts more with the background, so text stays readable on any brand color.",
        ),
        lead(
          "Navigation Tabs",
          "The selected tab lifts with +35% white on dark header backgrounds and deepens with +8% black on light ones.",
        ),
      ],
    },
    {
      id: "states",
      ...shot("derived-states-sidebar-table"),
      alt: "Selection rules for the navigation sidebar and data tables in two brand colours: selected at full colour, hover at 35% opacity, pressed with 8% black, and the four lines of CSS that apply them to any palette.",
      title: "Sidebar and Table Selection Rules",
      intro: "Extending the same logic to navigation drawers and dense data tables.",
      bullets: [
        lead(
          "Clear Selection States",
          "The active sidebar item and selected table row use the full chosen color, hover uses a 35% tint, and pressed adds 8% black, so dense records stay easy to scan.",
        ),
        lead(
          "Readable Text in Every State",
          "Text color is recalculated for each state, so a light or dark brand color never hides the row or item label.",
        ),
        lead(
          "One Reusable Function",
          "Engineers implement the rules once as a shared stylesheet function that works for any palette, instead of maintaining hundreds of hand-picked hex values.",
        ),
      ],
    },
    {
      id: "cvd-matrix",
      ...shot("color-vision-matrix"),
      alt: "Three themes - System Default, Northwind Health and Harbor Bank - each shown under typical vision, protanopia, deuteranopia and tritanopia, with a note that status colours always come with an icon and a text label.",
      title: "Advocating for Accessibility in Team Reviews",
      intro:
        "A visual comparison matrix I presented during a team meeting to demonstrate why color guardrails were critical for real users.",
      bullets: [
        lead(
          "Demonstrating Real Usability Risks",
          "Prepared side-by-side screens showing how custom brand themes, such as a bold red healthcare theme, change under Protanopia, Deuteranopia, and Tritanopia.",
        ),
        lead(
          "Highlighting Broken Interactions",
          "Showed the team that without safeguards, primary buttons could look disabled or unclickable, while urgent alerts stopped standing out.",
        ),
        lead(
          "Aligning the Team on Accessibility",
          "Used this practical comparison to convince stakeholders and developers that we needed built-in contrast rules, and status colors that always come with an icon and a text label, not an unconstrained color picker.",
        ),
      ],
    },
    {
      id: "global-views",
      ...shot("color-vision-preview"),
      alt: "Branding page with the Harbor Bank theme's Accessibility tab: typical vision and tritanopia previews side by side and four contrast checks that all pass.",
      title: "Color-Vision Accessibility Preview (Phase 2)",
      intro:
        "A designed preview in the theme's details panel to help administrators see the impact of their color choices before publishing.",
      bullets: [
        lead(
          "Accessibility Tab",
          "An 'Accessibility' tab lets admins switch the theme preview between typical vision, Protanopia, Deuteranopia and Tritanopia, next to the theme's contrast checks.",
        ),
        lead(
          "Showing Real Usability Issues",
          "Side-by-side previews show admins how colors that look distinct to them can blur together for other users.",
        ),
        lead(
          "Moved to Phase 2",
          "To launch the MVP on time with the core contrast rules, we saved this interactive preview for the next product release.",
        ),
      ],
    },
  ],
  safetyIntro:
    "Changing visual themes in an enterprise multi-tenant tool directly affects active users across organizations. To prevent critical mistakes and broken layouts, I designed three clear safety mechanisms into the publishing workflow.",
  safety: [
    {
      id: "immutability",
      ...shot("theme-library"),
      alt: "Branding page listing three themes; the locked System Default theme's menu offers Duplicate to customize and Export as JSON while Edit and Delete are locked, beside a read-only system theme note.",
      title: "Protecting the Default System Theme",
      intro: "Preventing critical system errors by locking the baseline theme.",
      bullets: [
        lead(
          "No Editing or Deleting the Default Theme",
          "The core system theme is read-only, ensuring the application always has a stable, accessible fallback.",
        ),
        lead(
          "Duplicate to Customize",
          "Admins create new themes by duplicating an existing one, making it easy to test changes without risking the baseline setup.",
        ),
      ],
    },
    {
      id: "session-warning",
      ...shot("publish-confirmation"),
      alt: "Publish confirmation for the Harbor Bank theme: a before and after preview, notes that signed-in people see it on their next refresh and everyone else at their next sign-in, and that System Default can be republished at any time.",
      title: "Clear Warnings Before Applying Changes",
      intro: "Explaining the immediate impact of publishing a theme to active users.",
      bullets: [
        lead(
          "Explicit Confirmation Step",
          "Before a theme goes live, a confirmation dialog shows the current and new theme side by side and states that signed-in users will see it on their next page refresh.",
        ),
        lead(
          "Reducing Accidental Publishing",
          "Prevents administrators from unintentionally altering the live interface during working hours without prior notice, and reminds them that the previous theme can be republished.",
        ),
      ],
    },
    {
      id: "css-sandbox",
      ...shot("theme-editor-custom-css"),
      alt: "Custom CSS section of the theme editor, marked Advanced: a warning that monthly releases can break overrides, a short overrides file with no syntax errors, and a checkbox confirming overrides will be re-tested after each release.",
      title: "Optional CSS Field with Maintenance Warnings",
      intro: "Keeping custom CSS as a secondary fallback for technical teams, not the primary tool.",
      bullets: [
        lead(
          "Secondary Add-on",
          "Placed the optional CSS editor last among the theme sections and marked it Advanced, so users rely on the visual controls first.",
        ),
        lead(
          "Clear Warning Notice",
          "An inline warning explains that custom CSS can break layouts during monthly platform updates, suggests requesting a layout change instead, and asks admins to confirm they will re-test after each release.",
        ),
      ],
    },
  ],
  deliveryIntro:
    "To launch quickly while keeping enterprise standards high, our team prioritized core functionality for the MVP and moved advanced educational tools to the next release.",
  delivery: [
    {
      title: "Self-Service Theming",
      status: { label: "Shipped · MVP", tone: "shipped" },
      wide: true,
      body: "Launched the administrative customizer, allowing enterprise clients to rebrand key portal areas on their own without filing custom engineering tickets.",
      visual: { kind: "tags", items: ["Enterprise", "Healthcare", "Public sector"] },
    },
    {
      title: "Automated Contrast & State Rules",
      status: { label: "Shipped · MVP", tone: "shipped" },
      body: "Integrated baseline WCAG 2.1 AA contrast checks, automatic label colors (white or near-black) and state colors calculated from one base color, so components stay accessible by default.",
      visual: {
        kind: "labels",
        items: [
          { text: "#FFFFFF", background: "#0B3D91", color: "#FFFFFF" },
          { text: "#12141A", background: "#F2B705", color: "#12141A" },
        ],
      },
    },
    {
      title: "Publishing Safeguards",
      status: { label: "Shipped · MVP", tone: "shipped" },
      body: "The default system theme stays locked, and a confirmation step warns admins before a new theme reaches active users.",
      visual: { kind: "checks", items: ["Locked system theme", "Duplicate to customize", "Publish confirmation"] },
    },
    {
      title: "Color-Vision Accessibility Preview",
      status: { label: "Phase 2 · Roadmap", tone: "roadmap" },
      wide: true,
      body: "While the contrast rules launched in the MVP, the interactive preview simulating color blindness was documented as a Phase 2 feature for future sprints.",
      visual: {
        kind: "phases",
        from: { label: "MVP", note: "Contrast & state rules" },
        to: { label: "Phase 2", note: "Color-vision preview" },
      },
    },
  ],
  engineeringIntro:
    "Since this project was designed in Adobe XD before native design token plugins were widespread, maintaining consistency required clear and simple handoff documentation.",
  engineering: [
    {
      title: "A Short Rule Set Instead of Endless Hex Codes",
      body: "Documented every state as a rule on the base color: +30% black for hover, +30% white for pressed and 40% opacity for disabled; the selected sidebar item or table row uses the full color, with a 35% tint on hover and +8% black when pressed; labels switch to white or near-black, whichever contrasts more.",
      visual: {
        kind: "swatches",
        items: [
          { label: "Base", rule: "base", color: "#0B3D91" },
          { label: "Hover", rule: "+30% #000", color: "color-mix(in srgb, #0B3D91, #000 30%)" },
          { label: "Pressed", rule: "+30% #FFF", color: "color-mix(in srgb, #0B3D91, #FFF 30%)" },
          { label: "Disabled", rule: "40% opacity", color: "rgb(11 61 145 / 0.4)" },
        ],
      },
    },
    {
      title: "Collaborative Implementation",
      body: "Worked closely with frontend developers so they could turn these rules into one shared stylesheet function, keeping component behavior consistent across any client palette.",
      visual: {
        kind: "code",
        label: "Selection rules as stylesheet variables",
        lines: [
          ["--selected", "var(--brand);"],
          ["--hover", "color-mix(in srgb, var(--brand) 35%, var(--surface));"],
          ["--pressed", "color-mix(in srgb, var(--brand), #000 8%);"],
          ["--on-brand", "contrast-pick(var(--brand), #FFF, #12141A);"],
        ],
      },
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
