import { useSyncExternalStore } from "react";

/** Nothing to subscribe to: React reads the client value once hydration has finished. */
const subscribe = () => () => undefined;

/**
 * True while React renders the first HTML: on the server (scripts/prerender.ts) and while the browser adopts
 * that HTML (hydrateRoot in src/main.tsx). React then renders once more with false, and anything the app renders
 * later, or renders without prerendered HTML (the dev server, a one-page build), gets false from the start.
 * For what must match the prerendered HTML while hydrating but may differ afterwards.
 */
export function useHydrating(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );
}
