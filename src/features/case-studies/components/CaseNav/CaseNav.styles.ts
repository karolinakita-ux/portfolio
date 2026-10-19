import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn("pt-3xl"),
  /** Wraps on narrow screens; Next keeps right alignment via ml-auto. */
  nav: (hasPrev: boolean, hasNext: boolean) =>
    cn(
      "flex flex-wrap items-start gap-md",
      hasPrev && hasNext ? "justify-between" : hasNext ? "justify-end" : "justify-start",
    ),
};
