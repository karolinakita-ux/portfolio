import type { Feature, GalleryRow } from "#features/case-studies/case-studies.types.ts";

export interface FeatureSectionProps {
  section: Feature;
  /** The section's images in the case gallery (same order as section.media). */
  rows: readonly GalleryRow[];
  /** Visual column on the left from lg (every other section). */
  reverse?: boolean;
}
