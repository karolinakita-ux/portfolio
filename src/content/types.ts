import type { ReactNode } from "react";
import type { View } from "../lib/routes.ts";

/**
 * Content model for every page. Copy lives in src/content/*; views only lay it out.
 * Rules the content must follow are enforced in src/content/content.test.ts.
 */

export type CalloutTone = "warning" | "info";

export interface Notice {
  tone: CalloutTone;
  label: string;
  text: string;
}

export interface MetaEntry {
  label: string;
  value: string;
  /** Spans the full width as its own row on desktop (e.g. Key Outcome). */
  wide?: boolean;
}

/**
 * Screenshot card in a case study.
 *   asset   file name in /assets, shown full size in the image viewer
 *   detail  optional close-up of the same screen; the card shows it and the
 *           viewer still opens `asset`. A missing file falls back to `asset`.
 *   alt     description of the full screenshot
 */
export interface ShowcaseCard {
  id: string;
  asset: string;
  detail?: string;
  alt: string;
  title: string;
  intro?: ReactNode;
  blocks?: ReadonlyArray<{ title: string; body: string }>;
  /** Every bullet opens with a bold lead-in term (see components/ui/lead.tsx). */
  bullets?: ReadonlyArray<ReactNode>;
}

export interface DetailItem {
  title: string;
  body: string;
  badge?: string;
}

export interface CaseNavTarget {
  view: View;
  /** Overrides "Next Case Study" / "Previous Case Study". */
  action?: string;
  /** Optional project-name line under the action. */
  label?: string;
}

interface CaseBase {
  /** Prefix for section ids. */
  id: string;
  shortTitle: string;
  eyebrow: ReadonlyArray<string>;
  /** H1. No trailing period. */
  title: string;
  meta: ReadonlyArray<MetaEntry>;
  notice?: Notice;
  summaryTitle: string;
  summary: ReadonlyArray<string>;
  prev?: CaseNavTarget;
  next?: CaseNavTarget;
}

export interface CaseSection {
  id: string;
  title: string;
  intro?: string | ReadonlyArray<string>;
  cards: ReadonlyArray<ShowcaseCard>;
  highlights?: ReadonlyArray<DetailItem>;
}

/** Shared layout: MeetEstim, Automotive. */
export interface CaseStudy extends CaseBase {
  sections: ReadonlyArray<CaseSection>;
  outcomesTitle?: string;
  outcomesIntro?: string;
  outcomes?: ReadonlyArray<DetailItem>;
  reflections?: {
    title: string;
    intro?: string;
    points: ReadonlyArray<readonly [title: string, body: string]>;
  };
}

/** Data Governance theming case: its own section structure. */
export interface ThemingCaseStudy extends CaseBase {
  assumption: string;
  reality: ReadonlyArray<ReactNode>;
  solutionIntro: string;
  solution: ReadonlyArray<ShowcaseCard>;
  safetyIntro: string;
  safety: ReadonlyArray<ShowcaseCard>;
  deliveryIntro: string;
  delivery: ReadonlyArray<DetailItem>;
  engineeringIntro: string;
  engineering: ReadonlyArray<DetailItem>;
  takeaways: ReadonlyArray<DetailItem>;
}

export interface WorkCase {
  id: string;
  asset: string;
  alt: string;
  eyebrow: ReadonlyArray<string>;
  title: string;
  summary: string;
  cta: string;
  view: View;
}

/** A LinkedIn recommendation quoted on the Work page. */
export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  initials: string;
  /** The person's LinkedIn profile. */
  profileUrl: string;
  /** Job title, without the company. */
  role: string;
  /** Company at the time, with its LinkedIn page. */
  company: { name: string; url: string };
}

export interface Milestone {
  id: string;
  period: string;
  title: string;
  org: string;
  focus: string;
  /** Optional reflection quote. */
  lesson?: string;
  tags: ReadonlyArray<string>;
}

export interface Principle {
  id: string;
  title: string;
  body: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  points?: ReadonlyArray<readonly [term: string, text: string]>;
}

/** Bold lead-in bullet in the CV and cover letter: "<strong>Lead:</strong> text". */
export interface LeadBullet {
  lead: string;
  text: string;
}

export interface LinkRef {
  label: string;
  href: string;
}

export interface CvHeader {
  name: string;
  title: string;
  location?: string;
  phone?: string;
  email: string;
  portfolio: LinkRef;
  linkedin: LinkRef;
}

/** ISO dates: "2023-09", or "2015" for year-only. `end: null` means Present. */
export interface CvRole {
  id: string;
  company: string;
  title: string;
  previousTitle?: string;
  location?: string;
  start: string;
  end: string | null;
  bullets: ReadonlyArray<LeadBullet>;
}

export interface CvDegree {
  id: string;
  institution: string;
  degree: string;
  start: string;
  end: string | null;
  details?: string;
}

export interface Cv {
  header: CvHeader;
  summary: string;
  competencies: ReadonlyArray<{ group: string; items: ReadonlyArray<string> }>;
  experience: ReadonlyArray<CvRole>;
  education: ReadonlyArray<CvDegree>;
}

export interface CoverLetter {
  sender: CvHeader & { phone: string };
  /** ISO date, e.g. "2026-10-08". */
  date: string;
  recipient: ReadonlyArray<string>;
  subject: string;
  salutation: string;
  opening: string;
  highlights: ReadonlyArray<LeadBullet>;
  closing: string;
  signOff: string;
}
