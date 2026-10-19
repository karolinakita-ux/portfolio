import { clsx } from "clsx";

import { FOCUS_RING, TEXT_LINK } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  root: clsx("relative inline-flex min-w-0 flex-wrap items-center gap-xs"),
  link: clsx("inline-flex min-w-0 items-center gap-sm", TEXT_LINK),
  address: (textClassName?: string) => clsx("min-w-0 break-all", textClassName ?? "text-body-md"),
  buttonCell: clsx("inline-flex shrink-0"),
  button: clsx(
    "inline-flex size-xl items-center justify-center rounded-sm text-text-link-default transition-[color,background-color] duration-fast",
    "hover:bg-bg-accent-brand-subtle hover:text-text-link-hover",
    FOCUS_RING,
  ),
  /** Visible bubble above the row while there is feedback; otherwise only the screen reader live region. */
  feedback: (visible: boolean) =>
    clsx(
      visible
        ? "absolute bottom-full left-0 z-10 mb-2xs rounded-sm bg-text-primary px-xs py-2xs text-label-sm whitespace-nowrap text-bg-canvas shadow-md motion-safe:animate-view-in"
        : "sr-only",
    ),
};
