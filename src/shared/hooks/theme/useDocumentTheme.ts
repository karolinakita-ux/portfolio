import { useSyncExternalStore } from "react";

import type { Theme } from "./theme.types.ts";
import { readDocumentTheme } from "./theme.utils.ts";

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
};

/**
 * Prerendered HTML is built as the light page (themed images carry their light source); the inline script
 * in index.html puts the stored or system theme on <html> before the first paint, and the app reads it there.
 */
const readServerTheme = (): Theme => "light";

/**
 * The theme the page shows right now: the `dark` class on <html>, which useTheme and the inline
 * script in index.html set. Any component can read it without the toggle's state, so a themed
 * image swaps in the same frame as the colours.
 */
export function useDocumentTheme(): Theme {
  return useSyncExternalStore(subscribe, readDocumentTheme, readServerTheme);
}
