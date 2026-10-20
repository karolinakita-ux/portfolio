import { clsx } from "clsx";

export const styles = {
  /** Rhythm: title → 12px → body → 16px → links (same at every width). */
  body: clsx("flex flex-col gap-md"),
  /** Links wrap on narrow screens, with the gap between rows of buttons (each link is BUTTON_HEIGHT tall). */
  links: clsx("flex flex-wrap gap-x-lg gap-y-sm"),
};
