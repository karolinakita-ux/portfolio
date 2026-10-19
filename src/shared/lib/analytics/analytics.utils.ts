import { EVENT, MAX_QUEUED, MAX_REF_LENGTH, UMAMI } from "./analytics.constants.ts";
import type {
  AnalyticsEvent,
  AnalyticsSite,
  AnalyticsState,
  BuildPayload,
  EventData,
  PrivacySignals,
  UmamiPayload,
} from "./analytics.types.ts";

/**
 * Visitor statistics with Umami Cloud (umami.is): no cookies, nothing written to the visitor's device.
 * What visitors are told: the privacy page (/privacy, features/privacy).
 *
 * - Only the live site counts: a production build at the site root, served from karolina.kita.company.
 *   Dev, Netlify branch deploys, local previews, tests and the claude.ai artifact never load the script.
 * - Visitors with Do Not Track or Global Privacy Control on, or who switched statistics off on the privacy
 *   page (statistics-switch.utils.ts), are not counted; the script does not load.
 * - The tracker's own page tracking is off (data-auto-track="false"): it misses Back / Forward and would count
 *   every scroll hash change (useSectionHash). App sends one pageview per view instead (trackPageview).
 * - With page tracking off, the tracker keeps the landing page as the current page forever, so every call
 *   passes the page itself: address without the hash, title and referrer.
 * - Calls made before the script has loaded wait in a queue; if the script is blocked, they are dropped.
 * - Never send names or email addresses, and never call umami.identify().
 */

export const optedOut = ({ doNotTrack, globalPrivacyControl, statisticsOff }: PrivacySignals): boolean =>
  statisticsOff === true || globalPrivacyControl === true || doNotTrack === "1" || doNotTrack === "yes";

/** True only on the live site, for a visitor who has not asked not to be tracked. */
export const analyticsAllowed = ({ production, base, hostname, privacy }: AnalyticsSite): boolean =>
  production && base === "/" && hostname === UMAMI.host && !optedOut(privacy);

const state: AnalyticsState = { on: false, queue: [], lastPage: null, referrer: null };

/** Sends nothing more on this page (the script is blocked, or the visitor switched statistics off). */
export const stopAnalytics = (): void => {
  state.on = false;
  state.queue.length = 0;
};

const flush = () => {
  const tracker = window.umami;
  if (!tracker) {
    stopAnalytics();
    return;
  }
  for (const build of state.queue.splice(0)) tracker.track(build);
};

const send = (build: BuildPayload) => {
  if (!state.on) return;
  const tracker = window.umami;
  if (tracker) tracker.track(build);
  else if (state.queue.length < MAX_QUEUED) state.queue.push(build);
};

/** The address bar without the hash: a section anchor is not a page of its own. */
const pageUrl = (): string => {
  const url = new URL(window.location.href);
  url.hash = "";
  return url.toString();
};

/** Same-site addresses go as a path, the way the tracker sends them. */
const asReferrer = (url: string): string => {
  const { origin } = window.location;
  return url.startsWith(origin + "/") ? url.slice(origin.length) : url;
};

/** The current page, read when the call is made (not when a queued call goes out). */
const withPage = (extra: Partial<UmamiPayload> = {}): BuildPayload => {
  const page = { url: pageUrl(), title: document.title, ...(state.referrer !== null && { referrer: state.referrer }) };
  return (payload) => ({ ...payload, ...page, ...extra });
};

/** The tag of a tagged link (?ref=acme, else utm_source), or null. */
const linkRef = (search: string): string | null => {
  const params = new URLSearchParams(search);
  const ref = (params.get("ref") ?? params.get("utm_source"))?.trim();
  return ref ? ref.slice(0, MAX_REF_LENGTH) : null;
};

/**
 * Loads the tracker when analyticsAllowed(site); returns whether it did. Called once from src/main.tsx,
 * before the first render, so App's first pageview is counted. An added script never blocks the page.
 */
export function startAnalytics(site: AnalyticsSite): boolean {
  if (!analyticsAllowed(site)) return false;
  if (state.on) return true;
  state.on = true;
  const script = document.createElement("script");
  script.src = UMAMI.script;
  script.dataset.websiteId = UMAMI.websiteId;
  script.dataset.domains = UMAMI.host;
  script.dataset.autoTrack = "false";
  script.dataset.excludeHash = "true";
  script.dataset.doNotTrack = "true";
  script.addEventListener("load", flush);
  script.addEventListener("error", stopAnalytics);
  document.head.append(script);
  return true;
}

/**
 * Counts the current page. App calls it on load and on every view change (Back / Forward included),
 * after the title has been updated. The first pageview also counts a tagged link (link-ref) once.
 */
export function trackPageview(): void {
  if (!state.on) return;
  const first = state.lastPage === null;
  if (state.lastPage !== null) state.referrer = asReferrer(state.lastPage);
  state.lastPage = pageUrl();
  send(withPage());
  const ref = first ? linkRef(window.location.search) : null;
  if (ref) track(EVENT.linkRef, { ref });
}

/** Counts an event on the current page; does nothing off the live site. */
export function track<E extends AnalyticsEvent>(name: E, data: EventData[E]): void {
  if (!state.on) return;
  send(withPage({ name, data }));
}
