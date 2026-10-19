import { clsx } from "clsx";

import { PILL, pillVisibility } from "#shared/layout/pill/pill.styles.ts";
import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  root: (scrolled: boolean) =>
    clsx(
      "sticky z-header border-b border-border-subtle bg-bg-canvas px-lg pt-sm pb-xs md:px-2xl md:py-sm lg:px-4xl short:static",
      "transition-[box-shadow,background-color,border-color] duration-medium ease-standard",
      scrolled ? "shadow-sm" : "shadow-none",
    ),
  /** Phones: flex-wrap puts the nav on its own row below. From md: a 3-column grid keeps the nav centred. */
  row: clsx(
    "mx-auto flex w-full max-w-header flex-wrap items-center justify-between gap-x-md gap-y-2xs md:grid md:grid-cols-header",
  ),
  home: clsx("block cursor-pointer justify-self-start rounded-sm", FOCUS_RING),
  nav: clsx("order-last w-full md:order-none md:w-auto"),
  /** isolate: every pill (-z-10) stays below every label while one slides past the others. */
  list: clsx("isolate flex flex-wrap items-center justify-center gap-2xs"),
  /** The label colour changes with the pill (medium), so it is never dark on dark for long. */
  link: (active: boolean) =>
    clsx(
      "relative block rounded-md px-sm py-xs text-label-lg transition-[color,background-color] duration-medium ease-standard",
      active ? "text-text-on-accent" : "text-text-primary hover:bg-bg-surface-default",
      FOCUS_RING,
    ),
  pill: (active: boolean) => clsx(PILL, "rounded-md", pillVisibility(active)),
  theme: clsx("justify-self-end"),
};
