import type { Page } from "@playwright/test";

/*
 * Touch scrolling, swipes and pinches as a phone sends them, in Chromium (the DevTools protocol's raw touch events:
 * Playwright's own touchscreen only taps), and where the page sits in the frames it paints. Needs a context with
 * hasTouch, e.g. MESSENGER_ANDROID.
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

/** A quick swipe of `distance` px that lifts while still moving: the page flings on after the finger has left. */
export async function touchFling(page: Page, distance: number): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  const x = 200;
  const start = distance > 0 ? 150 : 650;
  const steps = 10;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: start }] });
  for (let step = 1; step <= steps; step++) {
    const y = start + (distance * step) / steps;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    // 8 ms per step, as a finger moves; Playwright's waitForTimeout is too coarse to leave the fling its speed.
    await new Promise((resolve) => setTimeout(resolve, 8));
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

/** A point on the screen, in CSS px from the viewport's top left corner. */
interface ScreenPoint {
  x: number;
  y: number;
}

/**
 * One finger along `path` (its first point is where it lands): `stepMs` between moves, then `holdMs` still before it
 * lifts. With no hold it lifts while still moving, so a fling follows, as after touchFling().
 */
export async function touchPath(
  page: Page,
  path: readonly ScreenPoint[],
  { stepMs = 8, holdMs = 0 }: { stepMs?: number; holdMs?: number } = {},
): Promise<void> {
  const [start, ...moves] = path;
  if (!start) throw new Error("a touch needs a point to start from");
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
  for (const point of moves) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point] });
    await new Promise((resolve) => setTimeout(resolve, stepMs));
  }
  if (holdMs > 0) await page.waitForTimeout(holdMs);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

/** `steps` points from `from` to `to`, `from` included: a straight finger path for touchPath(). */
export const straightPath = (from: ScreenPoint, to: ScreenPoint, steps = 10): ScreenPoint[] =>
  Array.from({ length: steps + 1 }, (_, step) => ({
    x: from.x + ((to.x - from.x) * step) / steps,
    y: from.y + ((to.y - from.y) * step) / steps,
  }));

/** Two fingers around `center` that spread from `fromGap` to `toGap` px apart, hold still and lift: a pinch-zoom. */
export async function touchPinch(page: Page, center: ScreenPoint, fromGap: number, toGap: number): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  const fingers = (gap: number) => [
    { x: center.x - gap / 2, y: center.y, id: 0 },
    { x: center.x + gap / 2, y: center.y, id: 1 },
  ];
  const steps = 10;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: fingers(fromGap) });
  for (let step = 1; step <= steps; step++) {
    const gap = fromGap + ((toGap - fromGap) * step) / steps;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: fingers(gap) });
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
  await page.waitForTimeout(200);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

/**
 * Records where the page is scrolled in every frame it paints, from the first script on (call before page.goto();
 * read with largestPaintedStep()). Each frame is read in the first task after its animation callbacks, so a page
 * script that corrects the position in requestAnimationFrame counts, as it does on screen.
 */
export async function recordPaintedScroll(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const frames: Array<{ t: number; y: number }> = [];
    Object.assign(window, { __kbPaintedScroll: frames });
    const channel = new MessageChannel();
    channel.port1.onmessage = () => frames.push({ t: performance.now(), y: window.scrollY });
    const frame = () => {
      channel.port2.postMessage(0);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

/** The page's clock now (performance.now()), to pass to largestPaintedStep(). */
export const pageNow = (page: Page): Promise<number> => page.evaluate(() => performance.now());

/** The largest move of the page between two frames painted after `since`, in px. */
export async function largestPaintedStep(page: Page, since: number): Promise<number> {
  return page.evaluate((from) => {
    const frames = (window as unknown as { __kbPaintedScroll: Array<{ t: number; y: number }> }).__kbPaintedScroll;
    const after = frames.filter((frame) => frame.t >= from);
    let largest = 0;
    for (let i = 1; i < after.length; i++) {
      largest = Math.max(largest, Math.abs((after[i]?.y ?? 0) - (after[i - 1]?.y ?? 0)));
    }
    return Math.round(largest);
  }, since);
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
