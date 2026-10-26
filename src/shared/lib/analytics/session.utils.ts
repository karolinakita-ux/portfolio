import { readStoredTheme } from "#shared/hooks/theme/theme.utils.ts";
import { inAppBrowser } from "#shared/lib/browser/browser.utils.ts";

import {
  PIXEL_RATIO_BUCKET_LAST,
  PIXEL_RATIO_BUCKETS,
  VIEWPORT_BUCKET_LAST,
  VIEWPORT_BUCKETS,
  VIEWPORT_HEIGHT_BUCKET_LAST,
  VIEWPORT_HEIGHT_BUCKETS,
} from "./analytics.constants.ts";
import type { SessionData } from "./analytics.types.ts";
import { linkRef } from "./payload.utils.ts";

/**
 * Session data: how the site is seen on this visit, which version of it, and the tagged link that brought
 * it, sent once per page load with umami.identify(). Umami lists it on the Sessions page (Properties), and
 * a Segment filters any report by it. Ranges, not exact numbers: enough to choose which layout or image
 * size to improve, too coarse to tell visitors apart.
 */

/** The label of the first range whose limit is above the value, or the last label. */
const bucket = (value: number, buckets: ReadonlyArray<readonly [number, string]>, last: string): string =>
  buckets.find(([limit]) => value < limit)?.[1] ?? last;

export const viewportBucket = (width: number): string => bucket(width, VIEWPORT_BUCKETS, VIEWPORT_BUCKET_LAST);

export const viewportHeightBucket = (height: number): string =>
  bucket(height, VIEWPORT_HEIGHT_BUCKETS, VIEWPORT_HEIGHT_BUCKET_LAST);

export const pixelRatioBucket = (ratio: number): string => bucket(ratio, PIXEL_RATIO_BUCKETS, PIXEL_RATIO_BUCKET_LAST);

/** Read when the call goes out: the theme is on <html> before the first paint (index.html). */
export const sessionData = (): SessionData => {
  const ref = linkRef(window.location.search);
  return {
    viewport: viewportBucket(window.innerWidth),
    viewportHeight: viewportHeightBucket(window.innerHeight),
    pixelRatio: pixelRatioBucket(window.devicePixelRatio),
    theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
    themeSource: readStoredTheme() === null ? "system" : "picked",
    inApp: inAppBrowser(navigator.userAgent) ?? "none",
    version: import.meta.env.APP_VERSION,
    ...(ref !== null && { ref }),
  };
};
