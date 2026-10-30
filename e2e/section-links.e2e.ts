/**
 * A link to a section (/about#career) opened from another site or app: the page opens with the section's heading
 * just below the sticky header, focused.
 * - At once: the section-link script in index.html lands it as soon as the HTML is in, before the app's script has
 *   loaded (seconds on a slow phone), and the app only moves focus there.
 * - A visitor who starts scrolling while the app loads keeps their place: neither the browser's own jump to the hash
 *   nor the app pulls them back.
 * - On an Android phone in Messenger's in-app browser (a Chromium WebView): the heading stays in place when the window
 *   grows after the app has started (the keyboard closing, a sheet pulled up: past the short-screen layout the header
 *   turns sticky), until the visitor touches the page.
 * - An app's link wrapper may write its tracking tag after the hash (#career?fbclid=...): the link still lands, and
 *   the address keeps only the section.
 * Production build: the dev server sends an empty page, so there the app lands the link itself, once.
 */
import { expect, test, type Page } from "@playwright/test";

import { ANCHOR_HELD_ATTRIBUTE } from "#app/routing/anchor.constants.ts";

import { MESSENGER_ANDROID } from "./helpers/helpers.constants.ts";
import { appRan, holdScriptFiles, waitForApp } from "./helpers/page.utils.ts";
import { settledScrollY, touchDrag } from "./helpers/touch.utils.ts";

const DEV = process.env.E2E_DEV === "1";
const NO_HTML = "the dev server sends an empty page: the app lands the link with one scroll";

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

/** The heading of section `id` sits where an anchor jump puts it, below the sticky header. */
async function expectPlaced(page: Page, id: string): Promise<void> {
  await expect
    .poll(async () => {
      const { top, landing } = await headingPlace(page, id);
      return Math.abs(top - landing);
    })
    .toBeLessThanOrEqual(1);
  const { top, headerBottom } = await headingPlace(page, id);
  expect(top, "the heading sits below the sticky header").toBeGreaterThan(headerBottom);
}

/** expectPlaced, and the heading holds focus (the app has moved it there). */
async function expectOnHeading(page: Page, id: string): Promise<void> {
  await expectPlaced(page, id);
  await expect(page.locator("#" + id + "-title")).toBeFocused();
}

/** Opens `path` with the app's script held back; resolves once the section-link script has run. */
async function openBeforeApp(page: Page, path: string): Promise<() => void> {
  const release = await holdScriptFiles(page);
  await page.goto(path, { waitUntil: "commit" });
  await page.locator(`html[${ANCHOR_HELD_ATTRIBUTE}]`).waitFor({ state: "attached" });
  return release;
}

/** Lets the held app run, and waits until it has taken over and the page has loaded. */
async function startApp(page: Page, release: () => void): Promise<void> {
  expect(await appRan(page)).toBe(false);
  release();
  await waitForApp(page);
  await page.waitForLoadState("load");
}

test.describe("a section link", () => {
  test.skip(DEV, NO_HTML);

  test("lands on the heading before the app has loaded, and the app keeps it there", async ({ page }) => {
    const release = await openBeforeApp(page, "/about#career");
    await expectPlaced(page, "career");
    await startApp(page, release);
    await expectOnHeading(page, "career");
  });

  test("a visitor who scrolls while the app loads keeps their place", async ({ page }) => {
    const release = await openBeforeApp(page, "/about#career");
    await expectPlaced(page, "career");
    const landed = await settledScrollY(page);
    await page.mouse.move(400, 400);
    await page.mouse.wheel(0, -700);
    const visitorY = await settledScrollY(page);
    expect(visitorY).toBeLessThan(landed - 300);
    await startApp(page, release);
    expect(Math.abs((await settledScrollY(page)) - visitorY)).toBeLessThanOrEqual(1);
    await expect(page.locator("#career-title")).toBeFocused();
  });

  test("a link to a section the page does not have leaves it at its top", async ({ page }) => {
    await page.goto("/about#no-such-section");
    await waitForApp(page);
    await expect(page.locator("html")).not.toHaveAttribute(ANCHOR_HELD_ATTRIBUTE);
    expect(await settledScrollY(page)).toBe(0);
  });
});

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

  test("lands before the app has loaded, and a touch scroll while it loads is kept", async ({ page }) => {
    test.skip(DEV, NO_HTML);
    const release = await openBeforeApp(page, "/work/automotive#auto-personas");
    await expectPlaced(page, "auto-personas");
    const landed = await settledScrollY(page);
    await touchDrag(page, 500); // the finger moves down: the page scrolls back up
    const visitorY = await settledScrollY(page);
    expect(visitorY).toBeLessThan(landed - 300);
    await startApp(page, release);
    expect(Math.abs((await settledScrollY(page)) - visitorY)).toBeLessThanOrEqual(1);
  });

  test("keeps the heading in place when the window grows past the short-screen layout", async ({ page }) => {
    test.skip(DEV, NO_HTML);
    // Opened with the keyboard still up: below 480px the header scrolls with the page instead of sticking.
    await page.setViewportSize({ width: 412, height: 450 });
    await page.goto("/about#career");
    await waitForApp(page);
    await expectOnHeading(page, "career");
    await page.setViewportSize({ width: 412, height: 839 });
    await expectOnHeading(page, "career");
    await page.setViewportSize({ width: 360, height: 780 });
    await expectOnHeading(page, "career");
  });

  test("lets go at the visitor's first touch: a later resize leaves the page where they scrolled", async ({ page }) => {
    test.skip(DEV, NO_HTML);
    await page.goto("/about#career");
    await waitForApp(page);
    await expectOnHeading(page, "career");
    await touchDrag(page, -400);
    const visitorY = await settledScrollY(page);
    await page.setViewportSize({ width: 412, height: 700 });
    await page.setViewportSize({ width: 412, height: 839 });
    expect(Math.abs((await settledScrollY(page)) - visitorY)).toBeLessThanOrEqual(1);
  });
});
