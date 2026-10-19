import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn("flex flex-col gap-md pt-lg"),
  heading: cn("text-title-lg text-text-primary"),
  list: cn("grid list-none gap-lg md:grid-cols-3"),
  item: cn("flex min-w-0 flex-col gap-2xs"),
  title: cn("text-title-md font-semibold text-text-primary"),
  body: cn("text-body-lg text-text-secondary"),
};
