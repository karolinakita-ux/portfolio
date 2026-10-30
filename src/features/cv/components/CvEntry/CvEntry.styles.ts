import { clsx } from "clsx";

export const styles = {
  root: clsx("flex flex-col gap-sm"),
  /** Title and employer on the left, dates on the right (stacked on phones); never the last line of a page. */
  header: clsx("flex flex-col gap-2xs print:break-after-avoid sheet:flex-row sheet:justify-between sheet:gap-md"),
  heading: clsx("flex min-w-0 flex-col"),
  title: clsx("text-title-sm text-text-primary"),
  org: clsx("text-body-sm text-text-secondary"),
  dates: clsx("text-label-md whitespace-nowrap text-text-secondary sheet:shrink-0"),
  bullets: clsx("flex list-disc flex-col gap-xs pl-md text-body-sm text-text-secondary marker:text-text-muted"),
  /** A bullet never splits across two pages. */
  bullet: clsx("print:break-inside-avoid"),
};
