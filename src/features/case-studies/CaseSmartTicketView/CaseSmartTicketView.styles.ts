import { clsx } from "clsx";

export const styles = {
  /** Persona cards: stacked below lg, three in a row from lg, equal heights. */
  personas: clsx("grid list-none gap-lg lg:grid-cols-3"),
  persona: clsx("flex min-w-0 *:w-full"),
  /** Feature rows: 48px apart below lg, 64px from lg, as in the other case studies. */
  rows: clsx("flex list-none flex-col gap-2xl lg:gap-3xl"),
  comparisons: clsx("flex flex-col gap-2xl lg:gap-3xl"),
};
