import type { ReactNode } from "react";

import type { Navigate, View } from "#shared/lib/routes/routes.types.ts";
import type { CalloutTone } from "#shared/ui/Callout/Callout.types.ts";

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
  detail?: string;
  alt: string;
  title: string;
  intro?: ReactNode;
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
  summary: readonly string[];
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

/** Shared layout: Project Planning, Automotive. */
export interface CaseStudy extends CaseBase {
  sections: readonly CaseSection[];
  outcomesTitle?: string;
  outcomesIntro?: string;
  outcomes?: readonly DetailItem[];
  reflections?: {
    title: string;
    intro?: string;
    points: ReadonlyArray<readonly [title: string, body: string]>;
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
  delivery: readonly DetailItem[];
  engineeringIntro: string;
  engineering: readonly DetailItem[];
  takeaways: readonly DetailItem[];
}

export type AnyCase = CaseStudy | ThemingCaseStudy;

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
  /** Optional close-up shown on the card (card.detail). */
  previewSrc?: string;
  /** Opens the viewer at this card. */
  onExpand: (trigger: HTMLElement) => void;
}
