import { clsx } from "clsx";

export const styles = {
  root: clsx("grid gap-sm sheet:grid-cols-cv sheet:gap-x-xl sheet:gap-y-0"),
  /** pt-2xs: beside the content the label sits 4px lower, as in Figma. */
  label: clsx("flex flex-col gap-xs sheet:pt-2xs"),
  titleRow: clsx("group flex items-center gap-2xs"),
  // The token's letter spacing, not Figma's 1.12px: wide tracking makes PDF readers extract "E D U C A T I O N".
  // scroll-mt-lg: a link to the section (/cv#experience) leaves the space under the header that Section headings do.
  title: clsx("min-w-0 scroll-mt-lg text-title-sm text-text-primary uppercase focus:outline-none"),
  rule: clsx("accent-rule"),
  content: clsx("flex min-w-0 flex-col gap-md"),
};
