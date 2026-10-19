import { clsx } from "clsx";

export const styles = {
  /** Row height = card list; the portrait column stretches to it. 32px column gap. */
  grid: clsx("grid gap-xl md:grid-cols-2 md:items-stretch lg:grid-cols-about-lg"),
  list: clsx("flex min-w-0 flex-col gap-md"),
  title: clsx("text-title-md text-balance text-text-primary"),
  body: clsx("text-body-md text-text-secondary"),
};
