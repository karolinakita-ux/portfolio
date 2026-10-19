import { STATISTICS_CHANGE_EVENT, STATISTICS_OFF_KEY } from "./analytics.constants.ts";
import type { PrivacySignals, StatisticsState } from "./analytics.types.ts";
import { optedOut, stopAnalytics } from "./analytics.utils.ts";

/** The browser's own privacy signals. */
export const browserSignals = (): PrivacySignals => {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return { doNotTrack: nav.doNotTrack, globalPrivacyControl: nav.globalPrivacyControl };
};

/** True when the visitor switched statistics off on the privacy page (kept in this browser only). */
export const statisticsSwitchedOff = (): boolean => {
  try {
    return window.localStorage.getItem(STATISTICS_OFF_KEY) !== null;
  } catch {
    return false; // storage blocked: nothing was kept
  }
};

/** Every privacy signal of this visitor, for startAnalytics. */
export const visitorPrivacy = (): PrivacySignals => ({ ...browserSignals(), statisticsOff: statisticsSwitchedOff() });

/** Whether this visitor is counted, and why not. */
export const statisticsState = (): StatisticsState =>
  optedOut(browserSignals()) ? "browser" : statisticsSwitchedOff() ? "off" : "on";

/**
 * Switches statistics off (stops at once, and stays off in this browser) or back on (from the
 * next page load). Writes only Umami's own key, and only because the visitor asked for it.
 */
export const setStatisticsOff = (off: boolean): void => {
  try {
    if (off) window.localStorage.setItem(STATISTICS_OFF_KEY, "1");
    else window.localStorage.removeItem(STATISTICS_OFF_KEY);
  } catch {
    /* storage blocked: the choice applies to this page only */
  }
  if (off) stopAnalytics();
  window.dispatchEvent(new Event(STATISTICS_CHANGE_EVENT));
};

/** Calls `onChange` when the switch changes, here or in another tab. */
export const subscribeStatistics = (onChange: () => void): (() => void) => {
  window.addEventListener(STATISTICS_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(STATISTICS_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};
