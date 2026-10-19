import { VIEW } from "#shared/lib/routes.ts";
import { Lang, Strong, Swatch } from "#shared/ui/text.tsx";

import type { CaseStudy } from "./case-studies.types.ts";

/* Case study - Project Planning (Project Planning & Cost Management). Screenshot fields: see ShowcaseCard in case-studies.types.ts. */
export const PROJECT_PLANNING_CASE: CaseStudy = {
  view: VIEW.caseProjectPlanning,
  id: "me",
  shortTitle: "Project Planning",
  eyebrow: ["B2B SaaS", "Design System & Web Application"],
  title: "Enterprise Project Planning & Cost Management Platform",
  meta: [
    { label: "My Role", value: "Senior UX / Product Designer (Design Systems & Mentorship Lead)" },
    {
      label: "Team",
      value:
        "Senior UX Designer (myself), 1 UX Intern (mentorship), Project Managers, Frontend & Backend Engineering Team",
    },
    { label: "Timeline", value: "2023 - Present (Initial rollout & ongoing product evolution)" },
    { label: "Platform", value: "Web App (Desktop only, PrimeNG)" },
    {
      label: "Key Outcome",
      wide: true,
      value:
        "Designed an integrated planning tool and meeting cost tracker, replacing scattered spreadsheets with clear budget and team allocation views across concurrent projects.",
    },
  ],
  notice: {
    tone: "info",
    label: "Permission & localization note",
    text: "All branding, logos, and interface visuals are shared publicly with direct permission from the product leadership team. Screens reflect the live enterprise deployment for Polish teams (PLN formatting, domestic regulations). The underlying PrimeNG component library and layout grids were structured to scale across multiple languages and currencies.",
  },
  summaryTitle: "Executive Summary & Problem Space",
  summary: [
    "Managing software project budgets often breaks down in daily operations. While managers track high-level numbers in spreadsheets, team hours quietly get lost in untracked meetings and misaligned task estimates, leading to sudden budget overruns.",
    "The product was built as a focused web platform to solve this by connecting project planning directly with real-time meeting cost tracking. As the Senior UX Designer, I led the end-to-end interface design using the PrimeNG component system - simplifying resource scheduling, structuring clear budget dashboards, and mentoring a UX intern while collaborating closely with project managers and developers.",
  ],
  sections: [
    {
      id: "me-foundations",
      title: "Technical Foundation: Adopting PrimeNG & Semantic Tokens",
      intro: [
        "The initial prototype suffered from outdated legacy charting and fragmented UI patterns that were difficult to maintain. After aligning with product owners on required features and consulting with developers on delivery speed, we chose PrimeNG as our core front-end framework.",
        "To ensure design consistency and prevent engineering bottlenecks, I customized PrimeNG's foundation first: defining our tokenized color architecture, interactive states, and accessibility standards before designing the complex scheduling and budget workflows.",
      ],
      cards: [
        {
          id: "tokens",
          asset: "cases/project-planning/color-tokens-primeng.webp",
          alt: "Two token tables: the navyblue primitive scale from 50 to 950 with hex values, and the primary scale mapping each step to its navyblue primitive.",
          title: "Primary Palette & Token Aliasing",
          intro: (
            <>
              The core interface is anchored around navy blue (<Swatch hex="#005D8F" />
              #005D8F, primary.500), selected to provide high contrast and clear readability on dense data screens.
            </>
          ),
          bullets: [
            <>
              <Strong>11-Step Primary Ramp:</Strong> Defined a full ramp (primary.50 to primary.950) to support subtle
              container backgrounds, borders, and interactive states (hover, focus, active).
            </>,
            <>
              <Strong>Reduced Eye Strain:</Strong> Chose a balanced, muted navy instead of oversaturated blue tones to
              keep long daily scheduling sessions comfortable.
            </>,
            <>
              <Strong>PrimeNG Semantic Tokens:</Strong> Mapped raw primitive tokens (navyblue) to semantic aliases
              (primary), allowing engineering to manage colors centrally in Angular theme files.
            </>,
          ],
        },
        {
          id: "contrast",
          asset: "cases/project-planning/02-accessibility-contrast-checker.webp",
          alt: "WCAG 2.1 contrast checker showing white text on #005D8F with a 7.09 contrast ratio, passing AA and AAA for normal and large text.",
          title: "Accessibility: WCAG AAA Contrast Verification",
          intro:
            "To ensure comfortable reading on both low-contrast monitors and bright office displays, the primary interface color was tested against strict WCAG standards.",
          bullets: [
            <>
              <Strong>Verified Contrast Ratio:</Strong> White text (#FFFFFF) on the #005D8F primary surface achieves a
              7.09:1 contrast ratio.
            </>,
            <>
              <Strong>Full AAA Compliance:</Strong> Passes the strict WCAG AAA threshold (7.0:1) for body text, primary
              button labels, and navigation elements.
            </>,
            <>
              <Strong>Visual Hierarchy:</Strong> Gives primary actions an unambiguous visual weight without causing eye
              strain during all-day administrative tasks.
            </>,
          ],
        },
      ],
    },
    {
      id: "me-calendar",
      title: "Calendar Architecture: Structuring the Scheduling Workspace",
      intro:
        "During initial discovery, product owners needed a centralized calendar to make meeting planning and cost tracking practical. I took this high-level idea and structured the complete desktop interface - designing flexible weekly and daily views along with an interactive mini-calendar navigation system for the PrimeNG implementation.",
      cards: [
        {
          id: "week-grid",
          asset: "cases/project-planning/03-calendar-weekly-grid-roles.webp",
          alt: "Month overview with a participant/organizer toggle, project filter, mini month calendar and a weekly schedule grid of meetings.",
          title: "Weekly Timeline & Role Perspectives",
          intro:
            "A high-level weekly schedule grid designed to help managers balance workloads across projects without visual clutter.",
          bullets: [
            <>
              <Strong>Weekly Schedule Grid:</Strong> Structured clear 7-day columns and hourly slots, giving managers an
              instant overview of recurring meetings and available team focus time.
            </>,
            <>
              <Strong>Role Perspective Toggles:</Strong> Added intuitive view filters (Participant vs. Organizer / '
              <Lang lang="pl">Uczestnik</Lang>' vs. '<Lang lang="pl">Organizator</Lang>') so users can separate sessions
              they host from those they simply attend.
            </>,
            <>
              <Strong>Consistent PrimeNG Styling:</Strong> Standardized card paddings, borders, and typography so
              frontend developers could build the responsive grid using standard PrimeNG components.
            </>,
          ],
        },
        {
          id: "day-view",
          asset: "cases/project-planning/04-calendar-faceted-filter-density.webp",
          alt: "Calendar in day view with a collapsed icon sidebar, the selected date highlighted in the mini calendar and its meetings listed inline.",
          title: "Daily Detail View & Mini-Calendar Navigation",
          intro:
            "A granular daily breakdown paired with a persistent side panel for fast date jumping and project isolation.",
          bullets: [
            <>
              <Strong>Day View Granularity:</Strong> Allowed users to switch easily into a focused single-day view,
              showing exact meeting intervals and overlap warnings.
            </>,
            <>
              <Strong>Interactive Mini-Calendar:</Strong> Integrated a persistent monthly calendar on the left with
              meeting count indicators, enabling one-click navigation across dates without reloading the page.
            </>,
            <>
              <Strong>Project-Specific Filtering:</Strong> Added a prominent project dropdown filter so leads can
              isolate commitments tied to specific client contracts.
            </>,
            <>
              <Strong>Developer-Ready Specifications:</Strong> Provided detailed layout specs, spacing, and interaction
              states, removing guesswork for the engineering team during implementation.
            </>,
          ],
        },
      ],
    },
    {
      id: "me-cockpits",
      title: "Project Dashboards & Budget Tracking Tables",
      intro:
        "Dense operational data quickly becomes overwhelming without a clear hierarchy. I organized the analytics workspace into two connected layers: high-level meeting habit KPIs up top, and an actionable project table below that highlights budget risks at a glance.",
      cards: [
        {
          id: "kpis",
          asset: "cases/project-planning/05-telemetry-kpi-sparklines.webp",
          alt: "Seven meeting KPI cards, each with a percentage or cost value, a coloured trend sparkline and the change versus the previous period.",
          title: "Meeting Health Metrics & Trend Sparklines",
          intro: "Summary KPI cards showing scheduling discipline, team habits, and meeting delay costs.",
          bullets: [
            <>
              <Strong>Quick Trend Scanning:</Strong> Paired core percentages with directional sparklines and color-coded
              arrows, letting team leads spot velocity changes without digging through raw logs.
            </>,
            <>
              <Strong>Operational & Habit Metrics:</Strong> Surfaced key habit indicators such as break intervals ('
              <Lang lang="pl">Kultura przerw</Lang>'), agenda compliance ('
              <Lang lang="pl">Procent spotkań z agendą</Lang>'), and on-time starts directly alongside financial metrics
              ('<Lang lang="pl">Koszt opóźnień</Lang>' / Delay costs).
            </>,
            <>
              <Strong>Standardized KPI Cards:</Strong> Structured clean PrimeNG summary cards ('
              <Lang lang="pl">Szczegóły spotkań</Lang>' / Meeting Details) that keep essential health indicators easy to
              read during morning check-ins.
            </>,
          ],
        },
        {
          id: "portfolio-table",
          asset: "cases/project-planning/06-pmo-portfolio-data-tables.webp",
          alt: "Project list table with budget progress bars, time and cost deltas, meeting hours, task counts, team size and end dates with warning icons.",
          title: "Project Budget Table & Visual Progress Bars",
          intro:
            "A centralized portfolio table summarizing budget consumption, tracked hours, and delivery dates across active client streams.",
          bullets: [
            <>
              <Strong>Visual Budget Bars:</Strong> Embedded colored progress bars directly into the project table ('
              <Lang lang="pl">Lista projektów</Lang>'), giving managers an immediate visual alert for projects nearing
              or exceeding their budget limit.
            </>,
            <>
              <Strong>Scannable Data Hierarchy:</Strong> Applied strict table alignment rules - left-aligned project
              names and right-aligned numeric data (consumed hours, meeting counts, team size) for fast row-by-row
              comparisons.
            </>,
            <>
              <Strong>Status Flags & Deadlines:</Strong> Highlighted critical delivery dates ('
              <Lang lang="pl">Data Zakończenia</Lang>') with warning badges, helping managers spot schedule and budget
              risks early.
            </>,
          ],
        },
      ],
    },
    {
      id: "me-planning",
      title: "Project Roadmap & Goal Hierarchy",
      intro:
        "Accurate budget estimation requires breaking projects down into manageable milestones. Following an initial discovery workshop with stakeholders, we aligned on a familiar mental model - combining a structured goal hierarchy with an interactive timeline so managers could track project progress without steep learning curves.",
      cards: [
        {
          id: "workshop",
          asset: "cases/project-planning/07-discovery-workshop-miro-board.webp",
          alt: "Discovery workshop board with sticky notes grouped into Strategic Goals, Client Pain Points, UX Solutions and Technical Alignment.",
          title: "Discovery Workshop & Scope Alignment",
          intro:
            "A structured workshop mapping business pain points, UX solutions, and technical feasibility before opening Figma.",
          bullets: [
            <>
              <Strong>Identifying Core Friction:</Strong> Mapped project pain points with product owners and PMs,
              confirming that budget overruns were caused by disconnected task estimates and lack of milestone tracking.
            </>,
            <>
              <Strong>Structured Synthesis:</Strong> Categorized insights into Strategic Goals, Client Pain Points, UX
              Solutions, and Technical Alignment, ensuring every feature directly addressed a real problem.
            </>,
            <>
              <Strong>Familiar UX Patterns:</Strong> Decided to adopt proven mental models (Jira-style task trees and
              clean Gantt-style schedules), utilizing PrimeNG's TreeTable component to speed up delivery.
            </>,
          ],
        },
        {
          id: "roadmap",
          asset: "cases/project-planning/08-roadmap-gantt-goals-decomposition.webp",
          alt: "Project Goals tab: project list on the left, an expandable goals and tasks tree with status badges, and a Gantt timeline with a Today line and an overdue warning.",
          title: "Master-Detail Roadmap & Timeline View",
          intro: "A split-screen layout keeping project navigation on the left and interactive timelines on the right.",
          bullets: [
            <>
              <Strong>Master-Detail Layout:</Strong> Designed a persistent project sidebar on the left, letting managers
              switch between client streams without losing their workspace context.
            </>,
            <>
              <Strong>
                Goal & Task Hierarchy ('<Lang lang="pl">Cele</Lang>'):
              </Strong>{" "}
              Structured an expandable tree view under the Goals tab ('<Lang lang="pl">Cele</Lang>') that breaks
              top-level objectives into actionable phases and tasks with delivery deadlines.
            </>,
            <>
              <Strong>Interactive Schedule Grid:</Strong> Paired tasks with a clear timeline featuring a prominent
              'Today' indicator line and time scale toggles (Weeks, Months, Quarters / '
              <Lang lang="pl">Tygodnie, Miesiące, Kwartały</Lang>') for long-range planning.
            </>,
            <>
              <Strong>Delivery-Focused Design:</Strong> Delivered component specs to developers ensuring smooth handling
              of dates, progress indicators, and overdue milestone alerts.
            </>,
          ],
        },
      ],
    },
    {
      id: "me-operations",
      title: "Organization Settings & Project Budget Transparency",
      intro:
        "SaaS budgeting tools often fail when they ignore daily working habits or make hourly rate configuration tedious. I designed centralized administrative controls allowing companies to set reasonable meeting rules, track project spend breakdown, and manage employee rates without heavy operational friction.",
      cards: [
        {
          id: "hygiene",
          asset: "cases/project-planning/09-meeting-hygiene-break-culture.webp",
          alt: "HR panel Organization settings: focus blocks by weekday, standard working hours, agenda requirement, maximum participants and minimum break between meetings.",
          title: "Meeting Policies & Work-Life Balance Settings",
          intro:
            "A configuration panel where administrators define team-wide scheduling guidelines to prevent meeting overload.",
          bullets: [
            <>
              <Strong>Healthy Scheduling Rules:</Strong> Designed intuitive configuration controls in the HR Panel ('
              <Lang lang="pl">Panel HR</Lang>') for core policies, such as required 20-minute buffers between calls ('
              <Lang lang="pl">Minimalna przerwa między spotkaniami</Lang>') and protected focus blocks ('
              <Lang lang="pl">Bloki skupienia</Lang>').
            </>,
            <>
              <Strong>Agenda Requirements:</Strong> Added clear toggles to enforce meeting agendas ('
              <Lang lang="pl">Wymagania agendy</Lang>'), encouraging organizers to set discussion goals before booking
              team hours.
            </>,
            <>
              <Strong>
                Encouraging Better Habits ('<Lang lang="pl">Kultura przerw</Lang>'):
              </Strong>{" "}
              Focused on positive defaults rather than aggressive blocking modals, helping teams protect uninterrupted
              deep work organically.
            </>,
          ],
        },
        {
          id: "budget",
          asset: "cases/project-planning/10-project-budget-cost-telemetry.webp",
          alt: "Project details with an 84% budget bar, four cost KPI cards and a pie chart splitting costs into meetings, external costs and labor.",
          title: "Project Cost Breakdown & Spend Visibility",
          intro:
            "Detailed financial cards giving project managers clear visibility into where project budget is being consumed.",
          bullets: [
            <>
              <Strong>Budget Consumption Alerts:</Strong> Placed a prominent progress bar at the top of project details
              ('<Lang lang="pl">Szczegóły projektu</Lang>'), showing real-time budget usage (e.g., 84%) before reaching
              financial limits.
            </>,
            <>
              <Strong>Categorized Spend Distribution:</Strong> Designed a clean breakdown chart dividing total
              expenditure between internal meetings, external costs, and tracked delivery hours.
            </>,
            <>
              <Strong>Key Financial Metrics:</Strong> Grouped total budget, actual spend, and logged hours into
              scannable KPI summary cards formatted in local currency (PLN).
            </>,
          ],
        },
        {
          id: "rates",
          asset: "cases/project-planning/11-batch-rate-import-csv-tables.webp",
          alt: "Departments and Employees tables with hourly rates, department badges, role tags and CSV import and export buttons with tooltips.",
          title: "Hourly Rate Management & CSV Batch Updates",
          intro: "Streamlined administration tables to maintain department baselines and individual contributor rates.",
          bullets: [
            <>
              <Strong>Two-Tier Rate Tables:</Strong> Structured separate views for Departments ('
              <Lang lang="pl">Działy</Lang>') and individual Employees ('<Lang lang="pl">Pracownicy</Lang>'), making
              hourly rate adjustments easy to find and review.
            </>,
            <>
              <Strong>CSV Import & Export Actions:</Strong> Designed prominent bulk action buttons allowing controllers
              to upload or export rate sheets ('<Lang lang="pl">Pobierz dane / Importuj dane z pliku CSV</Lang>'),
              eliminating repetitive manual data entry.
            </>,
            <>
              <Strong>Department Filtering & Role Tags:</Strong> Included quick filters ('
              <Lang lang="pl">Wszystkie działy</Lang>') and role badges to keep large personnel listings manageable and
              error-free.
            </>,
          ],
        },
      ],
    },
  ],
  outcomesTitle: "Outcomes & Key Takeaways",
  outcomesIntro:
    "Delivering the platform transformed a fragmented planning process into a unified desktop tool, giving project managers transparent control over time and meeting expenditure.",
  outcomes: [
    {
      title: "Centralized Budget & Cost Visibility",
      body: "Replaced disconnected spreadsheets with an integrated schedule and cost calculator. Project managers gained immediate visibility into meeting expenses and budget burn rates during the planning stage, preventing surprises at monthly reconciliations.",
    },
    {
      title: "Accelerated Implementation via PrimeNG",
      body: "Customizing standard PrimeNG components rather than designing custom elements from scratch allowed the engineering team to build screens quickly and maintain consistent design patterns throughout the four-month timeline.",
    },
    {
      title: "Mentorship & Cross-Functional Handover",
      body: "Leading UI architecture while mentoring a junior UX intern proved the value of clear component guidelines. Detailed Figma specifications and token mapping enabled smooth handoffs to developers without back-and-forth communication bottlenecks.",
    },
  ],
  // Middle case in the Work order (Automotive → Project Planning → Data Governance).
  prev: { view: "case-automotive", label: "Automotive B2B Marketplace: Research-Backed Redesign" },
  next: { view: "case-theming", label: "Multi-Tenant Theme Customizer" },
};
