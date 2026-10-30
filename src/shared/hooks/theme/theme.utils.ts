import { flushSync } from "react-dom";

import { inAppBrowser } from "#shared/lib/browser/browser.utils.ts";
import { prefersReducedMotion } from "#shared/lib/ui/ui.utils.ts";

import { DARK_QUERY, THEME_STORAGE_KEY } from "./theme.constants.ts";
import type { Theme } from "./theme.types.ts";

export const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";

/** The theme the page shows now: the `dark` class on <html>, set by useTheme and the inline script in index.html. */
export const readDocumentTheme = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

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
 * Runs a theme state update. With view transitions and motion allowed, the browser snapshots
 * the page, the update renders synchronously inside the transition (flushSync) and the old
 * page cross-fades into the new one. Otherwise the update just applies.
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
  const transition = document.startViewTransition(() => {
    flushSync(update);
  });
  // A transition interrupted by the next one is skipped (the update still applies): not an error.
  transition.ready.catch(() => undefined);
};
