import { cva } from "class-variance-authority";

import type { CardGap, CardLayout } from "./Card.types.ts";

const LAYOUT: Record<CardLayout, string> = {
  stack: "flex flex-col p-lg",
  media: "grid p-md md:items-center md:p-lg",
};

const GAP: Record<CardGap, string> = { sm: "gap-sm", md: "gap-md", lg: "gap-lg" };

/**
 * Figma: Card. A raised surface with a hairline border; cards in a list fade up as they scroll
 * into view (reveal-on-scroll, utilities.css). Grid columns for the media layout come from the caller.
 */
export const card = cva("reveal-on-scroll rounded-md border border-border-subtle bg-bg-surface-raised shadow-sm", {
  variants: { layout: LAYOUT, gap: GAP },
  defaultVariants: { layout: "stack", gap: "sm" },
});
