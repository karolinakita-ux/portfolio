import type { CopyStatus } from "./CopyEmail.types.ts";

/** The confirmation bubble's text, which is also the polite live region. */
export const FEEDBACK: Record<CopyStatus, string> = {
  idle: "",
  copied: "Copied to clipboard!",
  selected: "Selected - press Ctrl+C or Command+C",
};
