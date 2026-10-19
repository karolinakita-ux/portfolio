import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn(
    "grid reveal-on-scroll gap-lg rounded-md border border-border-subtle bg-bg-surface-raised p-md shadow-sm md:grid-cols-showcase md:items-center md:p-lg",
  ),
  body: cn("flex min-w-0 flex-col gap-sm"),
  title: cn("text-title-md text-balance text-text-primary"),
  intro: cn("text-body-md text-text-secondary"),
  block: cn("flex flex-col gap-2xs pt-xs"),
  blockTitle: cn("text-title-md text-balance text-text-primary"),
  blockBody: cn("text-body-md text-text-secondary"),
};
