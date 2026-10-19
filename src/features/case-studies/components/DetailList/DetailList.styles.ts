import { clsx } from "clsx";

export const styles = {
  list: clsx("flex list-none flex-col gap-lg"),
  item: clsx("flex min-w-0 flex-col gap-2xs"),
  title: clsx("flex flex-wrap items-center gap-xs text-title-md font-semibold text-text-primary"),
  body: clsx("text-body-lg text-text-secondary"),
};
