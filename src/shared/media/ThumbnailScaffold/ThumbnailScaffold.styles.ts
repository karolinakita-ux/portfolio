import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn("absolute inset-0 flex flex-col items-center justify-center gap-xs p-md"),
  /** Pulses twice (2 x 2s) while loading, then holds still: nothing loops past 5 s (WCAG 2.2.2). */
  wireframe: (failed: boolean) =>
    cn("h-full w-full", !failed && "motion-safe:animate-pulse motion-safe:[animation-iteration-count:2]"),
  frame: cn("fill-bg-surface-raised stroke-border-subtle"),
  titleBar: cn("fill-bg-accent-brand-subtle"),
  mark: cn("fill-border-default"),
  panel: cn("fill-bg-surface-default stroke-border-subtle"),
  line: cn("fill-border-subtle"),
  accentPanel: cn("fill-bg-accent-brand-subtle stroke-border-subtle"),
  label: cn("inline-flex items-center gap-2xs text-label-sm text-text-secondary"),
};
