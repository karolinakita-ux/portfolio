import { cn } from "./ui.utils.ts";

/** Class lists shared by many components (each component's own classes: its *.styles.ts). */

/** Denim focus ring (borderInteractiveFocus), keyboard only. */
export const FOCUS_RING = cn(
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-interactive-focus",
);

/** Case-study bullet list: Body Medium, disc markers in textSecondary. */
export const BULLET_LIST = cn(
  "flex list-disc flex-col gap-xs pl-lg text-body-md text-text-secondary marker:text-text-secondary",
);

/**
 * Inline links in printable documents (the CV): denim on screen,
 * plain dark text on paper (the URL is the visible label).
 */
export const DOC_LINK = cn(
  "rounded-sm text-text-link-default underline underline-offset-2 hover:text-text-link-hover",
  "print:text-text-primary print:no-underline",
  FOCUS_RING,
);
