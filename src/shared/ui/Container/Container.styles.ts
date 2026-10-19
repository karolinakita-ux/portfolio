import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: (className?: string) => cn("px-lg md:px-2xl lg:px-4xl", className),
  column: cn("mx-auto w-full max-w-content"),
};
