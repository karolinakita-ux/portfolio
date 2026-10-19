import { useSyncExternalStore } from "react";

import type { StatisticsState } from "#shared/lib/analytics/analytics.types.ts";
import { statisticsState, subscribeStatistics } from "#shared/lib/analytics/statistics-switch.utils.ts";

/** This visitor's statistics state; null while prerendering (no browser to ask). */
export function useStatisticsState(): StatisticsState | null {
  return useSyncExternalStore(subscribeStatistics, statisticsState, () => null);
}
