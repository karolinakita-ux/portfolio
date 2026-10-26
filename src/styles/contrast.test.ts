import { describe, expect, it } from "vitest";

import figmaTokens from "./kita-branding.tokens.json";

/**
 * More contrast (prefers-contrast: more, the Figma modes lightMoreContrast and darkMoreContrast): text people
 * read reaches 7:1 (WCAG 1.4.6) and borders and focus rings 3:1 (WCAG 1.4.11) on every ground they sit on.
 * Colours with an alpha channel are composited over the canvas first.
 */
type Mode = Record<string, string | number>;
const { lightMoreContrast, darkMoreContrast } = figmaTokens.kitaBranding as Record<string, Mode>;

const channels = (hex: string): [number, number, number, number] => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
  return [r, g, b, h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
};

/** A colour as it shows on an opaque ground. */
const over = (color: string, ground: string): string => {
  const [r, g, b, a] = channels(color);
  const [R, G, B] = channels(ground);
  const mix = (x: number, y: number) =>
    Math.round(x * a + y * (1 - a))
      .toString(16)
      .padStart(2, "0");
  return `#${mix(r, R)}${mix(g, G)}${mix(b, B)}`;
};

const luminance = (hex: string): number => {
  const linear = (c: number) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = channels(hex);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};

const ratio = (a: string, b: string): number => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (high + 0.05) / (low + 0.05);
};

const TEXT = ["textPrimary", "textSecondary", "textLinkDefault", "textLinkHover", "textInteractiveSecondary"];
const BORDERS = [
  "borderSubtle",
  "borderDefault",
  "borderInteractiveDefault",
  "borderInteractiveHover",
  "borderInteractiveFocus",
];
const STATUS = ["Info", "Warning", "Error", "Success"];

describe.each([
  ["light", lightMoreContrast],
  ["dark", darkMoreContrast],
] as const)("more contrast (%s)", (_name, mode) => {
  const color = (token: string): string => {
    const value = mode?.[token];
    if (typeof value !== "string") throw new Error(`no colour ${token}`);
    return value;
  };
  const canvas = color("bgCanvas");
  const grounds = [canvas, over(color("bgSurfaceDefault"), canvas), over(color("bgSurfaceRaised"), canvas)];

  it.each(TEXT)("%s reaches 7:1 on the canvas and the surfaces", (token) => {
    for (const ground of grounds) expect(ratio(color(token), ground)).toBeGreaterThanOrEqual(7);
  });

  it.each(BORDERS)("%s reaches 3:1 on the canvas and the surfaces", (token) => {
    for (const ground of grounds) expect(ratio(color(token), ground)).toBeGreaterThanOrEqual(3);
  });

  it.each(STATUS)("the %s callout: text 7:1 and border 3:1 on its surface", (tone) => {
    const surface = over(color(`status${tone}Surface`), canvas);
    expect(ratio(color(`status${tone}Text`), surface)).toBeGreaterThanOrEqual(7);
    expect(ratio(color(`status${tone}Border`), surface)).toBeGreaterThanOrEqual(3);
  });
});
