/**
 * End-to-end tests in real Chromium, Firefox and WebKit: `yarn e2e` (specs: e2e/*.e2e.ts).
 *
 * By default the run builds and serves the production output, prerendered HTML included:
 * the first view is static HTML that React then adopts (hydrates), and that takeover is part of what
 * the specs check. `tsc -b` is skipped on purpose (`yarn verify` type-checks), so an
 * unfinished edit elsewhere in the tree does not block a run.
 * E2E_DEV=1 tests the Vite dev server instead (no build, no prerendered HTML): faster to iterate.
 *
 * The server always starts fresh on its own port: an old server would answer with old code.
 */
import { defineConfig, devices } from "@playwright/test";

import { MESSENGER_UA } from "./e2e/helpers/helpers.constants.ts";

// E2E_PORT: a second run at the same time (another checkout or agent) needs its own port.
const PORT = Number(process.env.E2E_PORT ?? 5190);
// An IPv4 address, not "localhost": Node binds that to ::1 only, and Firefox may try 127.0.0.1.
const HOST = "127.0.0.1";
const BASE_URL = `http://${HOST}:${PORT}`;
const DEV = process.env.E2E_DEV === "1";
const DESKTOP = { width: 1280, height: 800 };
/**
 * Firefox 159 (2026-10-27) turns scroll-driven animations on, so visitors' Firefox runs the cards' scroll reveal.
 * The Firefox that Playwright 1.64 bundles (157) has them behind this pref: switched on, the Firefox project tests
 * what visitors get. Drop it once Playwright bundles Firefox 159 or later.
 */
const FIREFOX_PREFS = { "layout.css.scroll-driven-animations.enabled": true };
/**
 * Tests tagged @android run only in the "android" project: an Android phone in Messenger's in-app browser (a Chromium
 * WebView), as Playwright's Pixel 7 (412 x 839 CSS px, touch) with Messenger's user agent. It runs the full Chromium
 * build (channel "chromium"), whose compositor flings the page on after a swipe; the default headless shell stops
 * with the finger.
 */
const ANDROID = /@android/;

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  // A fixed, small number: the motion specs sample every frame, and browsers starve each other on a busy machine.
  workers: process.env.CI ? 2 : 4,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", grepInvert: ANDROID, use: { ...devices["Desktop Chrome"], viewport: DESKTOP } },
    {
      name: "firefox",
      grepInvert: ANDROID,
      use: { ...devices["Desktop Firefox"], viewport: DESKTOP, launchOptions: { firefoxUserPrefs: FIREFOX_PREFS } },
    },
    { name: "webkit", grepInvert: ANDROID, use: { ...devices["Desktop Safari"], viewport: DESKTOP } },
    {
      name: "android",
      grep: ANDROID,
      use: { ...devices["Pixel 7"], userAgent: MESSENGER_UA.android, channel: "chromium" },
    },
  ],
  webServer: {
    command: DEV
      ? `yarn vite --host ${HOST} --port ${PORT} --strictPort`
      : `yarn vite build && yarn -s prerender && yarn vite preview --host ${HOST} --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
