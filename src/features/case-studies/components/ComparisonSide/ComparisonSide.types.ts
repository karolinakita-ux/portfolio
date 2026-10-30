import type { GalleryRow } from "#features/case-studies/case-studies.types.ts";
import type { ComparisonSide } from "#features/case-studies/smart-ticket.types.ts";

export interface ComparisonSideProps {
  side: ComparisonSide;
  /** The side's screens in the case gallery (same order as side.media). */
  rows: readonly GalleryRow[];
  tone: "before" | "after";
}
