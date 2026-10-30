import ASSET_SIZES from "virtual:asset-sizes";
import { describe, expect, it } from "vitest";

import { assetSize } from "./asset-size.utils.ts";

const FILE = "cases/automotive/multi-market-survey-light.webp";
const [width, height] = ASSET_SIZES[FILE] ?? [0, 0];

describe("assetSize", () => {
  it("reads the size of an image under /assets from its URL", () => {
    expect(width).toBeGreaterThan(0);
    expect(assetSize("/assets/" + FILE)).toEqual({ width, height });
  });

  it("works for a relative build and a full URL, without the query or hash", () => {
    expect(assetSize("./assets/" + FILE)).toEqual({ width, height });
    expect(assetSize("assets/" + FILE)).toEqual({ width, height });
    expect(assetSize("https://karolina.kita.company/assets/" + FILE + "?v=2#top")).toEqual({ width, height });
  });

  it("knows no size for other files", () => {
    expect(assetSize("/assets/cases/missing.webp")).toBeUndefined();
    expect(assetSize("/favicon-96x96.png")).toBeUndefined();
    expect(assetSize("/static/" + FILE)).toBeUndefined();
    expect(assetSize("")).toBeUndefined();
  });
});
