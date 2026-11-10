import { clsx } from "clsx";

export const styles = {
  card: clsx("w-full"),
  quoteMark: clsx("text-bg-accent-brand"),
  quote: clsx("flex-1 text-body-md text-text-secondary"),
  /** Under the quote, above the line: the translation badge and where we worked together. */
  context: clsx("flex flex-wrap items-center gap-x-sm gap-y-xs"),
  caption: clsx("flex items-center gap-sm border-t border-border-subtle pt-md"),
  person: clsx("flex min-w-0 flex-col items-start gap-3xs"),
  name: clsx("text-title-sm"),
  /**
   * As tall as a link in it (24px, LinkedInTextLink), so a line without one ("Psychologist") keeps the author
   * block, and the line above it, level with the cards beside it.
   */
  role: clsx("min-h-lg content-center text-body-sm text-text-secondary"),
};
