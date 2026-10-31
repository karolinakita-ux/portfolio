/**
 * Closing the image viewer lands on the screenshot it shows (features/image-viewer landOnPage, features/case-studies
 * imagePlace), in real browsers, at desktop and phone widths:
 * - opened on a case's first screenshot and moved on twice, the close button, Escape and Go to Description each land
 *   on the third: its row just below the sticky header with its description in view, focus on its button;
 * - opening and closing without browsing moves nothing;
 * - with reduced motion the page is there at once;
 * - Go to Description sits in the title row: beside Close from md, on a row of its own under it below md (Figma);
 * - on an Android phone in Messenger's in-app browser (tag @android): a swipe to the next screenshot, then a tap on
 *   Go to Description shows that screenshot's row.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { nextFrames, openView } from "./helpers/page.utils.ts";
import { straightPath, touchPath } from "./helpers/touch.utils.ts";

/** Automotive: one screenshot per row, each row with its title and description (ShowcaseRow). */
const CASE = VIEW_PATHS[VIEW.caseAutomotive];
const SHOT = /^View full size/;
const PHONE = { width: 390, height: 844 };

/** Waits until the page stops scrolling (a smooth scroll has ended): the scroll position still for 10 frames. */
const scrollSettled = (page: Page): Promise<number> =>
  page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const deadline = performance.now() + 4000;
    let last = window.scrollY;
    let still = 0;
    while (still < 10 && performance.now() < deadline) {
      await frame();
      if (Math.abs(window.scrollY - last) < 0.5) still++;
      else [still, last] = [0, window.scrollY];
    }
    return window.scrollY;
  });

/** Opens the screenshot and waits until the viewer shows it and stands still (the panel fades in with an 8px rise). */
async function openViewer(page: Page, shot: Locator) {
  await shot.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).not.toHaveClass(/opacity-0/);
  await dialog.evaluate(async (element) => {
    const running = [element, ...element.querySelectorAll("*")].flatMap((node) => node.getAnimations());
    await Promise.allSettled(running.map((animation) => animation.finished));
  });
  return dialog;
}

/** Where a screenshot's row sits in the window, with the space the sticky header takes (the page's scroll padding). */
const placeOf = (shot: Locator) =>
  shot.evaluate((button) => {
    const row = button.closest("article");
    const heading = row?.querySelector("h3");
    const description = row?.querySelector("p");
    if (!row || !heading || !description) throw new Error("the screenshot has no row with a title and a description");
    const header = document.querySelector("header")?.getBoundingClientRect();
    return {
      clear: parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
      headerBottom: header?.bottom ?? 0,
      window: window.innerHeight,
      row: row.getBoundingClientRect().top,
      heading: heading.getBoundingClientRect().top,
      description: description.getBoundingClientRect(),
      shot: button.getBoundingClientRect(),
    };
  });

/** The row starts just below the header, its title and the start of its description show, and so does the screenshot. */
async function expectLandedOn(page: Page, shot: Locator) {
  await expect(shot).toBeFocused();
  await scrollSettled(page);
  const place = await placeOf(shot);
  expect(Math.abs(place.row - place.clear), "the row just below the header").toBeLessThanOrEqual(2);
  expect(place.row, "below the header").toBeGreaterThanOrEqual(place.headerBottom - 1);
  expect(place.heading, "its title in view").toBeGreaterThanOrEqual(place.headerBottom - 1);
  expect(place.description.top, "its description in view").toBeLessThan(place.window - 40);
  expect(place.shot.top, "the screenshot in view").toBeLessThan(place.window);
}

const WAYS = {
  "the close button": (dialog: Locator) => dialog.getByRole("button", { name: "Close image viewer" }).click(),
  Escape: (dialog: Locator) => dialog.page().keyboard.press("Escape"),
  "Go to Description": (dialog: Locator) => dialog.getByRole("button", { name: "Go to Description" }).click(),
};

for (const [size, viewport] of [
  ["desktop", null],
  ["phone", PHONE],
] as const) {
  test.describe(`at ${size} width`, () => {
    if (viewport) test.use({ viewport });

    test.beforeEach(async ({ page }) => {
      await openView(page, CASE);
    });

    for (const [way, close] of Object.entries(WAYS)) {
      test(`${way} lands on the third screenshot after browsing to it`, async ({ page }) => {
        const shots = page.getByRole("button", { name: SHOT });
        const dialog = await openViewer(page, shots.first());
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await expect(dialog.getByText(/^3 \/ \d+$/)).toBeVisible();
        const before = await page.evaluate(() => window.scrollY);

        await close(dialog);
        await expect(dialog).toBeHidden();
        await expectLandedOn(page, shots.nth(2));
        expect(await page.evaluate(() => window.scrollY), "the page moved down to it").toBeGreaterThan(before);
      });
    }

    test("opening and closing without browsing moves nothing", async ({ page }) => {
      const first = page.getByRole("button", { name: SHOT }).first();
      await first.scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => window.scrollY);
      for (const close of [WAYS["the close button"], WAYS.Escape]) {
        const dialog = await openViewer(page, first);
        await close(dialog);
        await expect(dialog).toBeHidden();
        await expect(first).toBeFocused();
        expect(await scrollSettled(page)).toBe(before);
      }
    });

    test("with reduced motion the page is there at once", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      const shots = page.getByRole("button", { name: SHOT });
      const dialog = await openViewer(page, shots.first());
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await dialog.getByRole("button", { name: "Close image viewer" }).click();
      await expect(shots.nth(2)).toBeFocused();
      await nextFrames(page, 1);
      const landed = await page.evaluate(() => window.scrollY);
      expect(await scrollSettled(page)).toBe(landed);
      await expectLandedOn(page, shots.nth(2));
    });
  });
}

test("Go to Description sits beside Close from md, and on a row of its own under it on a phone", async ({ page }) => {
  await openView(page, CASE);
  const rowOf = async (dialog: Locator) => {
    const box = async (name: string) => {
      const found = await dialog.getByRole("button", { name }).boundingBox();
      if (!found) throw new Error(name + " has no box");
      return found;
    };
    const title = await dialog.getByRole("heading", { level: 2 }).boundingBox();
    return { close: await box("Close image viewer"), describe: await box("Go to Description"), title };
  };

  let dialog = await openViewer(page, page.getByRole("button", { name: SHOT }).first());
  const wide = await rowOf(dialog);
  // One row: Go to Description, then Close 8px to its right, Close centred against it.
  expect(wide.describe.x + wide.describe.width + 8).toBeCloseTo(wide.close.x, 0);
  expect(wide.close.y + wide.close.height / 2).toBeCloseTo(wide.describe.y + wide.describe.height / 2, 0);
  await page.keyboard.press("Escape");

  await page.setViewportSize(PHONE);
  dialog = await openViewer(page, page.getByRole("button", { name: SHOT }).first());
  const narrow = await rowOf(dialog);
  // Below Close, 4px down, its right edge lined up with Close's; the title keeps the row beside Close.
  expect(narrow.describe.y).toBeCloseTo(
    Math.max(narrow.close.y + narrow.close.height, (narrow.title?.y ?? 0) + (narrow.title?.height ?? 0)) + 4,
    0,
  );
  expect(narrow.describe.x + narrow.describe.width).toBeCloseTo(narrow.close.x + narrow.close.width, 0);
  // The panel fits the window with a one-line title: no scrolling inside the dialog.
  expect(await dialog.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(0);
});

test.describe("on an Android phone in Messenger", { tag: "@android" }, () => {
  test("a swipe to the next screenshot, then Go to Description shows that screenshot's row", async ({ page }) => {
    await openView(page, CASE);
    const shots = page.getByRole("button", { name: SHOT });
    await shots.first().tap();
    const dialog = page.getByRole("dialog");
    const image = dialog.locator("img");
    await expect(image).not.toHaveClass(/opacity-0/);
    const box = await image.boundingBox();
    if (!box) throw new Error("the image has no box");
    const y = box.y + box.height / 2;
    const x = box.x + box.width / 2;
    await touchPath(page, straightPath({ x: x + 120, y }, { x: x - 120, y }));
    await expect(dialog.getByText(/^2 \/ \d+$/)).toBeVisible();

    await dialog.getByRole("button", { name: "Go to Description" }).tap();
    await expect(dialog).toBeHidden();
    await expectLandedOn(page, shots.nth(1));
  });
});
