import ASSET_SIZES from "virtual:asset-sizes";
import { describe, expect, it } from "vitest";

import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { DATA_GOVERNANCE_CASE } from "#features/case-studies/content/data-governance.content.ts";
import { PROJECT_PLANNING_CASE } from "#features/case-studies/content/project-planning.content.tsx";
import { SMART_TICKET_CASE } from "#features/case-studies/content/smart-ticket.content.ts";

import { cardAssets, caseCards, featureStarts, sectionStarts, zoomAsset } from "./gallery.utils.ts";

describe("caseCards", () => {
  it("lists a case study's screenshots in page order: feature sections first, then screenshot sections", () => {
    for (const c of [AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE]) {
      expect(caseCards(c).map((card) => card.id)).toEqual([
        ...(c.features ?? []).flatMap((feature) => feature.media.map((card) => card.id)),
        ...c.sections.flatMap((section) => section.cards.map((card) => card.id)),
      ]);
    }
  });

  it("finds where each block's images start in the gallery", () => {
    const cards = caseCards(PROJECT_PLANNING_CASE);
    featureStarts(PROJECT_PLANNING_CASE).forEach((start, index) => {
      expect(cards[start]?.id).toBe(PROJECT_PLANNING_CASE.features?.[index]?.media[0]?.id);
    });
    sectionStarts(AUTOMOTIVE_CASE).forEach((start, index) => {
      expect(caseCards(AUTOMOTIVE_CASE)[start]?.id).toBe(AUTOMOTIVE_CASE.sections[index]?.cards[0]?.id);
    });
  });

  it("lists the Smart Ticket screenshots in page order", () => {
    const c = SMART_TICKET_CASE;
    expect(caseCards(c).map((card) => card.id)).toEqual(
      [
        c.flow.media,
        ...c.system.cards,
        ...c.rebuild.comparisons.flatMap((comparison) => [...comparison.before.media, ...comparison.after.media]),
        ...c.passenger.cards,
        ...c.operations.screens,
      ].map((card) => card.id),
    );
  });

  it("lists the Data Governance case's solution screenshots, then its safety ones", () => {
    expect(caseCards(DATA_GOVERNANCE_CASE).map((card) => card.id)).toEqual(
      [...DATA_GOVERNANCE_CASE.solution, ...DATA_GOVERNANCE_CASE.safety].map((card) => card.id),
    );
  });

  it.each([SMART_TICKET_CASE, AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, DATA_GOVERNANCE_CASE])(
    "names every $id screenshot card after its image, so the statistics' image value names the file",
    (c) => {
      for (const card of caseCards(c)) {
        const file = card.asset.split("/").pop() ?? "";
        expect(card.id, card.asset).toBe(file.replace(card.darkAsset ? /-light\.webp$/ : /\.webp$/, ""));
        const darkPair = card.darkAsset === undefined ? undefined : card.asset.replace(/-light\.webp$/, "-dark.webp");
        expect(card.darkAsset, card.id).toBe(darkPair);
      }
    },
  );

  it("keeps Smart Ticket's comparison ids apart from its screenshot card ids", () => {
    const cardIds = new Set(caseCards(SMART_TICKET_CASE).map((card) => card.id));
    for (const comparison of SMART_TICKET_CASE.rebuild.comparisons) expect(cardIds).not.toContain(comparison.id);
  });
});

describe("virtual:asset-sizes", () => {
  it("reads width and height from the PNG header", () => {
    // Sizes seen in the browser (naturalWidth x naturalHeight), so a swapped or misread field fails here.
    expect(ASSET_SIZES["cases/automotive/multi-market-survey-light.webp"]).toEqual([2000, 1062]);
    expect(ASSET_SIZES["site/portrait.webp"]).toEqual([376, 566]);
  });

  it.each([SMART_TICKET_CASE, AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, DATA_GOVERNANCE_CASE])(
    "knows the size of every $id screenshot, so the image viewer can draw its loading skeleton",
    (c) => {
      const cards = caseCards(c);
      expect(cards.length).toBeGreaterThan(0);
      for (const asset of cards.flatMap(cardAssets)) {
        const size = ASSET_SIZES[asset];
        expect(size, asset).toBeDefined();
        expect(size?.[0], asset).toBeGreaterThan(0);
        expect(size?.[1], asset).toBeGreaterThan(0);
      }
    },
  );
});

type Sizes = Readonly<Record<string, readonly [number, number]>>;

/**
 * What is wrong with the image viewer's sharper copies in `sizes` (paths under /assets): each must be its page
 * file's picture with more pixels. The viewer swaps it in at the page file's size, so a copy of another shape would
 * jump or stretch, and one without at least 1.5 times the pixels is not worth the download.
 */
function zoomCopyProblems(sizes: Sizes): string[] {
  return Object.entries(sizes).flatMap(([copy, [width, height]]) => {
    if (!copy.includes("/zoom/")) return [];
    const page = sizes[copy.replace("/zoom/", "/")];
    if (!page) return [`${copy}: no page file beside its zoom folder`];
    const [pageWidth, pageHeight] = page;
    const problems: string[] = [];
    if (width < pageWidth * 1.5)
      problems.push(`${copy}: ${width} px wide, under 1.5 times the page file's ${pageWidth}`);
    // Within a pixel of the page file's shape: export rounding, never a different crop.
    if (Math.abs(height - (width * pageHeight) / pageWidth) > 1)
      problems.push(`${copy}: ${width}x${height}, not the shape of the page file's ${pageWidth}x${pageHeight}`);
    return problems;
  });
}

describe("zoom copies", () => {
  it("keeps a case image's sharper copy in a zoom folder beside it, under the same name", () => {
    expect(zoomAsset("cases/automotive/journey-map-light.webp")).toBe("cases/automotive/zoom/journey-map-light.webp");
  });

  it("makes every zoom copy its page file's picture with at least 1.5 times the pixels", () => {
    expect(zoomCopyProblems(ASSET_SIZES)).toEqual([]);
  });

  it("finds a copy without a page file, one too small and one of another shape", () => {
    const page = "cases/x/shot-light.webp";
    expect(zoomCopyProblems({ [page]: [2000, 1062], [zoomAsset(page)]: [4000, 2124] })).toEqual([]);
    expect(zoomCopyProblems({ [page]: [720, 1564], [zoomAsset(page)]: [1080, 2346] })).toEqual([]); // 3x of 2x
    expect(zoomCopyProblems({ [zoomAsset(page)]: [4000, 2124] })).toHaveLength(1);
    expect(zoomCopyProblems({ [page]: [2000, 1062], [zoomAsset(page)]: [2400, 1274] })).toHaveLength(1);
    expect(zoomCopyProblems({ [page]: [2000, 1062], [zoomAsset(page)]: [4000, 2200] })).toHaveLength(1);
  });
});
