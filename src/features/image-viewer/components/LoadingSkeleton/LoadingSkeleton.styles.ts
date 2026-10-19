import { clsx } from "clsx";

export const styles = {
  root: (sized: boolean, className?: string) =>
    clsx(
      "relative overflow-hidden rounded-sm border border-border-subtle bg-bg-surface-raised",
      sized ? "kb-lightbox-skeleton" : "h-full w-full",
      className,
    ),
};
