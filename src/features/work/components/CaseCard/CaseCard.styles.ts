import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn(
    "grid reveal-on-scroll gap-lg rounded-md border border-border-subtle bg-bg-surface-raised p-md shadow-sm md:grid-cols-case-md md:items-center md:p-lg lg:grid-cols-case-lg",
  ),
  thumbnail: cn("group/thumb relative w-full min-w-0"),
  thumbnailLink: cn("absolute inset-0 rounded-sm"),
  body: cn("flex w-full min-w-0 flex-col items-start gap-xs"),
  /** Full column width; text-pretty only prevents a lone last word (no forced even split). */
  title: cn("w-full text-title-md text-pretty text-text-primary"),
  summary: cn("text-body-md text-text-secondary"),
  cta: cn("mt-xs"),
};
