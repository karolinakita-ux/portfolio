import type { Navigate } from "#shared/lib/routes/routes.types.ts";

export interface ConsentBannerProps {
  /** The answers; `focusInside` tells whether keyboard focus was on the button, which goes away with the box. */
  onAllow: (focusInside: boolean) => void;
  onDecline: (focusInside: boolean) => void;
  /** For the link to the privacy page. */
  onNavigate: Navigate;
}
