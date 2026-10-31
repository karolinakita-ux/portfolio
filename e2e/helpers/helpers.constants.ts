import { UMAMI } from "#shared/lib/analytics/analytics.constants.ts";

import type { Theme } from "./helpers.types.ts";

/** The app's own localStorage key for the visitor's theme pick (the inline script in index.html reads it too). */
export { THEME_STORAGE_KEY } from "#shared/hooks/theme/theme.constants.ts";

/** The live site's address: the statistics specs serve the local build under it (openAsLiveSite in umami.utils.ts). */
export const LIVE_SITE = "https://" + UMAMI.host;

/** Umami's collector: the tracker posts every call to its /api/send (no data-host-url on the script tag). */
export const UMAMI_COLLECTOR = "https://gateway.umami.is/**";

/** The live tracker as the statistics specs serve it (umami.utils.ts): a copy from cloud.umami.is, at most an hour old. */
export const TRACKER_COPY = { file: "node_modules/.tmp/e2e-umami-script.js", maxAgeMinutes: 60 } as const;

/** The consent box's name (its title, PRIVACY.consent.title). */
export const CONSENT_BOX = "Can I Count Your Visit?";

/** The collector's answer allows cross-origin calls, the browser's preflight included. */
export const COLLECTOR_CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "*",
} as const;

export const THEMES: readonly Theme[] = ["light", "dark"];

export const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
} as const;

/**
 * User agents of Messenger's in-app browser, as the app sends them: FBAN/MessengerForiOS on iPhone (WebKit),
 * FB_IAB/Orca-Android on Android (a Chromium WebView: the "android" project in playwright.config.ts).
 * `inAppBrowser()` (src/shared/lib/browser) reads both as Messenger.
 */
export const MESSENGER_UA = {
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/MessengerForiOS;FBAV/512.0.0.47.106;FBBV/731562344;FBDV/iPhone15,3;FBMD/iPhone;FBSN/iOS;FBSV/18.6;FBSS/3;FBCR/;FBID/phone;FBLC/pl_PL;FBOP/5]",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 7 Build/AP2A.240905.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.58 Mobile Safari/537.36 [FB_IAB/Orca-Android;FBAV/480.0.0.47.109;]",
} as const;

/** bgCanvas in src/styles/tokens.css. */
export const CANVAS: Readonly<Record<Theme, string>> = { light: "#ffffff", dark: "#1a1a1a" };

export const THEME_LABEL: Readonly<Record<Theme, string>> = { light: "Light mode", dark: "Dark mode" };

export const SELECTOR = {
  primaryNav: 'nav[aria-label="Primary"]',
  navPills: 'nav[aria-label="Primary"] [data-pill]',
  themeGroup: '[role="group"][aria-label="Colour theme"]',
  themePills: '[role="group"][aria-label="Colour theme"] [data-pill]',
} as const;
