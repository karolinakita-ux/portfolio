import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { FOCUS_RING } from "#shared/lib/ui/ui.styles.ts";

/**
 * Previous / next case study link. place: `end` closes the case study (action over the case name, the
 * next one on the right), `top` sits beside the breadcrumb (one line, at least 24px tall for WCAG 2.5.8).
 */
export const caseNavLink = cva(["group/nav flex min-w-0 rounded-sm px-2xs", FOCUS_RING], {
  variants: {
    place: { top: "items-center py-2xs", end: "flex-col gap-2xs py-xs" },
    direction: { prev: "", next: "" },
  },
  compoundVariants: [
    { place: "end", direction: "prev", className: "items-start" },
    { place: "end", direction: "next", className: "ml-auto items-end text-right" },
  ],
});

export const styles = {
  /** The arrow nudges outward on hover. */
  arrow: (isNext: boolean) =>
    clsx(
      "shrink-0 transition-transform duration-fast ease-standard",
      isNext ? "motion-safe:group-hover/nav:translate-x-2xs" : "motion-safe:group-hover/nav:-translate-x-2xs",
    ),
  action: clsx(
    "inline-flex items-center gap-xs text-label-lg text-text-primary decoration-1 underline-offset-4 group-hover/nav:underline",
  ),
  label: clsx("text-body-sm text-text-secondary transition-colors duration-fast group-hover/nav:text-text-primary"),
};
