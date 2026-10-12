import ASSET_SIZES from "virtual:asset-sizes";
import { describe, expect, it } from "vitest";
import { AUTOMOTIVE_CASE } from "../content/cases/automotive.ts";
import { PROJECT_PLANNING_CASE } from "../content/cases/project-planning.tsx";
import { THEMING_CASE } from "../content/cases/theming.tsx";
import { caseCards } from "./gallery.ts";

describe("caseCards", () => {
  it("lists a case study's screenshots in page order, section by section", () => {
    for (const c of [AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE]) {
      expect(caseCards(c).map((card) => card.id)).toEqual(
        c.sections.flatMap((section) => section.cards.map((card) => card.id)),
      );
    }
  });

  it("lists the theming case's solution screenshots, then its safety ones", () => {
    expect(caseCards(THEMING_CASE).map((card) => card.id)).toEqual(
      [...THEMING_CASE.solution, ...THEMING_CASE.safety].map((card) => card.id),
    );
  });
});

describe("virtual:asset-sizes", () => {
  it("reads width and height from the PNG header", () => {
    // Sizes seen in the browser (naturalWidth x naturalHeight), so a swapped or misread field fails here.
    expect(ASSET_SIZES["automotive-research-surveymonkey-markets.png"]).toEqual([605, 481]);
    expect(ASSET_SIZES["avatar-cutout.png"]).toEqual([376, 566]);
  });

  it.each([AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, THEMING_CASE])(
    "knows the size of every $id screenshot, so the image viewer can draw its loading skeleton",
    (c) => {
      const cards = caseCards(c);
      expect(cards.length).toBeGreaterThan(0);
      for (const card of cards) {
        const size = ASSET_SIZES[card.asset];
        expect(size, card.asset).toBeDefined();
        expect(size?.[0], card.asset).toBeGreaterThan(0);
        expect(size?.[1], card.asset).toBeGreaterThan(0);
      }
    },
  );
});
