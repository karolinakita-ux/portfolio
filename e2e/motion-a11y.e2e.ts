/**
 * Accessibility limits on motion (from the WCAG 2.1 AA review of 3.5.3 - 3.7.0, and the 2.2 review of 5.0.0):
 * - A keyboard focus ring appears at once in its final colour: no focusable element transitions
 *   its outline (a fading ring starts in the label colour, below 3:1 on the active pill in dark),
 *   and nothing hidden until focus fades in with its ring (the copy-link icons did until 5.1.1).
 * - Nothing loops: with images still loading, every time-based animation on the page ends within
 *   5 s (WCAG 2.2.2); the loading skeleton pulses twice and then holds still (skeleton-pulse, theme.css).
 * - The scroll reveal stays off for people who set forced colours (Windows high contrast) or ask
 *   for more contrast: a card half-way into its reveal is fully shown.
 */
import { expect, test } from "@playwright/test";

import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { focusRingFades } from "./helpers/focus-ring.utils.ts";
import { nextFrames, openView } from "./helpers/page.utils.ts";

/** WCAG 2.2.2: moving content that starts on its own must stop within 5 seconds. */
const MAX_LOOP_MS = 5000;

test.describe("focus rings appear at once", () => {
  for (const path of [VIEW_PATHS[VIEW.work], VIEW_PATHS[VIEW.about], VIEW_PATHS[VIEW.contact]]) {
    test(`${path}: no focus ring fades in`, async ({ page }) => {
      await openView(page, path);
      const { focusable, transitions } = await focusRingFades(page);
      expect(focusable, "the page should have focusable elements").toBeGreaterThan(5);
      expect(transitions).toEqual([]);
    });
  }
});

test.describe("nothing loops past 5 seconds", () => {
  test("with images still loading, every timed animation ends within 5 s", async ({ page }) => {
    // Hold every case image so the loading skeletons stay on screen.
    await page.route("**/assets/cases/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 15_000));
      await route.continue().catch(() => undefined); // the page may be gone by then
    });
    await openView(page, VIEW_PATHS[VIEW.work]);
    await page.locator(".reveal-on-scroll").first().scrollIntoViewIfNeeded();
    await nextFrames(page, 2);

    const timed = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => animation.timeline === document.timeline)
        .map((animation) => {
          const timing = animation.effect?.getComputedTiming();
          const target = animation.effect instanceof KeyframeEffect ? animation.effect.target : null;
          return {
            name: animation instanceof CSSAnimation ? animation.animationName : animation.constructor.name,
            target: target instanceof Element ? target.tagName.toLowerCase() : "",
            iterations: timing?.iterations ?? 0,
            endTime: Number(timing?.endTime ?? 0),
          };
        }),
    );
    const pulses = timed.filter((animation) => animation.name === "skeleton-pulse");
    expect(pulses.length, "the loading skeletons should be pulsing").toBeGreaterThan(0);
    for (const pulse of pulses) expect(pulse.iterations).toBe(2);
    expect(timed.filter((animation) => animation.iterations === Infinity)).toEqual([]);
    expect(timed.filter((animation) => animation.endTime > MAX_LOOP_MS)).toEqual([]);
  });
});

test.describe("the scroll reveal respects contrast settings", () => {
  for (const setting of [
    { name: "forced colours", media: { forcedColors: "active" } },
    { name: "more contrast", media: { contrast: "more" } },
  ] as const) {
    test(`${setting.name}: a card half-way into its reveal is fully shown`, async ({ page }) => {
      await page.emulateMedia(setting.media);
      await openView(page, VIEW_PATHS[VIEW.work]);
      // The last case card: put its top 48px inside the viewport (half of the 96px reveal range).
      // Layout position from offsetTop, so a reveal's own translate cannot skew it; measured again
      // after scrolling because lazy images above can still change the layout.
      for (let attempt = 0; attempt < 3; attempt++) {
        await page.evaluate(() => {
          const cards = document.querySelectorAll<HTMLElement>("article.reveal-on-scroll");
          let el: HTMLElement | null = cards[cards.length - 1] ?? null;
          let top = 0;
          while (el) {
            top += el.offsetTop;
            el = el.offsetParent as HTMLElement | null;
          }
          window.scrollTo(0, top - window.innerHeight + 48);
        });
        await nextFrames(page, 2);
      }
      const card = await page.evaluate(() => {
        const cards = document.querySelectorAll<HTMLElement>("article.reveal-on-scroll");
        const el = cards[cards.length - 1];
        if (!el) return null;
        const style = getComputedStyle(el);
        return {
          inside: Math.round(window.innerHeight - el.getBoundingClientRect().top),
          opacity: style.opacity,
          translate: style.translate,
          animations: el.getAnimations().length,
        };
      });
      expect(card).not.toBeNull();
      expect(card?.inside, "the card's top should be inside the bottom of the viewport").toBeGreaterThan(0);
      expect(card).toMatchObject({ opacity: "1", translate: "none", animations: 0 });
    });
  }
});
