import { clsx } from "clsx";

export const styles = {
  /**
   * From md the two sides share the parent's rows (subgrid): the taller header sets both, so the screens of
   * "before" and "after" start on the same line whatever the text and chip lengths.
   */
  root: clsx(
    "flex min-w-0 flex-col gap-md rounded-lg border border-border-subtle bg-bg-surface-raised p-md",
    "md:row-span-2 md:grid md:grid-rows-subgrid md:p-lg",
  ),
  header: clsx("flex flex-col gap-md"),
  /** The same title on both sides (body colour, bold); the side reads from its words and the chips' tone. */
  label: clsx("text-label-md font-bold text-text-primary uppercase"),
  text: clsx("text-body-md text-text-primary"),
  metrics: clsx("flex list-none flex-wrap gap-xs"),
  screens: clsx("grid list-none grid-cols-2 items-start gap-md"),
  figure: clsx("flex flex-col gap-xs"),
  caption: clsx("text-body-sm text-text-secondary"),
};
