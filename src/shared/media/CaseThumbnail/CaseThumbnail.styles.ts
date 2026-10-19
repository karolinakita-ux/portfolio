import { cn } from "#shared/lib/ui/ui.utils.ts";
import type { ImageStatus } from "#shared/media/image-status/image-status.types.ts";

export const styles = {
  root: (interactive: boolean) =>
    cn(
      "relative aspect-thumb w-full max-w-full overflow-hidden rounded-sm border border-border-subtle bg-bg-surface-default",
      interactive && "transition-colors duration-fast group-hover/thumb:border-border-interactive-hover",
    ),
  image: (status: ImageStatus, interactive: boolean) =>
    cn(
      "absolute inset-0 h-full w-full object-contain p-xs transition-[opacity,scale] duration-slow ease-standard",
      status === "loaded" ? "opacity-100" : "opacity-0",
      interactive && "motion-safe:group-hover/thumb:scale-[1.02]",
    ),
  srOnly: cn("sr-only"),
};
