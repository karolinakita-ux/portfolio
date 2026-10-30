import { clsx } from "clsx";

export const styles = {
  /**
   * Figma's A4 frame on screen (794px, 48px top, 64px sides, 32px bottom from md); no frame on paper, where the
   * PDF's page margins take its place.
   */
  root: clsx(
    "flex w-full flex-col gap-lg",
    "rounded-sm border border-border-subtle bg-bg-canvas p-lg shadow-md md:px-3xl md:pt-2xl md:pb-xl",
    "print:rounded-none print:border-0 print:p-0 print:shadow-none",
  ),
  summary: clsx("text-body-md text-text-secondary"),
  entries: clsx("flex flex-col gap-md"),
};
