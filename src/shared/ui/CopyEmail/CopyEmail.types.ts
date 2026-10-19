import type { ReactNode } from "react";

import type { EmailPlace } from "#shared/lib/analytics/analytics.types.ts";

export type CopyStatus = "idle" | "copied" | "selected";

export interface CopyEmailProps {
  email: string;
  /** Where it sits, for the email-click count. */
  place: EmailPlace;
  /** Type style of the address (default Body Medium). */
  textClassName?: string;
  icon?: ReactNode;
}
