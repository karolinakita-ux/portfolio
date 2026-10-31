import type { ReactNode } from "react";

export type CalloutTone = "warning" | "info";

export interface CalloutProps {
  tone: CalloutTone;
  /** Accessible name of the <aside>. */
  label: string;
  title?: string;
  /**
   * The title's heading level, so it fits the page's heading order (default 3, under a section's H2): 2 for a banner
   * between sections (DesignFilesBanner), 4 inside a block with its own H3 (ComparisonBlock). The look stays.
   */
  headingLevel?: 2 | 3 | 4;
  /**
   * Makes a titled banner linkable like a Section: its URL hash (/#behind-the-design), a copy-link anchor beside the
   * title (HeadingAnchor), and the address follows it while it is read (useSectionHash). Keep it stable: it is a
   * shared link. Ignored without a `title`.
   */
  id?: string;
  children: ReactNode;
}
