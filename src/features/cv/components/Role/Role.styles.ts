import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn("kb-print-block flex flex-col gap-xs"),
  heading: cn("flex flex-col"),
  title: cn("text-title-md text-text-primary"),
  meta: cn("text-body-md text-text-secondary"),
  company: cn("font-semibold text-text-primary"),
  previous: cn("text-body-md text-text-secondary"),
};
