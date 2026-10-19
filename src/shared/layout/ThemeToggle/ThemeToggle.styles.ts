import { PILL, pillVisibility } from "#shared/layout/pill/pill.styles.ts";
import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  // isolate: the pills (-z-10) sit above the group's background. kb-theme-toggle names the
  // group's own view-transition layer, so on a theme change its pill slides instead of fading.
  group: cn(
    "kb-theme-toggle isolate inline-flex items-center gap-2xs rounded-md border border-border-subtle bg-bg-surface-raised p-2xs shadow-sm",
  ),
  button: (active: boolean) =>
    cn(
      "relative inline-flex items-center justify-center rounded-sm px-md py-xs transition-[color,background-color] duration-medium ease-standard",
      active ? "text-text-on-accent" : "text-text-secondary hover:bg-bg-surface-default hover:text-text-primary",
      FOCUS_RING,
    ),
  pill: (active: boolean) => cn(PILL, "rounded-sm shadow-sm", pillVisibility(active)),
};
