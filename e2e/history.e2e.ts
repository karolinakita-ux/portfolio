/**
 * Browser history while reading (src/app/routing/), in real browsers:
 * - Back and Forward bring each page back to where the visitor left it (positions kept in memory);
 * - scrolling never writes to the history in an in-app browser: Messenger, Instagram and LinkedIn
 *   show their loading bar on every history write, which looked like the page reloading;
 * - in an ordinary browser the address follows the section being read, and that is the only write.
 */
import { expect, test, type Page } from "@playwright/test";

import { waitForApp } from "./helpers/page.utils.ts";

const MESSENGER_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/MessengerForiOS;FBAV/512.0.0.47.106;FBBV/731562344;FBDV/iPhone15,3;FBMD/iPhone;FBSN/iOS;FBSV/18.6;FBSS/3;FBCR/;FBID/phone;FBLC/pl_PL;FBOP/5]";

interface HistoryWrite {
  method: string;
  url: string | null;
}

/** Records every pushState / replaceState from the start of the page; read with historyWrites(). */
async function recordHistoryWrites(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const log: HistoryWrite[] = [];
    Object.assign(window, { __historyWrites: log });
    for (const method of ["pushState", "replaceState"] as const) {
      const original = window.history[method].bind(window.history);
      window.history[method] = (state: unknown, unused: string, url?: string | URL | null) => {
        log.push({ method, url: url === undefined || url === null ? null : String(url) });
        original(state, unused, url);
      };
    }
  });
}

const historyWrites = (page: Page) =>
  page.evaluate(() => (window as unknown as { __historyWrites: HistoryWrite[] }).__historyWrites);

const clearHistoryWrites = (page: Page) =>
  page.evaluate(() => {
    (window as unknown as { __historyWrites: unknown[] }).__historyWrites.length = 0;
  });

/** Scrolls down the page the way a visitor does: wheel steps with short pauses, then a rest. */
async function readDown(page: Page): Promise<void> {
  await page.mouse.move(200, 300);
  for (let step = 0; step < 8; step++) {
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(800); // longer than any "after scrolling stops" delay
}

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

test("Back and Forward bring each page back to where the visitor left it", async ({ page }) => {
  await page.goto("/");
  await waitForApp(page);
  const link = page.getByRole("article").nth(1).getByRole("link", { name: /^View/ });
  await link.scrollIntoViewIfNeeded();
  const onWork = await scrollY(page);
  expect(onWork).toBeGreaterThan(200);
  await link.click();
  await expect(page).toHaveURL(/\/work\//);
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect.poll(() => scrollY(page)).toBe(700);

  await page.goBack();
  // Back on Work; the hash may name the section that was in view (/#enterprise-cases).
  await expect(page).toHaveURL(/:\d+\/(#[\w-]+)?$/);
  await expect.poll(async () => Math.abs((await scrollY(page)) - onWork)).toBeLessThan(4);

  await page.goForward();
  await expect(page).toHaveURL(/\/work\//);
  await expect.poll(async () => Math.abs((await scrollY(page)) - 700)).toBeLessThan(4);
});

test.describe("in an in-app browser (Messenger)", () => {
  test.use({ userAgent: MESSENGER_IOS });

  test("scrolling never writes to the history, so no loading bar appears", async ({ page }) => {
    await recordHistoryWrites(page);
    await page.goto("/about");
    await waitForApp(page);
    await clearHistoryWrites(page);
    await readDown(page);
    expect(await scrollY(page)).toBeGreaterThan(1000);
    expect(await historyWrites(page)).toEqual([]);
    expect(new URL(page.url()).hash).toBe("");
  });
});

test("in an ordinary browser, the address follows the section being read, and nothing else is written", async ({
  page,
}) => {
  await recordHistoryWrites(page);
  await page.goto("/about");
  await waitForApp(page);
  await clearHistoryWrites(page);
  await readDown(page);
  const writes: HistoryWrite[] = await historyWrites(page);
  expect(writes.length).toBeGreaterThan(0);
  // Every write moves the hash to a section; none only stores state (the old scroll-position save did).
  for (const write of writes) {
    expect(write.method).toBe("replaceState");
    expect(write.url).toMatch(/^\/about(\?[^#]*)?(#[\w-]+)?$/);
  }
  expect(new URL(page.url()).hash).toMatch(/^#[\w-]+$/);
});
