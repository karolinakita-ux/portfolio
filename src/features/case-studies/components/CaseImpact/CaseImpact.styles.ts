import { clsx } from "clsx";

export const styles = {
  /** Stacked below md; from md two cards share a row when there are two (or four), otherwise three. */
  stats: (count: number) =>
    clsx("grid list-none gap-lg", count % 2 === 0 && count < 6 ? "md:grid-cols-2" : "md:grid-cols-3"),
  statItem: clsx("flex min-w-0"),
  card: clsx("w-full"),
  value: clsx("font-display text-headline-md font-medium text-text-primary"),
  label: clsx("text-body-md text-text-secondary"),
  note: clsx("text-body-sm text-text-secondary"),
};
