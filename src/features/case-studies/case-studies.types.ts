import type { ReactNode } from "react";

import type { Navigate, View } from "#shared/lib/routes/routes.types.ts";
import type { CalloutTone } from "#shared/ui/Callout/Callout.types.ts";

import type { BentoCard } from "./bento.types.ts";
import type {
  ComparisonSection,
  LessonsSection,
  MediaSection,
  PersonasSection,
  RowsSection,
  ScreenGridSection,
} from "./smart-ticket.types.ts";

/**
 * Content model of the case studies. Copy lives in *.content.ts(x) next to this file;
 * the rules it must follow are enforced in src/app/content-rules.test.ts.
 */

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
  /**
   * Optional dark-mode version of `asset`, shown while the site is in Dark mode (and in the image viewer).
   * A missing or broken file falls back to `asset`.
   */
  darkAsset?: string;
  /** The image draws its own frame (rounded corners, shadow): shown without the screenshot border. */
  frameless?: boolean;
  /** A phone screen: shown narrow (phone width) beside a wider text column. */
  device?: "phone";
  detail?: string;
  alt: string;
  title: string;
  intro?: ReactNode;
  /** More paragraphs after the intro, same style. */
  paragraphs?: readonly string[];
  blocks?: ReadonlyArray<{ title: string; body: string }>;
  /** Every bullet opens with a bold lead-in term (see shared/ui/lead.tsx). */
  bullets?: readonly ReactNode[];
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

/** One titled column of the executive summary ("The problem", "My part"). */
export interface SummaryColumn {
  /** Column heading. Without titles, the summary is a single column of paragraphs. */
  title?: string;
  body: string;
}

/** A Figma file a visitor can open from the case study (the design files banner). */
export interface DesignFile {
  url: string;
  title: string;
  body: string;
  linkLabel: string;
}

/**
 * Feature section: eyebrow, H2, lead and bullets in a text column beside one or more screenshots.
 * Sections alternate sides on wide screens and stack (text first) on narrow ones.
 */
export interface FeatureSection {
  /** Section id, the URL hash: keep it stable. */
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  /** Every bullet opens with a bold lead-in term (lead()). */
  bullets: readonly ReactNode[];
  media: readonly ShowcaseCard[];
}

/** A headline figure in the impact section ("4 → 1"), with the sentence that explains it. */
export interface StatItem {
  value: string;
  label: string;
}

/** Closing impact section: stat cards, then optional bullets. */
export interface CaseImpact {
  /** Section id: keep it stable. */
  id: string;
  eyebrow: string;
  title: string;
  stats: readonly StatItem[];
  /** A short line under the cards about what the figures are (for example, design decisions, not production data). */
  note?: string;
  bullets?: readonly ReactNode[];
}

interface CaseBase {
  /** The view that shows this case study (its URL, the screenshot folder, analytics). */
  view: View;
  /** Prefix for section ids. */
  id: string;
  shortTitle: string;
  eyebrow: readonly string[];
  /** H1. No trailing period. */
  title: string;
  meta: readonly MetaEntry[];
  notice?: Notice;
  summaryTitle: string;
  /** Optional one-line lead under the summary heading (Headline Small). */
  summaryLead?: string;
  /** Titled columns, side by side from lg. */
  summary: readonly SummaryColumn[];
  /** Banner inviting visitors to open the Figma file, before the case navigation. */
  designFile?: DesignFile;
  prev?: CaseNavTarget;
  next?: CaseNavTarget;
}

export interface CaseSection {
  id: string;
  title: string;
  intro?: string | readonly string[];
  cards: readonly ShowcaseCard[];
  highlights?: readonly DetailItem[];
}

/** Shared layout: Project Planning, Automotive. Feature sections (if any) come before the screenshot sections. */
export interface CaseStudy extends CaseBase {
  features?: readonly FeatureSection[];
  sections: readonly CaseSection[];
  impact?: CaseImpact;
  outcomesTitle?: string;
  outcomesIntro?: string;
  outcomes?: readonly DetailItem[];
  reflections?: {
    title: string;
    intro?: string;
    points: ReadonlyArray<readonly [title: string, body: string]>;
    /** "numbered": info-tinted cards numbered 01, 02, 03 (NumberedCards) instead of the flat DetailList. */
    layout?: "numbered";
  };
}

/** Data Governance theming case: its own section structure. */
export interface ThemingCaseStudy extends CaseBase {
  assumption: string;
  reality: readonly ReactNode[];
  solutionIntro: string;
  solution: readonly ShowcaseCard[];
  safetyIntro: string;
  safety: readonly ShowcaseCard[];
  deliveryIntro: string;
  /** Numbered bento cards, 01 onwards (BentoCards). */
  delivery: readonly BentoCard[];
  engineeringIntro: string;
  /** Numbered bento cards, continuing after the delivery cards. */
  engineering: readonly BentoCard[];
  takeaways: readonly DetailItem[];
}

/** Smart Ticket: mobile app and operations console, a 2022 concept rebuilt in 2026. Its own section structure. */
export interface SmartTicketCaseStudy extends CaseBase {
  personas: PersonasSection;
  flow: MediaSection;
  system: RowsSection;
  rebuild: ComparisonSection;
  passenger: RowsSection;
  operations: ScreenGridSection;
  impact: CaseImpact;
  lessons: LessonsSection;
}

export type AnyCase = CaseStudy | ThemingCaseStudy | SmartTicketCaseStudy;

/** Props of a case-study view (CaseStudyView, CaseThemingView). */
export interface CaseViewProps<C extends AnyCase> {
  c: C;
  resolveAsset: (name: string) => string;
  onNavigate: Navigate;
}

/** One screenshot card with its image URLs and the viewer opener (useCaseGallery). */
export interface GalleryRow {
  card: ShowcaseCard;
  /** Full screenshot (opened in the viewer). */
  src: string;
  /** Dark-mode version of `src` (card.darkAsset); the card falls back to `src` when it fails. */
  darkSrc?: string;
  /** Optional close-up shown on the card (card.detail). */
  previewSrc?: string;
  /** Opens the viewer at this card. */
  onExpand: (trigger: HTMLElement) => void;
}
