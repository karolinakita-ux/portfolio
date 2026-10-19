import type { View } from "#shared/lib/routes/routes.types.ts";

/** Content model of the Work page (copy in work.content.ts). */

export interface WorkCase {
  id: string;
  asset: string;
  alt: string;
  eyebrow: readonly string[];
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
