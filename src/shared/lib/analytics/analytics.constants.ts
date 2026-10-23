import type { StatisticsChoice } from "./analytics.types.ts";

/** Umami Cloud: the script, this site's id, and the only host that counts (see analytics.utils.ts). */
export const UMAMI = {
  script: "https://cloud.umami.is/script.js",
  websiteId: "19c960f0-bad6-40f5-b5cb-75dca6dc292f",
  /** The only host that counts; the tracker checks it again (data-domains). */
  host: "karolina.kita.company",
} as const;

/** Event names as the Umami dashboard lists them (at most 50 characters). Properties: EventData. */
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
  timeOnPage: "time-on-page",
  deadClick: "dead-click",
  rageClick: "rage-click",
} as const;

/** Events that no click or key starts: they carry no `input`. */
export const PASSIVE_EVENTS: readonly string[] = [EVENT.linkRef, EVENT.timeOnPage];

/** The visitor's statistics choice, kept in this browser only (statistics-consent.utils.ts). */
export const STATISTICS_CHOICE_KEY = "kb-statistics";

/**
 * What is stored for each answer. A plain "on" was a yes before 3.14.0, when the statistics counted
 * pages and link clicks only: consent covers what the visitor was told, so that visitor is asked again.
 * A no stays a no.
 */
export const STORED_CHOICE: Readonly<Record<StatisticsChoice, string>> = { on: "on-2", off: "off" };

/** Fired on window when the choice changes, so the consent box and the privacy page update. */
export const STATISTICS_CHANGE_EVENT = "kb-statistics-change";

/** Calls waiting for the script; a blocked script never arrives, so the queue stays short. */
export const MAX_QUEUED = 50;

/** Umami keeps event values up to 500 characters; a tag is a company or channel name. */
export const MAX_REF_LENGTH = 100;

/** A click or key counts as the input behind an event that follows within this time (input.utils.ts). */
export const INPUT_WINDOW_MS = 1000;

/** Time on page stops counting this long after the last scroll, key, tap or mouse move (engagement.utils.ts). */
export const IDLE_AFTER_MS = 30_000;

/** A section counts as reached once its top passes this share of the viewport height. */
export const SECTION_LINE = 0.5;

/** Scroll depth is read once the page has stood still this long after opening: a new view may glide to its place first. */
export const SETTLE_MS = 300;

/** Time on page as the dashboard groups it: each label holds the time below its limit (seconds). */
export const TIME_BUCKETS: ReadonlyArray<readonly [number, string]> = [
  [10, "under 10 s"],
  [30, "10 - 30 s"],
  [60, "30 s - 1 min"],
  [180, "1 - 3 min"],
  [600, "3 - 10 min"],
];
export const TIME_BUCKET_LAST = "over 10 min";

/** How far down the page the visitor saw, in quarters. */
export const SCROLL_BUCKETS = ["under 25%", "25%", "50%", "75%", "100%"] as const;

/** A pointer that moves further than this between press and release dragged or swiped: not a click. */
export const DRAG_PX = 10;

/** Clicks this close in time and place belong to one burst; RAGE_CLICKS of them make a rage click. */
export const BURST_GAP_MS = 700;
export const BURST_RADIUS_PX = 30;
export const RAGE_CLICKS = 3;

/** Longest label (alt text, heading, card title) sent with a dead click. */
export const MAX_LABEL_LENGTH = 100;

/** Elements that react to a click: a click on or inside them is not a dead click (clicks.utils.ts). */
export const INTERACTIVE = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
  "label",
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/** Text elements: a dead click on them reads "text". */
export const TEXT = "p, li, span, strong, em, b, i, small, blockquote, figcaption, dt, dd, time, td, th, cite, q, code";
