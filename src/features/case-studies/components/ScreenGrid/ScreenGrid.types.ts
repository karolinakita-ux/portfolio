import type { GalleryRow } from "#features/case-studies/case-studies.types.ts";
import type { ScreenGridSection } from "#features/case-studies/smart-ticket.types.ts";

export interface ScreenGridProps {
  section: ScreenGridSection;
  /** The screens in the case gallery (same order as section.screens). */
  rows: readonly GalleryRow[];
}
