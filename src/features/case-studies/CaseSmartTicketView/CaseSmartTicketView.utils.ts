import type { GalleryRow, SmartTicketCaseStudy } from "#features/case-studies/case-studies.types.ts";

export interface SmartTicketBlocks {
  flow?: GalleryRow;
  system: GalleryRow[];
  comparisons: Array<{ before: GalleryRow[]; after: GalleryRow[] }>;
  passenger: GalleryRow[];
  operations: GalleryRow[];
}

/** Splits the case gallery (smartTicketCards order) into the rows each section shows. */
export function galleryBlocks(c: SmartTicketCaseStudy, rows: readonly GalleryRow[]): SmartTicketBlocks {
  let next = 0;
  const take = (count: number): GalleryRow[] => {
    const slice = rows.slice(next, next + count);
    next += count;
    return slice;
  };
  const [flow] = take(1);
  const system = take(c.system.cards.length);
  const comparisons = c.rebuild.comparisons.map((comparison) => ({
    before: take(comparison.before.media.length),
    after: take(comparison.after.media.length),
  }));
  const passenger = take(c.passenger.cards.length);
  const operations = take(c.operations.screens.length);
  return { flow, system, comparisons, passenger, operations };
}
