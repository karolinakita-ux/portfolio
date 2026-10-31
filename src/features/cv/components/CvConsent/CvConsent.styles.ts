import { clsx } from "clsx";

export const styles = {
  /**
   * Kept on one page in print. Body Small in the PDF too (9pt): Label Small, the only smaller type token, has the
   * same 16px line height, and the clause keeps its 5 lines at A4 width, so it would free no room (2026-10-31).
   */
  root: clsx("text-body-sm text-text-secondary print:break-inside-avoid"),
};
