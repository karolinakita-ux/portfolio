import { useState } from "react";

import { ConsentBanner } from "#features/privacy/components/ConsentBanner/ConsentBanner.tsx";
import { useStatisticsState } from "#features/privacy/hooks/useStatisticsState.ts";
import { useHydrating } from "#shared/hooks/hydration/useHydrating.ts";
import type { StatisticsChoice } from "#shared/lib/analytics/analytics.types.ts";
import { consentNeeded, consentPreview, setStatisticsChoice } from "#shared/lib/analytics/statistics-consent.utils.ts";

import type { StatisticsConsentProps } from "./StatisticsConsent.types.ts";

/**
 * The consent box for visitor statistics, on the live site only, until the visitor decides. Not in the
 * prerendered HTML (the choice lives in the browser) and never shown with Do Not Track or Global
 * Privacy Control. On the dev server it shows on every page load (consentPreview), and an answer hides
 * it until the next one. While the app adopts the prerendered HTML (useHydrating) it is not there either,
 * as in that HTML; it shows right after.
 */
export function StatisticsConsent({ onNavigate, onAnswered }: StatisticsConsentProps) {
  const state = useStatisticsState();
  const hydrating = useHydrating();
  // Also covers blocked storage: the answer applies to this page, so the box does not come back at once.
  const [answered, setAnswered] = useState(false);
  const asking = !hydrating && !answered && (consentPreview() || (state === "unset" && consentNeeded()));
  if (!asking) return null;

  const answer = (choice: StatisticsChoice, focusInside: boolean) => {
    // Focus is on the answer button, which goes away with the box: it moves on first, so keyboard and
    // screen reader users do not drop back to the top of the page (WCAG 2.4.3).
    if (focusInside) onAnswered?.();
    setAnswered(true);
    setStatisticsChoice(choice);
  };
  return (
    <ConsentBanner
      onAllow={(focusInside) => answer("on", focusInside)}
      onDecline={(focusInside) => answer("off", focusInside)}
      onNavigate={onNavigate}
    />
  );
}
