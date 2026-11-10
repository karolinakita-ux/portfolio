import type { HTMLAttributes, ReactNode } from "react";

/** Space between the heading block and the section body: 24px (lg, default) or 32px (xl). */
export type SectionBodyGap = "lg" | "xl";

export interface SectionProps {
  id: string;
  title: string;
  /** Uppercase kicker above the heading (Label Medium). */
  eyebrow?: string;
  /** One paragraph, or several rendered as separate paragraphs. */
  description?: string | readonly string[];
  children?: ReactNode;
  headingProps?: HTMLAttributes<HTMLHeadingElement>;
  bodyGap?: SectionBodyGap;
  /**
   * Controls for the whole section at the right end of the heading row (a carousel’s Previous and Next); on a
   * narrow screen they wrap below the heading, still at the right end.
   */
  actions?: ReactNode;
}
