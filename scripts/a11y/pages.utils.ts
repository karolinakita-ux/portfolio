import type { Browser, Locator, Page } from "playwright";

import { VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

import { REFLOW_VIEWPORT, SMALL_PHONE_VIEWPORT, VIEWPORTS, ZOOM_VIEWPORT } from "./a11y.constants.ts";
import type { Theme } from "./a11y.types.ts";

const SIZES = { ...VIEWPORTS, reflow: REFLOW_VIEWPORT, small: SMALL_PHONE_VIEWPORT, zoom: ZOOM_VIEWPORT };

/** A view's URL on the dev server. */
export const urlFor = (base: string, view: View): string => base.replace(/\/$/, "") + VIEW_PATHS[view];

/** A fresh page at a viewport and theme, with reduced motion (the audit reads end states). */
export async function newPage(browser: Browser, viewport: keyof typeof SIZES, theme: Theme): Promise<Page> {
  const size = SIZES[viewport];
  const context = await browser.newContext({ viewport: size, reducedMotion: "reduce", colorScheme: theme });
  await context.addInitScript((theme) => {
    try {
      localStorage.setItem("kb-theme", theme);
    } catch {
      /* storage blocked: the theme script falls back to colorScheme */
    }
  }, theme);
  return context.newPage();
}

/**
 * Lets the page show the statistics consent box: the dev server shows it to every browser that is not
 * automated, so the page is told it is not.
 */
export async function showConsentBox(page: Page): Promise<void> {
  await page.context().addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false });
  });
}

export const consentBox = (page: Page): Locator => page.getByRole("region", { name: "Can I Count Your Visit?" });

export async function openView(page: Page, base: string, view: View): Promise<void> {
  await page.goto(urlFor(base, view));
  await page.waitForLoadState("networkidle");
  await page.locator("main").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}
