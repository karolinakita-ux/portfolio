import { clsx } from "clsx";

export const styles = {
  /** Never squeezed by the note beside it: the label stays on one line. */
  root: clsx("flex flex-col items-start gap-xs md:shrink-0 md:items-end"),
  hint: clsx("max-w-reading text-body-sm text-text-secondary md:text-right"),
};
