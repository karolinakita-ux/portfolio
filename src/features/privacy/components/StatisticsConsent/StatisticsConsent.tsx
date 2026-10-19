import { ConsentBanner } from "#features/privacy/components/ConsentBanner/ConsentBanner.tsx";
import { useStatisticsState } from "#features/privacy/hooks/useStatisticsState.ts";
import { consentNeeded, setStatisticsChoice } from "#shared/lib/analytics/statistics-consent.utils.ts";

import type { StatisticsConsentProps } from "./StatisticsConsent.types.ts";

/**
 * The consent box for visitor statistics, on the live site only, until the visitor decides. Not in the
 * prerendered HTML (the choice lives in the browser) and never shown with Do Not Track or Global
 * Privacy Control.
 */
export function StatisticsConsent({ onNavigate }: StatisticsConsentProps) {
  const state = useStatisticsState();
  if (state !== "unset" || !consentNeeded()) return null;
  return (
    <ConsentBanner
      onAllow={() => setStatisticsChoice("on")}
      onDecline={() => setStatisticsChoice("off")}
      onNavigate={onNavigate}
    />
  );
}
