import type { Navigate } from "#shared/lib/routes/routes.types.ts";

export interface StatisticsConsentProps {
  onNavigate: Navigate;
  /** Called when the box goes away with keyboard focus in it, before it does: move focus on (App: to main). */
  onAnswered?: () => void;
}
