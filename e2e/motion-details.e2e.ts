/**
 * Small motions in real browsers (docs/motion.md). The contract:
 * - A new view starts at its top at once and fades in: the logo from a page scrolled far down never
 *   sweeps the new view up with a smooth scroll. Within the view the logo still glides to the top.
 * - The view's fade fills backwards: once it ends, the view keeps no transform (a transform would make it
 *   a stacking context and the containing block of anything fixed inside) and no animation.
 * - On hover a button's trailing arrow nudges the way it points: down and right 4px, up and right 2px
 *   each way. With reduced motion it stays put.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

import { RECOMMENDATIONS_LINK_LABEL, WORK_CASES } from "#features/work/work.content.ts";
import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { SELECTOR } from "./helpers/helpers.constants.ts";
import { nextFrames, openView } from "./helpers/page.utils.ts";

/** The header logo: "K.Kita - Karolina Kita, home page". */
const LOGO = /home page$/;
/** Where the page is before the logo is clicked: far enough down for a smooth scroll to take several frames. */
const FAR_DOWN = 1500;

interface ScrollFrame {
  path: string;
  y: number;
}

interface Recording {
  /** Where the page was when the recording started. */
  start: number;
  /** Ends the recording and returns its frames. */
  stop: () => Promise<ScrollFrame[]>;
}

/** Scrolls to y, then records the path and scroll position of every frame. */
async function recordScroll(page: Page, y: number): Promise<Recording> {
  await page.evaluate((top) => {
    window.scrollTo({ top, behavior: "instant" });
  }, y);
  await nextFrames(page, 2);
  const start = await page.evaluate(() => Math.round(window.scrollY));
  await page.evaluate(() => {
    const frames: ScrollFrame[] = [];
    let recording = true;
    const tick = () => {
      if (!recording) return;
      frames.push({ path: location.pathname, y: Math.round(window.scrollY) });
      if (frames.length < 3000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    Object.assign(window, {
      __scrollFrames: () => {
        recording = false;
        return frames;
      },
    });
  });
  const stop = () =>
    page.evaluate(() => (window as unknown as { __scrollFrames: () => ScrollFrame[] }).__scrollFrames());
  return { start, stop };
}

/** The element's computed translate as numbers ("none" → 0 0; "4px" → 4 0; "2px -2px" → 2 -2). */
async function translateOf(locator: Locator): Promise<{ x: number; y: number }> {
  const translate = await locator.evaluate((element) => getComputedStyle(element).translate);
  const [x = "0", y = "0"] = translate === "none" ? [] : translate.split(" ");
  return { x: Number.parseFloat(x), y: Number.parseFloat(y) };
}

const viewWrapper = (page: Page) => page.locator("main > div");

test.describe("motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the logo from a page scrolled far down: Work starts at its top at once, with no smooth sweep", async ({
    page,
  }) => {
    await openView(page, VIEW_PATHS[VIEW.about]);
    const { start, stop } = await recordScroll(page, FAR_DOWN);
    expect(start, "scrolled far down").toBeGreaterThan(1000);
    await page.getByRole("link", { name: LOGO }).click();
    await expect(page).toHaveURL(/\/$/);
    await nextFrames(page, 45); // longer than a smooth scroll of 1500px takes (about 700ms)
    const frames = (await stop()).filter((frame) => frame.path === VIEW_PATHS[VIEW.work]);

    expect(frames.length, "frames recorded on Work").toBeGreaterThan(10);
    expect(
      frames.filter((frame) => frame.y !== 0 && frame.y !== start),
      "frames part-way up: a smooth sweep",
    ).toEqual([]);
    expect(frames.at(-1)?.y, "at the top").toBe(0);
  });

  test("the logo on Work itself still glides to the top", async ({ page }) => {
    await openView(page, VIEW_PATHS[VIEW.work]);
    const { start, stop } = await recordScroll(page, FAR_DOWN);
    expect(start, "scrolled far down").toBeGreaterThan(1000);
    await page.getByRole("link", { name: LOGO }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBe(0);
    const frames = await stop();
    expect(frames.filter((frame) => frame.y > 0 && frame.y < start).length, "frames part-way up").toBeGreaterThan(0);
  });

  test("a new view fades in, then keeps no transform and no animation", async ({ page }) => {
    await openView(page, VIEW_PATHS[VIEW.work]);
    await page.evaluate(() => {
      const started: string[] = [];
      document.addEventListener("animationstart", (event) => {
        if (event.target instanceof Element && event.target.matches("main > div")) started.push(event.animationName);
      });
      Object.assign(window, { __viewAnimations: started });
    });
    await page.locator(SELECTOR.primaryNav).getByRole("link", { name: "About", exact: true }).click();
    await expect(page).toHaveURL(/\/about$/);

    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __viewAnimations: string[] }).__viewAnimations))
      .toEqual(["view-in"]);
    await expect
      .poll(() => viewWrapper(page).evaluate((element) => element.getAnimations().length), { timeout: 5000 })
      .toBe(0);
    expect(await viewWrapper(page).evaluate((element) => getComputedStyle(element).transform)).toBe("none");
    expect(await viewWrapper(page).evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
  });
});

/** The trailing arrows on the Work page, the way each points. */
const ARROWS = [
  { name: "Explore Case Studies", points: "down", x: 0, y: 4 },
  { name: WORK_CASES[0]?.cta ?? "View Case Study", points: "right", x: 4, y: 0 },
  { name: RECOMMENDATIONS_LINK_LABEL, points: "up and right", x: 2, y: -2 },
] as const;

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test.describe(`arrow nudges (${reducedMotion === "reduce" ? "reduced motion" : "motion allowed"})`, () => {
    test.use({ reducedMotion });

    for (const { name, points, x, y } of ARROWS) {
      const moves = reducedMotion === "no-preference";
      test(`"${name}": its ${points} arrow ${moves ? `moves ${String(x)}, ${String(y)}px on hover` : "stays put"}`, async ({
        page,
      }) => {
        await openView(page, VIEW_PATHS[VIEW.work]);
        const control = page.getByRole("link", { name: new RegExp(`^${name}`) }).first();
        const arrow = control.locator("svg").last();
        await control.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        expect(await translateOf(arrow), "at rest").toEqual({ x: 0, y: 0 });

        await control.hover();
        if (moves) {
          await expect.poll(() => translateOf(arrow), { timeout: 3000 }).toEqual({ x, y });
        } else {
          await nextFrames(page, 15); // longer than the fast duration a nudge would take
          expect(await translateOf(arrow), "hovered").toEqual({ x: 0, y: 0 });
        }
      });
    }
  });
}
