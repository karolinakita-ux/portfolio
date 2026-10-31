/**
 * Click to zoom in the image viewer (features/image-viewer, useZoom) in real browsers:
 * - the cursor says what a click does: zoom in on the fitted image, zoom out once zoomed, grabbing while a drag pans;
 * - a click zooms to 200% with the clicked point kept under the pointer, another goes back to fit, and the toolbar's
 *   readout and buttons and the keys stay in step;
 * - a wide screenshot still shorter than the pane at 200% stays centred in it, as when fitted, so a click on its
 *   middle line keeps the clicked point under the pointer there too;
 * - a drag that pans the zoomed image is not a click;
 * - zoom is instant, with or without reduced motion;
 * - a tap on a touch screen leaves the zoom alone (tablet width, where the zoom buttons show).
 */
import { expect, test, type Browser, type Locator, type Page } from "@playwright/test";

import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { nextFrames, openView } from "./helpers/page.utils.ts";

const CASE = VIEW_PATHS[VIEW.caseAutomotive];
/** A case with a wide screenshot (about 3.4 : 1): at 200% it is still shorter than the pane on a tall window. */
const WIDE_CASE = VIEW_PATHS[VIEW.caseProjectPlanning];
const WIDE_SHOT = /^View full size: Cost distribution/;
const ZOOM_LEVEL = /^(Fit|\d+%)$/;

/**
 * Opens a screenshot (the case's first by default) in the viewer and waits until the image shows (decoded) and stands
 * still: the panel and the image fade in with an 8px rise, which would move the points the tests measure.
 */
async function openViewer(page: Page, name = /^View full size/) {
  await page.getByRole("button", { name }).first().click();
  const dialog = page.getByRole("dialog");
  const image = dialog.locator("img");
  await expect(image).not.toHaveClass(/opacity-0/);
  await dialog.evaluate(async (element) => {
    const running = [element, ...element.querySelectorAll("*")].flatMap((node) => node.getAnimations());
    await Promise.allSettled(running.map((animation) => animation.finished));
  });
  await nextFrames(page, 2);
  const zoom = dialog.getByRole("group", { name: "Zoom" });
  return {
    dialog,
    image,
    pane: dialog.locator(".kb-lightbox-pane"),
    readout: zoom.getByText(ZOOM_LEVEL),
    zoomIn: zoom.getByRole("button", { name: "Zoom in" }),
    zoomOut: zoom.getByRole("button", { name: "Zoom out" }),
  };
}

/** The point at fractions (fx, fy) of the image, on the screen. */
async function pointOn(image: Locator, fx: number, fy: number) {
  const box = await image.boundingBox();
  if (!box) throw new Error("the image has no box");
  return { x: box.x + box.width * fx, y: box.y + box.height * fy };
}

const cursorOf = (locator: Locator) => locator.evaluate((element) => getComputedStyle(element).cursor);

/** Where the image sits in its pane: the gaps to the pane's inner edges (inside its border and scrollbars) and its scroll. */
const placementOf = (image: Locator) =>
  image.evaluate((element) => {
    const pane = element.parentElement;
    if (!pane) throw new Error("no pane");
    const box = element.getBoundingClientRect();
    const frame = pane.getBoundingClientRect();
    const left = frame.left + pane.clientLeft;
    const top = frame.top + pane.clientTop;
    return {
      height: box.height,
      paneHeight: pane.clientHeight,
      gaps: {
        left: box.left - left,
        right: left + pane.clientWidth - box.right,
        top: box.top - top,
        bottom: top + pane.clientHeight - box.bottom,
      },
      scrolled: { x: pane.scrollLeft, y: pane.scrollTop },
      room: { x: pane.scrollWidth - pane.clientWidth, y: pane.scrollHeight - pane.clientHeight },
    };
  });

test.describe("with a mouse", () => {
  test.beforeEach(async ({ page }) => {
    await openView(page, CASE);
  });

  test("a click zooms in at the clicked point, another goes back to fit, and the cursor says which", async ({
    page,
  }) => {
    const { dialog, image, pane, readout, zoomIn, zoomOut } = await openViewer(page);
    expect(await cursorOf(image)).toBe("zoom-in");
    await expect(readout).toHaveText("Fit");

    // Off the middle, so keeping the middle (what the buttons do) would not pass.
    const point = await pointOn(image, 0.25, 0.3);
    await page.mouse.click(point.x, point.y);
    await expect(readout).toHaveText("200%");
    await expect(zoomOut).toHaveAttribute("aria-disabled", "false");
    await expect(dialog.getByRole("region", { name: "Zoomed image, scroll to pan" })).toBeFocused();
    expect(await cursorOf(image)).toBe("zoom-out");

    // The same point of the image is under the pointer, and the pane scrolled to get it there (not at an edge).
    const placed = await image.evaluate(
      (element, { fx, fy }) => {
        const box = element.getBoundingClientRect();
        const pane = element.parentElement;
        if (!pane) throw new Error("no pane");
        return {
          x: box.left + box.width * fx,
          y: box.top + box.height * fy,
          scrolled: [pane.scrollLeft, pane.scrollTop],
          room: [pane.scrollWidth - pane.clientWidth, pane.scrollHeight - pane.clientHeight],
        };
      },
      { fx: 0.25, fy: 0.3 },
    );
    expect(Math.abs(placed.x - point.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(placed.y - point.y)).toBeLessThanOrEqual(2);
    for (const [i, offset] of placed.scrolled.entries()) {
      expect(offset).toBeGreaterThan(0);
      expect(offset).toBeLessThan(placed.room[i] ?? 0);
    }
    // Focus moved for the keys, without a focus ring: the visitor used the mouse.
    expect(await pane.evaluate((element) => element.matches(":focus-visible"))).toBe(false);

    // The keys work after a click and stay in step with it.
    await page.keyboard.press("-");
    await expect(readout).toHaveText("150%");
    await page.keyboard.press("+");
    await expect(readout).toHaveText("200%");

    await page.mouse.click(point.x, point.y);
    await expect(readout).toHaveText("Fit");
    await expect(zoomOut).toHaveAttribute("aria-disabled", "true");
    await expect(zoomIn).toBeFocused();
    expect(await cursorOf(image)).toBe("zoom-in");
  });

  test("a drag pans the zoomed image and is not a click; the cursor grabs while it does", async ({ page }) => {
    const { image, pane, readout } = await openViewer(page);
    const point = await pointOn(image, 0.5, 0.5);
    await page.mouse.click(point.x, point.y);
    await expect(readout).toHaveText("200%");
    const before = await pane.evaluate((element) => [element.scrollLeft, element.scrollTop]);

    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(point.x - 120, point.y - 80, { steps: 6 });
    expect(await cursorOf(image)).toBe("grabbing");
    await page.mouse.up();
    await expect(readout).toHaveText("200%");
    const after = await pane.evaluate((element) => [element.scrollLeft, element.scrollTop]);
    expect((after[0] ?? 0) - (before[0] ?? 0)).toBeGreaterThan(100);
    expect((after[1] ?? 0) - (before[1] ?? 0)).toBeGreaterThan(60);
    expect(await cursorOf(image)).toBe("zoom-out");

    // A drag that comes back to where it started is still a drag.
    await page.mouse.down();
    await page.mouse.move(point.x - 60, point.y - 80, { steps: 4 });
    await page.mouse.move(point.x - 120, point.y - 80, { steps: 4 });
    await page.mouse.up();
    await expect(readout).toHaveText("200%");
  });

  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`zoom is instant (${reducedMotion} motion)`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion });
      const { image, readout } = await openViewer(page);
      const fitted = (await image.boundingBox())?.width ?? 0;
      const point = await pointOn(image, 0.5, 0.5);
      await page.mouse.click(point.x, point.y);
      await expect(readout).toHaveText("200%");
      // The first frame after the click has the final size, and nothing runs on the image.
      const first = (await image.boundingBox())?.width ?? 0;
      await page.waitForTimeout(400);
      expect(first).toBeCloseTo(fitted * 2, 0);
      expect((await image.boundingBox())?.width).toBeCloseTo(first, 0);
      expect(await image.evaluate((element) => element.getAnimations().length)).toBe(0);
    });
  }
});

test("a wide screenshot shorter than the pane at 200% stays centred, with the clicked point under the pointer", async ({
  page,
}) => {
  // A tall desktop window: the pane is about 790px high, the zoomed screenshot about 690px.
  await page.setViewportSize({ width: 1280, height: 1000 });
  await openView(page, WIDE_CASE);
  const { image, pane, readout } = await openViewer(page, WIDE_SHOT);
  const fitted = await placementOf(image);
  expect(Math.abs(fitted.gaps.top - fitted.gaps.bottom)).toBeLessThanOrEqual(1);

  // Off the middle across (keeping the middle, as the buttons do, would not pass), on the middle line down.
  const point = await pointOn(image, 0.25, 0.5);
  await page.mouse.click(point.x, point.y);
  await expect(readout).toHaveText("200%");
  const zoomed = await placementOf(image);
  // What this test is about: wider than the pane, still shorter than it.
  expect(zoomed.height).toBeLessThan(zoomed.paneHeight);
  expect(zoomed.room.x).toBeGreaterThan(0);
  // Centred down the pane as when fitted, nothing to scroll that way, and scrolled across to the clicked point.
  expect(Math.abs(zoomed.gaps.top - zoomed.gaps.bottom)).toBeLessThanOrEqual(1);
  expect(zoomed.room.y).toBe(0);
  expect(zoomed.scrolled.x).toBeGreaterThan(0);
  const placed = await pointOn(image, 0.25, 0.5);
  expect(Math.abs(placed.x - point.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(placed.y - point.y)).toBeLessThanOrEqual(2);

  // Larger than the pane both ways (300%), the image still scrolls to each of its edges.
  await page.keyboard.press("+");
  await expect(readout).toHaveText("300%");
  expect((await placementOf(image)).room.y).toBeGreaterThan(0);
  await pane.evaluate((element) => element.scrollTo(0, 0));
  const start = (await placementOf(image)).gaps;
  expect(Math.abs(start.left)).toBeLessThanOrEqual(1);
  expect(Math.abs(start.top)).toBeLessThanOrEqual(1);
  await pane.evaluate((element) => element.scrollTo(element.scrollWidth, element.scrollHeight));
  const end = (await placementOf(image)).gaps;
  expect(Math.abs(end.right)).toBeLessThanOrEqual(1);
  expect(Math.abs(end.bottom)).toBeLessThanOrEqual(1);
});

/** A touch screen (no mouse) of the given width. */
async function touchPage(browser: Browser, width: number, height: number) {
  const context = await browser.newContext({ hasTouch: true, viewport: { width, height } });
  const page = await context.newPage();
  await openView(page, CASE);
  return page;
}

test("a tap on a touch screen leaves the zoom alone; the zoom buttons still work there", async ({ browser }) => {
  const page = await touchPage(browser, 1024, 768); // a tablet: md and up, so the zoom buttons show
  const { dialog, image, readout, zoomIn } = await openViewer(page);
  await image.tap();
  await expect(readout).toHaveText("Fit");
  await expect(dialog.locator(".kb-lightbox-image-zoomed")).toHaveCount(0);

  await zoomIn.tap();
  await expect(readout).toHaveText("150%");
  await image.tap();
  await page.waitForTimeout(300);
  await expect(readout).toHaveText("150%");
  await page.context().close();
});

test("a tap on a phone leaves the image fitted", async ({ browser }) => {
  const page = await touchPage(browser, 390, 844);
  const { dialog, image } = await openViewer(page);
  await image.tap();
  await page.waitForTimeout(300);
  await expect(dialog.locator(".kb-lightbox-image-zoomed")).toHaveCount(0);
  await expect(dialog.getByRole("region", { name: "Zoomed image, scroll to pan" })).toHaveCount(0);
  await page.context().close();
});
