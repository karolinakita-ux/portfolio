import { clsx } from "clsx";

export const styles = {
  root: clsx("mt-xl grid rounded-md border border-border-subtle bg-bg-surface-raised shadow-sm lg:grid-cols-4"),
  /** Dividers are per-cell borders: stacked rows on mobile, columns + a wide row on lg. */
  cell: (index: number, wide: boolean) =>
    clsx(
      "flex min-w-0 flex-col gap-2xs border-border-subtle p-md",
      index > 0 && "border-t",
      wide ? "lg:col-span-4" : index > 0 && "lg:border-t-0 lg:border-l",
    ),
  term: clsx("text-body-sm text-text-secondary"),
  value: clsx("text-body-md text-text-primary"),
};
