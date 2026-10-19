import { clsx } from "clsx";

export const styles = {
  /** Rhythm: title → 12px → body → 16px → links (same at every width). */
  body: clsx("flex flex-col gap-md"),
  /** Links wrap on narrow screens. */
  links: clsx("flex flex-wrap gap-x-lg gap-y-xs"),
};
