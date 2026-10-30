/**
 * A link to a section (/about#career) opened from a chat, on an Android phone in Messenger's in-app browser
 * (a Chromium WebView): the page opens with the section's heading just below the sticky header, focused.
 * - An app's link wrapper may write its tracking tag after the hash (#career?fbclid=...): the link still lands,
 *   and the address keeps only the section.
 * Production build: what a visitor's browser receives.
 */
import { expect, test, type Page } from "@playwright/test";

import { MESSENGER_ANDROID } from "./helpers/helpers.constants.ts";
import { waitForApp } from "./helpers/page.utils.ts";

/** Where the heading of section `id` sits, and where an anchor jump puts it (scroll padding + its scroll margin). */
const headingPlace = (page: Page, id: string) =>
  page.evaluate((section) => {
    const heading = document.getElementById(section + "-title");
    const header = document.querySelector(".kb-site-header");
    if (!heading || !header) throw new Error("no heading for #" + section + ", or no site header");
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
    const margin = parseFloat(getComputedStyle(heading).scrollMarginTop);
    return {
      top: Math.round(heading.getBoundingClientRect().top),
      landing: Math.round(padding + margin),
      headerBottom: Math.round(header.getBoundingClientRect().bottom),
    };
  }, id);

/** The heading of section `id` sits where an anchor jump puts it, below the header, and holds focus. */
async function expectOnHeading(page: Page, id: string): Promise<void> {
  await expect
    .poll(async () => {
      const { top, landing } = await headingPlace(page, id);
      return Math.abs(top - landing);
    })
    .toBeLessThanOrEqual(1);
  const { top, headerBottom } = await headingPlace(page, id);
  expect(top, "the heading sits below the sticky header").toBeGreaterThan(headerBottom);
  await expect(page.locator("#" + id + "-title")).toBeFocused();
}

test.describe("a section link opened in Messenger on an Android phone", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Android's in-app browsers are Chromium WebViews");
  test.use(MESSENGER_ANDROID);

  test("lands on the section's heading, below the header", async ({ page }) => {
    await page.goto("/about#career");
    await waitForApp(page);
    await expectOnHeading(page, "career");
  });

  for (const tail of ["?fbclid=IwAR0abc", "&fbclid=IwAR0abc"]) {
    test(`still lands when an app wrote its tracking tag after the hash (#career${tail})`, async ({ page }) => {
      await page.goto("/about?ref=section-link#career" + tail);
      await waitForApp(page);
      await expectOnHeading(page, "career");
      const { search, hash } = new URL(page.url());
      expect(search + hash).toBe("?ref=section-link#career");
    });
  }
});
