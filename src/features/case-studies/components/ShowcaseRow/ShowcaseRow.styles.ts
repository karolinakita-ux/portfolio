import { clsx } from "clsx";

const GRID = {
  feature: ["lg:grid-cols-feature", "lg:grid-cols-feature-reverse"],
  phone: ["lg:grid-cols-phone", "lg:grid-cols-phone-reverse"],
};

export const styles = {
  /** Feature row: stacked below lg; text column + screenshot from lg, mirrored on every other row. */
  root: (reverse: boolean, phone: boolean) =>
    clsx("grid reveal-on-scroll gap-lg lg:items-center lg:gap-2xl", GRID[phone ? "phone" : "feature"][reverse ? 1 : 0]),
  body: clsx("flex min-w-0 flex-col gap-sm"),
  /** From lg the screenshot of a mirrored row moves to the left; the text stays first for screen readers. */
  media: (reverse: boolean, phone: boolean) =>
    clsx("min-w-0", {
      "lg:order-first": reverse,
      "flex justify-center rounded-xl border border-border-subtle bg-bg-surface-default px-lg py-xl": phone,
    }),
  /** A phone screen keeps its phone width; other screenshots fill the column. */
  screen: (phone: boolean) => clsx("w-full", { "max-w-phone": phone }),
  /** Focused by the image viewer's Go to Description, never by Tab: no ring, as a section's heading. */
  title: clsx("text-title-lg text-balance text-text-primary focus:outline-none"),
  intro: clsx("text-body-lg text-text-secondary"),
  block: clsx("flex flex-col gap-2xs pt-xs"),
  blockTitle: clsx("text-title-md text-balance text-text-primary"),
  blockBody: clsx("text-body-md text-text-secondary"),
};
