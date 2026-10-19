import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  list: cn("grid gap-md md:grid-cols-2"),
  item: cn("min-w-0"),
  card: cn(
    "flex h-full reveal-on-scroll flex-col gap-md rounded-md border border-border-subtle bg-bg-surface-raised p-lg shadow-sm",
  ),
  quoteMark: cn("text-bg-accent-brand"),
  quote: cn("flex-1 text-body-md text-text-secondary"),
  caption: cn("flex items-center gap-sm border-t border-border-subtle pt-md"),
  person: cn("flex min-w-0 flex-col items-start gap-3xs"),
  name: cn("text-title-sm"),
  role: cn("text-body-sm text-text-secondary"),
  srOnly: cn("sr-only"),
  more: cn("flex"),
};
