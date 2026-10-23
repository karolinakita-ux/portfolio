import {
  IDLE_AFTER_MS,
  SCROLL_BUCKETS,
  SECTION_LINE,
  SETTLE_MS,
  TIME_BUCKET_LAST,
  TIME_BUCKETS,
} from "./analytics.constants.ts";
import type { TimeOnPage } from "./analytics.types.ts";

/**
 * Time on page and how far the visitor read (the time-on-page event), the way Plausible measures it:
 *
 * - Engaged time counts while the tab is visible and the visitor has scrolled, pressed a key, tapped or
 *   moved the mouse in the last IDLE_AFTER_MS. A tab left open in the background does not count.
 * - A stretch ends when the visitor opens another page, switches tabs or apps, or closes the page; each
 *   stretch is one event with the time since the last one, so the seconds of a page's events add up.
 * - Scroll depth and the furthest section are the most the visitor has seen of the page so far. They are
 *   read once the page has stood still for SETTLE_MS after opening: a new view starts at the old scroll
 *   position and may glide to the top or to a section, which would count as reading the way there.
 */

let engaged = 0;
/** Start of the running count, or null while paused (hidden or idle). */
let since: number | null = null;
let lastReset = -Infinity;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
let settleTimer: ReturnType<typeof setTimeout> | undefined;
let settled = false;
let frame = 0;
/** Share of the page seen (0 - 1) and the furthest section reached, by its place in the page. */
let depth = 0;
let reached = -1;
let section: string | undefined;

export const timeBucket = (seconds: number): string =>
  TIME_BUCKETS.find(([limit]) => seconds < limit)?.[1] ?? TIME_BUCKET_LAST;

export const scrollBucket = (share: number): TimeOnPage["scroll"] =>
  SCROLL_BUCKETS[Math.min(Math.floor(share * 4), 4)] ?? "under 25%";

const pause = () => {
  if (since !== null) engaged += performance.now() - since;
  since = null;
  lastReset = -Infinity;
  clearTimeout(idleTimer);
};

/** Any sign of a reader: the count (re)starts and pauses IDLE_AFTER_MS after the last one. */
const onActivity = () => {
  if (document.visibilityState !== "visible") return;
  const now = performance.now();
  since ??= now;
  if (now - lastReset < 1000) return; // a mouse move fires many times a second
  lastReset = now;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(pause, IDLE_AFTER_MS);
};

const measure = () => {
  frame = 0;
  const seen = (window.scrollY + window.innerHeight + 2) / Math.max(document.documentElement.scrollHeight, 1);
  depth = Math.max(depth, Math.min(seen, 1));
  // At the bottom, a short last section never reaches the line: everything on screen has been seen.
  const line = window.innerHeight * (seen >= 1 ? 1 : SECTION_LINE);
  document.querySelectorAll<HTMLElement>("main section[data-anchor][id]").forEach((element, index) => {
    if (index > reached && element.getBoundingClientRect().top <= line) {
      reached = index;
      section = element.id;
    }
  });
};

const settle = () => {
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    settled = true;
    measure();
  }, SETTLE_MS);
};

const onScroll = () => {
  onActivity();
  if (settled) frame ||= requestAnimationFrame(measure);
  else settle();
};

/** A new page: nothing seen yet, counting from now. Call it after the pageview. */
export function startPage(): void {
  pause();
  engaged = 0;
  depth = 0;
  reached = -1;
  section = undefined;
  settled = false;
  cancelAnimationFrame(frame);
  frame = 0;
  settle();
  onActivity();
}

/** Ends the stretch on this page: its time and depth, or null under a second. The count goes on. */
export function endStretch(): TimeOnPage | null {
  const running = since !== null;
  pause();
  const seconds = Math.round(engaged / 1000);
  engaged = 0;
  if (running) onActivity();
  if (seconds < 1) return null;
  return { time: timeBucket(seconds), seconds, scroll: scrollBucket(depth), ...(section !== undefined && { section }) };
}

/**
 * Listens for reading activity; `onStretch` gets each stretch that ends because the tab is hidden or the
 * page closes (a new page ends one too: see endStretch). Returns the function that stops.
 */
export function watchEngagement(onStretch: (stretch: TimeOnPage) => void): () => void {
  const report = () => {
    const stretch = endStretch();
    pause();
    if (stretch) onStretch(stretch);
  };
  const onVisibility = () => {
    if (document.visibilityState === "hidden") report();
    else onActivity();
  };
  const activity = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"] as const;
  const options = { capture: true, passive: true };
  for (const type of activity) document.addEventListener(type, onActivity, options);
  window.addEventListener("scroll", onScroll, options);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", report);
  return () => {
    for (const type of activity) document.removeEventListener(type, onActivity, options);
    window.removeEventListener("scroll", onScroll, options);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", report);
    pause();
    engaged = 0; // statistics are off: what was counted is never sent
    clearTimeout(settleTimer);
    cancelAnimationFrame(frame);
    frame = 0;
  };
}

/** Calls `report` when the page goes to the printer or to a PDF (page-print). Returns the function that stops. */
export function watchPrints(report: () => void): () => void {
  window.addEventListener("beforeprint", report);
  return () => {
    window.removeEventListener("beforeprint", report);
  };
}
