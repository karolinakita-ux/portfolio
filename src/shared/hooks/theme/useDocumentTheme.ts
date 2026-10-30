import { useSyncExternalStore } from "react";

import type { Theme } from "./theme.types.ts";

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
};

const readTheme = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");

/** Prerendered HTML is the light page; the browser switches to the stored or system theme right after. */
const readServerTheme = (): Theme => "light";

/**
 * The theme the page shows right now: the `dark` class on <html>, which useTheme and the inline
 * script in index.html set. Any component can read it without the toggle's state, so a themed
 * image swaps in the same frame as the colours.
 */
export function useDocumentTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, readServerTheme);
}
