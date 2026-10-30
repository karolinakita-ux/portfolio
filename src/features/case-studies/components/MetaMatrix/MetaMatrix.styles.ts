import { clsx } from "clsx";

/** Figma: Info Table. Label Title Medium in textSecondary, value Body Large; 24px padding, 8px between them. */
export const styles = {
  root: clsx("mt-md grid rounded-md border border-border-subtle bg-bg-surface-raised lg:grid-cols-4"),
  /** Dividers are per-cell borders: stacked rows on mobile, columns + a wide row on lg. */
  cell: (index: number, wide: boolean) =>
    clsx(
      "flex min-w-0 flex-col gap-xs border-border-subtle p-md md:p-lg",
      index > 0 && "border-t",
      wide ? "lg:col-span-4" : index > 0 && "lg:border-t-0 lg:border-l",
    ),
  term: clsx("text-title-md text-text-secondary"),
  value: clsx("text-body-lg text-text-primary"),
};
