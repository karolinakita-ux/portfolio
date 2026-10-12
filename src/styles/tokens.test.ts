import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import figmaTokens from "./kita-branding.tokens.json";

/**
 * 1:1 parity between the Figma Variables export (kita-branding.tokens.json)
 * and the CSS custom properties the app is styled with (tokens.css).
 * Re-export the JSON from Figma and run the tests: any drift fails here.
 */
// Resolved with node:path: the jsdom test environment's global URL mis-resolves file: URLs on Windows.
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "tokens.css"), "utf8");

/** CSS-only tokens derived in code, not Figma variables. */
const DERIVED = new Set(["bg-canvas-translucent", "elevation-sm", "elevation-md", "elevation-lg", "elevation-xl"]);

/** Figma names that do not map mechanically (bgBg… is a doubled prefix in the Figma collection). */
const FIGMA_NAME: Record<string, string> = {
  "bg-avatar-base": "bgBgAvatarBase",
  "bg-avatar-glow-warm": "bgBgAvatarGlowWarm",
  "bg-avatar-glow-cold": "bgBgAvatarColdGlow",
};

const toFigmaName = (cssName: string) =>
  FIGMA_NAME[cssName] ?? cssName.replace(/-([a-z0-9])/g, (_match, char: string) => char.toUpperCase());

function readBlock(startMarker: string, endMarker?: string): Map<string, string> {
  const start = css.indexOf(startMarker);
  const end = endMarker ? css.indexOf(endMarker, start) : css.length;
  if (start < 0 || end < 0) throw new Error(`tokens.css block not found: ${startMarker}`);
  const block = css.slice(start, end);
  return new Map(
    [...block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map(([, name = "", value = ""]) => [name, value.trim()]),
  );
}

const MODES = {
  light: readBlock(":root,", "@media not print"),
  dark: readBlock(":root.dark"),
} as const;

describe.each(Object.entries(MODES))("tokens.css (%s)", (mode, vars) => {
  const figma: Record<string, string | number> = figmaTokens.kitaBranding[mode as keyof typeof MODES];

  it("declares tokens", () => {
    expect(vars.size).toBeGreaterThan(40);
  });

  it.each([...vars].filter(([name]) => !DERIVED.has(name)))("--%s matches Figma", (name, value) => {
    const figmaValue = figma[toFigmaName(name)];
    expect(figmaValue, `no Figma variable for --${name} (${toFigmaName(name)})`).toBeDefined();
    expect(value.toLowerCase()).toBe(String(figmaValue).toLowerCase());
  });
});

describe("tokens.css light / dark", () => {
  it("defines the same set of variables in both modes", () => {
    expect([...MODES.dark.keys()].sort()).toEqual([...MODES.light.keys()].sort());
  });
});
