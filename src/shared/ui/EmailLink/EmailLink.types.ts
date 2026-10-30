import type { EmailPlace } from "#shared/lib/analytics/analytics.types.ts";

export interface EmailLinkProps {
  email: string;
  /** Where it sits, for the email-click count. */
  place: EmailPlace;
}
