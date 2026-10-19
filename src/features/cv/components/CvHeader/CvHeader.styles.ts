import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn("kb-print-block flex flex-col gap-2xs"),
  name: cn("font-display text-display-sm font-medium text-text-primary"),
  title: cn("text-title-lg text-text-primary"),
  contacts: cn("mt-2xs text-body-md text-text-secondary not-italic"),
};
