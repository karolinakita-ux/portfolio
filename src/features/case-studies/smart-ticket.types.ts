import type { ReactNode } from "react";

import type { DetailItem, ShowcaseCard } from "./case-studies.types.ts";

/** Section types of the Smart Ticket case study (SmartTicketCaseStudy in case-studies.types.ts). */

/** A rider persona from the research, as a card: who, goal, everyday problems and how the product helps. */
export interface Persona {
  id: string;
  initials: string;
  /** Name and age, "Tomasz, 34". */
  name: string;
  role: string;
  /** Lines they ride, read out in full ("Metro M1", "Tram 17"). */
  lines: readonly string[];
  context: string;
  goal: string;
  /** Every bullet opens with a bold lead-in term (lead()). */
  problems: readonly ReactNode[];
  /** Every bullet opens with a bold lead-in term (lead()). */
  helps: readonly ReactNode[];
}

export interface PersonasSection {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  personas: readonly Persona[];
}

/** A section with an eyebrow, an H2, an optional lead and screenshot rows (ShowcaseRow). */
export interface RowsSection {
  id: string;
  eyebrow: string;
  title: string;
  lead?: string;
  cards: readonly ShowcaseCard[];
}

/** One side of a before / after comparison. */
export interface ComparisonSide {
  /** "2022 brief · initial assumption", "Modern rebuild (2026)". */
  label: string;
  text: string;
  /** Measured facts shown as chips (error tone before, success tone after). */
  metrics?: readonly string[];
  /** Screens side by side; each card's title is its caption. */
  media: readonly ShowcaseCard[];
}

/** A before / after comparison: two columns, then the reasoning (columns of points, or a list of shifts). */
export interface Comparison {
  id: string;
  title: string;
  intro?: string;
  before: ComparisonSide;
  after: ComparisonSide;
  /** Titled columns of bullets under the comparison ("Why - the standard", "Evidence on the canvas"). */
  rationale?: ReadonlyArray<{ title: string; points: readonly ReactNode[] }>;
  /** A titled list of changes ("Strategic shift"). */
  shift?: { title: string; points: readonly string[] };
}

export interface ComparisonSection {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  comparisons: readonly Comparison[];
}

/** Operations console: scope note, decisions and a grid of captioned screens. */
export interface ScreenGridSection {
  id: string;
  eyebrow: string;
  title: string;
  /** Highlighted note next to the description ("Redesigned admin scope"). */
  scope: { title: string; body: string };
  lead: string;
  decisionsTitle: string;
  /** Every bullet opens with a bold lead-in term (lead()). */
  decisions: readonly ReactNode[];
  screens: readonly ShowcaseCard[];
}

/** Closing lessons: eyebrow, H2, titled points. */
export interface LessonsSection {
  id: string;
  eyebrow: string;
  title: string;
  points: readonly DetailItem[];
}

/** A section with an eyebrow, an H2, a lead and one full-width image (personas, a user flow). */
export interface MediaSection {
  /** Section id: keep it stable. */
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  media: ShowcaseCard;
}
