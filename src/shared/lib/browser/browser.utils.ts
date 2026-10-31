import { IN_APP_BROWSERS } from "./browser.constants.ts";
import type { InAppBrowser, NetworkInformation } from "./browser.types.ts";

/** The app a user agent belongs to, or null for an ordinary browser. */
export const inAppBrowser = (userAgent: string): InAppBrowser | null =>
  IN_APP_BROWSERS.find(([, mark]) => mark.test(userAgent))?.[0] ?? null;

/**
 * The visitor asked to save data (Save-Data) or is on a 2G connection: load no image they did not ask for (the
 * background preloads, the image viewer's sharper copies).
 */
export const savesData = (): boolean => {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return Boolean(connection?.saveData) || (connection?.effectiveType ?? "").includes("2g");
};
