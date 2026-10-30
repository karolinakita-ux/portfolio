import { clsx } from "clsx";

export const styles = {
  /** Kept on one page in print. */
  root: clsx("flex flex-col gap-xs text-body-sm text-text-secondary print:break-inside-avoid"),
};
