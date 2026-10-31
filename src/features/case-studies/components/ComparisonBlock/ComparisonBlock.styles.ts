import { clsx } from "clsx";

export const styles = {
  /** A card in the middle of a case study: it fades up as it scrolls into view, like the screenshot rows. */
  root: clsx("flex reveal-on-scroll flex-col gap-lg"),
  header: clsx("flex flex-col gap-xs"),
  title: clsx("text-title-lg text-balance text-text-primary"),
  intro: clsx("text-body-lg text-text-secondary"),
  columns: clsx("grid gap-lg md:grid-cols-2"),
  rationale: clsx(
    "grid gap-lg rounded-lg border border-border-subtle bg-bg-surface-raised p-md md:grid-cols-2 md:p-lg",
  ),
  rationaleColumn: clsx("flex min-w-0 flex-col gap-sm"),
  rationaleTitle: clsx("text-label-md font-bold text-text-primary uppercase"),
  shiftList: clsx("flex list-none flex-col gap-xs text-body-md"),
  /** An arrow marker (hidden from screen readers), then the change. */
  shiftItem: clsx("flex gap-xs"),
};
