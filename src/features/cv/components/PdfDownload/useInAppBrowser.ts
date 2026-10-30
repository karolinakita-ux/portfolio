import { useSyncExternalStore } from "react";

import type { InAppBrowser } from "#shared/lib/browser/browser.types.ts";
import { inAppBrowser } from "#shared/lib/browser/browser.utils.ts";

/** The user agent never changes during a visit: nothing to subscribe to. */
const subscribe = () => () => undefined;

const readInApp = (): InAppBrowser | null => inAppBrowser(navigator.userAgent);

/** The app whose built-in browser shows the page (Messenger, LinkedIn ...), or null; null while prerendering. */
export function useInAppBrowser(): InAppBrowser | null {
  return useSyncExternalStore(subscribe, readInApp, () => null);
}
