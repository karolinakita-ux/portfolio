import { clsx } from "clsx";

export const styles = {
  list: clsx("grid gap-md md:grid-cols-2"),
  item: clsx("min-w-0"),
  card: clsx("h-full"),
  quoteMark: clsx("text-bg-accent-brand"),
  quote: clsx("flex-1 text-body-md text-text-secondary"),
  caption: clsx("flex items-center gap-sm border-t border-border-subtle pt-md"),
  person: clsx("flex min-w-0 flex-col items-start gap-3xs"),
  name: clsx("text-title-sm"),
  role: clsx("text-body-sm text-text-secondary"),
  /** A section-closing action sits at the end of the row, like the About page's. */
  more: clsx("flex justify-end"),
};
