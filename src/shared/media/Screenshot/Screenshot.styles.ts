import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  failed: cn(
    "relative aspect-thumb min-w-0 overflow-hidden rounded-sm border border-border-subtle bg-bg-surface-default",
  ),
  srOnly: cn("sr-only"),
  image: (expandable: boolean) =>
    cn(
      "block h-auto w-full transition-transform duration-slow ease-standard",
      expandable && "motion-safe:group-hover/zoom:scale-[1.02]",
    ),
  frame: cn("min-w-0 overflow-hidden rounded-sm border border-border-subtle bg-bg-surface-default"),
  button: cn(
    "group/zoom relative block w-full min-w-0 cursor-zoom-in overflow-hidden rounded-sm border border-border-subtle bg-bg-surface-default text-left",
    FOCUS_RING,
  ),
  /** Visible affordance: always shown (touch screens have no hover), label expands on hover / focus. */
  badge: cn(
    "pointer-events-none absolute top-xs right-xs inline-flex items-center gap-2xs rounded-sm border border-border-subtle",
    "bg-bg-surface-raised px-xs py-2xs text-label-sm text-text-primary shadow-sm",
  ),
  badgeLabel: cn("hidden group-hover/zoom:inline group-focus-visible/zoom:inline"),
};
