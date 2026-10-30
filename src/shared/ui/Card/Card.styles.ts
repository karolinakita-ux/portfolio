import { cva } from "class-variance-authority";

import type { CardGap, CardLayout } from "./Card.types.ts";

const LAYOUT: Record<CardLayout, string> = {
  stack: "flex flex-col p-lg",
  media: "grid p-md md:items-center md:p-lg",
};

const GAP: Record<CardGap, string> = { sm: "gap-sm", md: "gap-md", lg: "gap-lg" };

/**
 * Figma: Card. A raised surface with a hairline border; cards in a list fade up as they scroll
 * into view from tablet width up (reveal-on-scroll, utilities.css), except where `reveal` is off: the
 * closing sections of a case study, after its impact, stay still (docs/motion.md, Scroll reveal).
 * Grid columns for the media layout come from the caller.
 */
export const card = cva("rounded-md border border-border-subtle bg-bg-surface-raised shadow-sm", {
  variants: { layout: LAYOUT, gap: GAP, reveal: { true: "reveal-on-scroll", false: "" } },
  defaultVariants: { layout: "stack", gap: "sm", reveal: true },
});
