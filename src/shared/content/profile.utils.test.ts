import { describe, expect, it } from "vitest";

import { PROFILE } from "./profile.ts";
import { cvPdfLabel, pageCount } from "./profile.utils.ts";

describe("pageCount", () => {
  it("says page for one and pages for more", () => {
    expect(pageCount(1)).toBe("1 page");
    expect(pageCount(2)).toBe("2 pages");
  });
});

describe("cvPdfLabel", () => {
  it("adds the PDF's page count, kept on one line by a no-break space", () => {
    expect(PROFILE.cvPdfPages).toBe(2);
    expect(cvPdfLabel("Download PDF")).toBe("Download PDF (2\u00a0pages)");
  });
});
