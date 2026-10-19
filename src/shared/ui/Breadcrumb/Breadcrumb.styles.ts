import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  list: cn("flex flex-wrap items-center gap-2xs text-body-sm text-text-secondary"),
  item: cn("flex items-center gap-2xs"),
  current: cn("text-text-primary"),
  link: cn(
    "inline-flex items-center gap-2xs rounded-sm underline underline-offset-2 hover:text-text-primary",
    FOCUS_RING,
  ),
};
