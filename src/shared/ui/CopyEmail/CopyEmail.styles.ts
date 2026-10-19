import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn("relative inline-flex min-w-0 flex-wrap items-center gap-xs"),
  link: cn(
    "inline-flex min-w-0 items-center gap-sm rounded-sm text-text-link-default underline underline-offset-2 hover:text-text-link-hover",
    FOCUS_RING,
  ),
  address: (textClassName?: string) => cn("min-w-0 break-all", textClassName ?? "text-body-md"),
  srOnly: cn("sr-only"),
  buttonCell: cn("inline-flex shrink-0"),
  button: cn(
    "inline-flex size-xl items-center justify-center rounded-sm text-text-link-default transition-[color,background-color] duration-fast",
    "hover:bg-bg-accent-brand-subtle hover:text-text-link-hover",
    FOCUS_RING,
  ),
  /** Visible bubble above the row while there is feedback; otherwise only the screen reader live region. */
  feedback: (visible: boolean) =>
    cn(
      visible
        ? "absolute bottom-full left-0 z-10 mb-2xs rounded-sm bg-text-primary px-xs py-2xs text-label-sm whitespace-nowrap text-bg-canvas shadow-md motion-safe:animate-view-in"
        : "sr-only",
    ),
};
