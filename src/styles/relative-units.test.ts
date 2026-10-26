import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Text, spacing, layout widths and breakpoints are in rem, so they follow the visitor's browser text size: a
 * larger default size makes the page grow as it does with zoom. At the default size rem matches Figma's px.
 * Only radius, shadows and motion offsets stay in px (theme.css, tokens.css).
 */
// Resolved with node:path: the jsdom test environment's global URL mis-resolves file: URLs on Windows.
const dir = dirname(fileURLToPath(import.meta.url));
const read = (file: string) => readFileSync(join(dir, file), "utf8");
const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

describe("relative units", () => {
  it("sets breakpoints, spacing, type and layout widths in rem", () => {
    const tokens = [
      ...read("theme.css").matchAll(/--(?:breakpoint|spacing|text|container)-[a-z0-9-]+:\s*([^;]+);/g),
    ].filter(
      ([declaration]) => !declaration.includes("--font-weight:"), // a number, not a length
    );
    expect(tokens.length).toBeGreaterThan(60);
    const notRem = tokens
      .filter(([, value = ""]) => !/^-?[0-9.]+rem$/.test(value.trim()))
      .map(([declaration]) => declaration);
    expect(notRem).toEqual([]);
  });

  it("uses no px length above 2px in the other stylesheets (hairlines and outlines may stay in px)", () => {
    const files = readdirSync(dir).filter(
      (file) => file.endsWith(".css") && file !== "tokens.css" && file !== "theme.css",
    );
    const found = files.flatMap((file) =>
      [...withoutComments(read(file)).matchAll(/(\d+(?:\.\d+)?)px/g)]
        .filter(([, number = "0"]) => Number(number) > 2)
        .map(([length]) => `${file}: ${length}`),
    );
    expect(found).toEqual([]);
  });
});
