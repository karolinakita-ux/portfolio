import { clsx } from "clsx";

export const styles = {
  /**
   * At the end of the breadcrumb row; below it, on the right, when the row is too narrow. -mr-2xs: the
   * links' own padding, so "Next" lines up with the right edge of the content.
   */
  root: clsx("-mr-2xs ml-auto flex items-center gap-sm"),
};
