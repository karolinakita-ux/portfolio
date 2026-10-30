import { describe, expect, it } from "vitest";

import type { GalleryRow } from "#features/case-studies/case-studies.types.ts";
import { SMART_TICKET_CASE } from "#features/case-studies/content/smart-ticket.content.ts";
import { caseCards } from "#features/case-studies/gallery/gallery.utils.ts";

import { galleryBlocks } from "./CaseSmartTicketView.utils.ts";

const rows: GalleryRow[] = caseCards(SMART_TICKET_CASE).map((card) => ({
  card,
  src: card.asset,
  onExpand: () => undefined,
}));

describe("galleryBlocks", () => {
  it("hands each section its own screenshots, in order, using every one exactly once", () => {
    const blocks = galleryBlocks(SMART_TICKET_CASE, rows);
    const ids = (list: readonly GalleryRow[]) => list.map((row) => row.card.id);
    expect(blocks.flow?.card.id).toBe(SMART_TICKET_CASE.flow.media.id);
    expect(ids(blocks.system)).toEqual(SMART_TICKET_CASE.system.cards.map((card) => card.id));
    expect(ids(blocks.passenger)).toEqual(SMART_TICKET_CASE.passenger.cards.map((card) => card.id));
    expect(ids(blocks.operations)).toEqual(SMART_TICKET_CASE.operations.screens.map((card) => card.id));
    const all = [
      ...(blocks.flow ? [blocks.flow] : []),
      ...blocks.system,
      ...blocks.comparisons.flatMap((comparison) => [...comparison.before, ...comparison.after]),
      ...blocks.passenger,
      ...blocks.operations,
    ];
    expect(ids(all)).toEqual(ids(rows));
  });
});
