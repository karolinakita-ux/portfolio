import { describe, expect, it } from "vitest";
import { formatMonthYear } from "./dates.ts";

describe("formatMonthYear", () => {
  it.each([
    ["2023-09", "Sep 2023"],
    ["2018-07", "Jul 2018"],
    ["2026-12", "Dec 2026"],
    ["2015", "2015"],
  ])("formats %s as %s", (iso, expected) => {
    expect(formatMonthYear(iso)).toBe(expected);
  });

  it.each(["2023-13", "2023-00", "Sep 2023", "23-09", ""])("rejects %j", (iso) => {
    expect(() => formatMonthYear(iso)).toThrow();
  });
});
