import type { SmartTicketCaseStudy } from "#features/case-studies/case-studies.types.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { lead } from "#shared/ui/lead/lead.tsx";

import { caseShots } from "./content.utils.ts";

/*
 * Case study - Smart Ticket: mobile ticketing and transit operations. A 2022 client concept, rebuilt in 2026 as a
 * portfolio redesign. Section order and blocks follow Figma node 2716:4133 (Kita Branding file, page "Case · Smart
 * Ticket"); card tints, title sizes and spacing still differ from it, pending Karolina's decision. The copy is
 * checked against the Smart Ticket Figma file (designFile below), so it differs from that frame on purpose: the
 * frame keeps claims the file does not show. Every 2026 screen has a Light and a Dark version; the 2022 screens
 * and the Lock Screen exist in one version only. Screenshot fields: see ShowcaseCard in case-studies.types.ts.
 */
const { shot, singleShot } = caseShots("smart-ticket");

export const SMART_TICKET_CASE: SmartTicketCaseStudy = {
  view: VIEW.caseSmartTicket,
  id: "ticket",
  shortTitle: "Smart Ticket",
  eyebrow: ["Public Mobility", "B2C Mobile & B2B Operations", "Design System"],
  title: "Smart Ticket: Mobile Ticketing & Transit Operations",
  meta: [
    { label: "My role", value: "2022 - 23: Product Designer · 2026: Senior Product Designer" },
    {
      label: "Team",
      value:
        "2022 - 23: UX/UI Designer (me), 2 Product Owners, Business Analyst, mobile development team · 2026: solo redesign",
    },
    { label: "Timeline", value: "Q4 2022 - May 2023: original concept · 2026: full system rebuild" },
    { label: "Platform", value: "iOS & Android passenger app · responsive web console for transit operations" },
    {
      label: "Key Outcome",
      wide: true,
      value:
        "Redesigned the 2022 transit concept in Figma: created a tokenized WCAG 2.2 design system, designed offline ticketing flows, and framed a municipal web console.",
    },
  ],
  notice: {
    tone: "info",
    label: "About this case study",
    text: "The original 2022 concept was handed over to developers after client approval. In 2026, I revisited the initial research to rebuild the product for my portfolio - creating a tokenized design system, privacy-safe admin flows, and aligning it with real European transit data standards (GTFS-RT, SIRI).",
  },
  summaryTitle: "Executive Summary",
  summaryLead: "Ticketing apps usually fail riders at the worst moment.",
  summary: [
    {
      title: "The problem",
      body: "Riders buy tickets while running for a tram, underground without signal, or unsure which zone they need. A slow checkout, a ticket that will not load during an inspection, or the wrong fare can each end in a missed ride or a fine. The 2022 concept followed the initial business brief: hard-coded styles, instant activation and a manual admin model.",
    },
    {
      title: "My part",
      body: "In 2022 - 23 I was the UX/UI designer next to two product owners, a business analyst and the mobile developers: I reviewed the requirements, removed dark patterns and delivered the personas, user flows, style guide and mockups. In 2026 I rebuilt the system alone in Figma: a token-based design system, 56 mobile screens and states and 8 operations screens. The original 2022 screens stay in the file for comparison.",
    },
  ],
  personas: {
    id: "ticket-users",
    eyebrow: "Users",
    title: "Three riders, three moments of stress",
    lead: "Each persona is based on the 2022 research and points to one design decision. Every rider signs in or creates an account first - the app has no guest mode.",
    personas: [
      {
        id: "commuter",
        initials: "TK",
        name: "Tomasz, 34",
        role: "Daily office commuter",
        lines: ["Metro M1", "Tram 17"],
        context:
          "Commutes every day by metro and tram between home and the business district. Travels in the morning and afternoon peak.",
        goal: "Catch tight connections without checking several apps, and show his ticket quickly when an inspector checks.",
        problems: [
          lead("Traffic jams", "He worries that his 20-minute ticket will run out before his stop."),
          lead("No signal underground", "Mobile internet drops, so slow ticket apps fail during a ticket check."),
          lead("Invoices", "He forgets to download PDF invoices for his monthly company expense report."),
        ],
        helps: [
          lead("Live Activity", "The Lock Screen shows journey progress and the arrival time in minutes."),
          lead("Offline QR pass", "The pass works without mobile signal in the metro."),
          lead("One-tap invoice", "“Download PDF Invoice” sits on the receipt screen."),
        ],
      },
      {
        id: "student",
        initials: "ZN",
        name: "Zuzanna, 21",
        role: "University student",
        lines: ["Bus 131", "Tram 4"],
        context:
          "Uses buses, trams and night routes across the city. Has a small student budget and switches between single rides and day passes.",
        goal: "Buy a discounted student ticket fast, without paying full price by mistake or getting a fine.",
        problems: [
          lead("Fare mix-ups", "In a hurry, she mixes up Standard and Reduced (-50%) fares."),
          lead("Diversions", "Route diversions and track repairs make her miss classes."),
          lead("Declined cards", "Her card is sometimes declined just before boarding."),
        ],
        helps: [
          lead("Clear fare toggle", "A “Standard / Reduced -50%” toggle sits at the top of the ticket sheet."),
          lead(
            "Live status",
            "The Schedules screen shows saved lines with live status (“Delayed +4 min”) and service alerts such as “Tram line 4 route diverted”.",
          ),
          lead(
            "Quick payment",
            "She pays with a 6-digit BLIK code, Apple Pay or the Smart Wallet - no card number to type.",
          ),
        ],
      },
      {
        id: "tourists",
        initials: "EM",
        name: "Elena & Marco, 29",
        role: "Weekend tourists",
        lines: ["Metro M2", "Tram 9"],
        context:
          "Visiting Warsaw for a 3-day city trip. They do not speak Polish and have never used the local transit network.",
        goal: "Travel from the central station to the sights without learning the zone and ticket rules.",
        problems: [
          lead(
            "Unknown fares",
            "They do not know which ticket (20-minute, 75-minute, 90-minute or 24-hour; Zone 1 or Zones 1+2) covers their trip.",
          ),
          lead("New account", "Before the first ride they must set up an account in an app they have never used."),
          lead("Hard stop names", "They miss their stop because Polish stop names are hard to read and remember."),
        ],
        helps: [
          lead(
            "Ticket in the result",
            "Route results show the ticket that covers the trip, with its price and a “Select & Buy” button.",
          ),
          lead("Start on board", "They buy in advance and start the ticket by scanning the QR code in the vehicle."),
          lead(
            "Step-by-step route",
            "Route details list each leg, transfer walk and stop count, with live arrival times.",
          ),
        ],
      },
    ],
  },
  flow: {
    id: "ticket-flow",
    eyebrow: "User flow",
    title: "From trip search to an offline inspection",
    lead: "The main path has one rule: buying and activating are separate steps. A rider can buy at home, keep the pass inactive, and start the countdown only when the vehicle arrives.",
    media: {
      ...shot("user-flow"),
      // The diagram draws its own border; its legend sits on the page, as in Figma.
      frameless: true,
      alt: "User flow. Entry, then Signed in? If no, log in or create an account. Home and quick trip search, then Active pass? If yes, open the active pass, show the offline QR code with a countdown, inspection successful. If no, pick a route with a suggested ticket, choose a payment method (Apple Pay, BLIK code with bank approval, or wallet balance), and the pass is saved on the phone, inactive. The rider boards, scans the door QR code or enters the side number, and the pass becomes active with a Live Activity on the lock screen; an inspection during the ride opens the active pass.",
      title: "User flow - buy, then activate on board",
    },
  },
  system: {
    id: "ticket-design-system",
    eyebrow: "Design system",
    title: "Tokens that make accessibility testable",
    cards: [
      {
        ...shot("token-handoff"),
        alt: "Token handoff and code mapping: a DTCG JSON export with Light and Dark values, a list of export targets and a table mapping each semantic token to its CSS variable.",
        title: "Three tiers, one source of truth",
        intro:
          "Primitives (hidden from publishing) feed semantic tokens with Light and Dark modes, plus dimension and effect collections. Components reference semantic tokens only, so a theme change happens in one place.",
        paragraphs: [
          "All 175 variables carry CSS code syntax. The handoff page specifies a W3C DTCG JSON export (one file per mode) and maps each token to CSS, Tailwind and React Native.",
        ],
      },
      {
        ...shot("accessibility-contrast"),
        alt: "Accessibility and contrast standards: a table of text and surface token pairs with Light and Dark samples, contrast ratios and AA or AAA results, and cards on touch targets, focus and motion, and the European Accessibility Act.",
        title: "Contrast you can check",
        intro:
          "Brand indigo #4338CA reaches 7.9:1 on white - WCAG 2.2 AAA. Twelve token pairs are checked in both modes, with ratios computed from the live variables: all text pairs pass AA and both border pairs pass 3:1. In Dark mode the brand role steps to brand/400 (5.8:1).",
        paragraphs: [
          "Solid status fills use the 700 steps (#047857, #B91C1C), so white labels pass AA (5.5:1 and 6.5:1), and ticket status is never shown by colour alone.",
        ],
      },
      {
        ...shot("semantic-inversion"),
        alt: "Dark mode semantic inversion: each semantic token with its Light and Dark value, next to an active ticket card shown in both modes.",
        title: "Tonal surfaces, multi-tenant ready",
        intro:
          "Cool slate neutrals (slate/0 to slate/950) group content by background instead of heavy borders, and every text tier stays at 4.5:1 or more (the lowest, text/muted, is 4.9:1).",
        paragraphs: [
          "A tenant variable collection (Warsaw ZTM, Berlin VBB, Prague PID) drives city names across the console; per-city currency and data are the next step.",
        ],
      },
    ],
  },
  rebuild: {
    id: "ticket-rebuild",
    eyebrow: "2022 brief vs 2026 rebuild",
    title: "From an exploratory prototype to a production-ready system",
    lead: "The 2022 concept followed the initial business brief: manual operational inputs, instant activation on purchase and decorative brand styling. That was the right scope for a prototype meant to win client approval. In 2026 I tested the same ideas against current standards - WCAG 2.2, W3C Design Tokens (DTCG), GDPR privacy by design and European transit data protocols (GTFS-RT, SIRI-SX, NeTEx) - and changed what did not hold up.",
    comparisons: [
      {
        id: "visual-foundation",
        title: "Visual foundation: from decorative styling to tokens",
        before: {
          label: "2022 brief · initial assumption",
          text: "The brief asked for a decorative brand look. Colours were hard-coded hex values. The brand blue #204796 passed (8.7:1), but placeholder grey #A3A3A3 reached 2.5:1, and the disabled button (#CCCCCC with a white label) 1.6:1.",
          media: [
            {
              ...singleShot("legacy-sign-up-phone-number"),
              alt: "2022 sign-up screen, phone number tab: a country code picker, a password field with light grey placeholder text and a pale grey disabled button.",
              title: "2022 - Sign up by phone number",
            },
            {
              ...singleShot("legacy-sign-up-email"),
              alt: "2022 sign-up screen, email tab: email and password fields with light grey placeholder text, a terms checkbox and a pale grey disabled button.",
              title: "2022 - Sign up by email",
            },
          ],
        },
        after: {
          label: "2026 decision",
          text: "Every colour is a token with Light and Dark modes. Primary #4338CA reaches 7.9:1 on white. Cool slate neutrals and soft elevation replace one-off greys, so dense lists stay easy to scan.",
          media: [
            // Both modes side by side, as in the Figma frame: this pair shows the token modes, so it does not
            // switch with the site's theme. Each file has one version; its suffix names the mode it shows.
            {
              ...singleShot("create-account-details-light"),
              alt: "2026 create account screen in Light mode, step 1 of 3: full name and email fields, a Continue button, and Continue with Apple and Continue with Google.",
              title: "Create account / Details - Light mode",
            },
            {
              ...singleShot("create-account-details-dark"),
              alt: "The same create account screen in Dark mode: the same layout on dark slate surfaces.",
              title: "Create account / Details - Dark mode",
            },
          ],
        },
        rationale: [
          {
            title: "Why - the standard",
            points: [
              lead("WCAG 2.2 SC 1.4.3", "At least 4.5:1 for body text and tags."),
              lead(
                "Outdoor CTAs",
                "Primary button labels reach 7.9:1 in Light mode (the WCAG AAA level, SC 1.4.6), because riders read screens in direct sunlight.",
              ),
              lead(
                "W3C DTCG",
                "One token format, so the same values reach iOS, Android and web without manual copying.",
              ),
            ],
          },
          {
            title: "Evidence on the canvas",
            points: [
              lead(
                "Contrast",
                "brand/primary #4338CA reaches 7.9:1 on white; text/muted 4.9:1; status text on status backgrounds 6.8 to 7.6:1.",
              ),
              lead("Variables", "175 variables in 5 collections, with Light and Dark modes."),
              lead("Handoff", "The Token Handoff page documents the DTCG JSON export: one file per mode."),
            ],
          },
        ],
      },
      {
        id: "profile-security",
        title: "Profile and security",
        intro: "Mostly readable in 2022, but every colour was a one-off value that could not support Dark Mode.",
        before: {
          label: "Legacy concept (2022)",
          text: "Most text passed, but grey helper text on the security screen reached only 2.5:1. None of the colours were linked to a system, so one change meant editing every screen.",
          metrics: ["0% of colours from tokens", "3 text contrast failures", "Lowest text 2.5:1"],
          media: [
            {
              ...singleShot("legacy-security"),
              alt: "2022 security screen: password, PIN and fingerprint options with light grey helper text under each option.",
              title: "2022 - Security",
            },
            {
              ...singleShot("legacy-my-profile"),
              alt: "2022 My Profile screen: a list of payment methods, transactions, security, contact and legal, and a log out link.",
              title: "2022 - My Profile",
            },
          ],
        },
        after: {
          label: "Modern rebuild (2026)",
          text: "Same content, rebuilt from tokens and components (List / Menu Row, Avatar). Biometrics, password and sign-out sit in one predictable list.",
          metrics: ["100% of colours from tokens", "0 text contrast failures", "Lowest text 7.1:1"],
          media: [
            {
              ...shot("profile-main-hub"),
              alt: "2026 My Account screen: profile with a student fare tag, a wallet balance of PLN 34.50 with Top up, and grouped lists for payments, travel and city, security and app, and log out.",
              title: "Profile / Main Hub",
            },
            {
              ...shot("profile-security-biometrics"),
              alt: "2026 Security and Privacy screen: Face ID sign-in switch, change password, two-factor authentication enabled, active devices and a delete account panel.",
              title: "Profile / Security & Biometrics",
            },
          ],
        },
        shift: {
          title: "Strategic shift",
          points: [
            "Grey helper text #A3A3A3 (2.5:1) → text/secondary (7.7:1 on white) or text/muted (4.9:1).",
            "Primitive → semantic → component tokens make Light and Dark modes one switch, not a redesign.",
            "Destructive actions are separated: Delete account sits in its own panel with error tokens, while Log out is a neutral list row.",
          ],
        },
      },
    ],
  },
  passenger: {
    id: "ticket-passenger-app",
    eyebrow: "Passenger app",
    title: "Designed for the moments that usually go wrong",
    lead: "Each feature answers a real edge case of riding public transport: no signal underground, a ticket that starts too early, unclear fares and a payment that must be quick.",
    cards: [
      {
        ...shot("offline-pass-inspection"),
        device: "phone",
        alt: "Active pass, offline: a no-connection notice, an Active (offline verified) badge, 14:22 time left, a large QR code and the ticket type, fare, zones and validity.",
        title: "Offline QR pass",
        intro:
          "The pass is stored on the phone and says so: “No internet connection • Your ticket is safely stored offline”. It shows a live countdown and a QR code an inspector can scan without a network - the main fear riders have in the metro. The design specifies a signed token for offline checks; signing itself is an engineering requirement, outside the design scope.",
      },
      {
        ...shot("vehicle-activation"),
        device: "phone",
        alt: "Activate your ticket sheet over My Tickets: tap to scan the vehicle QR code, or enter the vehicle side number, then Validate and start trip.",
        title: "Buy now, start later",
        intro:
          "Buying and activating are two separate steps. Riders buy ahead, and the timer starts only when they scan the QR code opposite the vehicle door, or at the station before the metro gates. If the code can’t be scanned, they type the vehicle side number.",
      },
      {
        ...shot("ticket-selection-sheet"),
        device: "phone",
        alt: "Select Ticket sheet over route results: a Standard or Reduced -50% fare toggle, the 20-minute transfer ticket selected as covering the trip, a 90-minute option, quantity and Continue to payment.",
        title: "From route to ticket in three taps",
        intro:
          "Every route result already shows the ticket that covers the trip, for example a 20-min ticket for PLN 4.40. “Select & Buy” opens one sheet with a Standard / Reduced -50% toggle that marks the ticket covering the trip, and riders can still pick another. “Continue to payment” and “Pay” finish the purchase.",
      },
      {
        ...shot("blik-confirmation"),
        device: "phone",
        alt: "Pay with BLIK sheet: six boxes for the code from the banking app, a code expiry timer at 01:42 and a Confirm and pay button for PLN 4.40.",
        title: "Fast payment, one sheet",
        intro:
          "Checkout is one “Review & Pay” sheet with the Smart Wallet, Apple Pay and BLIK. BLIK opens a six-digit code entry with a visible expiry timer, so riders always know the code is still valid.",
      },
      {
        ...singleShot("lock-screen-live-activity"),
        device: "phone",
        alt: "iPhone Lock Screen with a Live Activity: metro M1 en route to Centrum, arriving in 3 minutes, a progress bar between stops and a Tap to show inspection QR shortcut.",
        title: "The journey on the Lock Screen",
        intro:
          "During the trip, an iOS Live Activity shows progress between stops and the minutes to arrival, with a shortcut straight to the inspection QR code.",
      },
    ],
  },
  operations: {
    id: "ticket-operations",
    eyebrow: "Admin web app",
    title: "Run the network (operations console)",
    scope: {
      title: "Redesigned admin scope",
      body: "The original 2022 concept lacked operational depth. This expanded operations console is my 2026 redesign - introducing automated GTFS-RT feeds, multi-operator fleet tracking, and privacy-first governance.",
    },
    lead: "The web console serves transit operations staff. Real-time feeds replace manual entry, fleet and validators are monitored live, tariffs are published to the app and validators, and every sensitive action is logged.",
    decisionsTitle: "Design decisions",
    decisions: [
      lead("Feeds", "GTFS-RT and SIRI-SX for live data, NeTEx / GTFS for static timetables."),
      lead("Fleet", "1,248 vehicles across 4 operators on one ZTM network; validators sync every 60\u00a0s."),
      lead(
        "Privacy by design",
        "Browsing passenger accounts is disabled; staff open one masked record by exact reference, and access expires after 15 minutes.",
      ),
      lead("Governance", "An append-only audit log, retained for 7 years."),
    ],
    screens: [
      {
        ...shot("admin-operations-dashboard"),
        alt: "Operations dashboard: KPI cards for boardings, revenue, active vehicles and validator health, an hourly boarding chart and live disruption alerts.",
        title: "Admin / Operations Dashboard",
      },
      {
        ...shot("admin-transit-feeds"),
        alt: "Automated transit feeds and alerts engine: feed health KPIs, a table of upstream transit authorities and operator endpoints with protocol and sync status, and automated disruption rules.",
        title: "Admin / Automated Transit Feeds & Alerts Engine",
      },
      {
        ...shot("admin-fleet-vehicles"),
        alt: "Fleet and vehicle management: a table of vehicles with fleet number, model, depot, validator status and passenger load, filtered by vehicle type.",
        title: "Admin / Fleet & Vehicle Management",
      },
      {
        ...shot("admin-operator-registry"),
        alt: "Multi-operator fleet and clearing registry: vehicle-kilometre totals per operator for settlement and a table of vehicles with operator, validator key sync and status.",
        title: "Admin / Multi-Operator Fleet & Clearing Registry",
      },
      {
        ...shot("admin-fare-tariffs"),
        alt: "Fare and tariff configuration: a standard ticket catalogue with prices and publishing switches, and concession and discount rules.",
        title: "Admin / Fare & Tariff Configuration",
      },
      {
        ...shot("admin-access-control"),
        alt: "Access control and team permissions: a team member table with roles and operators, a field permission matrix and a passenger support lookup with masked data.",
        title: "Admin / Access Control & Team Permissions",
      },
      {
        ...shot("admin-audit-trail"),
        alt: "Security audit trail and logs: filters and a table of timestamped events with actor, action, target and severity, and a note that the log is append-only.",
        title: "Admin / Security Audit Trail & Logs",
      },
      {
        ...shot("admin-app-security"),
        alt: "Application security and session policies: session timeout, concurrent device limits, login rate limiting and password and multi-factor authentication rules.",
        title: "Admin / Application Security & Policies",
      },
    ],
  },
  impact: {
    id: "ticket-outcomes",
    eyebrow: "Outcomes",
    title: "What the redesign delivers",
    stats: [
      {
        value: "2 products, 1 system",
        label: "56 mobile screens and states and 8 console screens share 175 variables in 5 collections.",
      },
      {
        value: "WCAG 2.2 AA",
        label:
          "12 token pairs checked in Light and Dark all pass AA, or 3:1 for non-text; primary indigo reaches AAA (7.9:1) in Light.",
      },
      {
        value: "3 taps",
        label:
          "From a route result to a ticket paid from the wallet: Select & Buy → Continue to payment → Pay. BLIK adds its code.",
      },
      {
        value: "No passenger browsing",
        label: "Staff cannot browse passenger accounts; one masked record opens by exact reference and is logged.",
      },
      {
        value: "Offline inspection",
        label: "The active pass and its QR code are designed to show without a network connection.",
      },
      {
        value: "Real data standards",
        label: "GTFS-RT, SIRI-SX and NeTEx / GTFS feeds replace manual timetable and alert inputs.",
      },
    ],
    note: "This is a concept redesign: the outcomes describe verified design decisions, not production metrics.",
  },
  lessons: {
    id: "ticket-lessons",
    eyebrow: "Lessons learned",
    title: "What I would tell my 2022 self",
    points: [
      {
        title: "UX belongs in the requirements",
        body: "Most 2022 problems were written into the specification before any design work. Reviewing requirements early is still the cheapest fix.",
      },
      {
        title: "Tokens make quality measurable",
        body: "With semantic tokens, contrast and Dark mode become checks you can run, not opinions to defend.",
      },
      {
        title: "Use the data the city already has",
        body: "Designing around GTFS, SIRI and operator contracts made the admin product simpler and more honest than inventing manual workflows.",
      },
    ],
  },
  designFile: {
    url: "https://www.figma.com/design/al8zX7vvgJvxNPUaeKp38Q/Smart-Ticket-App?node-id=200-85&t=rLEE9MGJA3JJXZxT-1",
    title: "Inspect the design files",
    body: "The Figma file holds the token collections and their DTCG export, the mobile screens and states in Light and Dark mode, the operations console, the components with their variants and the original 2022 screens for comparison.",
    linkLabel: "Open the Figma file",
  },
  // First case in the Work order (Smart Ticket → Automotive → Project Planning → Data Governance):
  // the left link returns to the list, the right one continues to Automotive.
  prev: { view: VIEW.work, action: "Back to All Work" },
  next: {
    view: VIEW.caseAutomotive,
    label: "Automotive B2B Ecosystem: From Dealer Research Across Europe to a Validated Redesign",
  },
};
