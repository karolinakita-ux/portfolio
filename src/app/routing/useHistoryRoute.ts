import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { replaceAddress } from "#shared/lib/routes/address.utils.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import type { Navigate, View } from "#shared/lib/routes/routes.types.ts";
import { readRoute } from "#shared/lib/routes/routes.utils.ts";

import type { HistoryState, Route } from "./history.types.ts";
import { newEntryId, nextViewKey, saveScrollPosition, urlFor } from "./history.utils.ts";

/**
 * View routing backed by the browser history and real URL paths (/about, /work/automotive).
 *
 * - navigate() pushes a new history entry when the view changes, so Back and
 *   Forward (and swipe-back on phones) move between views.
 * - Each entry remembers its scroll position; going Back returns to where the
 *   visitor was, e.g. the case-study card they clicked. Positions are kept in memory by
 *   entry id and written to the history only when leaving an entry, never while
 *   scrolling: in-app browsers (Messenger, LinkedIn) flash their loading bar on every write.
 * - Re-selecting the current view resets it to the top (or to its anchor) without adding history.
 * - A link to a section of the open page that the browser follows by itself (a fragment navigation: popstate
 *   with an entry the app never wrote) lands on that section's heading, not at the top.
 * - The first load normalises the URL: old hash links (/#about), aliases (/resume) and the
 *   file forms the host also serves (/about.html, /about/index.html) become their path, an
 *   unknown path becomes /, a section hash (/about#career) stays.
 *
 * route.key changes on every navigation; App uses it to apply scroll / focus once
 * the view has rendered. route.viewKey changes only when the view changes; App
 * remounts the view on it, so a jump within the page (same view, new anchor) only scrolls.
 */
export function useHistoryRoute(initialView: View = VIEW.work): [Route, Navigate] {
  const [route, setRoute] = useState<Route>(() => {
    const { view, anchor } = readRoute(window.location);
    return {
      view: view ?? initialView,
      anchor,
      smooth: false,
      restoreY: null,
      afterBrowserJump: false,
      key: 0,
      viewKey: 0,
    };
  });

  // The committed view, read by event handlers and navigate().
  const viewRef = useRef(route.view);
  const initialAnchorRef = useRef(route.anchor);
  // The current history entry's id, and the last scroll position of every entry left in this visit.
  const entryIdRef = useRef("");
  const positionsRef = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    viewRef.current = route.view;
  }, [route.view]);

  useEffect(() => {
    // The app restores scroll itself, per view.
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

    // Normalise the first entry (old hash links, aliases, unknown paths); a reloaded entry keeps its id.
    entryIdRef.current = (window.history.state as HistoryState | null)?.kbId ?? newEntryId();
    try {
      const first: HistoryState = { kbView: viewRef.current, scrollY: 0, kbId: entryIdRef.current };
      replaceAddress(urlFor(viewRef.current, initialAnchorRef.current), first);
    } catch {
      /* ignore */
    }

    const positions = positionsRef.current;

    const onPopState = (event: PopStateEvent) => {
      // The page still shows the entry being left: remember where it was, in memory only.
      positions.set(entryIdRef.current, window.scrollY);
      const route = readRoute(window.location);
      const view = route.view ?? VIEW.work;
      const state = event.state as HistoryState | null;
      if (state?.kbView === undefined) {
        // An entry the app never wrote: the browser followed a link to a section of this page by itself (a
        // fragment navigation) and jumps to the section. Land on its heading, as a link from elsewhere does,
        // and give the entry its id and normalised address, as the first load does: one write, not while scrolling.
        entryIdRef.current = newEntryId();
        try {
          const entry: HistoryState = { kbView: view, scrollY: 0, kbId: entryIdRef.current };
          replaceAddress(urlFor(view, route.anchor), entry);
        } catch {
          /* ignore */
        }
        setRoute((current) => ({
          view,
          anchor: route.anchor,
          smooth: false,
          restoreY: null,
          afterBrowserJump: true,
          key: current.key + 1,
          viewKey: nextViewKey(current, view),
        }));
        return;
      }
      entryIdRef.current = state.kbId ?? newEntryId();
      const remembered = state.kbId === undefined ? undefined : positions.get(state.kbId);
      const restoreY = remembered ?? (typeof state.scrollY === "number" ? state.scrollY : 0);
      setRoute((current) => ({
        view,
        anchor: null,
        smooth: false,
        restoreY,
        afterBrowserJump: false,
        key: current.key + 1,
        viewKey: nextViewKey(current, view),
      }));
    };

    // Leaving the page (another site, a reload, the app in the background): one write, so the
    // entry still knows its position when the visitor comes back.
    const onPageHide = () => saveScrollPosition(viewRef.current);

    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  const navigate = useCallback<Navigate>((view, anchor = null, options = {}) => {
    try {
      if (view !== viewRef.current) {
        positionsRef.current.set(entryIdRef.current, window.scrollY);
        saveScrollPosition(viewRef.current);
        entryIdRef.current = newEntryId();
        const next: HistoryState = { kbView: view, scrollY: 0, kbId: entryIdRef.current };
        window.history.pushState(next, "", urlFor(view, anchor));
      } else {
        replaceAddress(urlFor(view, anchor)); // the same view: not a new page
      }
    } catch {
      /* routing still works in state */
    }
    viewRef.current = view;
    setRoute((current) => ({
      view,
      anchor,
      // Only within the view: a new view mounts at the old scroll position, so a smooth scroll would sweep it
      // while it fades in. It starts at its top (or anchor) at once.
      smooth: Boolean(options.smooth) && view === current.view,
      restoreY: null,
      afterBrowserJump: false,
      key: current.key + 1,
      viewKey: nextViewKey(current, view),
    }));
  }, []);

  return [route, navigate];
}
