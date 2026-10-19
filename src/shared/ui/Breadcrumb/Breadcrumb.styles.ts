import { clsx } from "clsx";

import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  list: clsx("flex flex-wrap items-center gap-2xs text-body-sm text-text-secondary"),
  item: clsx("flex items-center gap-2xs"),
  current: clsx("text-text-primary"),
  link: clsx(
    "inline-flex items-center gap-2xs rounded-sm underline underline-offset-2 hover:text-text-primary",
    FOCUS_RING,
  ),
};
