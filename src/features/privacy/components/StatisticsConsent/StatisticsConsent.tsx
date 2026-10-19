import { useState } from "react";

import { ConsentBanner } from "#features/privacy/components/ConsentBanner/ConsentBanner.tsx";
import { useStatisticsState } from "#features/privacy/hooks/useStatisticsState.ts";
import type { StatisticsChoice } from "#shared/lib/analytics/analytics.types.ts";
import { consentNeeded, consentPreview, setStatisticsChoice } from "#shared/lib/analytics/statistics-consent.utils.ts";

import type { StatisticsConsentProps } from "./StatisticsConsent.types.ts";

/**
 * The consent box for visitor statistics, on the live site only, until the visitor decides. Not in the
 * prerendered HTML (the choice lives in the browser) and never shown with Do Not Track or Global
 * Privacy Control. On the dev server it shows on every page load (consentPreview), and an answer hides
 * it until the next one.
 */
export function StatisticsConsent({ onNavigate }: StatisticsConsentProps) {
  const state = useStatisticsState();
  // Also covers blocked storage: the answer applies to this page, so the box does not come back at once.
  const [answered, setAnswered] = useState(false);
  const asking = !answered && (consentPreview() || (state === "unset" && consentNeeded()));
  if (!asking) return null;

  const answer = (choice: StatisticsChoice) => {
    setAnswered(true);
    setStatisticsChoice(choice);
  };
  return <ConsentBanner onAllow={() => answer("on")} onDecline={() => answer("off")} onNavigate={onNavigate} />;
}
