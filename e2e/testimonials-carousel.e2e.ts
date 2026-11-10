/**
 * The Work page's recommendations carousel in real browsers: 2 whole cards in view on a desktop (the managers
 * first), Previous and Next move one view and keep focus, reduced motion makes the move instant, it never moves on
 * its own, a phone shows 1 card with the next one at the edge and follows a swipe, and the page never scrolls
 * sideways. Unit tests (useCarousel.test.tsx) cover the counting; jsdom has no layout or scrolling.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

import { openView } from "./helpers/page.utils.ts";
import { straightPath, touchPath } from "./helpers/touch.utils.ts";

const TITLE = "Trusted by the People I Worked With";

const section = (page: Page): Locator => page.getByRole("region", { name: TITLE });
const track = (page: Page): Locator => section(page).getByRole("list", { name: "Recommendations" });

/** The 1-based numbers of the cards wholly inside the track's visible box. */
const cardsInView = (list: Locator): Promise<number[]> =>
  list.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return Array.from(element.children).flatMap((item, index) => {
      const card = item.getBoundingClientRect();
      return card.left >= box.left - 1 && card.right <= box.right + 1 ? [index + 1] : [];
    });
  });

/** Opens the Work page and scrolls the recommendations into view. */
async function openRecommendations(page: Page): Promise<void> {
  await openView(page, "/");
  await section(page).scrollIntoViewIfNeeded();
  await track(page).scrollIntoViewIfNeeded();
}

test.describe("the recommendations carousel on a desktop", () => {
  test("shows the two managers first, 2 whole cards in view, with Previous unavailable", async ({ page }) => {
    await openRecommendations(page);
    await expect(section(page).getByText("1 - 2 of 5", { exact: true })).toBeVisible();
    expect(await cardsInView(track(page))).toEqual([1, 2]);
    await expect(track(page).getByRole("figure").nth(0)).toContainText("Stewart Wilson");
    await expect(track(page).getByRole("figure").nth(1)).toContainText("Gavin Harvey");
    await expect(page.getByRole("button", { name: "Previous recommendations" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  test("Next and Previous move one view, land on whole cards and keep focus", async ({ page }) => {
    await openRecommendations(page);
    const next = page.getByRole("button", { name: "Next recommendations" });
    const previous = page.getByRole("button", { name: "Previous recommendations" });

    // From the keyboard: Safari does not focus a button on a mouse click, so focus is checked for keys.
    await next.focus();
    await page.keyboard.press("Enter");
    await expect(section(page).getByText("3 - 4 of 5", { exact: true })).toBeVisible();
    expect(await cardsInView(track(page))).toEqual([3, 4]);
    await expect(next).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(section(page).getByText("4 - 5 of 5", { exact: true })).toBeVisible();
    expect(await cardsInView(track(page))).toEqual([4, 5]);
    await expect(next).toHaveAttribute("aria-disabled", "true");
    await expect(next).toBeFocused();
    await expect(section(page).getByText("Showing 4 to 5 of 5")).toBeAttached();

    await previous.click();
    await expect(section(page).getByText("2 - 3 of 5", { exact: true })).toBeVisible();
    expect(await cardsInView(track(page))).toEqual([2, 3]);
  });

  test("moves at once when the visitor asks for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openRecommendations(page);
    const target = await track(page).evaluate((element) => (element.children[2] as HTMLElement).offsetLeft);
    const origin = await track(page).evaluate((element) => (element.children[0] as HTMLElement).offsetLeft);
    await page.getByRole("button", { name: "Next recommendations" }).click();
    // One frame later the row is already there: no smooth scroll in between.
    const left = await track(page).evaluate(
      (element) => new Promise<number>((resolve) => requestAnimationFrame(() => resolve(element.scrollLeft))),
    );
    expect(Math.abs(left - (target - origin))).toBeLessThanOrEqual(1);
  });

  test("never moves on its own", async ({ page }) => {
    await openRecommendations(page);
    const before = await track(page).evaluate((element) => element.scrollLeft);
    await page.waitForTimeout(6000);
    expect(await track(page).evaluate((element) => element.scrollLeft)).toBe(before);
    await expect(section(page).getByText("1 - 2 of 5", { exact: true })).toBeVisible();
  });

  test("printed, it shows every card", async ({ page }) => {
    await openRecommendations(page);
    await page.emulateMedia({ media: "print" });
    expect(await cardsInView(track(page))).toEqual([1, 2, 3, 4, 5]);
    await expect(page.getByRole("button", { name: "Next recommendations" })).toBeHidden();
  });
});

test("at 320px the page never scrolls sideways, and 1 card is in view", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openRecommendations(page);
  await expect(section(page).getByText("1 of 5", { exact: true })).toBeVisible();
  expect(await cardsInView(track(page))).toEqual([1]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("a phone shows 1 card with the next at the edge, and a swipe moves to it @android", async ({ page }) => {
  await openRecommendations(page);
  await expect(section(page).getByText("1 of 5", { exact: true })).toBeVisible();
  expect(await cardsInView(track(page))).toEqual([1]);

  const box = await track(page).boundingBox();
  if (!box) throw new Error("the recommendations row has no box");
  const y = box.y + box.height / 2;
  await touchPath(page, straightPath({ x: box.x + box.width - 40, y }, { x: box.x + 40, y }), { holdMs: 150 });
  await expect(section(page).getByText("2 of 5", { exact: true })).toBeVisible();
  expect(await cardsInView(track(page))).toEqual([2]);
});
