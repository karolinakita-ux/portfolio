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
  title: clsx("text-title-md font-semibold"),
};
