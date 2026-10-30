import { cva } from "class-variance-authority";

import type { BadgeTone, BadgeWeight } from "./Badge.types.ts";

const WEIGHT: Record<BadgeWeight, string> = { regular: "", medium: "font-medium" };

/**
 * neutral: a tag; warning: a planned item (a roadmap status); error / success: a measured result (the text says
 * what it is, the colour only repeats it). The tone shows in the fill and border; the label stays text-primary,
 * as in Figma's bento badge: the status text colours reach only 3.9:1 (success) at Label Small, below 4.5:1.
 */
const TONE: Record<BadgeTone, string> = {
  neutral: "bg-bg-badge-default text-text-primary",
  error: "border border-status-error-border bg-status-error-surface text-text-primary",
  success: "border border-status-success-border bg-status-success-surface text-text-primary",
  warning: "border border-status-warning-border bg-status-warning-surface text-text-primary",
};

/** Figma: Badge. Pill, Label Small; neutral on bgBadgeDefault, or a status tone (Figma: chip). */
export const badge = cva("rounded-full px-sm py-3xs text-label-sm", {
  variants: { weight: WEIGHT, tone: TONE },
  defaultVariants: { weight: "regular", tone: "neutral" },
});
