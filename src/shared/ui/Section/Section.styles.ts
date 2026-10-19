import { cn } from "#shared/lib/ui/ui.utils.ts";

import type { SectionBodyGap } from "./Section.types.ts";

const BODY_GAP: Record<SectionBodyGap, string> = { lg: cn("gap-lg"), xl: cn("gap-xl") };

export const styles = {
  root: cn("pt-3xl"),
  body: (gap: SectionBodyGap) => cn("flex flex-col", BODY_GAP[gap]),
  header: cn("flex flex-col gap-xs"),
  titleRow: cn("group flex items-center gap-xs"),
  title: cn(
    "scroll-mt-lg font-display text-headline-lg text-balance text-text-primary focus:outline-none lg:text-display-sm",
  ),
  paragraph: (index: number) => cn("text-body-lg text-text-secondary", index > 0 && "mt-xs"),
};
