import { clsx } from "clsx";

export const styles = {
  /** One column on phones; from md, two cards side by side or three for three or more, so no column stays empty. */
  list: (count: number) => clsx("grid list-none gap-md", count === 2 ? "md:grid-cols-2" : "md:grid-cols-3"),
  /** Info-tinted card: the same surface and border as the info Callout, so it reads as a takeaway, not a control. */
  item: clsx("flex min-w-0 flex-col gap-sm rounded-md border border-status-info-border bg-status-info-surface p-lg"),
  /** Decorative: the ordered list already gives the position to assistive tech. */
  number: clsx("font-display text-headline-lg text-status-info-text"),
  title: clsx("font-display text-headline-sm text-balance text-text-primary"),
  body: clsx("text-body-md text-text-secondary"),
};
