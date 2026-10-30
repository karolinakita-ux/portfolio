import type { GalleryRow } from "#features/case-studies/case-studies.types.ts";

/** The case gallery split into the rows each Smart Ticket section shows (galleryBlocks). */
export interface SmartTicketBlocks {
  flow?: GalleryRow;
  system: GalleryRow[];
  comparisons: Array<{ before: GalleryRow[]; after: GalleryRow[] }>;
  passenger: GalleryRow[];
  operations: GalleryRow[];
}
