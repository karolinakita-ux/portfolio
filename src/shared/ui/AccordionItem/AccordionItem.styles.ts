import { clsx } from "clsx";

import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  root: clsx("rounded-md border border-border-subtle bg-bg-surface-default"),
  heading: clsx("text-title-md text-text-primary"),
  button: clsx(
    "flex w-full items-center justify-between gap-md rounded-md px-lg py-md text-left",
    "transition-[color] duration-fast hover:text-text-secondary",
    FOCUS_RING,
  ),
  title: clsx("min-w-0"),
  chevron: (open: boolean) =>
    clsx("shrink-0 text-text-secondary transition-transform duration-medium ease-standard", { "rotate-180": open }),
  /** Height animates via grid-template-rows 0fr → 1fr (no measured heights). */
  panel: (open: boolean) =>
    clsx(
      "grid transition-[grid-template-rows] duration-medium ease-standard",
      open ? "grid-rows-expanded" : "grid-rows-collapsed",
    ),
  clip: clsx("overflow-hidden"),
  body: clsx("flex flex-col gap-sm px-lg pb-lg"),
};
