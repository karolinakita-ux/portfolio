import ASSET_SIZES from "virtual:asset-sizes";
import { describe, expect, it } from "vitest";
import { AUTOMOTIVE_CASE } from "../content/cases/automotive.ts";
import { PROJECT_PLANNING_CASE } from "../content/cases/project-planning.tsx";
import { THEMING_CASE } from "../content/cases/theming.tsx";
import { caseCards } from "./gallery.ts";

describe.each([AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, THEMING_CASE])("$id gallery", (c) => {
  it("knows the pixel size of every screenshot, so the image viewer can draw its loading skeleton", () => {
    const cards = caseCards(c);
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      const size = ASSET_SIZES[card.asset];
      expect(size, card.asset).toBeDefined();
      expect(size?.[0], card.asset).toBeGreaterThan(0);
      expect(size?.[1], card.asset).toBeGreaterThan(0);
    }
  });
});
