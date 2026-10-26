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

/** Where the light block starts (the motion block before it is a :root too). */
const LIGHT_START = ":root {\n  color-scheme: light;";

/** Where the more-contrast overrides start (prefers-contrast: more), after the dark block. */
const MORE_CONTRAST_START = "/* More contrast";
const MORE_CONTRAST_DARK_START = "@media screen and (prefers-contrast: more)";

const MODES = {
  light: readBlock(LIGHT_START, "@media not print"),
  dark: readBlock(":root.dark", MORE_CONTRAST_START),
} as const;

/** The more-contrast modes declare only the tokens they change; every other token keeps its base mode's value. */
const MORE_CONTRAST = {
  lightMoreContrast: { base: "light", overrides: readBlock(MORE_CONTRAST_START, MORE_CONTRAST_DARK_START) },
  darkMoreContrast: { base: "dark", overrides: readBlock(MORE_CONTRAST_DARK_START) },
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

describe.each(Object.entries(MORE_CONTRAST))("tokens.css (%s)", (mode, { base, overrides }) => {
  const figma: Record<string, string | number> = figmaTokens.kitaBranding[mode as keyof typeof MORE_CONTRAST];

  it("changes only tokens its base mode declares, the same ones in light and dark", () => {
    expect(overrides.size).toBeGreaterThan(10);
    for (const name of overrides.keys()) expect(MODES[base].has(name), `--${name}`).toBe(true);
    expect([...overrides.keys()].sort()).toEqual([...MORE_CONTRAST.lightMoreContrast.overrides.keys()].sort());
  });

  it.each([...MODES[base]].filter(([name]) => !DERIVED.has(name)))("--%s matches Figma", (name, baseValue) => {
    const value = overrides.get(name) ?? baseValue;
    expect(value.toLowerCase()).toBe(String(figma[toFigmaName(name)]).toLowerCase());
  });
});

/**
 * Motion tokens are the same in both modes, so tokens.css declares them once, in their own
 * :root block. Figma stores durations as a number of milliseconds (motionDurationFast: 150).
 */
const MOTION = readBlock("/* Motion: the same in light and dark */", LIGHT_START);

/** The CSS value a Figma motion variable stands for: durations get their unit. */
const motionCssValue = (cssName: string, figmaValue: string | number) =>
  cssName.startsWith("motion-duration-") ? `${String(figmaValue)}ms` : String(figmaValue);

describe("tokens.css (motion)", () => {
  const { light, dark } = figmaTokens.kitaBranding as Record<keyof typeof MODES, Record<string, string | number>>;

  it("declares the duration and easing tokens", () => {
    expect([...MOTION.keys()]).toEqual(
      expect.arrayContaining(["motion-duration-fast", "motion-duration-medium", "motion-easing-standard"]),
    );
  });

  it.each([...MOTION])("--%s matches Figma in light and dark", (name, value) => {
    const figmaName = toFigmaName(name);
    expect(light[figmaName], `no Figma variable for --${name} (${figmaName})`).toBeDefined();
    expect(dark[figmaName], `${figmaName} differs between Figma modes`).toBe(light[figmaName]);
    expect(value.toLowerCase()).toBe(motionCssValue(name, light[figmaName] ?? "").toLowerCase());
  });

  it("declares every Figma motion variable", () => {
    const figmaMotion = Object.keys(light).filter((key) => key.startsWith("motion"));
    expect(figmaMotion.sort()).toEqual([...MOTION.keys()].map(toFigmaName).sort());
  });
});
