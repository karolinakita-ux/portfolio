import { clsx } from "clsx";

export const styles = {
  root: clsx("pt-3xl"),
  /** Stacked below lg; 440px text column + visual column from lg (Figma gap 56px → 2xl). */
  grid: (reverse: boolean) =>
    clsx("grid gap-xl lg:items-start lg:gap-2xl", reverse ? "lg:grid-cols-feature-reverse" : "lg:grid-cols-feature"),
  text: clsx("flex min-w-0 flex-col gap-md"),
  titleRow: clsx("group flex items-center gap-xs"),
  title: clsx(
    "min-w-0 scroll-mt-lg font-display text-headline-sm text-balance text-text-primary focus:outline-none lg:text-headline-md",
  ),
  lead: clsx("text-body-lg text-text-secondary"),
  /** Screenshots stack with 24px between them; a mirrored section shows them on the left from lg. */
  media: (reverse: boolean) => clsx("flex min-w-0 list-none flex-col gap-lg", { "lg:order-first": reverse }),
};
