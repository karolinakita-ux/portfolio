import type { Page } from "@playwright/test";

import type { AnimationSample, FinishOptions, FrameSample, ItemSample, PillAnimationRecord } from "./helpers.types.ts";

/** Starts sampling every element that matches `selector`, once per frame, from now on. */
export async function startSampling(page: Page, selector: string): Promise<void> {
  await page.evaluate((s) => {
    if (!window.__kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
    window.__kb.startSampling(s);
  }, selector);
}

/** Waits for the change (optional) and for `selector` to stop animating; then returns every sampled frame. */
export async function finishSampling(
  page: Page,
  selector: string,
  { active, timeoutMs = 4000 }: FinishOptions = {},
): Promise<FrameSample[]> {
  return page.evaluate(
    async ({ s, key, timeout }) => {
      const kb = window.__kb;
      if (!kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
      if (key !== undefined) await kb.waitActive(s, key, timeout);
      await kb.waitIdle(s, timeout);
      return kb.stopSampling();
    },
    { s: selector, key: active, timeout: timeoutMs },
  );
}

/** One sample of every element that matches `selector`, now. */
export async function sampleNow(page: Page, selector: string): Promise<ItemSample[]> {
  return page.evaluate((s) => {
    if (!window.__kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
    return window.__kb.sample(s);
  }, selector);
}

/** The animations attached right now to each element that matches `selector` (elements without any left out). */
export async function runningAnimations(
  page: Page,
  selector: string,
): Promise<Array<{ key: string; animations: AnimationSample[] }>> {
  const items = await sampleNow(page, selector);
  return items.filter((item) => item.animations.length > 0).map(({ key, animations }) => ({ key, animations }));
}

export async function waitIdle(page: Page, selector: string, timeoutMs = 4000): Promise<void> {
  await page.evaluate(
    async ({ s, timeout }) => {
      if (!window.__kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
      await window.__kb.waitIdle(s, timeout);
    },
    { s: selector, timeout: timeoutMs },
  );
}

/** Every animation that has run on a [data-pill] element since the document started. */
export async function pillLog(page: Page): Promise<PillAnimationRecord[]> {
  return page.evaluate(() => {
    if (!window.__kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
    return window.__kb.pillLog;
  });
}

export async function viewTransitionCalls(page: Page): Promise<number> {
  return page.evaluate(() => {
    if (!window.__kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
    return window.__kb.viewTransitionCalls;
  });
}

/** Waits for the last document.startViewTransition() to finish (no-op when none ran). */
export async function viewTransitionFinished(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await window.__kb?.lastViewTransition?.finished;
  });
}
