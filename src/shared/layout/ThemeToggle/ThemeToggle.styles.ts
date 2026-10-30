import { clsx } from "clsx";

import { PILL } from "#shared/layout/pill/pill.styles.ts";
import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

/**
 * The pressed look (label colour, visible pill, filled icon) follows each button's aria-pressed, not the
 * theme prop: the inline script in index.html presses the applied theme's button in the prerendered HTML
 * before the app runs, and the look follows it. So what is shown and what assistive tech hears always agree.
 */
export const styles = {
  // isolate: the pills (-z-10) sit above the group's background. kb-theme-toggle names the
  // group's own view-transition layer, so on a theme change its pill slides instead of fading.
  group: clsx(
    "kb-theme-toggle isolate inline-flex items-center gap-2xs rounded-md border border-border-subtle bg-bg-surface-raised p-2xs shadow-sm",
  ),
  // No hover background on the pressed button: it would cover its pill.
  button: clsx(
    "group/theme relative inline-flex items-center justify-center rounded-sm px-md py-xs text-text-secondary transition-[color,background-color] duration-medium ease-standard not-aria-pressed:hover:bg-bg-surface-default not-aria-pressed:hover:text-text-primary aria-pressed:text-text-on-accent",
    FOCUS_RING,
  ),
  pill: clsx(PILL, "rounded-sm opacity-0 shadow-sm group-aria-pressed/theme:opacity-100"),
  // fill-current beats the icon's fill="none" attribute.
  icon: clsx("group-aria-pressed/theme:fill-current"),
};
