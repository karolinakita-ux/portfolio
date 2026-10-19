import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: (keepTogether: boolean) => cn("flex flex-col gap-sm", keepTogether && "kb-print-block"),
  header: cn("group kb-print-keep-with-next flex items-center gap-xs border-b border-border-default pb-2xs"),
  title: cn("font-display text-headline-sm text-text-primary focus:outline-none"),
};
