import { clsx } from "clsx";

export const styles = {
  /** Kept on one page in print. */
  root: clsx("text-body-sm text-text-secondary print:break-inside-avoid"),
};
