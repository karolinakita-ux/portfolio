import { cn } from "#shared/lib/ui/ui.utils.ts";

import type { CalloutTone } from "./Callout.types.ts";

/** Tone maps to the status* token family. */
const TONE: Record<CalloutTone, string> = {
  warning: cn("border-status-warning-border bg-status-warning-surface text-status-warning-text"),
  info: cn("border-status-info-border bg-status-info-surface text-status-info-text"),
};

export const styles = {
  root: (tone: CalloutTone) => cn("rounded-md border p-lg text-body-lg", TONE[tone]),
  titled: cn("flex flex-col gap-sm"),
  title: cn("text-title-md font-semibold"),
};
