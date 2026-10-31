import type { StatisticsChoice } from "./analytics.types.ts";

/** Umami Cloud: the script, this site's id, and the only host that counts (see analytics.utils.ts). */
export const UMAMI = {
  script: "https://cloud.umami.is/script.js",
  websiteId: "19c960f0-bad6-40f5-b5cb-75dca6dc292f",
  /** The only host that counts; the tracker checks it again (data-domains). */
  host: "karolina.kita.company",
  /** The window function the tracker runs before every request (data-before-send): beforeSend in analytics.utils.ts. */
  beforeSend: "kbUmamiBeforeSend",
} as const;

/**
 * Event names as the Umami dashboard lists them. The naming rules and what each event answers:
 * docs/analytics.md (the tracking plan; tracking-plan.test.ts keeps it in step). Properties: EventData.
 */
export const EVENT = {
  linkRef: "link-ref",
  caseOpen: "case-open",
  caseNav: "case-nav",
  imageOpen: "image-open",
  imageNav: "image-nav",
  imageZoom: "image-zoom",
  imageDescriptionOpen: "image-description-open",
  figmaClick: "figma-click",
  githubClick: "github-click",
  storybookClick: "storybook-click",
  linkedinClick: "linkedin-click",
  emailClick: "email-click",
  outboundClick: "outbound-click",
  cvOpen: "cv-open",
  cvDownload: "cv-download",
  faqOpen: "faq-open",
  sectionLinkCopy: "section-link-copy",
  textCopy: "text-copy",
  themeSwitch: "theme-switch",
  pagePrint: "page-print",
  timeOnPage: "time-on-page",
  deadClick: "dead-click",
  rageClick: "rage-click",
  pageNotFound: "page-not-found",
  jsError: "js-error",
} as const;

/** Events that no click or key starts: they carry no `input`. */
export const PASSIVE_EVENTS: readonly string[] = [EVENT.linkRef, EVENT.timeOnPage, EVENT.pageNotFound];

/** The visitor's statistics choice, kept in this browser only (statistics-consent.utils.ts). */
export const STATISTICS_CHOICE_KEY = "kb-statistics";

/**
 * What is stored for each answer. Consent covers what the visitor was told, so a yes given to an
 * earlier version is asked again: "on" (before 3.14.0: pages and link clicks) and "on-2" (3.14.0 -
 * 4.0.0: no page speed, errors or window size yet). A no stays a no.
 */
export const STORED_CHOICE: Readonly<Record<StatisticsChoice, string>> = { on: "on-3", off: "off" };

/**
 * Query parameters kept in the addresses sent to Umami: the link tag (?ref=) and the UTM parameters
 * of Umami's UTM report. Anything else is dropped, such as the click ids that ads and social apps add
 * (fbclid, gclid, li_fat_id): they are unique per click, and the pages would split by them.
 */
export const KEPT_PARAMS: readonly string[] = [
  "ref",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

/**
 * Link tags (?ref=) the site writes into its own links; link-ref and the session's `ref` show them. The tags
 * Karolina adds by hand (/cv?ref=acme, ?ref=linkedin-post) are not here. docs/analytics.md (Tagged links) lists
 * each one (tracking-plan.test.ts).
 */
export const LINK_REF = {
  /**
   * A section's address copied with the link button beside its heading (HeadingAnchor). A copier who came from a
   * tagged link passes that tag on instead, with this as utm_medium (sectionLinkQuery in link-tags.utils.ts).
   */
  sectionLink: "section-link",
} as const;

/** Load metrics in the tracker's speed report: they belong to the page the browser loaded (payload.utils.ts). */
export const LOAD_METRICS = ["ttfb", "fcp", "lcp"] as const;

/** Browser window width as the dashboard groups it, at the site's breakpoints (theme.css). */
export const VIEWPORT_BUCKETS: ReadonlyArray<readonly [number, string]> = [
  [480, "under 480px"],
  [768, "480 - 767px"],
  [1024, "768 - 1023px"],
  [1280, "1024 - 1279px"],
];
export const VIEWPORT_BUCKET_LAST = "1280px or wider";

/**
 * Browser window height, for what fits on the first screen: landscape phones, then 768px-high laptops and
 * small phones, most phones and 900px-high laptops, full HD desktops, taller screens.
 */
export const VIEWPORT_HEIGHT_BUCKETS: ReadonlyArray<readonly [number, string]> = [
  [500, "under 500px"],
  [700, "500 - 699px"],
  [900, "700 - 899px"],
  [1100, "900 - 1099px"],
];
export const VIEWPORT_HEIGHT_BUCKET_LAST = "1100px or taller";

/** Screen pixel density (devicePixelRatio), for image sizes: each label holds the ratios below its limit. */
export const PIXEL_RATIO_BUCKETS: ReadonlyArray<readonly [number, string]> = [
  [1.25, "1x"],
  [1.75, "1.5x"],
  [2.5, "2x"],
];
export const PIXEL_RATIO_BUCKET_LAST = "3x";

/** js-error: at most this many per page load, each message cut to MAX_MESSAGE_LENGTH. */
export const MAX_ERRORS = 3;
export const MAX_MESSAGE_LENGTH = 150;

/** Browser warnings that reach window.onerror but break nothing. */
export const HARMLESS_ERRORS = ["ResizeObserver loop"];

/** Longest address sent with page-not-found. */
export const MAX_PATH_LENGTH = 100;

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

/** Longest label (alt text, image caption, heading, card title) sent with a dead click. */
export const MAX_LABEL_LENGTH = 100;

/**
 * Elements that react to a click: a click on or inside them is not a dead click (clicks.utils.ts). data-clickable marks
 * one that is not a control but reacts to a click or tap all the same: the image viewer's image zooms (useZoom).
 */
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
  "[data-clickable]",
].join(", ");

/** Text elements: a dead click on them reads "text". */
export const TEXT = "p, li, span, strong, em, b, i, small, blockquote, figcaption, dt, dd, time, td, th, cite, q, code";
