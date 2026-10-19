import { clsx } from "clsx";

export const styles = {
  root: clsx(
    "flex flex-col items-start gap-md rounded-md border border-border-subtle bg-bg-surface-default p-lg sm:flex-row sm:items-center sm:justify-between",
  ),
  text: clsx("text-body-md text-text-primary"),
};
