import { clsx } from "clsx";

import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

/**
 * Figma: Breadcrumb (Karolina, 2026-10-31). Body Small; 8px between a crumb and the chevron on each side, 4px from
 * Home's house to its label.
 */
export const styles = {
  list: clsx("flex flex-wrap items-center gap-xs text-body-sm text-text-secondary"),
  item: clsx("flex items-center gap-xs"),
  current: clsx("text-text-primary"),
  link: clsx(
    "inline-flex items-center gap-2xs rounded-sm underline underline-offset-2 hover:text-text-primary",
    FOCUS_RING,
  ),
};
