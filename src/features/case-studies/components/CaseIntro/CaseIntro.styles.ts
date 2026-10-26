import { clsx } from "clsx";

export const styles = {
  root: clsx("pt-xl"),
  /** Breadcrumb, then previous / next at the end of the row, or on a row of its own on narrow screens. */
  topRow: clsx("flex flex-wrap items-center gap-x-md gap-y-xs"),
  heading: clsx("mt-xl flex flex-col gap-sm"),
  notice: clsx("mt-lg"),
};
