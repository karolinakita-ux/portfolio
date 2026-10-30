/**
 * The CV: the /cv page and the PDF made from it (`yarn cv-pdf`, scripts/cv-pdf.ts). Text from Karolina's Long CV
 * (Figma file "Karolina Kita Branding", page "CV", frames 2761:2 and 2761:103), with her British spelling, titles
 * and dates. After any change here run `yarn cv-pdf` and commit the PDF and scripts/cv-pdf.lock.json:
 * src/app/seo/cv-pdf.test.tsx fails until the PDF matches the page again.
 *
 * Rules (src/app/content-rules.test.ts): plain text for applicant tracking systems, so short hyphens and no
 * curly quotes; ISO dates ("2023-11"; end null = Present); lead-ins without their own colon (lead() adds it);
 * the email and LinkedIn from PROFILE; no phone number or street address; the consent in English and Polish,
 * with {email} where the address goes.
 */
import { PROFILE } from "#shared/content/profile.ts";

import type { Cv, CvPage } from "./cv.types.ts";

export const CV: Cv = {
  header: {
    name: PROFILE.name,
    headline: "Senior Product Designer · Design Systems",
    location: "Poland · Remote (CET)",
    email: PROFILE.email,
    linkedin: { label: "linkedin.com/in/karolinakita", href: PROFILE.linkedinUrl },
    site: { label: "karolina.kita.company", pdfHref: "https://karolina.kita.company/?utm_medium=cv-pdf" },
  },

  summary:
    "Senior Product Designer with 8+ years on B2B and enterprise platforms: data-dense applications, transactional flows and token-based design systems. With an M.Sc. in Psychology, I ground design decisions in research to reduce cognitive load in decision-heavy workflows. I own the work end to end, from discovery and usability testing to Figma libraries mapped to code, WCAG contrast rules and handoff specs that cover states, errors and edge cases.",

  experience: [
    {
      id: "programado",
      title: "Senior Product Designer (Consulting / Contract)",
      org: ["Programado", "Remote"],
      start: "2023-11",
      end: null,
      bullets: [
        {
          lead: "Design Systems",
          text: "Built and maintain a token-based design system in Figma (design tokens, variables, components) aligned with the frontend component library, with Light and Dark themes and WCAG 2.1 AA contrast rules.",
        },
        {
          lead: "End-to-End Product Design",
          text: "Lead UX and UI for complex enterprise workflows, from discovery and user flows to high-fidelity UI and interactive prototypes.",
        },
        {
          lead: "Data-Dense Interfaces",
          text: "Designed dashboards, data tables and multi-step forms that make complex business data easy to scan and act on.",
        },
        {
          lead: "Design-to-Code Handoff",
          text: "Write detailed specifications for interaction states, error handling and responsive behaviour, working daily with frontend engineers.",
        },
        {
          lead: "Mentoring",
          text: "Mentored a junior designer through design critiques and documentation standards.",
        },
      ],
    },
    {
      id: "globallogic",
      title: "Senior UI/UX Designer",
      org: ["GlobalLogic", "Full-time", "Remote"],
      start: "2019-09",
      end: "2026-09",
      bullets: [
        {
          lead: "Product Strategy and Stakeholder Alignment",
          text: "Translated ambiguous enterprise requirements into validated roadmaps, balancing business goals, engineering constraints and user needs with product and engineering leadership.",
        },
        {
          lead: "Evidence-Based UX Research",
          text: "Planned and ran mixed-methods research (user interviews, surveys, usability benchmarking and A/B testing), using a psychology background (M.Sc.) to turn behavioural data into product decisions.",
        },
        {
          lead: "Complex IA and Data-Heavy Workflows",
          text: "Designed information architecture, multi-variable filtering and dense data tables, turning complex data structures and transactional flows into clear user journeys.",
        },
        {
          lead: "Multi-Tenant Platforms and Permissions",
          text: "Designed role-based access control (RBAC), multi-role permission models and account management flows for multi-tenant enterprise platforms.",
        },
        {
          lead: "AI-Augmented DesignOps",
          text: "Integrated generative AI into the design process for research synthesis, thematic clustering, rapid prototyping and edge-case documentation for QA and developers.",
        },
        {
          lead: "Accessibility Audits",
          text: "Ran WCAG 2.1 audits across core user flows and documented the required fixes for engineering.",
        },
        {
          lead: "Design Thinking Workshops",
          text: "Facilitated cross-functional workshops to align product, engineering and business teams on problems and priorities.",
        },
      ],
    },
    {
      id: "cinkciarz",
      title: "UX Researcher & Designer",
      org: ["Cinkciarz.pl", "Zielona Góra"],
      start: "2018-07",
      end: "2019-09",
      bullets: [
        {
          lead: "Mixed-Methods User Research",
          text: "Ran moderated user interviews, hallway testing and guerrilla usability studies, turning findings into UX improvements for high-security financial flows.",
        },
        {
          lead: "Prototyping and Flow Optimisation",
          text: "Designed wireframes, multi-step transaction journeys and interactive prototypes (Adobe XD) for mobile and web, reducing friction in checkout and exchange flows.",
        },
        {
          lead: "Design System Foundations",
          text: "Contributed to shared UI component libraries and style guides for visual and functional consistency across the product.",
        },
        {
          lead: "Competitive Benchmarking",
          text: "Ran heuristic audits and competitive analyses of the European FinTech market to support MVP scope and product roadmaps.",
        },
      ],
    },
  ],

  skills: [
    {
      area: "Product Design",
      items: [
        "End-to-End Product Design",
        "Product Strategy",
        "Complex B2B Workflows",
        "Enterprise SaaS",
        "Data-Dense Interfaces",
        "Information Architecture",
        "User Flows",
        "Wireframing",
        "High-Fidelity UI",
        "Prototyping",
      ],
    },
    {
      area: "UX Research",
      items: [
        "Mixed-Methods Research",
        "User Interviews",
        "Usability Testing",
        "A/B Testing",
        "Heuristic Evaluation",
        "Competitive Analysis",
        "Research Synthesis",
      ],
    },
    {
      area: "Design Systems",
      items: [
        "Design Tokens",
        "Variables",
        "Component Libraries",
        "Multi-Brand Theming",
        "Light and Dark Modes",
        "Accessibility (WCAG 2.1 AA)",
      ],
    },
    {
      area: "Collaboration",
      items: [
        "Cross-Functional Collaboration",
        "Stakeholder Alignment",
        "Design-to-Code Handoff",
        "Design Thinking Workshops",
        "Mentoring",
      ],
    },
    {
      area: "Tools",
      items: ["Figma (Variables, Components, Auto Layout, Prototyping)", "Adobe XD", "Generative AI tools (Claude)"],
    },
  ],

  education: [
    {
      id: "psychology",
      title: "M.Sc. in Psychology",
      org: ["University of Zielona Góra"],
      start: "2015-10",
      end: "2020-06",
      bullets: [
        {
          lead: "Focus",
          text: "Cognitive research and behavioural analysis: attention, cognitive strain and decision-making in digital interfaces.",
        },
      ],
    },
  ],

  // Recruitment consent for employers and agencies in Poland and abroad, drafted 2026-10-30 from the GDPR
  // (Art. 6(1)(a) and 7(3): withdrawal as easy as giving it), art. 22¹a of the Kodeks pracy and UODO's guide for
  // employers (future recruitment needs its own consent, for a set period). Not legal advice.
  consent: {
    en: "I consent to the processing of my personal data in this CV by the employer or recruitment agency that receives it, in Poland or abroad, for the current recruitment process, in line with the GDPR (Regulation (EU) 2016/679). I also consent to its processing for future recruitment processes by the same employer or agency for 12 months after they receive it. A recruitment agency may send my CV to an employer only for a role I agree to. I can withdraw my consent at any time by email to {email}.",
    pl: "Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w tym CV przez pracodawcę lub agencję zatrudnienia, do których trafi to CV, w Polsce lub za granicą, na potrzeby obecnego procesu rekrutacji, zgodnie z RODO (rozporządzenie (UE) 2016/679). Wyrażam również zgodę na przetwarzanie tych danych przez tego samego pracodawcę lub tę samą agencję na potrzeby przyszłych procesów rekrutacji przez 12 miesięcy od otrzymania CV. Agencja zatrudnienia może przekazać moje CV pracodawcy tylko w związku z ofertą, na którą się zgodzę. Zgodę mogę wycofać w każdej chwili, pisząc na adres {email}.",
  },

  footer: PROFILE.name + " · " + PROFILE.role,
};

export const CV_PAGE: CvPage = {
  crumb: "CV",
  titles: { summary: "Summary", experience: "Experience", skills: "Skills", education: "Education" },
  contactsLabel: "Contact details",
  note: "Read my CV here, or download it as a PDF: the same content on A4 pages, ready to print or to send with an application.",
  download: "Download PDF",
  inAppHint: "The PDF opens best in your phone's browser: open this page there to download it.",
};
