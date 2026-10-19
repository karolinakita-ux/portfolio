import { prefersReducedMotion } from "#shared/lib/ui/ui.utils.ts";

import { MOTION_DURATION, MOTION_EASING } from "./motion.constants.ts";
import type { AnimationTiming, MotionDuration, MotionEasing } from "./motion.types.ts";

/** A CSS time in milliseconds ("240ms" → 240, "0.3s" → 300), or null when it is not one. */
export const parseCssTime = (value: string): number | null => {
  const match = /^(\d*\.?\d+)(ms|s)$/.exec(value.trim());
  if (!match) return null;
  const amount = Number(match[1]);
  return match[2] === "s" ? amount * 1000 : amount;
};

/** A custom property's value on <html>, trimmed; "" when unset. */
const readRootProperty = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Duration and easing for element.animate(), from the motion tokens. Null when the animation
 * should not run, so the caller just shows the end state: reduced motion is on, the browser
 * has no Web Animations API, or a token is missing, zero or unreadable.
 */
export function animationTiming(
  duration: MotionDuration = "medium",
  easing: MotionEasing = "standard",
): AnimationTiming | null {
  // No Element outside a browser (the prerender), no animate() in jsdom or very old browsers.
  if (typeof Element === "undefined" || typeof Element.prototype.animate !== "function") return null;
  if (prefersReducedMotion()) return null;
  const ms = parseCssTime(readRootProperty(MOTION_DURATION[duration]));
  const curve = readRootProperty(MOTION_EASING[easing]);
  if (ms === null || ms <= 0 || curve === "") return null;
  return { duration: ms, easing: curve };
}
