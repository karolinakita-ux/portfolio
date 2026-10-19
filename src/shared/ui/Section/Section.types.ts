import type { HTMLAttributes, ReactNode } from "react";

/** Space between the heading block and the section body: 24px (lg, default) or 32px (xl). */
export type SectionBodyGap = "lg" | "xl";

export interface SectionProps {
  id: string;
  title: string;
  /** One paragraph, or several rendered as separate paragraphs. */
  description?: string | readonly string[];
  children?: ReactNode;
  headingProps?: HTMLAttributes<HTMLHeadingElement>;
  bodyGap?: SectionBodyGap;
}
