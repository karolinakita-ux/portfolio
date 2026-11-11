/**
 * The Work page's recommendations carousel in real browsers: 2 whole cards in view on a desktop (the managers
 * first) with a slice of the next one, Previous and Next move one view and keep focus, reduced motion makes the move instant, it never moves on
 * its own, a mouse drags it and it glides to a whole card on release, the edge that cuts a card off fades, a
 * phone shows 1 card with the next one at the edge and follows a swipe, and the page never scrolls sideways.
 * Unit tests (useCarousel.test.tsx, carousel.utils.test.ts) cover the counting and the fade's sizes; jsdom has
 * no layout or scrolling.
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

/** How many px of card `n` (1-based) show inside the track's visible box. */
const visibleWidth = (list: Locator, n: number): Promise<number> =>
  list.evaluate((element, index) => {
    const box = element.getBoundingClientRect();
    const card = (element.children[index] as HTMLElement).getBoundingClientRect();
    return Math.max(0, Math.min(card.right, box.right) - Math.max(card.left, box.left));
  }, n - 1);

/** Opens the Work page and scrolls the recommendations into view. */
async function openRecommendations(page: Page): Promise<void> {
  await openView(page, "/");
  await section(page).scrollIntoViewIfNeeded();
  await track(page).scrollIntoViewIfNeeded();
}

test.describe("the recommendations carousel on a desktop", () => {
  test("shows the two managers first, 2 whole cards in view and a slice of the third, with Previous unavailable", async ({
    page,
  }) => {
    await openRecommendations(page);
    await expect(section(page).getByText("1 - 2 of 5", { exact: true })).toBeVisible();
    await expect.poll(() => cardsInView(track(page))).toEqual([1, 2]);
    // The 48px slice (space-2xl) plus the track's 4px padding: the next card's edge and its quote mark.
    const slice = await visibleWidth(track(page), 3);
    expect(slice).toBeGreaterThanOrEqual(44);
    expect(slice).toBeLessThanOrEqual(56);
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
    await expect.poll(() => cardsInView(track(page))).toEqual([3, 4]);
    await expect(next).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(section(page).getByText("4 - 5 of 5", { exact: true })).toBeVisible();
    await expect.poll(() => cardsInView(track(page))).toEqual([4, 5]);
    await expect(next).toHaveAttribute("aria-disabled", "true");
    await expect(next).toBeFocused();
    await expect(section(page).getByText("Showing 4 to 5 of 5")).toBeAttached();

    await previous.click();
    await expect(section(page).getByText("2 - 3 of 5", { exact: true })).toBeVisible();
    await expect.poll(() => cardsInView(track(page))).toEqual([2, 3]);
  });

  test("the position changes as soon as Next is pressed, not when the row stops", async ({ page }) => {
    await openRecommendations(page);
    // Press Next and read the page one frame later, while the smooth scroll has only just begun.
    const seen = await section(page).evaluate(async (element) => {
      const list = element.querySelector("ul");
      const next = element.querySelector<HTMLButtonElement>('button[aria-label="Next recommendations"]');
      if (!list || !next) throw new Error("the carousel has no row or no Next button");
      const target = (list.children[2] as HTMLElement).offsetLeft - (list.children[0] as HTMLElement).offsetLeft;
      next.click();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const position = Array.from(element.querySelectorAll("p")).find((p) => p.textContent.includes(" of 5"));
      return { text: position?.textContent ?? "", left: list.scrollLeft, target };
    });
    expect(seen.text).toContain("3 - 4 of 5");
    expect(seen.left).toBeLessThan(seen.target - 50);
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

  test("a mouse drag moves the row with the pointer, and on release it glides to a whole card", async ({ page }) => {
    await openRecommendations(page);
    const list = track(page);
    const box = await list.boundingBox();
    if (!box) throw new Error("the recommendations row has no box");
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 100, y, { steps: 10 });
    // While the button is down the row follows the pointer 1:1, without snapping.
    expect(Math.abs((await list.evaluate((element) => element.scrollLeft)) - 100)).toBeLessThanOrEqual(2);
    await expect(list).toHaveAttribute("data-drag", "active");
    await page.mouse.move(x - 200, y, { steps: 10 });
    await page.mouse.up();
    // 200px is less than half a card, but more than a nudge: it moves on by one card.
    await expect(section(page).getByText("2 - 3 of 5", { exact: true })).toBeVisible();
    await expect.poll(() => cardsInView(list)).toEqual([2, 3]);
    await expect(list).toHaveAttribute("data-drag", "idle");
    expect(await page.evaluate(() => getSelection()?.toString() ?? "")).toBe("");
  });

  test("a drag that ends on a link does not open it", async ({ page, context }) => {
    await openRecommendations(page);
    const link = track(page).getByRole("link").first();
    const box = await link.boundingBox();
    if (!box) throw new Error("the first card's link has no box");
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 150, y, { steps: 10 });
    await page.mouse.up();
    await expect(section(page).getByText("2 - 3 of 5", { exact: true })).toBeVisible();
    expect(context.pages()).toHaveLength(1);
  });

  test("a drag lands at once when the visitor asks for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openRecommendations(page);
    const list = track(page);
    const target = await list.evaluate(
      (element) => (element.children[1] as HTMLElement).offsetLeft - (element.children[0] as HTMLElement).offsetLeft,
    );
    const box = await list.boundingBox();
    if (!box) throw new Error("the recommendations row has no box");
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 120, y, { steps: 6 });
    await page.mouse.up();
    const left = await list.evaluate(
      (element) => new Promise<number>((resolve) => requestAnimationFrame(() => resolve(element.scrollLeft))),
    );
    expect(Math.abs(left - target)).toBeLessThanOrEqual(1);
  });

  test("each edge fades while there is more that way, and never over a keyboard focus ring", async ({ page }) => {
    await openRecommendations(page);
    const list = track(page);
    const fade = () =>
      list.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          start: parseFloat(style.getPropertyValue("--kb-fade-start")),
          end: parseFloat(style.getPropertyValue("--kb-fade-end")),
          mask: style.maskImage,
        };
      });
    // At the start only the end has more (the slice of card 3): only the end fades.
    const start = await fade();
    expect(start.mask).toContain("linear-gradient");
    expect(start.start).toBe(0);
    expect(start.end).toBeGreaterThanOrEqual(44);

    // From the keyboard, so the focus that follows counts as keyboard focus (:focus-visible) in every browser.
    const next = page.getByRole("button", { name: "Next recommendations" });
    await next.focus();
    await page.keyboard.press("Enter");
    await expect(section(page).getByText("3 - 4 of 5", { exact: true })).toBeVisible();
    // In the middle both ends have more: both fade, although the start falls on card 3's own edge.
    await expect.poll(async () => (await fade()).start).toBeGreaterThanOrEqual(24);
    await expect.poll(async () => (await fade()).end).toBeGreaterThanOrEqual(24);
    await page.keyboard.press("Enter");
    await expect(section(page).getByText("4 - 5 of 5", { exact: true })).toBeVisible();
    // At the end only the start has more (the slice of card 3): only the start fades.
    await expect.poll(async () => (await fade()).end).toBe(0);
    await expect.poll(async () => (await fade()).start).toBeGreaterThanOrEqual(44);

    // A card's link takes keyboard focus (Firefox stops on the row itself first, Safari skips links on Tab):
    // the fade lets go, so the focus ring shows in full.
    const link = list.getByRole("link").first();
    await link.focus();
    expect(await link.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    await expect.poll(async () => (await fade()).mask).toBe("none");
  });

  test("no edge fade with more contrast", async ({ page }) => {
    await page.emulateMedia({ contrast: "more" });
    await openRecommendations(page);
    const mask = await track(page).evaluate((element) => {
      const style = getComputedStyle(element);
      return style.maskImage;
    });
    expect(mask).toBe("none");
  });

  test("printed, it shows every card", async ({ page }) => {
    await openRecommendations(page);
    await page.emulateMedia({ media: "print" });
    await expect.poll(() => cardsInView(track(page))).toEqual([1, 2, 3, 4, 5]);
    await expect(page.getByRole("button", { name: "Next recommendations" })).toBeHidden();
  });
});

for (const width of [820, 1280]) {
  test(`at ${String(width)}px the line above the authors is level on every card, also where a job line wraps`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await openRecommendations(page);
    const lines = await track(page).evaluate((element) =>
      Array.from(element.querySelectorAll("figcaption")).map((caption) =>
        Math.round(caption.getBoundingClientRect().top),
      ),
    );
    expect(lines).toHaveLength(5);
    expect(new Set(lines).size).toBe(1);
  });
}

test("at 320px the page never scrolls sideways, and 1 card is in view", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openRecommendations(page);
  await expect(section(page).getByText("1 of 5", { exact: true })).toBeVisible();
  await expect.poll(() => cardsInView(track(page))).toEqual([1]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  // The edge fade is for tablet width and up.
  const mask = await track(page).evaluate((element) => {
    const style = getComputedStyle(element);
    return style.maskImage;
  });
  expect(mask).toBe("none");
});

test("a phone shows 1 card with the next at the edge, and a swipe moves to it @android", async ({ page }) => {
  await openRecommendations(page);
  await expect(section(page).getByText("1 of 5", { exact: true })).toBeVisible();
  await expect.poll(() => cardsInView(track(page))).toEqual([1]);

  const box = await track(page).boundingBox();
  if (!box) throw new Error("the recommendations row has no box");
  const y = box.y + box.height / 2;
  await touchPath(page, straightPath({ x: box.x + box.width - 40, y }, { x: box.x + 40, y }), { holdMs: 150 });
  await expect(section(page).getByText("2 of 5", { exact: true })).toBeVisible();
  await expect.poll(() => cardsInView(track(page))).toEqual([2]);
});
