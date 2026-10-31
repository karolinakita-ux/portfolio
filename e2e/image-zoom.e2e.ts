/**
 * Click or tap to zoom in the image viewer (features/image-viewer, useZoom) in real browsers:
 * - the cursor says what a click does: zoom in on the fitted image, zoom out once zoomed, grabbing while a drag pans;
 * - a click zooms to 200% with the clicked point kept under the pointer, another goes back to fit, and the toolbar's
 *   readout and buttons and the keys stay in step;
 * - a wide screenshot still shorter than the pane at 200% stays centred in it, as when fitted, so a click on its
 *   middle line keeps the clicked point under the pointer there too;
 * - a drag that pans the zoomed image is not a click;
 * - zoom is instant, with or without reduced motion;
 * - on a touch screen a tap zooms the same way, and at 320px the toolbar holds Previous, the zoom controls and Next
 *   in one row;
 * - on an Android phone in Messenger's in-app browser (tag @android: the "android" project, real flings and pinches):
 *   the zoom buttons with 40px touch targets, tap to zoom at once, and a swipe, a pan, a fling and a pinch that do not
 *   zoom the image.
 */
import { expect, test, type Browser, type Locator, type Page } from "@playwright/test";

import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { nextFrames, openView } from "./helpers/page.utils.ts";
import { straightPath, touchPath, touchPinch } from "./helpers/touch.utils.ts";

const CASE = VIEW_PATHS[VIEW.caseAutomotive];
/** A case with a wide screenshot (about 3.4 : 1): at 200% it is still shorter than the pane on a tall window. */
const WIDE_CASE = VIEW_PATHS[VIEW.caseProjectPlanning];
const WIDE_SHOT = /^View full size: Cost distribution/;
const ZOOM_LEVEL = /^(Fit|\d+%)$/;

/**
 * Waits until the viewer's image shows (decoded) and stands still: the panel and the image fade in with an 8px rise,
 * and a new image slides in from the side, which would move the points the tests measure.
 */
async function settle(page: Page, dialog: Locator) {
  await expect(dialog.locator("img")).not.toHaveClass(/opacity-0/);
  await dialog.evaluate(async (element) => {
    const running = [element, ...element.querySelectorAll("*")].flatMap((node) => node.getAnimations());
    await Promise.allSettled(running.map((animation) => animation.finished));
  });
  await nextFrames(page, 2);
}

/** Opens a screenshot (the case's first by default) in the viewer, once it shows and stands still (settle). */
async function openViewer(page: Page, name = /^View full size/) {
  await page.getByRole("button", { name }).first().click();
  const dialog = page.getByRole("dialog");
  await settle(page, dialog);
  const zoom = dialog.getByRole("group", { name: "Zoom" });
  return {
    dialog,
    image: dialog.locator("img"),
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

/** How far the point at fractions (fx, fy) of the image is from `point` now, in px across and down. */
async function driftFrom(image: Locator, point: { x: number; y: number }, fx: number, fy: number) {
  const now = await pointOn(image, fx, fy);
  return { x: Math.abs(now.x - point.x), y: Math.abs(now.y - point.y) };
}

test("a tap zooms in where it lands and another goes back to fit, as a click does", async ({ browser }) => {
  const page = await touchPage(browser, 1024, 768); // a tablet
  const { dialog, image, readout, zoomIn, zoomOut } = await openViewer(page);
  // On the middle line down: a wide screenshot shorter than the pane stays centred that way.
  const point = await pointOn(image, 0.25, 0.5);
  await page.touchscreen.tap(point.x, point.y);
  await expect(readout).toHaveText("200%");
  await expect(dialog.getByRole("region", { name: "Zoomed image, scroll to pan" })).toBeFocused();
  const drift = await driftFrom(image, point, 0.25, 0.5);
  expect(drift.x).toBeLessThanOrEqual(2);
  expect(drift.y).toBeLessThanOrEqual(2);

  await page.touchscreen.tap(point.x, point.y);
  await expect(readout).toHaveText("Fit");
  await expect(zoomIn).toBeFocused();

  await zoomIn.tap();
  await expect(readout).toHaveText("150%");
  await zoomOut.tap();
  await expect(readout).toHaveText("Fit");
  await page.context().close();
});

test("at 320px the toolbar holds Previous, the zoom controls and Next in one row, and they work", async ({
  browser,
}) => {
  const page = await touchPage(browser, 320, 640);
  const { dialog, image, readout, zoomIn, zoomOut } = await openViewer(page);
  await expect(dialog.getByText(/^1 \/ \d+$/)).toBeVisible(); // the counter above the image
  const row = [dialog.getByRole("button", { name: "Previous image" }), zoomOut, readout, zoomIn];
  row.push(dialog.getByRole("button", { name: "Next image" }));
  const boxes = [];
  for (const control of row) {
    await expect(control).toBeVisible();
    const box = await control.boundingBox();
    if (!box) throw new Error("a control has no box");
    boxes.push(box);
  }
  const panel = await dialog.getByRole("figure").boundingBox();
  if (!panel) throw new Error("the panel has no box");
  const middle = (box: { y: number; height: number }) => box.y + box.height / 2;
  for (const [i, box] of boxes.entries()) {
    expect(box.x, "inside the panel").toBeGreaterThanOrEqual(panel.x);
    expect(box.x + box.width, "inside the panel").toBeLessThanOrEqual(panel.x + panel.width);
    expect(Math.abs(middle(box) - middle(boxes[0] ?? box)), "on one row").toBeLessThanOrEqual(1);
    const next = boxes[i + 1];
    if (next) expect(box.x + box.width, "no overlap").toBeLessThanOrEqual(next.x);
  }
  expect(await dialog.evaluate((element) => element.scrollWidth - element.clientWidth), "no sideways scroll").toBe(0);

  await zoomIn.tap();
  await expect(readout).toHaveText("150%");
  const point = await pointOn(image, 0.5, 0.5);
  await page.touchscreen.tap(point.x, point.y); // from any zoom level back to fit
  await expect(readout).toHaveText("Fit");
  await page.touchscreen.tap(point.x, point.y);
  await expect(readout).toHaveText("200%");
  await page.context().close();
});

test.describe("on an Android phone in Messenger", { tag: "@android" }, () => {
  test.beforeEach(async ({ page }) => {
    await openView(page, CASE);
  });

  test("the zoom buttons show beside Previous and Next, each with a 40px touch target", async ({ page }) => {
    const { dialog, readout, zoomIn, zoomOut } = await openViewer(page);
    expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
    // The swipe hint has no room beside the zoom controls on a phone held upright; the buttons say it all.
    await expect(dialog.getByText("Swipe to browse")).toBeHidden();
    const names = ["Close image viewer", "Previous image", "Zoom out", "Zoom in", "Next image"];
    for (const name of names) {
      const button = dialog.getByRole("button", { name });
      await expect(button).toBeVisible();
      // 19px from the middle each way, outside the 32px button it draws, still reaches it.
      const reached = await button.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;
        const spots = [
          [x - 19, y],
          [x + 19, y],
          [x, y - 19],
          [x, y + 19],
        ] as const;
        return {
          width: box.width,
          spots: spots.map(([px, py]) => element.contains(document.elementFromPoint(px, py))),
        };
      });
      expect(reached.width, name).toBeLessThan(38);
      expect(reached.spots, name).toEqual([true, true, true, true]);
    }

    await zoomIn.tap();
    await expect(readout).toHaveText("150%");
    await zoomIn.tap();
    await expect(readout).toHaveText("200%");
    await zoomOut.tap();
    await expect(readout).toHaveText("150%");
  });

  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`a tap zooms in at once where it lands, and another goes back to fit (${reducedMotion} motion)`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion });
      const { image, readout, zoomIn } = await openViewer(page);
      const fitted = (await image.boundingBox())?.width ?? 0;
      const point = await pointOn(image, 0.25, 0.5);
      await page.touchscreen.tap(point.x, point.y);
      await expect(readout).toHaveText("200%");
      // The first frame after the tap has the final size, with the tapped point still under the finger.
      expect((await image.boundingBox())?.width).toBeCloseTo(fitted * 2, 0);
      expect(await image.evaluate((element) => element.getAnimations().length)).toBe(0);
      const drift = await driftFrom(image, point, 0.25, 0.5);
      expect(drift.x).toBeLessThanOrEqual(2);
      expect(drift.y).toBeLessThanOrEqual(2);

      await page.touchscreen.tap(point.x, point.y);
      await expect(readout).toHaveText("Fit");
      await expect(zoomIn).toBeFocused();
    });
  }

  test("a swipe browses, a pan and a fling move the zoomed image, a pinch zooms the page: none zooms the image", async ({
    page,
  }) => {
    const { dialog, image, pane, readout } = await openViewer(page);
    const counter = dialog.getByText(/^\d+ \/ \d+$/);
    await expect(counter).toHaveText(/^1 \//);

    // A swipe to the left on the fitted image, lifted while moving: the next screenshot, still fitted.
    const start = await pointOn(image, 0.5, 0.5);
    await touchPath(page, straightPath({ x: start.x + 120, y: start.y }, { x: start.x - 120, y: start.y }));
    await expect(counter).toHaveText(/^2 \//);
    await settle(page, dialog);
    await page.waitForTimeout(300);
    await expect(readout).toHaveText("Fit");

    // Zoomed with a tap, a finger pans the image; held still before it lifts, so nothing flings on.
    const centre = await pointOn(image, 0.5, 0.5);
    await page.touchscreen.tap(centre.x, centre.y);
    await expect(readout).toHaveText("200%");
    const scrolled = () => pane.evaluate((element) => element.scrollLeft);
    const before = await scrolled();
    const left = { x: centre.x - 80, y: centre.y };
    const right = { x: centre.x + 80, y: centre.y };
    await touchPath(page, straightPath(right, left, 12), { stepMs: 16, holdMs: 200 });
    const panned = await scrolled();
    expect(panned - before).toBeGreaterThan(100);
    await expect(readout).toHaveText("200%");
    await expect(counter).toHaveText(/^2 \//); // zoomed, a swipe pans instead of browsing

    // A quick swipe that lifts while moving: the image flings on, and a tap while it does stops it without zooming out.
    await pane.evaluate((element) => {
      const scrolls: number[] = [];
      Object.assign(window, { __kbPaneScrolls: scrolls });
      element.addEventListener("scroll", () => scrolls.push(performance.now()));
    });
    const now = () => page.evaluate(() => performance.now());
    await touchPath(page, straightPath(left, right));
    const lifted = await now();
    await page.touchscreen.tap(centre.x, centre.y);
    const tapped = await now();
    await page.waitForTimeout(400);
    const scrolls = await page.evaluate(() => (window as unknown as { __kbPaneScrolls: number[] }).__kbPaneScrolls);
    expect(
      scrolls.some((at) => at > lifted && at < tapped),
      "still flinging when the tap lands",
    ).toBe(true);
    expect(
      scrolls.filter((at) => at > tapped + 50),
      "the tap stopped the fling",
    ).toEqual([]);
    expect(await scrolled()).toBeLessThan(panned - 100);
    await expect(readout).toHaveText("200%");

    // A tap once it has stopped goes back to fit; a pinch then zooms the page, not the image.
    await page.touchscreen.tap(centre.x, centre.y);
    await expect(readout).toHaveText("Fit");
    await touchPinch(page, centre, 60, 240);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBeGreaterThan(1.2);
    await expect(readout).toHaveText("Fit");
    await expect(dialog.locator(".kb-lightbox-image-zoomed")).toHaveCount(0);
  });
});
