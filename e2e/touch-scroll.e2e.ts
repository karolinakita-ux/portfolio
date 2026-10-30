/**
 * Scrolling a long case study by touch on an Android phone in Messenger's in-app browser (tag @android: the "android"
 * project, whose Chromium flings after a swipe). Once a fling has stopped, the page stays where it stopped.
 * Up to 5.14.16 the case screenshots had no width or height in the HTML: each was 0px tall until its file arrived,
 * and the case gallery preloads them all, so the page grew by thousands of px while the visitor read (Smart Ticket:
 * 16,213 to 23,014px on a phone), and the browser moved it after a fling had stopped, or against it.
 * - Every image holds its height in the first HTML: the page is as tall before any image has loaded as after.
 * - Images that arrive after a fling has stopped do not move the page.
 * Production build: the dev server sends an empty page, and the app builds it with the sizes too.
 */
import { expect, test, type Page } from "@playwright/test";

import { waitForApp } from "./helpers/page.utils.ts";
import { settledScrollY, touchFling } from "./helpers/touch.utils.ts";

const CASE = "/work/smart-ticket";

/** Each image in the page's content: where it sits in the page and how tall it is. */
const imageBoxes = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("main img")].map((image) => {
      const box = image.getBoundingClientRect();
      return {
        src: image.getAttribute("src"),
        top: Math.round(box.top + window.scrollY),
        height: Math.round(box.height),
      };
    }),
  );

const pageHeight = (page: Page) => page.evaluate(() => document.documentElement.scrollHeight);

test.describe("scrolling a case study by touch", { tag: "@android" }, () => {
  test("every image holds its height before it loads: the page does not grow as the screenshots arrive", async ({
    page,
  }) => {
    let release: () => void = () => undefined;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/assets/**", async (route) => {
      await held;
      await route.fallback();
    });
    await page.goto(CASE, { waitUntil: "domcontentloaded" }); // the load event waits for the held images
    await waitForApp(page);
    const before = await imageBoxes(page);
    const heightBefore = await pageHeight(page);
    expect(before.length).toBeGreaterThan(20);
    expect(
      before.filter((image) => image.height === 0),
      "images with no height before they load",
    ).toEqual([]);

    release();
    // Down the whole page, so every lazy image loads, then wait for all of them.
    for (let y = 0; y < (await pageHeight(page)); y += 600) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(30);
    }
    await page.waitForFunction(() =>
      [...document.querySelectorAll<HTMLImageElement>("main img")].every((image) => image.complete),
    );
    expect(await imageBoxes(page)).toEqual(before);
    expect(await pageHeight(page)).toBe(heightBefore);
  });

  test("images that arrive after a fling has stopped do not move the page", async ({ page }) => {
    // Each image arrives about a second late: after the fling that brought it into view has stopped.
    await page.route("**/assets/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fallback();
    });
    await page.goto(CASE + "#ticket-outcomes");
    await waitForApp(page);
    for (let fling = 0; fling < 6; fling++) {
      await touchFling(page, 300); // the finger moves down: the page flings back up the case
      const stopped = await settledScrollY(page);
      await page.waitForTimeout(1500);
      expect(Math.abs((await settledScrollY(page)) - stopped), `after fling ${fling + 1}`).toBeLessThanOrEqual(1);
    }
  });
});
