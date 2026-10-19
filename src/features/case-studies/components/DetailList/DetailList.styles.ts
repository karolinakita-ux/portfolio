import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  list: cn("flex list-none flex-col gap-lg"),
  item: cn("flex min-w-0 flex-col gap-2xs"),
  title: cn("flex flex-wrap items-center gap-xs text-title-md font-semibold text-text-primary"),
  badge: cn("rounded-full bg-bg-badge-default px-sm py-3xs text-label-sm font-medium text-text-primary"),
  body: cn("text-body-lg text-text-secondary"),
};
