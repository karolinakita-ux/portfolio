import type { View } from "#shared/lib/routes/routes.types.ts";

import type { EVENT } from "./analytics.constants.ts";

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
}

/** What the module remembers for the page's lifetime. */
export interface AnalyticsState {
  on: boolean;
  queue: BuildPayload[];
  /** Address of the last pageview, or null before the first one. */
  lastPage: string | null;
  /** Referrer of the current page; null keeps the tracker's own (document.referrer, on the first page). */
  referrer: string | null;
}
