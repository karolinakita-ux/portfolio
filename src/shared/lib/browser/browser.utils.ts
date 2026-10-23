import { IN_APP_BROWSERS } from "./browser.constants.ts";
import type { InAppBrowser } from "./browser.types.ts";

/** The app a user agent belongs to, or null for an ordinary browser. */
export const inAppBrowser = (userAgent: string): InAppBrowser | null =>
  IN_APP_BROWSERS.find(([, mark]) => mark.test(userAgent))?.[0] ?? null;
