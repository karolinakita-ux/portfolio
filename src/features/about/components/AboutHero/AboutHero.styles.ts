import { cn } from "#shared/lib/ui/ui.utils.ts";

export const styles = {
  root: cn("pt-xl"),
  body: cn("mt-xl flex flex-col gap-lg"),
  /** Same H1 scale as every page: Display Small (36px) on phones, Display Medium (45px) from md. Full column width. */
  title: cn("w-full font-display text-display-sm font-normal text-balance text-text-primary md:text-display-md"),
  paragraph: cn("text-body-md text-text-secondary"),
  actions: cn("flex flex-wrap justify-end gap-sm"),
};
