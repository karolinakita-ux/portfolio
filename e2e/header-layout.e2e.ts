/**
 * The sticky header:
 * - Phones: two rows, the logo and theme switch above the nav, spacingXs (8px) apart.
 * - It never leaves the view, so moving the focus through its links and buttons (Tab) never scrolls the
 *   page, also while the statistics consent box keeps space at the bottom; the page's scroll padding still
 *   keeps focused page content clear of it (WCAG 2.4.11).
 */
import { expect, test, type Page } from "@playwright/test";

import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { SELECTOR, VIEWPORTS } from "./helpers/helpers.constants.ts";
import { nextFrames, openView } from "./helpers/page.utils.ts";

const PATH = VIEW_PATHS[VIEW.about];
const SCROLLED = 1500;
/**
 * The smallest phone, and the space the consent box keeps at its width while it shows: --kb-consent-h on <html>, set
 * by useConsentSpace (494px in Firefox and WebKit, 514px in Chromium). The e2e pages never show the box itself. Since
 * 5.17.3 a window this short puts the box in the page (the cramped variant); it still floats from 641px up, with the
 * same space, so this is the header's hardest case: the space reaches under it.
 */
const SMALL_PHONE = { width: 320, height: 568 } as const;
const SMALL_PHONE_CONSENT_SPACE = "494px";

interface Stop {
  name: string;
  scrollY: number;
}

/** The focused element: its name, whether it sits in the header, and the page's scroll position. */
async function focusState(page: Page): Promise<Stop & { inHeader: boolean }> {
  return page.evaluate(() => {
    const focused = document.activeElement;
    const name = focused?.getAttribute("aria-label") ?? focused?.textContent.trim() ?? "";
    return { name, inHeader: focused?.closest("header") != null, scrollY: Math.round(window.scrollY) };
  });
}

/**
 * Scrolls down the page, focuses the logo without scrolling, then presses Tab until the focus leaves the
 * header. Returns the scroll position at the logo and each control reached after it.
 */
async function tabThroughHeader(page: Page): Promise<{ start: number; visited: Stop[] }> {
  await page.evaluate((y) => {
    window.scrollTo(0, y);
  }, SCROLLED);
  await page
    .locator("header a")
    .first()
    .evaluate((logo: HTMLElement) => {
      logo.focus({ preventScroll: true });
    });
  await nextFrames(page, 2);
  const start = (await focusState(page)).scrollY;
  const visited: Stop[] = [];
  for (let presses = 0; presses < 10; presses++) {
    await page.keyboard.press("Tab");
    await nextFrames(page, 2);
    const { name, inHeader, scrollY } = await focusState(page);
    if (!inHeader) break;
    visited.push({ name, scrollY });
  }
  return { start, visited };
}

/** Scrolls down the page and focuses each header link and button in turn: the scroll position after each. */
async function focusEachHeaderControl(page: Page): Promise<Stop[]> {
  return page.evaluate(async (y) => {
    const stops = [];
    for (const control of document.querySelectorAll<HTMLElement>("header :is(a, button)")) {
      window.scrollTo(0, y);
      control.focus();
      for (let i = 0; i < 2; i++) await new Promise((resolve) => requestAnimationFrame(resolve));
      stops.push({
        name: control.getAttribute("aria-label") ?? control.textContent.trim(),
        scrollY: Math.round(scrollY),
      });
    }
    return stops;
  }, SCROLLED);
}

/** The controls Tab reaches after the logo. WebKit's Tab skips links (as Safari does by default). */
const headerStops = (browserName: string): string[] =>
  browserName === "webkit" ? ["Light mode", "Dark mode"] : ["Work", "About", "Contact", "Light mode", "Dark mode"];

test.describe("phone rows", () => {
  test.use({ viewport: VIEWPORTS.phone });

  test("the nav row sits spacingXs (8px) below the logo and theme switch", async ({ page }) => {
    await openView(page, PATH);
    const gap = await page.locator(SELECTOR.primaryNav).evaluate((nav) => {
      const above = Array.from(nav.parentElement?.children ?? []).filter((item) => item !== nav);
      return nav.getBoundingClientRect().top - Math.max(...above.map((item) => item.getBoundingClientRect().bottom));
    });
    expect(gap).toBeCloseTo(8, 1);
  });
});

for (const viewport of ["phone", "desktop"] as const) {
  test.describe(`focus in the stuck header, ${viewport} (${String(VIEWPORTS[viewport].width)}px)`, () => {
    test.use({ viewport: VIEWPORTS[viewport] });

    test("Tab through its links and buttons: the page does not scroll", async ({ page, browserName }) => {
      await openView(page, PATH);
      const { start, visited } = await tabThroughHeader(page);
      expect(start, "scrolled down the page").toBe(SCROLLED);
      const names = headerStops(browserName);
      expect(
        visited.map((step) => step.name),
        "header controls reached with Tab",
      ).toEqual(names);
      expect(visited, "scroll position after each Tab").toEqual(names.map((name) => ({ name, scrollY: SCROLLED })));
    });

    test("page content focused behind the header scrolls clear of it (WCAG 2.4.11)", async ({ page }) => {
      await openView(page, PATH);
      const link = page.locator("main a[href]").nth(4);
      // Put the link right under the header's bottom edge, then focus it.
      await link.evaluate((element) => {
        const header = document.querySelector("header")?.getBoundingClientRect();
        if (!header) throw new Error("no header");
        window.scrollBy(0, element.getBoundingClientRect().top - (header.bottom - 20));
      });
      await nextFrames(page, 2);
      const place = (element: Element) => ({
        top: element.getBoundingClientRect().top,
        headerBottom: document.querySelector("header")?.getBoundingClientRect().bottom ?? 0,
      });
      const behind = await link.evaluate(place);
      expect(behind.top, "the link starts behind the header").toBeLessThan(behind.headerBottom);
      await link.focus();
      await nextFrames(page, 2);
      const { top, headerBottom } = await link.evaluate(place);
      expect(top, `focused link top (header bottom ${String(headerBottom)})`).toBeGreaterThanOrEqual(headerBottom);
    });
  });
}

test.describe(`focus in the stuck header while the consent box shows, small phone (${String(SMALL_PHONE.width)}px)`, () => {
  test.use({ viewport: SMALL_PHONE });

  test("Tab through its links and buttons, or focus them: the page does not scroll", async ({ page, browserName }) => {
    await openView(page, PATH);
    await page.evaluate((space) => {
      document.documentElement.style.setProperty("--kb-consent-h", space);
    }, SMALL_PHONE_CONSENT_SPACE);
    const { start, visited } = await tabThroughHeader(page);
    expect(start, "scrolled down the page").toBe(SCROLLED);
    const names = headerStops(browserName);
    expect(visited, "scroll position after each Tab").toEqual(names.map((name) => ({ name, scrollY: SCROLLED })));
    // WebKit's Tab never reaches the links: focus every control directly too.
    const focused = await focusEachHeaderControl(page);
    expect(focused, "logo, three nav links, two theme buttons").toHaveLength(6);
    expect(focused, "scroll position after focusing each").toEqual(
      focused.map(({ name }) => ({ name, scrollY: SCROLLED })),
    );
  });
});
