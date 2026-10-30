import type { GalleryRow } from "#features/case-studies/case-studies.types.ts";
import type { Comparison } from "#features/case-studies/smart-ticket.types.ts";

export interface ComparisonBlockProps {
  comparison: Comparison;
  beforeRows: readonly GalleryRow[];
  afterRows: readonly GalleryRow[];
}
