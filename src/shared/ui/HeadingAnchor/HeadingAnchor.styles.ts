import { clsx } from "clsx";

import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  /**
   * Shown on hover and keyboard focus, always on touch screens and while "copied" shows; hidden in print.
   * It appears at once, without a fade: fading it in would fade its focus ring in too (e2e/motion-a11y).
   */
  link: (copied: boolean) =>
    clsx(
      "inline-flex size-lg shrink-0 items-center justify-center rounded-sm text-text-secondary",
      "hover:text-text-primary print:hidden",
      copied ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100",
      FOCUS_RING,
    ),
  status: clsx("sr-only"),
};
