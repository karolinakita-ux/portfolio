import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  /** At least 24px tall, so the stacked links stay easy to tap (WCAG 2.5.8). */
  root: cn(
    "inline-flex min-h-lg items-center gap-2xs rounded-sm text-text-link-default underline underline-offset-2 hover:text-text-link-hover",
    FOCUS_RING,
  ),
  icon: cn("shrink-0"),
};
