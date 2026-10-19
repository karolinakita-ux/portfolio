import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  /** Rhythm: title → 12px → body → 16px → links (same at every width). */
  body: cn("flex flex-col gap-md"),
  /** Links wrap on narrow screens. */
  links: cn("flex flex-wrap gap-x-lg gap-y-xs"),
};
