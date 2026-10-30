import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import type { CalloutTone } from "./Callout.types.ts";

/** Figma: Banner, Info | Warning. Tone maps to the status* token family. */
const TONE: Record<CalloutTone, string> = {
  warning: "border-status-warning-border bg-status-warning-surface text-status-warning-text",
  info: "border-status-info-border bg-status-info-surface text-status-info-text",
};

export const callout = cva("rounded-md border p-lg text-body-lg", { variants: { tone: TONE } });

export const styles = {
  titled: clsx("flex flex-col gap-sm"),
  /** A linkable banner's title and its copy-link anchor, as in a Section (the anchor is as tall as the title line). */
  titleRow: clsx("group flex items-center gap-xs"),
  /**
   * A linkable banner's title takes focus when a link lands on it (no ring, as a Section heading) and stops a little
   * below the sticky header, with the banner's top edge in view; min-w-0 lets a long word break beside the anchor.
   */
  title: clsx("min-w-0 scroll-mt-lg text-title-md font-semibold focus:outline-none"),
};
