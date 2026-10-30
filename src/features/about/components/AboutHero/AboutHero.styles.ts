import { clsx } from "clsx";

export const styles = {
  root: clsx("pt-xl"),
  body: clsx("mt-xl flex flex-col gap-lg"),
  paragraph: clsx("text-body-md text-text-secondary"),
  /** The primary button last, at the right edge; the CV before it. */
  actions: clsx("flex flex-wrap justify-end gap-sm"),
};
