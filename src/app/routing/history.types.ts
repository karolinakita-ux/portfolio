import type { View } from "#shared/lib/routes/routes.types.ts";

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

/** What the app keeps in each browser history entry. */
export interface HistoryState {
  kbView?: View;
  scrollY?: number;
}
