import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  /** Row height = card list; the portrait column stretches to it. 32px column gap. */
  grid: cn("grid gap-xl md:grid-cols-2 md:items-stretch lg:grid-cols-about-lg"),
  list: cn("flex min-w-0 flex-col gap-md"),
  card: cn(
    "flex reveal-on-scroll flex-col gap-sm rounded-md border border-border-subtle bg-bg-surface-raised p-lg shadow-sm",
  ),
  title: cn("text-title-md text-balance text-text-primary"),
  body: cn("text-body-md text-text-secondary"),
};
