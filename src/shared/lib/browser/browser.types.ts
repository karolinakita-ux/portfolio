import type { IN_APP_BROWSERS } from "./browser.constants.ts";

/** The app whose built-in browser shows the page: messenger, instagram, linkedin... */
export type InAppBrowser = (typeof IN_APP_BROWSERS)[number][0];
