import { describe, expect, it } from "vitest";

import { caseShots } from "./content.utils.ts";

describe("caseShots", () => {
  const { shot, singleShot } = caseShots("smart-ticket");

  it("names a Light and Dark screen's two files after it, and its card id too", () => {
    expect(shot("user-flow")).toEqual({
      id: "user-flow",
      asset: "cases/smart-ticket/user-flow-light.webp",
      darkAsset: "cases/smart-ticket/user-flow-dark.webp",
    });
  });

  it("gives a changed screen's files new names and keeps its card id, so the statistics count the same screen", () => {
    expect(shot("user-flow", 2)).toEqual({
      id: "user-flow",
      asset: "cases/smart-ticket/user-flow-v2-light.webp",
      darkAsset: "cases/smart-ticket/user-flow-v2-dark.webp",
    });
  });

  it("names a one-version screen's file and card id after it, with no Dark file", () => {
    expect(singleShot("legacy-security")).toEqual({
      id: "legacy-security",
      asset: "cases/smart-ticket/legacy-security.webp",
    });
  });
});
