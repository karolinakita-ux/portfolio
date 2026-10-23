import { readStoredTheme } from "#shared/hooks/theme/theme.utils.ts";
import { inAppBrowser } from "#shared/lib/browser/browser.utils.ts";

import {
  PIXEL_RATIO_BUCKET_LAST,
  PIXEL_RATIO_BUCKETS,
  VIEWPORT_BUCKET_LAST,
  VIEWPORT_BUCKETS,
} from "./analytics.constants.ts";
import type { SessionData } from "./analytics.types.ts";

/**
 * Session data: how the site is seen on this visit, sent once per page load with umami.identify() and
 * shown on Umami's Sessions page, where every report can be filtered by it. Ranges, not exact numbers:
 * enough to choose which layout or image size to improve, too coarse to tell visitors apart.
 */

export const viewportBucket = (width: number): string =>
  VIEWPORT_BUCKETS.find(([limit]) => width < limit)?.[1] ?? VIEWPORT_BUCKET_LAST;

export const pixelRatioBucket = (ratio: number): string =>
  PIXEL_RATIO_BUCKETS.find(([limit]) => ratio < limit)?.[1] ?? PIXEL_RATIO_BUCKET_LAST;

/** Read when the call goes out: the theme is on <html> before the first paint (index.html). */
export const sessionData = (): SessionData => ({
  viewport: viewportBucket(window.innerWidth),
  pixelRatio: pixelRatioBucket(window.devicePixelRatio),
  theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
  themeSource: readStoredTheme() === null ? "system" : "picked",
  inApp: inAppBrowser(navigator.userAgent) ?? "none",
});
