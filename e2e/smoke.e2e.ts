/**
 * Every page loads in every browser: the right title, one <main>, one <h1>, the Primary nav,
 * and no console errors or uncaught exceptions on the way (the prerendered-HTML takeover included).
 */
import { expect, test } from "@playwright/test";

import { titleForView, VIEW_PATHS, VIEWS } from "#shared/lib/routes.ts";

import { waitForApp } from "./helpers.ts";

const DEV = process.env.E2E_DEV === "1";
const count = (html: string, tag: string): number => html.match(new RegExp(`<${tag}[\\s>]`, "g"))?.length ?? 0;

for (const view of VIEWS) {
  const path = VIEW_PATHS[view];

  test(`${path} loads cleanly`, async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(`console error: ${message.text()}`);
    });
    page.on("pageerror", (error) => {
      problems.push(`uncaught: ${error.message}`);
    });

    const response = await page.goto(path);
    expect(response?.status(), "HTTP status").toBe(200);
    if (!DEV) {
      // The production server answers with the page's prerendered HTML, not an empty shell. Fetched
      // again on the side: Firefox does not always keep the body of the navigation response.
      const html = await (await page.request.get(path)).text();
      expect(count(html, "main"), "prerendered <main>").toBe(1);
      expect(count(html, "h1"), "prerendered <h1>").toBe(1);
    }

    await waitForApp(page);
    await expect(page).toHaveTitle(titleForView(view));
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    expect(problems).toEqual([]);
  });
}
