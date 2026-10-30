import { clsx } from "clsx";

import { CV_LINK } from "#features/cv/cv.styles.ts";
import { BUTTON_HEIGHT } from "#shared/lib/ui/ui.styles.ts";

/**
 * A contact item: as tall as a Button on screen, so the row spaced like buttons when it wraps on phones (Karolina's
 * rule, and 24px targets for WCAG 2.5.8); Figma's plain 16px line on paper. max-w-full: a long address breaks
 * instead of pushing the page wider at a large text size.
 */
const CONTACT = clsx("inline-block max-w-full", BUTTON_HEIGHT, "print:border-y-0 print:py-0");

export const styles = {
  /** A hairline under the header, 32px below the contacts (Figma: 8px space, then the line 24px down). */
  root: clsx("flex flex-col gap-sm border-b border-border-subtle pb-xl"),
  name: clsx("font-display text-headline-lg text-text-primary"),
  headline: clsx("text-title-md text-text-primary"),
  /** -my-xs: the items' button height overlaps the space around the row, so the text sits where Figma has it. */
  contacts: clsx("-my-xs flex flex-wrap gap-x-md gap-y-sm text-body-sm text-text-secondary print:my-0 print:gap-y-2xs"),
  item: clsx("max-w-full min-w-0"),
  text: CONTACT,
  link: clsx(CONTACT, CV_LINK),
};
