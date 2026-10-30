import { clsx } from "clsx";

export const styles = {
  root: clsx("pt-2xl lg:pt-3xl"),
  body: clsx("flex flex-col gap-lg"),
  lead: clsx("font-display text-headline-sm text-text-secondary"),
  /**
   * Buttons stack on phones, as wide as their label; from sm they sit in one row that wraps, stretched to one height
   * (the primary Button has no border, the secondary one has: items-start would leave them 2px apart).
   */
  actions: clsx("flex flex-col items-start gap-sm sm:flex-row sm:flex-wrap sm:items-stretch"),
};
