import { clsx } from "clsx";

export const styles = {
  list: clsx("flex flex-col gap-md"),
  /** A 112px area column beside the skills from md and on paper; a row never splits across two pages. */
  row: clsx("flex flex-col gap-2xs print:break-inside-avoid sheet:grid sheet:grid-cols-cv-skills sheet:gap-x-md"),
  area: clsx("text-title-sm text-text-primary"),
  items: clsx("text-body-sm text-text-secondary"),
};
