/**
 * How the image viewer draws a screenshot (features/image-viewer), in real browsers:
 * - on a phone with three device pixels per CSS pixel, the viewer opens on the page's own file, which at fit has
 *   more pixels than the screen shows, and nothing on the image or around it scales it (no transform, filter,
 *   will-change or zoom), so a pinch-zoom redraws the image from its file instead of stretching the first picture;
 * - the viewer's own zoom (a laptop at two device pixels per CSS pixel) changes the image's width, never a transform,
 *   so each zoom level is drawn from the file too;
 * - Chromium: a pinch-zoom over the open viewer resizes the visual viewport, the event useSharpImage takes to load a
 *   screenshot's sharper copy (LightboxItem.zoomSrc), and on a 3x phone a 3x pinch needs more pixels than a 2000 px
 *   page file has.
 * The swap to a sharper copy itself is covered by LightboxProvider.test.tsx: no case has a copy yet.
 */
import { expect, test, type Browser, type Locator, type Page } from "@playwright/test";

import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { nextFrames, openView } from "./helpers/page.utils.ts";

const CASE = VIEW_PATHS[VIEW.caseAutomotive];
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true };

/** A new page in `options`' context on the case study. */
async function casePage(browser: Browser, options: Parameters<Browser["newContext"]>[0]) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  await openView(page, CASE);
  return page;
}

/** Opens the case's first screenshot and waits until the image shows (decoded) and its entry animations are done. */
async function openViewer(page: Page) {
  await page
    .getByRole("button", { name: /^View full size/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  const image = dialog.locator("img");
  await expect(image).not.toHaveClass(/opacity-0/);
  await dialog.evaluate(async (element) => {
    const running = [element, ...element.querySelectorAll("*")].flatMap((node) => node.getAnimations());
    await Promise.allSettled(running.map((animation) => animation.finished));
  });
  await nextFrames(page, 2);
  return { dialog, image };
}

/**
 * Anything on the image or the elements around it that would make the browser scale a picture it already drew
 * (and blur it) instead of drawing it again from the file at the new size.
 */
const scalingStyles = (image: Locator) =>
  image.evaluate((element) => {
    const found: string[] = [];
    for (let node: Element | null = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      const name = node.tagName.toLowerCase() + (node.className ? "." + node.className.split(" ")[0] : "");
      if (style.transform !== "none") found.push(`${name} transform: ${style.transform}`);
      if (style.filter !== "none") found.push(`${name} filter: ${style.filter}`);
      if (style.willChange !== "auto") found.push(`${name} will-change: ${style.willChange}`);
      if (!["", "1", "normal"].includes(style.zoom)) found.push(`${name} zoom: ${style.zoom}`);
    }
    if (getComputedStyle(element).imageRendering !== "auto") found.push("img image-rendering");
    return found;
  });

/** The image's file, its width on the page and the device pixels it covers across. */
const drawnSize = (image: Locator) =>
  image.evaluate((element: HTMLImageElement) => {
    const width = element.getBoundingClientRect().width;
    return {
      path: new URL(element.currentSrc).pathname,
      fileWidth: element.naturalWidth,
      width,
      devicePixels: width * window.devicePixelRatio * (window.visualViewport?.scale ?? 1),
    };
  });

test("on a 3x phone the viewer draws the page's own file at fit, with nothing that scales it", async ({ browser }) => {
  const page = await casePage(browser, PHONE);
  const { image } = await openViewer(page);
  const drawn = await drawnSize(image);
  expect(drawn.path).toMatch(/^\/assets\/cases\/automotive\/[^/]+\.webp$/);
  await expect(page.locator(`main img[src="${drawn.path}"]`)).toHaveCount(1);
  // Fitted to the phone, the 2000 px file has about two pixels for each device pixel.
  expect(drawn.fileWidth).toBeGreaterThanOrEqual(drawn.devicePixels);
  expect(await scalingStyles(image)).toEqual([]);
  await page.context().close();
});

test("the viewer's zoom changes the image's width, never a transform", async ({ browser }) => {
  const page = await casePage(browser, { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  const { dialog, image } = await openViewer(page);
  const fitted = (await drawnSize(image)).width;
  const readout = dialog.getByRole("group", { name: "Zoom" }).getByText(/^(Fit|\d+%)$/);
  for (const [key, level] of [
    ["+", 1.5],
    ["+", 2],
    ["+", 3],
  ] as const) {
    await page.keyboard.press(key);
    await expect(readout).toHaveText(`${level * 100}%`);
    expect((await drawnSize(image)).width).toBeCloseTo(fitted * level, 0);
    expect(await scalingStyles(image)).toEqual([]);
  }
  await page.context().close();
});

test("a pinch-zoom over the viewer resizes the visual viewport, and at 3x needs more pixels than the file has", async ({
  browser,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "pinch-zoom through the DevTools protocol");
  const page = await casePage(browser, { ...PHONE, isMobile: true });
  const { image } = await openViewer(page);
  const pageFileWidth = (await drawnSize(image)).fileWidth; // at fit the viewer shows the page's file
  await page.evaluate(() => {
    const scales: number[] = [];
    Object.assign(window, { __kbViewportScales: scales });
    window.visualViewport?.addEventListener("resize", () => scales.push(window.visualViewport?.scale ?? 1));
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 3 });
  await expect
    .poll(() => page.evaluate(() => (window as Window & { __kbViewportScales?: number[] }).__kbViewportScales))
    .toContain(3);
  // useSharpImage loads a screenshot's sharper copy here (needsMorePixels).
  expect((await drawnSize(image)).devicePixels).toBeGreaterThan(pageFileWidth);
  expect(await scalingStyles(image)).toEqual([]);
  await cdp.detach();
  await page.context().close();
});
