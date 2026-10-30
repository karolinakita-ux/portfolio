import { clsx } from "clsx";

/** The same hero as the privacy policy: both are text pages linked from the footer. */
export const styles = {
  hero: clsx("pt-xl"),
  heading: clsx("mt-xl flex flex-col gap-sm"),
  intro: clsx("text-body-lg text-text-secondary"),
  updated: clsx("text-body-sm text-text-secondary"),
};
