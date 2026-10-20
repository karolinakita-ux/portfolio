import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Google Search Console verifies the owner of karolina.kita.company with this file at the site root
 * (HTML file method, since 2026-10-20). Google checks it again from time to time: removing or editing
 * it loses the verification, so it stays, byte for byte.
 */
const FILE = "googlecf978c6093e1d8a5.html";

describe("Google Search Console verification file", () => {
  it("stays in public/ exactly as Google issued it", () => {
    expect(readFileSync(join(process.cwd(), "public", FILE), "utf8")).toBe(`google-site-verification: ${FILE}`);
  });
});
