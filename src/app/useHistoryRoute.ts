import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { readViewFromLocation, urlForView, type Navigate, type View } from "#shared/lib/routes.ts";

/**
 * View routing backed by the browser history.
 *
 * - navigate() pushes a new history entry when the view changes, so Back and
 *   Forward (and swipe-back on phones) move between views.
 * - Each entry remembers its scroll position; going Back returns to where the
 *   visitor was, e.g. the case-study card they clicked.
 * - Re-selecting the current view resets it to the top without adding history.
 *
 * route.key changes on every navigation; App uses it to remount the view and
 * to apply scroll / focus once the new view has rendered.
 */
export interface Route {
  view: View;
  /** Element id to land on after navigating (instead of the top). */
  anchor: string | null;
  smooth: boolean;
  /** Scroll position to restore (Back / Forward), or null for a fresh visit. */
  restoreY: number | null;
  /** Increments on every navigation; 0 is the initial page load. */
  key: number;
}

interface HistoryState {
  kbView?: View;
  scrollY?: number;
}

const SCROLL_SAVE_DELAY = 300; // ms after scrolling stops (keeps replaceState calls rare)

const saveScrollPosition = (view: View) => {
  try {
    const current = (window.history.state ?? {}) as HistoryState;
    const next: HistoryState = { ...current, kbView: view, scrollY: window.scrollY };
    window.history.replaceState(next, "");
  } catch {
    /* history may be unavailable in sandboxed frames */
  }
};

export function useHistoryRoute(initialView: View = "work"): [Route, Navigate] {
  const [route, setRoute] = useState<Route>(() => ({
    view: readViewFromLocation() ?? initialView,
    anchor: null,
    smooth: false,
    restoreY: null,
    key: 0,
  }));

  // The committed view, read by event handlers and navigate().
  const viewRef = useRef(route.view);
  useLayoutEffect(() => {
    viewRef.current = route.view;
  }, [route.view]);

  useEffect(() => {
    // The app restores scroll itself, per view.
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

    // Normalise the first entry (aliases such as #projects → bare root).
    try {
      const first: HistoryState = { kbView: viewRef.current, scrollY: 0 };
      window.history.replaceState(first, "", urlForView(viewRef.current));
    } catch {
      /* ignore */
    }

    let timer: number | undefined;

    const onPopState = (event: PopStateEvent) => {
      // A pending save belongs to the entry we just left; drop it.
      window.clearTimeout(timer);
      const view = readViewFromLocation() ?? "work";
      const state = event.state as HistoryState | null;
      const restoreY = typeof state?.scrollY === "number" ? state.scrollY : 0;
      setRoute((current) => ({ view, anchor: null, smooth: false, restoreY, key: current.key + 1 }));
    };

    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => saveScrollPosition(viewRef.current), SCROLL_SAVE_DELAY);
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const navigate = useCallback<Navigate>((view, anchor = null, options = {}) => {
    if (view !== viewRef.current) {
      saveScrollPosition(viewRef.current);
      try {
        const next: HistoryState = { kbView: view, scrollY: 0 };
        window.history.pushState(next, "", urlForView(view));
      } catch {
        /* routing still works in state */
      }
      viewRef.current = view;
    }
    setRoute((current) => ({
      view,
      anchor,
      smooth: Boolean(options.smooth),
      restoreY: null,
      key: current.key + 1,
    }));
  }, []);

  return [route, navigate];
}
