import type { ReactNode } from "react";

export type CalloutTone = "warning" | "info";

export interface CalloutProps {
  tone: CalloutTone;
  /** Accessible name of the <aside>. */
  label: string;
  title?: string;
  children: ReactNode;
}
