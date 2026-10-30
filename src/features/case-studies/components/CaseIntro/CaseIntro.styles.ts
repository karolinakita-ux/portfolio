import { clsx } from "clsx";

export const styles = {
  root: clsx("pt-xl"),
  /** Breadcrumb, then previous / next at the end of the row, or on a row of its own on narrow screens. */
  topRow: clsx("flex flex-wrap items-center gap-x-md gap-y-xs"),
  heading: clsx("mt-xl flex flex-col gap-xs"),
  /** The Figma file link right under the details panel, so the design files are one click from the top. */
  designFile: clsx("mt-md"),
  notice: clsx("mt-xl lg:mt-2xl"),
};
