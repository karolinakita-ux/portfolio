import { clsx } from "clsx";

import { PILL, pillVisibility } from "#shared/layout/pill/pill.styles.ts";
import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  /** kb-site-header: base.css keeps focus on its links and buttons from scrolling the page. */
  root: (scrolled: boolean) =>
    clsx(
      "kb-site-header sticky z-header border-b border-border-subtle bg-bg-canvas px-lg pt-sm pb-xs md:px-2xl md:py-sm lg:px-4xl short:static",
      "transition-[box-shadow,background-color,border-color] duration-medium ease-standard",
      scrolled ? "shadow-sm" : "shadow-none",
    ),
  /** Phones: flex-wrap puts the nav on its own row below. From md: a 3-column grid keeps the nav centred. */
  row: clsx(
    "mx-auto flex w-full max-w-header flex-wrap items-center justify-between gap-x-md gap-y-xs md:grid md:grid-cols-header",
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
  /**
   * The current page's underline: the gold pill alone is 1.54:1 on the white header, under the 3:1 a state needs
   * (WCAG 1.4.11). Inside the pill, so it rides, fades and jumps with it. Placed like the 2px text underline 4px
   * under the label it replaced (the same pixels in Chromium): as wide as the label (inset-x-sm is the link's px-sm,
   * -mx-px makes up for the pill's 1px border) and its own height below bottom-xs (the link's py-xs). A border in
   * the pill's colour (the label's text-on-accent), not a background: forced colours drop backgrounds, keep borders.
   */
  underline: clsx("absolute inset-x-sm bottom-xs -mx-px translate-y-full border-b-2 border-current"),
  theme: clsx("justify-self-end"),
};
