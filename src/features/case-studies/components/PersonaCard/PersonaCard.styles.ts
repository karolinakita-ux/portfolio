import { clsx } from "clsx";

import { BULLET_LIST } from "#shared/lib/ui/ui.styles.ts";

export const styles = {
  header: clsx("flex items-center gap-sm"),
  identity: clsx("flex min-w-0 flex-col"),
  name: clsx("text-title-lg text-text-primary"),
  role: clsx("text-body-md text-text-secondary"),
  lines: clsx("flex list-none flex-wrap gap-xs"),
  block: clsx("flex flex-col gap-xs"),
  label: clsx("text-label-md text-text-secondary uppercase"),
  text: clsx("text-body-md text-text-primary"),
  /** The goal stands out on the brand tint, as in Figma. */
  goal: clsx("flex flex-col gap-xs rounded-md bg-bg-accent-brand-subtle p-md"),
  goalLabel: clsx("text-label-md text-text-primary uppercase"),
  goalText: clsx("text-body-md font-medium text-text-primary"),
  list: BULLET_LIST,
};
