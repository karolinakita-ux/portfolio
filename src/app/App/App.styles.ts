import { clsx } from "clsx";

import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  root: clsx(
    "flex min-h-screen flex-col bg-bg-canvas font-sans text-text-primary antialiased",
    "selection:bg-bg-accent-brand-subtle selection:text-text-primary",
  ),
  skipLink: clsx(
    "sr-only focus:not-sr-only focus:fixed focus:top-md focus:left-md focus:z-skip",
    "focus:rounded-md focus:bg-bg-surface-raised focus:px-md focus:py-xs focus:text-label-lg focus:shadow-md",
    "print:hidden",
    FOCUS_RING,
  ),
  /** Site chrome: no box on screen (the sticky header behaves as before), removed on paper. */
  chrome: clsx("contents print:hidden"),
  main: clsx("flex-1 pb-3xl focus:outline-none lg:pb-4xl print:pb-0"),
  /** A new view fades in; the first one is already on screen as prerendered HTML. */
  view: (viewKey: number) => (viewKey > 0 ? clsx("motion-safe:animate-view-in") : undefined),
};
