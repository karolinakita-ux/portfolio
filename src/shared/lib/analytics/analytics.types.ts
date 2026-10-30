import type { Theme } from "#shared/hooks/theme/theme.types.ts";
import type { InAppBrowser } from "#shared/lib/browser/browser.types.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

import type { EVENT, LOAD_METRICS, SCROLL_BUCKETS } from "./analytics.constants.ts";

export type AnalyticsEvent = (typeof EVENT)[keyof typeof EVENT];

/** What the visitor used for a click or key: sent with every event they start (input.utils.ts). */
export type InputKind = "mouse" | "touch" | "pen" | "keyboard";

/** One stretch on a page, from arriving (or coming back to the tab) to leaving or hiding it. */
export interface TimeOnPage {
  /** The engaged time as the dashboard groups it (TIME_BUCKETS). */
  time: string;
  /** The same in whole seconds, for exports and the API. */
  seconds: number;
  /** How far down the page the visitor has seen so far. */
  scroll: (typeof SCROLL_BUCKETS)[number];
  /** The furthest section reached (its id, the URL hash); absent above the first one. */
  section?: string;
}

/**
 * What a click or a copied selection was on: an image (or the frame around a captioned screenshot), an icon, a
 * heading, text, the empty part of a card, or the page.
 */
export type ClickedElement = "image" | "icon" | "heading" | "text" | "card" | "page";

/** A spot on the page, described from the site's own markup (clicks.utils.ts): dead clicks and text copies. */
export interface PageSpot {
  element: ClickedElement;
  /** The section id around it, a hero's name (hero, about, case...), or the landmark (header, footer, dialog, main). */
  area: string;
  /** The image's alt text or caption, the heading, or the card's title: site copy, never anything the visitor typed. */
  label?: string;
}

/** A PageSpot's label and the element whose text it is: none for alt text or aria-label, which no selection holds. */
export interface SpotLabel {
  text: string;
  from?: Element;
}

/** An error in the site's own code (errors.utils.ts). */
export interface JsError {
  /** error: a script error; rejection: a promise nobody handled. */
  kind: "error" | "rejection";
  /** The browser's message, cut to MAX_MESSAGE_LENGTH, addresses without their query. */
  message: string;
  /** The script file it came from (index-Bj0HK1p4.js); none for a rejection. */
  file?: string;
}

/**
 * Session data (umami.identify, once per page load): how the site is seen, for filtering any report.
 * Never an `id` key: identify() would take it as a Distinct ID and link visits.
 */
export interface SessionData {
  /** Browser window width (VIEWPORT_BUCKETS); Umami's own `screen` is the whole screen. */
  viewport: string;
  /** Browser window height (VIEWPORT_HEIGHT_BUCKETS): how much of a page fits on the first screen. */
  viewportHeight: string;
  /** Screen pixel density (PIXEL_RATIO_BUCKETS). */
  pixelRatio: string;
  /** The theme shown when the page loaded. */
  theme: Theme;
  /** system: it follows the device setting; picked: the visitor chose it with the switch. */
  themeSource: "system" | "picked";
  /** The app whose built-in browser shows the site, or none. */
  inApp: InAppBrowser | "none";
  /**
   * The site's version the page was loaded with (package.json, as in the footer). Every call has it as
   * Umami's tag too, but the dashboard lists the values of session properties, not of the tag.
   */
  version: string;
  /**
   * The tag of the link that opened the page (?ref=acme, else utm_source), as link-ref sends it. Left out
   * without one, so Umami keeps the tag an earlier visit in the same session brought.
   */
  ref?: string;
}

/** The properties each event carries: a wrong event name or property is a type error. */
export interface EventData {
  /** The page was opened from a tagged link (?ref=acme, or utm_source). */
  [EVENT.linkRef]: { ref: string };
  [EVENT.caseOpen]: { case: View; from: "card-link" | "thumbnail" };
  [EVENT.caseNav]: { from: View; to: View; direction: "prev" | "next"; place: "top" | "end" };
  /** image: the screenshot card's id. */
  [EVENT.imageOpen]: { case: View; image: string };
  /** The next or previous screenshot in the image viewer (arrow, key or swipe); image: the one now shown. */
  [EVENT.imageNav]: { case: View; image: string; direction: "prev" | "next" };
  /**
   * hero, banner: the Work page's links to the Figma workspace. case: the case study whose Figma file link was
   * used, at its top (under the details panel) or in the design files banner at the end.
   */
  [EVENT.figmaClick]: { place: "hero" | "banner" } | { place: "top" | "end"; case: View };
  [EVENT.githubClick]: { place: "hero" | "banner" };
  [EVENT.storybookClick]: { place: "hero" | "banner" };
  [EVENT.linkedinClick]: {
    target: "profile" | "recommendations" | "author" | "company";
    place: "footer" | "contact" | "testimonials";
  };
  [EVENT.emailClick]: { action: "copy" | "mailto"; place: "footer" | "contact" };
  /** A link to another website that has no event of its own (TextLink external); host: that website. */
  [EVENT.outboundClick]: { host: string };
  /** question: the FAQ item's id. Sent when it opens, not when it closes. */
  [EVENT.faqOpen]: { question: string };
  /** section: the section id (the URL hash the copied link ends in). */
  [EVENT.sectionLinkCopy]: { section: string };
  /** The visitor selected text and copied it: where it was, never the text. */
  [EVENT.textCopy]: PageSpot;
  [EVENT.themeSwitch]: { theme: Theme };
  /** The page went to the printer or to a PDF (beforeprint). */
  [EVENT.pagePrint]: Record<string, never>;
  /** Sent when the visitor leaves the page, switches tabs or apps, or closes it. */
  [EVENT.timeOnPage]: TimeOnPage;
  /** A click or tap on something that does nothing; once per burst of quick clicks on one spot. */
  [EVENT.deadClick]: PageSpot;
  /** The same burst reached RAGE_CLICKS clicks: the visitor expected it to react. */
  [EVENT.rageClick]: PageSpot;
  /** The visitor opened an address that matches no page; the app showed Work instead. path: that address. */
  [EVENT.pageNotFound]: { path: string };
  [EVENT.jsError]: JsError;
}

/** What goes to Umami: the event's properties, plus the input behind it when a click or key started it. */
export type SentData<E extends AnalyticsEvent> = EventData[E] & { input?: InputKind };

export type EmailPlace = EventData[typeof EVENT.emailClick]["place"];

/** Where a case study's Figma file link sits (figma-click): under the details panel or in the design files banner. */
export type DesignFilePlace = Extract<EventData[typeof EVENT.figmaClick], { case: View }>["place"];

/** What Umami's tracker sends with each call; the tracker fills it in, analytics.utils.ts overrides the page. */
export interface UmamiPayload {
  website: string;
  hostname: string;
  screen: string;
  language: string;
  title: string;
  url: string;
  referrer?: string;
  /** The site's version (data-tag). */
  tag?: string;
  /** Set for events; a payload without a name is a pageview. */
  name?: string;
  data?: object;
}

/** A speed report (type "performance", data-performance): Core Web Vitals in milliseconds, CLS as a score. */
export type PerformancePayload = UmamiPayload &
  Partial<Record<(typeof LOAD_METRICS)[number] | "cls" | "inp" | "duration", number>>;

/**
 * The kinds of request the tracker makes: pageviews and events, session data, speed reports, and its own error
 * reports (data-errors, off on this site; beforeSend cancels them).
 */
export type UmamiSendType = "event" | "identify" | "performance" | "error";

/** data-before-send: gets every request before it goes; null cancels it. */
export type BeforeSend = (type: UmamiSendType, payload: PerformancePayload) => PerformancePayload | null;

export type BuildPayload = (payload: UmamiPayload) => UmamiPayload;

/** The part of window.umami the app uses: track() with a function that edits the payload, identify() with session data. */
export interface UmamiTracker {
  track: (build: BuildPayload) => unknown;
  identify: (data: SessionData) => unknown;
}

declare global {
  interface Window {
    umami?: UmamiTracker;
    /** UMAMI.beforeSend */
    kbUmamiBeforeSend?: BeforeSend;
  }
}

/** Privacy signals the browser sends. Navigator.globalPrivacyControl is not in TypeScript's DOM types yet. */
export interface PrivacySignals {
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
}

/** The visitor's answer to the consent box (or the switch on /privacy). */
export type StatisticsChoice = "on" | "off";

/** on / off: the visitor's choice; unset: not decided yet; browser: Do Not Track or Global Privacy Control. */
export type StatisticsState = StatisticsChoice | "unset" | "browser";

export interface AnalyticsSite {
  /** A production build (import.meta.env.PROD). */
  production: boolean;
  /** Vite's base: "/" on the site, "./" in a one-page build such as the claude.ai artifact. */
  base: string;
  hostname: string;
  privacy: PrivacySignals;
  /** The dev server in a person's browser: the consent box shows on every page load, to check its design. */
  preview?: boolean;
  /** The site's version (package.json), sent as Umami's tag so the dashboard can compare releases. */
  release?: string;
}

/** The page a call belongs to, read when it is made: address without the hash, title and referrer. */
export interface PageSnapshot {
  url: string;
  title: string;
  referrer?: string;
}

/** What the module remembers for the page's lifetime. */
export interface AnalyticsState {
  on: boolean;
  /** Tracker calls waiting for the script. */
  queue: Array<(tracker: UmamiTracker) => void>;
  /** The page of the last pageview, or null before the first one. */
  page: PageSnapshot | null;
  /** Referrer of the current page; null keeps the tracker's own (document.referrer, on the first page). */
  referrer: string | null;
  /** Removes the input, click, copy, print, error and time-on-page listeners; null while statistics are off. */
  unwatch: (() => void) | null;
  /** The address the visitor opened when it matched no page: page-not-found goes with the first pageview. */
  notFound: string | null;
}
