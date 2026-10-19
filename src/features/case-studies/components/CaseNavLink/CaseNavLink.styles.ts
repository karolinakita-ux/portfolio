import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  /** The arrow nudges outward on hover. */
  arrow: (isNext: boolean) =>
    cn(
      "shrink-0 transition-transform duration-fast ease-standard",
      isNext ? "motion-safe:group-hover/nav:translate-x-2xs" : "motion-safe:group-hover/nav:-translate-x-2xs",
    ),
  root: (isNext: boolean) =>
    cn(
      "group/nav flex min-w-0 flex-col gap-2xs rounded-sm px-2xs py-xs",
      isNext ? "ml-auto items-end text-right" : "items-start",
      FOCUS_RING,
    ),
  action: cn(
    "inline-flex items-center gap-xs text-label-lg text-text-primary decoration-1 underline-offset-4 group-hover/nav:underline",
  ),
  label: cn("text-body-sm text-text-secondary transition-colors duration-fast group-hover/nav:text-text-primary"),
};
