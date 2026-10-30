import { STATISTICS_CHANGE_EVENT, STATISTICS_CHOICE_KEY, STORED_CHOICE } from "./analytics.constants.ts";
import type { AnalyticsSite, PrivacySignals, StatisticsChoice, StatisticsState } from "./analytics.types.ts";
import {
  analyticsAllowed,
  analyticsOn,
  optedOut,
  startAnalytics,
  stopAnalytics,
  trackPageview,
} from "./analytics.utils.ts";

/**
 * Consent for visitor statistics. Umami's script reads device information (screen size, language)
 * and sends it, which needs prior consent under Art. 5(3) of the ePrivacy Directive (EDPB Guidelines
 * 2/2023, para. 33) and Art. 399 of Poland's Prawo komunikacji elektronicznej, cookies or not. So the
 * script loads only after the visitor allows it (the consent box, or the switch on /privacy); with
 * Do Not Track or Global Privacy Control on, nobody is asked and nothing loads.
 */

/** The live site, as src/main.tsx describes it; null until initStatistics() runs (and in tests). */
let site: AnalyticsSite | null = null;

/** The browser's own privacy signals. */
export const browserSignals = (): PrivacySignals => {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return { doNotTrack: nav.doNotTrack, globalPrivacyControl: nav.globalPrivacyControl };
};

/** The visitor's stored choice, or null before they decide (or after a yes to an older version: STORED_CHOICE). */
export const storedChoice = (): StatisticsChoice | null => {
  try {
    const value = window.localStorage.getItem(STATISTICS_CHOICE_KEY);
    return value === STORED_CHOICE.on ? "on" : value === STORED_CHOICE.off ? "off" : null;
  } catch {
    return null; // storage blocked: ask again on every page load
  }
};

/** browser: Do Not Track / Global Privacy Control; unset: not decided yet; on / off: the visitor's choice. */
export const statisticsState = (): StatisticsState =>
  optedOut(browserSignals()) ? "browser" : (storedChoice() ?? "unset");

/** True when the consent box should ask: the live site, no browser signal, no choice yet. */
export const consentNeeded = (): boolean => site !== null && analyticsAllowed(site) && statisticsState() === "unset";

/**
 * True on the dev server (`yarn dev`): the consent box shows on every page load, whatever was chosen
 * before, so its design can be checked. Nothing loads there: analyticsAllowed() needs a production build.
 */
export const consentPreview = (): boolean => site?.preview === true;

/**
 * The choice changed in another tab, or the site's data was cleared (key null): it applies to this page at once.
 * Anything but a yes stops the statistics here too; a yes starts them and counts the page this tab shows, as
 * setStatisticsChoice does in the tab where it was given.
 */
const onStoredChoice = (event: StorageEvent): void => {
  if (event.key !== null && event.key !== STATISTICS_CHOICE_KEY) return;
  if (storedChoice() !== "on") stopAnalytics();
  else if (site !== null && !analyticsOn() && startAnalytics(site)) trackPageview();
};

/**
 * Called once from src/main.tsx: remembers the site, loads the script if the visitor already allowed it, and
 * follows a choice made in another tab. Returns a function that stops following it (tests).
 */
export function initStatistics(current: AnalyticsSite): () => void {
  site = current;
  if (storedChoice() === "on") startAnalytics(current);
  window.addEventListener("storage", onStoredChoice);
  return () => {
    window.removeEventListener("storage", onStoredChoice);
  };
}

/**
 * Stores the visitor's choice. "on" loads the script and counts the page they are on; "off" stops
 * at once. Changing it here is as easy as giving it (GDPR Art. 7(3)).
 */
export function setStatisticsChoice(choice: StatisticsChoice): void {
  try {
    window.localStorage.setItem(STATISTICS_CHOICE_KEY, STORED_CHOICE[choice]);
  } catch {
    /* storage blocked: the choice applies to this page only */
  }
  if (choice === "on") {
    if (site !== null && startAnalytics(site)) trackPageview();
  } else {
    stopAnalytics();
  }
  window.dispatchEvent(new Event(STATISTICS_CHANGE_EVENT));
}

/** Calls `onChange` when the choice changes, here or in another tab. */
export const subscribeStatistics = (onChange: () => void): (() => void) => {
  window.addEventListener(STATISTICS_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(STATISTICS_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};
