import { clsx } from "clsx";

import { BUTTON_HEIGHT, FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  /** As tall as a bordered Button (BUTTON_HEIGHT): a row of these links that wraps is spaced like buttons. */
  root: clsx(
    "group/link inline-flex items-center gap-2xs rounded-sm text-label-lg font-semibold decoration-1 underline-offset-4 hover:underline",
    BUTTON_HEIGHT,
    FOCUS_RING,
  ),
  icon: clsx("shrink-0"),
  /** Nudges up and out on hover: the link leaves the site. */
  arrow: clsx(
    "shrink-0 transition-transform duration-fast motion-safe:group-hover/link:translate-x-3xs motion-safe:group-hover/link:-translate-y-3xs",
  ),
};
