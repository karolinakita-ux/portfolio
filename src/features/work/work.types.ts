import type { CaseView } from "#shared/lib/routes/routes.types.ts";

/** Content model of the Work page (copy in work.content.ts). */

export interface WorkCase {
  id: string;
  asset: string;
  /** Optional Dark-mode thumbnail; without one, Dark mode shows `asset`. */
  darkAsset?: string;
  alt: string;
  eyebrow: readonly string[];
  summary: string;
  cta: string;
  /** The case study it opens, and its title: the case's card title (CASE_NAMES in shared/lib/routes). */
  view: CaseView;
}

/** A LinkedIn recommendation quoted on the Work page. */
export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  initials: string;
  /** The person's LinkedIn profile; without it the name is plain text. */
  profileUrl?: string;
  /** Job title, without the company. */
  role: string;
  /** The person's current employer, with its LinkedIn page, when the card names one. */
  company?: { name: string; url: string };
  /** A line under the role, e.g. "Translated from Polish" when the quote is a translation. */
  note?: string;
}
