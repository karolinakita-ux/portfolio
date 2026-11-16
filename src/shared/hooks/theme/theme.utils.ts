import { flushSync } from "react-dom";

import { inAppBrowser } from "#shared/lib/browser/browser.utils.ts";
import { prefersReducedMotion } from "#shared/lib/ui/ui.utils.ts";

import { DARK_QUERY, STICKY_HEADER_SELECTOR, THEME_STORAGE_KEY } from "./theme.constants.ts";
import type { Theme } from "./theme.types.ts";

export const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";

/** The theme the page shows now: the `dark` class on <html>, set by useTheme and the inline script in index.html. */
export const readDocumentTheme = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

/**
 * The theme already on <html> (its colour-scheme): the one the inline script in index.html chose before the first
 * paint, and pressed in the theme switch. Null where none is applied yet (the prerender, tests without the script).
 */
export const readAppliedTheme = (): Theme | null => {
  if (typeof document === "undefined") return null;
  const value = document.documentElement.style.colorScheme;
  return isTheme(value) ? value : null;
};

export const readStoredTheme = (): Theme | null => {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null; // storage blocked (private mode, strict settings)
  }
};

export const systemTheme = (): Theme => {
  try {
    return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
  } catch {
    return "light";
  }
};

/**
 * Holds the sticky header where it shows now, placed against the page instead of the window: position relative,
 * moved down by as much as sticking moved it. Returns the release, which gives the header back its own inline
 * position and top (React's `top`: the safe area). A header that is not stuck gets an offset of 0.
 *
 * During a view transition Chromium places sticky elements against the transition's snapshot, which reaches under
 * a phone browser's bar while the bar shows (GetFixedToSnapshotViewportOutsets in view_transition_style_tracker.cc).
 * Scrolled down with the bar back (after a scroll up), the stuck header moved up under the bar by the bar's height
 * for as long as the cross-fade ran, and its logo row disappeared (Chrome 145 on Android, in Chrome and in the
 * Google app's custom tab). Relative positioning is measured against the page, so the header stays where it was.
 */
export const holdStickyHeader = (): (() => void) => {
  const header = document.querySelector<HTMLElement>(STICKY_HEADER_SELECTOR);
  if (!header || getComputedStyle(header).position !== "sticky") return () => undefined;
  const { position, top } = header.style;
  const stuckTop = header.getBoundingClientRect().top;
  header.style.position = "relative";
  header.style.top = "0px";
  header.style.top = `${String(stuckTop - header.getBoundingClientRect().top)}px`;
  return () => {
    header.style.position = position;
    header.style.top = top;
  };
};

/** The release of the header held for the running cross-fade, and that cross-fade (the last one started). */
let releaseHeader: (() => void) | null = null;
let lastTransition: ViewTransition | null = null;

/**
 * Runs a theme state update. With view transitions and motion allowed, the browser snapshots
 * the page, the update renders synchronously inside the transition (flushSync) and the old
 * page cross-fades into the new one. Otherwise the update just applies.
 *
 * The stuck header is held in place until the last cross-fade has finished (holdStickyHeader).
 *
 * Not in in-app browsers (Messenger, Facebook, LinkedIn...): in Messenger on Android the top of the
 * header hid under the app's bar for as long as the cross-fade ran, most likely because its browser
 * places the transition's snapshot of the page too high. There the theme switches in one frame, as
 * in browsers without view transitions.
 */
export const changeTheme = (update: () => void) => {
  if (
    typeof document.startViewTransition !== "function" ||
    prefersReducedMotion() ||
    inAppBrowser(navigator.userAgent) !== null
  ) {
    update();
    return;
  }
  releaseHeader ??= holdStickyHeader();
  const transition = document.startViewTransition(() => {
    flushSync(update);
  });
  lastTransition = transition;
  // A transition interrupted by the next one is skipped (the update still applies): not an error.
  transition.ready.catch(() => undefined);
  void transition.finished
    .catch(() => undefined)
    .then(() => {
      if (lastTransition !== transition) return; // a newer cross-fade still runs: the header stays held
      lastTransition = null;
      releaseHeader?.();
      releaseHeader = null;
    });
};
