import type { Browser, Page } from "playwright";

import { VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

import { REFLOW_VIEWPORT, VIEWPORTS } from "./a11y.constants.ts";
import type { Theme, ViewportName } from "./a11y.types.ts";

/** A view's URL on the dev server. */
export const urlFor = (base: string, view: View): string => base.replace(/\/$/, "") + VIEW_PATHS[view];

/** A fresh page at a viewport and theme, with reduced motion (the audit reads end states). */
export async function newPage(browser: Browser, viewport: ViewportName | "reflow", theme: Theme): Promise<Page> {
  const size = viewport === "reflow" ? REFLOW_VIEWPORT : VIEWPORTS[viewport];
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

export async function openView(page: Page, base: string, view: View): Promise<void> {
  await page.goto(urlFor(base, view));
  await page.waitForLoadState("networkidle");
  await page.locator("main").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}
