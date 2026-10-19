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

/** Case-study bullet list: Body Medium, disc markers in textSecondary. */
export const BULLET_LIST = clsx(
  "flex list-disc flex-col gap-xs pl-lg text-body-md text-text-secondary marker:text-text-secondary",
);

/**
 * Inline links in printable documents (the CV): denim on screen,
 * plain dark text on paper (the URL is the visible label).
 */
export const DOC_LINK = clsx(TEXT_LINK, "print:text-text-primary print:no-underline");
