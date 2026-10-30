import { clsx } from "clsx";

import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

/** Figma: Screenshot frame - 12px radius, hairline border, medium elevation (case-study visual column). */
const FRAME = "overflow-hidden rounded-lg border border-border-subtle bg-bg-surface-default shadow-md";
/** An image with its own rounded card and shadow sits on the page as it is. */
const BARE = "overflow-hidden rounded-lg";

export const styles = {
  failed: clsx(
    "relative aspect-thumb min-w-0 overflow-hidden rounded-lg border border-border-subtle bg-bg-surface-default",
  ),
  image: (expandable: boolean) =>
    clsx("block h-auto w-full transition-transform duration-slow ease-standard", {
      "motion-safe:group-hover/zoom:scale-[1.02]": expandable,
    }),
  frame: (frameless: boolean) => clsx("min-w-0", frameless ? BARE : FRAME),
  button: (frameless: boolean) =>
    clsx("group/zoom relative block w-full min-w-0 cursor-zoom-in text-left", frameless ? BARE : FRAME, FOCUS_RING),
  /** Visible affordance: always shown (touch screens have no hover), label expands on hover / focus. */
  badge: clsx(
    "pointer-events-none absolute top-xs right-xs inline-flex items-center gap-2xs rounded-sm border border-border-subtle",
    "bg-bg-surface-raised px-xs py-2xs text-label-sm text-text-primary shadow-sm",
  ),
  badgeLabel: clsx("hidden group-hover/zoom:inline group-focus-visible/zoom:inline"),
};
