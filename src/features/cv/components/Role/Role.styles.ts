import { clsx } from "clsx";

export const styles = {
  root: clsx("kb-print-block flex flex-col gap-xs"),
  heading: clsx("flex flex-col"),
  title: clsx("text-title-md text-text-primary"),
  meta: clsx("text-body-md text-text-secondary"),
  company: clsx("font-semibold text-text-primary"),
  previous: clsx("text-body-md text-text-secondary"),
};
