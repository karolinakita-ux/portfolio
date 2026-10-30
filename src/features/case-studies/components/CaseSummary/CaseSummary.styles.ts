import { clsx } from "clsx";

export const styles = {
  /** Sits 16px under the H2 (the Section's 24px body gap minus the lead's own pull-up). */
  lead: clsx("-mt-xs font-display text-headline-sm text-balance text-text-secondary"),
  /** Titled columns sit side by side from lg; untitled ones are paragraphs in one column. */
  columns: (titled: boolean) => clsx("grid", titled ? "gap-lg lg:grid-cols-2 lg:gap-2xl" : "gap-md"),
  column: clsx("flex min-w-0 flex-col gap-xs"),
  title: clsx("text-title-md text-text-primary"),
  body: clsx("text-body-lg text-text-secondary"),
};
