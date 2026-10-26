import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import type { SectionBodyGap } from "./Section.types.ts";

const BODY_GAP: Record<SectionBodyGap, string> = { lg: "gap-lg", xl: "gap-xl" };

export const sectionBody = cva("flex flex-col", { variants: { gap: BODY_GAP }, defaultVariants: { gap: "lg" } });

export const styles = {
  root: clsx("pt-3xl"),
  header: clsx("flex flex-col gap-xs"),
  titleRow: clsx("group flex items-center gap-xs"),
  // min-w-0: beside its copy-link button the heading may shrink, so a long word breaks instead of pushing the
  // button off a narrow screen at a large browser text size.
  title: clsx(
    "min-w-0 scroll-mt-lg font-display text-headline-lg text-balance text-text-primary focus:outline-none lg:text-display-sm",
  ),
  paragraph: (index: number) => clsx("text-body-lg text-text-secondary", { "mt-xs": index > 0 }),
};
