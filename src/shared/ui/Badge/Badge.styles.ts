import { cva } from "class-variance-authority";

import type { BadgeWeight } from "./Badge.types.ts";

const WEIGHT: Record<BadgeWeight, string> = { regular: "", medium: "font-medium" };

/** Figma: Badge. Pill on bgBadgeDefault, Label Small. */
export const badge = cva("rounded-full bg-bg-badge-default px-sm py-3xs text-label-sm text-text-primary", {
  variants: { weight: WEIGHT },
  defaultVariants: { weight: "regular" },
});
