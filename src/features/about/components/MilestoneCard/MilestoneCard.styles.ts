import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn(
    "flex reveal-on-scroll flex-col gap-sm rounded-md border border-border-subtle bg-bg-surface-raised p-lg shadow-sm",
  ),
  period: cn("text-body-sm text-text-secondary"),
  heading: cn("flex flex-col gap-2xs"),
  title: cn("text-title-lg text-balance text-text-primary"),
  org: cn("text-body-md text-text-secondary"),
  focus: cn("grid grid-cols-term gap-x-xs text-body-md"),
  focusTerm: cn("font-medium text-text-primary"),
  focusValue: cn("min-w-0 text-text-secondary"),
  lesson: cn("border-l-2 border-bg-accent-brand pl-sm text-body-md text-text-primary"),
  tags: cn("flex flex-wrap gap-xs"),
  tag: cn("rounded-full bg-bg-badge-default px-sm py-3xs text-label-sm text-text-primary"),
};
