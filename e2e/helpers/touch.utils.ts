import type { Page } from "@playwright/test";

/*
 * Touch scrolling as a phone sends it, in Chromium (the DevTools protocol's raw touch events: Playwright's own
 * touchscreen only taps). Needs a context with hasTouch, e.g. MESSENGER_ANDROID.
 */

/**
 * The finger moves `distance` px down the screen (negative: up, which scrolls the page down) in small steps, holds
 * still and lifts: the page follows the finger and does not fling on.
 */
export async function touchDrag(page: Page, distance: number): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  const x = 200;
  const start = distance > 0 ? 200 : 600;
  const steps = 12;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: start }] });
  for (let step = 1; step <= steps; step++) {
    const y = start + (distance * step) / steps;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
  }
  await page.waitForTimeout(200); // still: no speed left to fling with
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

/** The scroll position once it has not changed for 10 frames in a row. */
export async function settledScrollY(page: Page): Promise<number> {
  return page.evaluate(async () => {
    let last = Number.NaN;
    for (let still = 0; still < 10;) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (Math.abs(window.scrollY - last) < 0.5) still++;
      else still = 0;
      last = window.scrollY;
    }
    return Math.round(last);
  });
}
