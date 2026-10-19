import { clsx } from "clsx";

export const styles = {
  period: clsx("text-body-sm text-text-secondary"),
  heading: clsx("flex flex-col gap-2xs"),
  title: clsx("text-title-lg text-balance text-text-primary"),
  org: clsx("text-body-md text-text-secondary"),
  focus: clsx("grid grid-cols-term gap-x-xs text-body-md"),
  focusTerm: clsx("font-medium text-text-primary"),
  focusValue: clsx("min-w-0 text-text-secondary"),
  lesson: clsx("border-l-2 border-bg-accent-brand pl-sm text-body-md text-text-primary"),
  tags: clsx("flex flex-wrap gap-xs"),
};
