import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn("pt-2xl lg:pt-3xl"),
  body: cn("flex flex-col gap-lg"),
  /** H1 scale shared by every page: Display Small → Display Medium (45px). */
  title: cn("font-display text-display-sm font-normal text-balance text-text-primary md:text-display-md"),
  lead: cn("font-display text-headline-sm text-text-secondary"),
  actions: cn("flex flex-wrap gap-sm"),
  srOnly: cn("sr-only"),
};
