import { clsx } from "clsx";

import { TEXT_LINK } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  /** At least 24px tall, so the stacked links stay easy to tap (WCAG 2.5.8). */
  root: clsx("inline-flex min-h-lg items-center gap-2xs", TEXT_LINK),
  icon: clsx("shrink-0"),
};
