import type { Navigate } from "#shared/lib/routes/routes.types.ts";

export interface ConsentBannerProps {
  onAllow: () => void;
  onDecline: () => void;
  /** For the link to the privacy page. */
  onNavigate: Navigate;
}
