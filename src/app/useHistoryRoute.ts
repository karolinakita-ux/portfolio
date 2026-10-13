import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { readRoute, VIEW, VIEW_PATHS, type Navigate, type View } from "#shared/lib/routes.ts";

/**
 * View routing backed by the browser history and real URL paths (/about, /work/meetestim).
 *
 * - navigate() pushes a new history entry when the view changes, so Back and
 *   Forward (and swipe-back on phones) move between views.
 * - Each entry remembers its scroll position; going Back returns to where the
 *   visitor was, e.g. the case-study card they clicked.
 * - Re-selecting the current view resets it to the top (or to its anchor) without adding history.
 * - The first load normalises the URL: old hash links (/#about) and aliases (/resume)
 *   become their path, an unknown path becomes /, a section hash (/about#career) stays.
 *
 * route.key changes on every navigation; App uses it to apply scroll / focus once
 * the view has rendered. route.viewKey changes only when the view changes; App
 * remounts the view on it, so a jump within the page (same view, new anchor) only scrolls.
 */
export interface Route {
  view: View;
  /** Section id to land on after navigating (instead of the top). */
  anchor: string | null;
  smooth: boolean;
  /** Scroll position to restore (Back / Forward), or null for a fresh visit. */
  restoreY: number | null;
  /** Increments on every navigation; 0 is the initial page load. */
  key: number;
  /** Increments when the view changes; 0 is the first view. */
  viewKey: number;
}

interface HistoryState {
  kbView?: View;
  scrollY?: number;
}

const SCROLL_SAVE_DELAY = 300; // ms after scrolling stops (keeps replaceState calls rare)

/** URL of a view; keeps the query string (e.g. ?ref=cv) and adds the section anchor. */
const urlFor = (view: View, anchor: string | null): string =>
  VIEW_PATHS[view] + window.location.search + (anchor ? "#" + anchor : "");

const nextViewKey = (current: Route, view: View): number =>
  view === current.view ? current.viewKey : current.viewKey + 1;

const saveScrollPosition = (view: View) => {
  try {
    const current = (window.history.state ?? {}) as HistoryState;
    const next: HistoryState = { ...current, kbView: view, scrollY: window.scrollY };
    window.history.replaceState(next, "");
  } catch {
    /* history may be unavailable in sandboxed frames */
  }
};

export function useHistoryRoute(initialView: View = VIEW.work): [Route, Navigate] {
  const [route, setRoute] = useState<Route>(() => {
    const { view, anchor } = readRoute(window.location);
    return { view: view ?? initialView, anchor, smooth: false, restoreY: null, key: 0, viewKey: 0 };
  });

  // The committed view, read by event handlers and navigate().
  const viewRef = useRef(route.view);
  const initialAnchorRef = useRef(route.anchor);
  useLayoutEffect(() => {
    viewRef.current = route.view;
  }, [route.view]);

  useEffect(() => {
    // The app restores scroll itself, per view.
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

    // Normalise the first entry (old hash links, aliases, unknown paths).
    try {
      const first: HistoryState = { kbView: viewRef.current, scrollY: 0 };
      window.history.replaceState(first, "", urlFor(viewRef.current, initialAnchorRef.current));
    } catch {
      /* ignore */
    }

    let timer: number | undefined;

    const onPopState = (event: PopStateEvent) => {
      // A pending save belongs to the entry we just left; drop it.
      window.clearTimeout(timer);
      const view = readRoute(window.location).view ?? VIEW.work;
      const state = event.state as HistoryState | null;
      const restoreY = typeof state?.scrollY === "number" ? state.scrollY : 0;
      setRoute((current) => ({
        view,
        anchor: null,
        smooth: false,
        restoreY,
        key: current.key + 1,
        viewKey: nextViewKey(current, view),
      }));
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
    try {
      if (view !== viewRef.current) {
        saveScrollPosition(viewRef.current);
        const next: HistoryState = { kbView: view, scrollY: 0 };
        window.history.pushState(next, "", urlFor(view, anchor));
      } else {
        window.history.replaceState(window.history.state, "", urlFor(view, anchor));
      }
    } catch {
      /* routing still works in state */
    }
    viewRef.current = view;
    setRoute((current) => ({
      view,
      anchor,
      smooth: Boolean(options.smooth),
      restoreY: null,
      key: current.key + 1,
      viewKey: nextViewKey(current, view),
    }));
  }, []);

  return [route, navigate];
}
