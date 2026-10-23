import type { View } from "#shared/lib/routes/routes.types.ts";

import type { EVENT, SCROLL_BUCKETS } from "./analytics.constants.ts";

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

/** What a dead click landed on: an image, an icon, a heading, text, the empty part of a card, or the page. */
export type ClickedElement = "image" | "icon" | "heading" | "text" | "card" | "page";

export interface DeadClick {
  element: ClickedElement;
  /** The section id around it, a hero's name (hero, about, case...), or the landmark (header, footer, dialog, main). */
  area: string;
  /** The image's alt text, the heading, or the card's title: site copy, never anything the visitor typed. */
  label?: string;
}

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
  /** Sent when the visitor leaves the page, switches tabs or apps, or closes it. */
  [EVENT.timeOnPage]: TimeOnPage;
  /** A click or tap on something that does nothing; once per burst of quick clicks on one spot. */
  [EVENT.deadClick]: DeadClick;
  /** The same burst reached RAGE_CLICKS clicks: the visitor expected it to react. */
  [EVENT.rageClick]: DeadClick;
}

/** What goes to Umami: the event's properties, plus the input behind it when a click or key started it. */
export type SentData<E extends AnalyticsEvent> = EventData[E] & { input?: InputKind };

export type EmailPlace = EventData[typeof EVENT.emailClick]["place"];

/** What Umami's tracker sends with each call; the tracker fills it in, analytics.utils.ts overrides the page. */
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

export type BuildPayload = (payload: UmamiPayload) => UmamiPayload;

/** The part of window.umami the app uses: track() with a function that edits the payload. */
export interface UmamiTracker {
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
  queue: BuildPayload[];
  /** The page of the last pageview, or null before the first one. */
  page: PageSnapshot | null;
  /** Referrer of the current page; null keeps the tracker's own (document.referrer, on the first page). */
  referrer: string | null;
  /** Removes the input, click and time-on-page listeners; null while statistics are off. */
  unwatch: (() => void) | null;
}
