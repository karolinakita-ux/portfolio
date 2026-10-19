import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn(
    "group/link inline-flex items-center gap-2xs rounded-sm text-label-lg font-semibold decoration-1 underline-offset-4 hover:underline",
    FOCUS_RING,
  ),
  icon: cn("shrink-0"),
  arrow: cn(
    "shrink-0 transition-transform duration-fast motion-safe:group-hover/link:translate-x-3xs motion-safe:group-hover/link:-translate-y-3xs",
  ),
  srOnly: cn("sr-only"),
};
