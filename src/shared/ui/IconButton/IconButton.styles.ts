import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: (className?: string) =>
    cn(
      "inline-flex size-xl shrink-0 cursor-pointer items-center justify-center rounded-md border border-border-subtle",
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
