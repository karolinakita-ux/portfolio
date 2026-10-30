/**
 * The app adopts each prerendered page (hydrateRoot in src/main.tsx) instead of building it again:
 * - the elements the HTML brought stay (the same <main>), in Light and Dark, with no console errors: React reports
 *   a page that does not match its HTML as one, and renders it again;
 * - an old hash link (/#about, served the Work HTML) still opens its page, rendered anew;
 * - the images in the first HTML (the About portrait, the Work thumbnails) show without the app: none waits
 *   transparent for the script. On a dark page the thumbnails' Light files wait until the app shows the Dark ones.
 * Production build only: the dev server sends an empty page, with nothing to adopt.
 */
import { expect, test, type Page } from "@playwright/test";

import { VIEW, VIEW_PATHS, VIEWS } from "#shared/lib/routes/routes.constants.ts";
import { titleForView } from "#shared/lib/routes/routes.utils.ts";

import type { Theme } from "./helpers/helpers.types.ts";
import { blockScriptFiles, holdScriptFiles, prepare, waitForApp } from "./helpers/page.utils.ts";

test.skip(process.env.E2E_DEV === "1", "the dev server sends an empty page: nothing to adopt");

const THUMBNAILS = 'main img[src*="/thumbnail-"]';
const PORTRAIT = "#philosophy img";

/** Waits until the parser has added the site footer (contentinfo), the end of the page's HTML. */
const pageParsed = (page: Page) => page.getByRole("contentinfo").waitFor({ state: "attached" });

/** Console errors and uncaught exceptions from now on. */
function problems(page: Page): string[] {
  const list: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") list.push(`console error: ${message.text()}`);
  });
  page.on("pageerror", (error) => list.push(`uncaught: ${error.message}`));
  return list;
}

/**
 * Opens `path` with the app held back, tags the <main> the HTML brought, then lets the app run. True when the
 * app kept that element.
 */
async function keepsFirstHtml(page: Page, path: string, theme: Theme): Promise<boolean> {
  await prepare(page, { theme });
  const release = await holdScriptFiles(page);
  await page.goto(path, { waitUntil: "commit" });
  await pageParsed(page);
  await page.evaluate(() => {
    const main = document.querySelector("main");
    if (main) Object.assign(main, { kbFirstHtml: true });
  });
  release();
  await waitForApp(page);
  return page.evaluate(() => {
    const main = document.querySelector("main");
    return main !== null && "kbFirstHtml" in main;
  });
}

/**
 * Each image's source and computed opacity once its transitions have ended: Firefox and WebKit may style the page
 * before its stylesheet has arrived, and the opacity the stylesheet sets then transitions in.
 */
const shownImages = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll(async (images) => {
    await Promise.all(images.flatMap((img) => img.getAnimations().map((animation) => animation.finished)));
    return images.map((img) => ({ src: img.getAttribute("src") ?? "", opacity: getComputedStyle(img).opacity }));
  });

for (const view of VIEWS) {
  const path = VIEW_PATHS[view];
  test(`${path} keeps its prerendered elements when the app takes over`, async ({ page }) => {
    const seen = problems(page);
    expect(await keepsFirstHtml(page, path, "light"), "the same <main>").toBe(true);
    await expect(page).toHaveTitle(titleForView(view));
    expect(seen).toEqual([]);
  });
}

for (const view of [VIEW.work, VIEW.about] as const) {
  const path = VIEW_PATHS[view];
  test(`${path} keeps its prerendered elements on a dark page`, async ({ page }) => {
    const seen = problems(page);
    expect(await keepsFirstHtml(page, path, "dark"), "the same <main>").toBe(true);
    expect(seen).toEqual([]);
  });
}

test("an old hash link opens its page, rendered anew over the Work HTML", async ({ page }) => {
  const seen = problems(page);
  await prepare(page);
  await page.goto("/#about");
  await waitForApp(page);
  await expect(page).toHaveTitle(titleForView(VIEW.about));
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("h1")).toHaveCount(1);
  expect(seen).toEqual([]);
});

test("the portrait and the Work thumbnails show without the app", async ({ page }) => {
  await prepare(page);
  await blockScriptFiles(page);
  await page.goto(VIEW_PATHS[VIEW.about]);
  const portrait = page.locator(PORTRAIT);
  await expect.poll(() => portrait.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(portrait).toHaveCSS("opacity", "1");

  await page.goto(VIEW_PATHS[VIEW.work]);
  const thumbnails = await shownImages(page, THUMBNAILS);
  expect(thumbnails.length).toBeGreaterThan(0);
  for (const { src, opacity } of thumbnails) expect(opacity, src).toBe("1");
});

test("on a dark page the thumbnails' Light files wait for the app, which shows the Dark ones", async ({ page }) => {
  await prepare(page, { theme: "dark" });
  const release = await holdScriptFiles(page);
  await page.goto(VIEW_PATHS[VIEW.work], { waitUntil: "commit" });
  await pageParsed(page);
  const before = await shownImages(page, THUMBNAILS);
  expect(before.length).toBeGreaterThan(0);
  for (const { src, opacity } of before) {
    expect(src).toMatch(/-light\.webp$/);
    expect(opacity, src).toBe("0");
  }

  release();
  await waitForApp(page);
  for (const thumbnail of await page.locator(THUMBNAILS).all()) {
    await thumbnail.scrollIntoViewIfNeeded();
    await expect(thumbnail).toHaveAttribute("src", /-dark\.webp$/);
    await expect(thumbnail).toHaveCSS("opacity", "1");
  }
});
