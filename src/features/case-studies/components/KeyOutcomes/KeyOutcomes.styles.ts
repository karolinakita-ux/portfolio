import { clsx } from "clsx";

export const styles = {
  root: clsx("flex flex-col gap-md pt-lg"),
  heading: clsx("text-title-lg text-text-primary"),
  list: clsx("grid list-none gap-lg md:grid-cols-3"),
  item: clsx("flex min-w-0 flex-col gap-2xs"),
  title: clsx("text-title-md font-semibold text-text-primary"),
  body: clsx("text-body-lg text-text-secondary"),
};
