import { clsx } from "clsx";

export const styles = {
  /** A4 width on screen, edge-to-edge inside the @page margins on paper; always the light theme. */
  root: clsx(
    "kb-theme-light mx-auto flex w-full max-w-a4 flex-col gap-lg",
    "rounded-sm border border-border-subtle bg-bg-canvas p-lg text-text-primary shadow-md md:p-3xl",
    "print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none",
  ),
  summary: clsx("text-body-md text-text-primary"),
  competencies: clsx("flex flex-col gap-2xs text-body-md text-text-primary"),
  group: clsx("font-semibold"),
  experience: clsx("flex flex-col gap-md"),
};
