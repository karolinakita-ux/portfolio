import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  /** Shown on hover and keyboard focus, always on touch screens and while "copied" shows; hidden in print. */
  link: (copied: boolean) =>
    cn(
      "inline-flex size-lg shrink-0 items-center justify-center rounded-sm text-text-secondary",
      "transition-opacity duration-fast hover:text-text-primary print:hidden",
      copied ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100",
      FOCUS_RING,
    ),
  status: cn("sr-only"),
};
