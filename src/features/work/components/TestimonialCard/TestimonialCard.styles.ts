import { clsx } from "clsx";

/**
 * The card's 4 parts sit in the 4 rows the carousel's cards share (TESTIMONIAL_ROWS, Card layout="rows"): the
 * quote mark, the quote, what qualifies it, the author. Each row is as tall as its tallest part in the row, so
 * the line above the authors stays level even where a job line wraps (tablet width) or a card has no context.
 */
export const styles = {
  card: clsx("w-full"),
  quoteMark: clsx("row-start-1 text-bg-accent-brand"),
  quote: clsx("row-start-2 text-body-md text-text-secondary"),
  /** Under the quote, above the line: the translation badge and where we worked together. */
  context: clsx("row-start-3 flex flex-wrap items-center gap-x-sm gap-y-xs self-end"),
  caption: clsx("row-start-4 flex items-center gap-sm border-t border-border-subtle pt-md"),
  person: clsx("flex min-w-0 flex-col items-start gap-3xs"),
  name: clsx("text-title-sm"),
  /**
   * As tall as a link in it (24px, LinkedInTextLink), so a line without one ("Psychologist") keeps the author
   * block, and the line above it, level with the cards beside it.
   */
  role: clsx("min-h-lg content-center text-body-sm text-text-secondary"),
};
