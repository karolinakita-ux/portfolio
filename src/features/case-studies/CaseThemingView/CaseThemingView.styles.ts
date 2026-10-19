import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";
import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  problemGrid: cn("grid gap-md md:grid-cols-2"),
  problemCard: cn(
    "flex reveal-on-scroll flex-col gap-sm rounded-md border border-border-subtle bg-bg-surface-raised p-lg shadow-sm",
  ),
  problemTitle: cn("text-title-md text-text-primary"),
  problemBody: cn("text-body-md text-text-secondary"),
  problemList: BULLET_LIST,
  rows: cn("flex flex-col gap-md"),
};
