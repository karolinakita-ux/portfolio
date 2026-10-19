import { expect, type Page } from "@playwright/test";

import type { MotionTokens } from "./helpers.types.ts";

/** A CSS custom property on <html>, trimmed ("" when it is not defined). */
export async function cssToken(page: Page, name: string): Promise<string> {
  return page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
}

/** "240ms" or "0.24s" → 240. */
export function toMs(value: string): number {
  const match = /^(-?[\d.]+)(ms|s)$/.exec(value.trim());
  if (!match) throw new Error(`not a CSS time: "${value}"`);
  return Number(match[1]) * (match[2] === "s" ? 1000 : 1);
}

/** --motion-duration-medium and --motion-easing-standard: the timing of every travel and fade. */
export async function motionTokens(page: Page): Promise<MotionTokens> {
  const duration = await cssToken(page, "--motion-duration-medium");
  const easing = await cssToken(page, "--motion-easing-standard");
  expect(duration, "--motion-duration-medium is defined").not.toBe("");
  expect(easing, "--motion-easing-standard is defined").not.toBe("");
  return { durationMs: toMs(duration), easing };
}

/** One spelling per easing: minified CSS has "cubic-bezier(.2,0,0,1)", the Web Animations API "cubic-bezier(0.2, 0, 0, 1)". */
export const sameEasing = (easing: string): string =>
  easing
    .replace(/\s+/g, " ")
    .replace(/-?\d*\.?\d+/g, (number) => String(Number(number)))
    .replace(/\s*([(),])\s*/g, "$1");
