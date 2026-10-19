import type { View } from "./routes.ts";

/**
 * Visitor statistics with Umami Cloud (umami.is): no cookies, nothing written to the visitor's device.
 * What visitors are told: the Privacy section on the Contact page (/contact#privacy).
 *
 * - Only the live site counts: a production build at the site root, served from karolina.kita.company.
 *   Dev, Netlify branch deploys, local previews, tests and the claude.ai artifact never load the script.
 * - Visitors with Do Not Track or Global Privacy Control switched on are not counted; the script does not load.
 * - The tracker's own page tracking is off (data-auto-track="false"): it misses Back / Forward and would count
 *   every scroll hash change (useSectionHash). App sends one pageview per view instead (trackPageview).
 * - With page tracking off, the tracker keeps the landing page as the current page forever, so every call
 *   passes the page itself: address without the hash, title and referrer.
 * - Calls made before the script has loaded wait in a queue; if the script is blocked, they are dropped.
 * - Never send names or email addresses, and never call umami.identify().
 */

export const UMAMI = {
  script: "https://cloud.umami.is/script.js",
  websiteId: "19c960f0-bad6-40f5-b5cb-75dca6dc292f",
  /** The only host that counts; the tracker checks it again (data-domains). */
  host: "karolina.kita.company",
} as const;

/** Event names as the Umami dashboard lists them (at most 50 characters). */
export const EVENT = {
  linkRef: "link-ref",
  caseOpen: "case-open",
  caseNav: "case-nav",
  imageOpen: "image-open",
  figmaClick: "figma-click",
  githubClick: "github-click",
  linkedinClick: "linkedin-click",
  emailClick: "email-click",
  cvPrint: "cv-print",
  faqOpen: "faq-open",
  sectionLinkCopy: "section-link-copy",
  themeSwitch: "theme-switch",
} as const;

export type AnalyticsEvent = (typeof EVENT)[keyof typeof EVENT];

/** The properties each event carries: a wrong event name or property is a type error. */
export interface EventData {
  /** The page was opened from a tagged link (?ref=acme, or utm_source). */
  [EVENT.linkRef]: { ref: string };
  [EVENT.caseOpen]: { case: View; from: "card-link" | "thumbnail" };
  [EVENT.caseNav]: { from: View; to: View; direction: "prev" | "next" };
  /** image: the screenshot card's id. */
  [EVENT.imageOpen]: { case: View; image: string };
  [EVENT.figmaClick]: { place: "hero" | "banner" };
  [EVENT.githubClick]: { place: "hero" | "banner" };
  [EVENT.linkedinClick]: {
    target: "profile" | "recommendations" | "author" | "company";
    place: "footer" | "contact" | "testimonials" | "cv";
  };
  [EVENT.emailClick]: { action: "copy" | "mailto"; place: "footer" | "contact" | "cv" };
  /** method: the Download PDF button, or the browser's own print (Ctrl+P). */
  [EVENT.cvPrint]: { method: "button" | "browser" };
  /** question: the FAQ item's id. Sent when it opens, not when it closes. */
  [EVENT.faqOpen]: { question: string };
  /** section: the section id (the URL hash the copied link ends in). */
  [EVENT.sectionLinkCopy]: { section: string };
  [EVENT.themeSwitch]: { theme: "light" | "dark" };
}

export type EmailPlace = EventData[typeof EVENT.emailClick]["place"];

/** What Umami's tracker sends with each call; the tracker fills it in, the helpers below override the page. */
export interface UmamiPayload {
  website: string;
  hostname: string;
  screen: string;
  language: string;
  title: string;
  url: string;
  referrer?: string;
  /** Set for events; a payload without a name is a pageview. */
  name?: string;
  data?: object;
}

type BuildPayload = (payload: UmamiPayload) => UmamiPayload;

/** The part of window.umami this module uses: track() with a function that edits the payload. */
interface UmamiTracker {
  track: (build: BuildPayload) => unknown;
}

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

/** Privacy signals the browser sends. Navigator.globalPrivacyControl is not in TypeScript's DOM types yet. */
export interface PrivacySignals {
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
}

export interface AnalyticsSite {
  /** A production build (import.meta.env.PROD). */
  production: boolean;
  /** Vite's base: "/" on the site, "./" in a one-page build such as the claude.ai artifact. */
  base: string;
  hostname: string;
  privacy: PrivacySignals;
}

export const optedOut = ({ doNotTrack, globalPrivacyControl }: PrivacySignals): boolean =>
  globalPrivacyControl === true || doNotTrack === "1" || doNotTrack === "yes";

/** True only on the live site, for a visitor who has not asked not to be tracked. */
export const analyticsAllowed = ({ production, base, hostname, privacy }: AnalyticsSite): boolean =>
  production && base === "/" && hostname === UMAMI.host && !optedOut(privacy);

/** Calls waiting for the script; a blocked script never arrives, so the queue stays short. */
const MAX_QUEUED = 50;
/** Umami keeps event values up to 500 characters; a tag is a company or channel name. */
const MAX_REF_LENGTH = 100;

const state = {
  on: false,
  queue: [] as BuildPayload[],
  /** Address of the last pageview, or null before the first one. */
  lastPage: null as string | null,
  /** Referrer of the current page; null keeps the tracker's own (document.referrer, on the first page). */
  referrer: null as string | null,
};

const stop = () => {
  state.on = false;
  state.queue.length = 0;
};

const flush = () => {
  const tracker = window.umami;
  if (!tracker) {
    stop();
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
  script.addEventListener("error", stop);
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
