import { clsx } from "clsx";

/** Class lists shared by many components (each component's own classes: its *.styles.ts). */

/** Denim focus ring (borderInteractiveFocus), keyboard only. */
export const FOCUS_RING = clsx(
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-interactive-focus",
);

/** A text link: link colour, underline, hover colour, focus ring. Layout classes go next to it. */
export const TEXT_LINK = clsx(
  "rounded-sm text-text-link-default underline underline-offset-2 hover:text-text-link-hover",
  FOCUS_RING,
);

/**
 * A text link in a row of links that can wrap: as tall as a bordered Button (its py-xs and 1px border,
 * Button.styles.ts), and the row takes the buttons' gap (gap-y-sm). Wrapped rows then sit as far apart
 * as buttons would (Karolina's rule).
 */
export const BUTTON_HEIGHT = clsx("border-y border-transparent py-xs");

/** Case-study bullet list: Body Medium, disc markers in textSecondary. */
export const BULLET_LIST = clsx(
  "flex list-disc flex-col gap-xs pl-lg text-body-md text-text-secondary marker:text-text-secondary",
);
