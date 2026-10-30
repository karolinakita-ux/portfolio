import { vi } from "vitest";

/**
 * Installs a controllable window.matchMedia. Every query reports `matches`;
 * call `change(next)` to flip it and notify listeners (e.g. system dark mode at sunset).
 * Queries listed in `fixed` keep their own value and never change
 * (e.g. { "(prefers-reduced-motion: reduce)": false } while the colour scheme flips).
 */
export function mockMatchMedia(initial: boolean, fixed: Readonly<Record<string, boolean>> = {}) {
  let matches = initial;
  const listeners = new Set<{ query: string; listener: (event: MediaQueryListEvent) => void }>();

  const matchMedia = (query: string): MediaQueryList =>
    ({
      get matches() {
        return fixed[query] ?? matches;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.add({ query, listener }),
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        for (const entry of listeners) if (entry.listener === listener) listeners.delete(entry);
      },
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    }) as unknown as MediaQueryList;

  vi.stubGlobal("matchMedia", matchMedia);

  return {
    change(next: boolean) {
      matches = next;
      for (const { query, listener } of listeners) {
        if (!(query in fixed)) listener({ matches: next } as MediaQueryListEvent);
      }
    },
  };
}
