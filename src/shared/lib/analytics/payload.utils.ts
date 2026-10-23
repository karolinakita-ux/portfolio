import { KEPT_PARAMS, LOAD_METRICS } from "./analytics.constants.ts";
import type { PageSnapshot, PerformancePayload, UmamiSendType } from "./analytics.types.ts";

/**
 * What every request to Umami may say about an address (beforeSend in analytics.utils.ts applies it to
 * the tracker's own requests too): no hash, no query parameter but the link tag and UTM (KEPT_PARAMS),
 * and of another site only its address without query: a search or a login link stays out.
 */

/** The address without its hash and without query parameters other than KEPT_PARAMS. */
export const cleanUrl = (href: string): string => {
  try {
    const url = new URL(href, window.location.href);
    url.hash = "";
    // Deleting re-encodes the whole query, so only when something goes.
    const dropped = [...url.searchParams.keys()].filter((key) => !KEPT_PARAMS.includes(key));
    for (const key of dropped) url.searchParams.delete(key);
    return url.toString();
  } catch {
    return href;
  }
};

/** A referrer as Umami gets it: a page of this site as a cleaned path, another site without its query and hash. */
export const cleanReferrer = (referrer: string): string => {
  const { origin } = window.location;
  if (referrer.startsWith("/") || referrer.startsWith(origin + "/")) {
    const url = new URL(cleanUrl(new URL(referrer, origin).toString()));
    return url.pathname + url.search;
  }
  return referrer.split(/[?#]/, 1)[0] ?? referrer;
};

/** The address the browser loaded this document from (before the app normalised it). */
const loadedUrl = (): string => {
  const [navigation] =
    typeof performance.getEntriesByType === "function" ? performance.getEntriesByType("navigation") : [];
  return navigation?.name ?? window.location.href;
};

/**
 * A request as it should leave: pageviews and events keep the page they were built with; session data
 * and speed reports (the tracker builds those) get the page the app counted last, `page`. A speed report's
 * load metrics (LOAD_METRICS) are dropped when that page is not the one the browser loaded: a visitor
 * who moved on before allowing statistics would credit the first page's load to another one.
 */
export function cleanPayload(
  type: UmamiSendType,
  payload: PerformancePayload,
  page: PageSnapshot | null,
): PerformancePayload {
  const sent: PerformancePayload = type === "event" || page === null ? { ...payload } : { ...payload, ...page };
  sent.url = cleanUrl(sent.url);
  if (sent.referrer !== undefined) sent.referrer = cleanReferrer(sent.referrer);
  if (type === "performance" && page !== null && cleanUrl(loadedUrl()) !== page.url) {
    for (const metric of LOAD_METRICS) Reflect.deleteProperty(sent, metric);
  }
  return sent;
}
