import { clsx } from "clsx";

export const styles = {
  root: clsx("pt-3xl"),
  /** Wraps on narrow screens; Next keeps right alignment via ml-auto. */
  nav: (hasPrev: boolean, hasNext: boolean) =>
    clsx(
      "flex flex-wrap items-start gap-md",
      hasPrev && hasNext ? "justify-between" : hasNext ? "justify-end" : "justify-start",
    ),
};
