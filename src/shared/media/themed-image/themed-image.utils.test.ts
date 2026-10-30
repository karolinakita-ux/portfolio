import { describe, expect, it } from "vitest";

import { pickThemedSrc, themedSources } from "./themed-image.utils.ts";

describe("pickThemedSrc", () => {
  it("shows the dark version in Dark mode", () => {
    expect(pickThemedSrc("dark", "a-light.webp", "a-dark.webp")).toBe("a-dark.webp");
  });

  it("keeps the default image in Light mode, or when there is no dark version", () => {
    expect(pickThemedSrc("light", "a-light.webp", "a-dark.webp")).toBe("a-light.webp");
    expect(pickThemedSrc("dark", "a-light.webp")).toBe("a-light.webp");
  });
});

describe("themedSources", () => {
  it("falls back from the dark version to the default one, then to the last resort", () => {
    expect(themedSources("dark", "detail.webp", "detail-dark.webp", "full.webp")).toEqual([
      "detail-dark.webp",
      "detail.webp",
      "full.webp",
    ]);
  });

  it("lists each file once", () => {
    expect(themedSources("light", "a.webp", "a-dark.webp")).toEqual(["a.webp"]);
    expect(themedSources("dark", "a.webp")).toEqual(["a.webp"]);
  });
});
