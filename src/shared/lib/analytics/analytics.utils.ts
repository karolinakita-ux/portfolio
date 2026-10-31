import { EVENT, MAX_PATH_LENGTH, MAX_QUEUED, PASSIVE_EVENTS, UMAMI } from "./analytics.constants.ts";
import type {
  AnalyticsEvent,
  AnalyticsSite,
  AnalyticsState,
  BeforeSend,
  BuildPayload,
  EventData,
  PageSnapshot,
  PrivacySignals,
  SentData,
  UmamiPayload,
  UmamiTracker,
} from "./analytics.types.ts";
import { watchCopies, watchDeadClicks } from "./clicks.utils.ts";
import { endStretch, startPage, watchEngagement, watchPrints } from "./engagement.utils.ts";
import { watchErrors } from "./errors.utils.ts";
import { recentInput, watchInput } from "./input.utils.ts";
import { cleanPayload, cleanReferrer, cleanUrl, linkRef } from "./payload.utils.ts";
import { sessionData } from "./session.utils.ts";

/**
 * Visitor statistics with Umami Cloud (umami.is): no cookies, nothing written to the visitor's device.
 * What visitors are told: the privacy page (/privacy, features/privacy). What is sent and the rules for
 * adding to it: docs/analytics.md.
 *
 * - Only the live site counts: a production build at the site root, served from karolina.kita.company.
 *   Dev, Netlify's own addresses (*.netlify.app), local previews, tests and the claude.ai artifact never
 *   load the script.
 * - The script loads only after the visitor allows statistics (statistics-consent.utils.ts: the consent box
 *   or the switch on /privacy). With Do Not Track or Global Privacy Control on, nobody is asked.
 * - The tracker's own pageviews are off (data-auto-pageview="false"): it misses Back / Forward and would count
 *   every scroll hash change (useSectionHash). App sends one pageview per view instead (trackPageview).
 *   The tracker stays initialised for its speed report (data-performance: Core Web Vitals, Umami's
 *   Performance tab). It takes every history.replaceState as a new page, so address changes that are
 *   not one go past it (replaceAddress in shared/lib/routes).
 * - The tracker keeps its own idea of the current page, so every call passes the page itself: address
 *   without the hash, title and referrer. Every call on a page has its pageview's referrer: on the first page
 *   document.referrer ("" when there is none, as the tracker sends it), then the page before. The tracker's own
 *   never goes: once the address changes it names the page just left, so the time spent on the first page
 *   would say it came from itself. beforeSend does the same for the tracker's own requests (speed
 *   reports, session data), keeps only the link tag and UTM parameters in addresses, and cancels
 *   everything once statistics are off. Umami's own error reports (stack traces) never go.
 * - Calls made before the script has loaded wait in a queue; if the script is blocked, they are dropped.
 * - Besides pageviews and track() calls, it measures time on page (engagement.utils.ts), dead clicks and
 *   text copies (clicks.utils.ts), prints and errors in the site's code (errors.utils.ts), and tags events
 *   a click or key started with the input (input.utils.ts). Those listeners run only while statistics are on.
 * - Each call carries the site's version as Umami's tag (data-tag), so the dashboard can compare releases.
 *   The session data has it too (session.utils.ts), so it is listed with its values among the session properties.
 * - Never send names, email addresses or text the visitor typed or copied. umami.identify() gets session
 *   data only (session.utils.ts), never an id: visits are not linked to each other.
 */

export const optedOut = ({ doNotTrack, globalPrivacyControl }: PrivacySignals): boolean =>
  globalPrivacyControl === true || doNotTrack === "1" || doNotTrack === "yes";

/** True only on the live site, for a visitor who has not asked not to be tracked. */
export const analyticsAllowed = ({ production, base, hostname, privacy }: AnalyticsSite): boolean =>
  production && base === "/" && hostname === UMAMI.host && !optedOut(privacy);

const state: AnalyticsState = { on: false, queue: [], page: null, referrer: null, unwatch: null, notFound: null };

/** True while statistics run on this page. */
export const analyticsOn = (): boolean => state.on;

/** Sends nothing more on this page (the script is blocked, or the visitor switched statistics off). */
export const stopAnalytics = (): void => {
  state.on = false;
  state.queue.length = 0;
  state.unwatch?.();
  state.unwatch = null;
};

const flush = () => {
  const tracker = window.umami;
  if (!tracker) {
    stopAnalytics();
    return;
  }
  for (const run of state.queue.splice(0)) run(tracker);
};

/** Runs a tracker call now, or once the script has loaded. */
const call = (run: (tracker: UmamiTracker) => void) => {
  if (!state.on) return;
  const tracker = window.umami;
  if (tracker) run(tracker);
  else if (state.queue.length < MAX_QUEUED) state.queue.push(run);
};

const send = (build: BuildPayload) => {
  call((tracker) => tracker.track(build));
};

/**
 * Runs before every request the tracker makes (data-before-send), its own speed reports and session
 * data included: nothing goes once statistics are off, and addresses are cleaned (payload.utils.ts).
 * Umami's own error reports carry stack traces, so none goes even if they were switched on: the site
 * sends js-error instead (errors.utils.ts).
 */
export const beforeSend: BeforeSend = (type, payload) =>
  state.on && type !== "error" ? cleanPayload(type, payload, state.page) : null;

/**
 * The current page, read when the call is made (not when a queued call goes out). Until the app counts a second
 * page, the referrer is the one the browser loaded this document with: the page that linked here, or none ("").
 */
const currentPage = (): PageSnapshot => ({
  url: cleanUrl(window.location.href),
  title: document.title,
  referrer: state.referrer ?? cleanReferrer(document.referrer),
});

const withPage =
  (extra: Partial<UmamiPayload> = {}, page = currentPage()): BuildPayload =>
  (payload) => ({ ...payload, ...page, ...extra });

/** An event's properties, plus the input behind it when a click or key started it. */
const sentData = <E extends AnalyticsEvent>(name: E, data: EventData[E]): SentData<E> => {
  const input = PASSIVE_EVENTS.includes(name) ? undefined : recentInput();
  return input ? { ...data, input } : data;
};

/** The stretch on the page being left, sent as that page (the address bar may show the next one already). */
const reportStretch = (stretch = endStretch()) => {
  if (stretch && state.page) send(withPage({ name: EVENT.timeOnPage, data: stretch }, state.page));
};

const watch = (): (() => void) => {
  const stops = [
    watchInput(),
    watchEngagement(reportStretch),
    watchDeadClicks((spot, rage) => {
      track(rage ? EVENT.rageClick : EVENT.deadClick, spot);
    }),
    watchCopies((spot) => {
      track(EVENT.textCopy, spot);
    }),
    watchPrints(() => {
      track(EVENT.pagePrint, {});
    }),
    watchErrors((error) => {
      track(EVENT.jsError, error);
    }),
  ];
  return () => {
    for (const stop of stops) stop();
  };
};

/**
 * Loads the tracker when analyticsAllowed(site); returns whether it did. Called by statistics-consent.utils.ts
 * once the visitor has allowed statistics. An added script never blocks the page.
 */
export function startAnalytics(site: AnalyticsSite): boolean {
  if (!analyticsAllowed(site)) return false;
  if (state.on) return true;
  state.on = true;
  window.kbUmamiBeforeSend = beforeSend;
  state.unwatch = watch();
  // Statistics switched off and on again on the same page: a second script would start a second speed report.
  if (document.querySelector(`script[src="${UMAMI.script}"]`)) {
    if (window.umami) flush();
    return true;
  }
  const script = document.createElement("script");
  script.src = UMAMI.script;
  script.dataset.websiteId = UMAMI.websiteId;
  script.dataset.domains = UMAMI.host;
  script.dataset.autoPageview = "false";
  script.dataset.performance = "true";
  script.dataset.beforeSend = UMAMI.beforeSend;
  script.dataset.excludeHash = "true";
  script.dataset.doNotTrack = "true";
  // Umami's own error reports (stack traces) stay off, also if window.umamiConfig asked for them: js-error instead.
  script.dataset.errors = "false";
  if (site.release) script.dataset.tag = site.release;
  script.addEventListener("load", flush);
  script.addEventListener("error", stopAnalytics);
  document.head.append(script);
  return true;
}

/**
 * Remembers an address that matched no page (src/main.tsx, before the app replaces it with /). It goes
 * out as page-not-found with the first pageview, so a broken link shows up even when the visitor allows
 * statistics later on.
 */
export const notePageNotFound = (path: string): void => {
  state.notFound = path.slice(0, MAX_PATH_LENGTH);
};

/**
 * Counts the current page. App calls it on load and on every view change (Back / Forward included),
 * after the title has been updated. It first sends the time spent on the page before. The first
 * pageview also sends the session data and, once, a tagged link (link-ref) and a missing page.
 */
export function trackPageview(): void {
  if (!state.on) return;
  reportStretch();
  const first = state.page === null;
  if (state.page !== null) state.referrer = cleanReferrer(state.page.url);
  state.page = currentPage();
  send(withPage({}, state.page));
  startPage();
  if (!first) return;
  call((tracker) => tracker.identify(sessionData()));
  const ref = linkRef(window.location.search);
  if (ref) track(EVENT.linkRef, { ref });
  if (state.notFound !== null) track(EVENT.pageNotFound, { path: state.notFound });
}

/** Counts an event on the current page; does nothing off the live site. */
export function track<E extends AnalyticsEvent>(name: E, data: EventData[E]): void {
  if (!state.on) return;
  send(withPage({ name, data: sentData(name, data) }));
}
