import { describe, expect, it } from "vitest";
import { measurePageFit } from "./pageFit.ts";

const mm = (value: number) => (value * 96) / 25.4; // millimetres → CSS px

describe("measurePageFit", () => {
  const printWidth = mm(170);

  it("reports the space left on one A4 page", () => {
    expect(measurePageFit(printWidth, mm(238))).toEqual({ fits: true, mm: 19 });
    expect(measurePageFit(printWidth, mm(256.6))).toEqual({ fits: true, mm: 0 });
  });

  it("reports how far the letter runs over", () => {
    expect(measurePageFit(printWidth, mm(265))).toEqual({ fits: false, mm: 8 });
  });

  it("stays silent when the column is not at print width (phones)", () => {
    expect(measurePageFit(375, mm(200))).toBeNull();
    expect(measurePageFit(mm(171), mm(200))).toBeNull();
  });
});
