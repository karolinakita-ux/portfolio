import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: (sized: boolean, className?: string) =>
    cn(
      "relative overflow-hidden rounded-sm border border-border-subtle bg-bg-surface-raised",
      sized ? "kb-lightbox-skeleton" : "h-full w-full",
      className,
    ),
};
