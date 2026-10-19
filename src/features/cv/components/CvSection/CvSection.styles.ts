import { clsx } from "clsx";

export const styles = {
  root: (keepTogether: boolean) => clsx("flex flex-col gap-sm", keepTogether && "kb-print-block"),
  header: clsx("group kb-print-keep-with-next flex items-center gap-xs border-b border-border-default pb-2xs"),
  title: clsx("font-display text-headline-sm text-text-primary focus:outline-none"),
};
