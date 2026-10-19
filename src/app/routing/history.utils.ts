import type { View } from "#shared/lib/routes/routes.types.ts";
import { urlForView } from "#shared/lib/routes/routes.utils.ts";

import type { HistoryState, Route } from "./history.types.ts";

/** URL of a view; keeps the query string (e.g. ?ref=cv) and adds the section anchor. */
export const urlFor = (view: View, anchor: string | null): string => urlForView(view, anchor, window.location);

/** The view key after navigating to `view`: unchanged within the same view, else the next one. */
export const nextViewKey = (current: Route, view: View): number =>
  view === current.view ? current.viewKey : current.viewKey + 1;

/** Stores the scroll position in the current history entry (for Back / Forward). */
export const saveScrollPosition = (view: View): void => {
  try {
    const current = (window.history.state ?? {}) as HistoryState;
    const next: HistoryState = { ...current, kbView: view, scrollY: window.scrollY };
    window.history.replaceState(next, "");
  } catch {
    /* history may be unavailable in sandboxed frames */
  }
};
