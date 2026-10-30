import { clsx } from "clsx";

export const styles = {
  /** Scope note (440px, as the feature text column) beside the description from lg. */
  intro: clsx("grid gap-lg lg:grid-cols-feature lg:items-start lg:gap-2xl"),
  decisions: clsx("flex min-w-0 flex-col gap-sm"),
  lead: clsx("text-body-lg text-text-secondary"),
  decisionsTitle: clsx("pt-xs text-label-md text-text-secondary uppercase"),
  grid: clsx("grid list-none gap-x-md gap-y-lg md:grid-cols-2"),
  figure: clsx("flex flex-col gap-xs"),
  caption: clsx("text-body-sm text-text-secondary"),
};
