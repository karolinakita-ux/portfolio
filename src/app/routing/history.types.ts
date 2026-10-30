import type { View } from "#shared/lib/routes/routes.types.ts";

export interface Route {
  view: View;
  /** Section id to land on after navigating (instead of the top). */
  anchor: string | null;
  /** Scroll there smoothly: only for a jump within the view (Explore Case Studies). A new view starts there at once. */
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
  /** Scroll position when the visitor left the entry (written on leaving, never while scrolling). */
  scrollY?: number;
  /** The entry's id: Back and Forward look up its last scroll position in memory. */
  kbId?: string;
}
