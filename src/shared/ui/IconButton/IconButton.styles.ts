import { clsx } from "clsx";

import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  root: (className?: string) =>
    clsx(
      "relative inline-flex size-xl shrink-0 cursor-pointer items-center justify-center rounded-md border border-border-subtle",
      // On a touch screen the 32px button takes taps 4px around it too: a 40px target, drawn no larger. The layer is
      // placed from inside the 1px border, hence the extra -1px margin.
      "pointer-coarse:before:absolute pointer-coarse:before:-inset-2xs pointer-coarse:before:-m-px",
      "bg-bg-surface-raised text-text-primary shadow-sm transition-[color,background-color,border-color,scale] duration-fast ease-standard",
      // Pressed feedback: touch screens have no tap highlight (Tailwind removes it).
      "motion-safe:not-aria-disabled:active:scale-95",
      "hover:border-border-interactive-hover hover:bg-bg-surface-default",
      // aria-disabled (not disabled) keeps focus on the button when it hits a limit, e.g. max zoom.
      "aria-disabled:cursor-not-allowed aria-disabled:border-border-interactive-disabled aria-disabled:bg-bg-surface-raised",
      "aria-disabled:text-text-interactive-disabled aria-disabled:shadow-none",
      FOCUS_RING,
      className,
    ),
};
