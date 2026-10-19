import { clsx } from "clsx";

export const styles = {
  root: clsx("kb-print-block flex flex-col gap-2xs"),
  name: clsx("font-display text-display-sm font-medium text-text-primary"),
  title: clsx("text-title-lg text-text-primary"),
  contacts: clsx("mt-2xs text-body-md text-text-secondary not-italic"),
};
