/**
 * Header motion. The contract:
 * - Nav: each Primary nav link holds an aria-hidden <span data-pill>; only the active link's pill
 *   shows. When the active item changes, that pill runs one animation from the old pill's box to
 *   its own (--motion-duration-medium, --motion-easing-standard); a second change mid-way turns it
 *   from where it is. With no item on one side (/cv) it fades instead. Nothing moves on the first
 *   load or under reduced motion.
 * - Theme switch: its pill travels the same way. Where document.startViewTransition exists the
 *   page cross-fades through it (the toggle keeps its own live layer); elsewhere the theme switches
 *   in one frame, with CSS transitions off while it does.
 * - Forced colours: the visible pill keeps a 1px border.
 */
import { expect, test, type Page } from "@playwright/test";

import { NAV_ITEMS, VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";

import { summariseAnimations } from "./helpers/animations.utils.ts";
import { expectFade, expectJump, expectResting, expectTravel } from "./helpers/expectations.utils.ts";
import { activeKeys, controlOf, expectBoxNear, formatBox, itemOf, progressOf } from "./helpers/geometry.utils.ts";
import { CANVAS, SELECTOR, THEME_LABEL, THEMES, VIEWPORTS } from "./helpers/helpers.constants.ts";
import type { Box, FrameSample, Theme } from "./helpers/helpers.types.ts";
import { motionTokens } from "./helpers/motion.utils.ts";
import { navLink, openView, themeButton } from "./helpers/page.utils.ts";
import {
  finishSampling,
  pillLog,
  sampleNow,
  startSampling,
  viewTransitionCalls,
  viewTransitionFinished,
  waitIdle,
} from "./helpers/sampling.utils.ts";

const labelOf = (view: View): string => {
  const item = NAV_ITEMS.find((candidate) => candidate.view === view);
  if (!item) throw new Error(`${view} is not in NAV_ITEMS`);
  return item.label;
};
const WORK = labelOf(VIEW.work);
const ABOUT = labelOf(VIEW.about);
const CONTACT = labelOf(VIEW.contact);
const NAV_KEYS = NAV_ITEMS.map((item) => item.label);
const THEME_KEYS = THEMES.map((theme) => THEME_LABEL[theme]);

test.describe("nav pill at rest", () => {
  const pages = [
    { path: VIEW_PATHS[VIEW.work], active: WORK, current: "page" },
    { path: VIEW_PATHS[VIEW.about], active: ABOUT, current: "page" },
    { path: VIEW_PATHS[VIEW.contact], active: CONTACT, current: "page" },
    { path: VIEW_PATHS[VIEW.caseProjectPlanning], active: WORK, current: "true" },
    { path: VIEW_PATHS[VIEW.cv], active: null, current: null },
  ] as const;

  for (const { path, active, current } of pages) {
    test(`first load of ${path}: ${active ?? "no"} pill shown, nothing animates`, async ({ page }) => {
      await openView(page, path);
      if (active !== null) {
        await expect(navLink(page, active)).toHaveAttribute("aria-current", current);
      } else {
        await expect(page.locator(`${SELECTOR.primaryNav} [aria-current]`)).toHaveCount(0);
      }
      // Longer than any animation, so one started by the prerendered-HTML takeover would be logged.
      await page.waitForTimeout(500);
      expect(await pillLog(page), "pill animations since the document started").toEqual([]);
      expectResting(await sampleNow(page, SELECTOR.navPills), NAV_KEYS, active);
      expectResting(await sampleNow(page, SELECTOR.themePills), THEME_KEYS, THEME_LABEL.light);
    });
  }

  test("pills are hidden from assistive tech: links and buttons keep their names", async ({ page, browserName }) => {
    await openView(page, VIEW_PATHS[VIEW.about]);
    const controls = `${SELECTOR.primaryNav} a, ${SELECTOR.themeGroup} button`;
    const pills = await page.locator(controls).evaluateAll((elements) =>
      elements.map((control) => {
        const found = control.querySelectorAll("[data-pill]");
        const pill = found[0];
        return {
          count: found.length,
          tag: pill?.tagName ?? null,
          ariaHidden: pill?.getAttribute("aria-hidden") ?? null,
          position: pill ? getComputedStyle(pill).position : null,
          text: pill?.textContent ?? null,
        };
      }),
    );
    const expected = { count: 1, tag: "SPAN", ariaHidden: "true", position: "absolute", text: "" };
    expect(pills, "one empty, aria-hidden, absolutely positioned span[data-pill] per control").toEqual(
      [...NAV_KEYS, ...THEME_KEYS].map(() => expected),
    );
    for (const label of NAV_KEYS) await expect(navLink(page, label)).toHaveAccessibleName(label);
    for (const theme of THEMES) await expect(themeButton(page, theme)).toHaveAccessibleName(THEME_LABEL[theme]);

    if (browserName === "chromium") {
      // Chromium's own accessibility tree, not Playwright's name computation.
      const cdp = await page.context().newCDPSession(page);
      const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
      const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: controls });
      const names: string[] = [];
      for (const nodeId of nodeIds) {
        const { nodes } = await cdp.send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
        const node = nodes[0];
        names.push(String(node?.role?.value) + ": " + String(node?.name?.value));
      }
      expect(names, "Chromium accessible names").toEqual([
        ...NAV_KEYS.map((label) => "link: " + label),
        ...THEME_KEYS.map((label) => "button: " + label),
      ]);
    }
  });

  test("the visible pill has a transparent 1px border by default", async ({ page }) => {
    await openView(page, VIEW_PATHS[VIEW.about]);
    const pill = page.locator(`${SELECTOR.primaryNav} a[aria-current] [data-pill]`);
    await expect(pill, "the active link's pill").toHaveCount(1);
    const border = await pill.evaluate(borderOf);
    expect(border.widths, "border widths").toEqual(["1px", "1px", "1px", "1px"]);
    expect(border.colors.every(isTransparent), `border colours ${border.colors.join(", ")}`).toBe(true);
  });
});

for (const viewport of ["phone", "desktop"] as const) {
  for (const theme of THEMES) {
    test.describe(`nav pill, ${viewport} (${VIEWPORTS[viewport].width}px), ${theme}`, () => {
      test.use({ viewport: VIEWPORTS[viewport], colorScheme: theme });

      test(`header click: the pill travels from ${ABOUT} to ${CONTACT}`, async ({ page }) => {
        await openView(page, VIEW_PATHS[VIEW.about], { theme });
        const motion = await motionTokens(page);
        await startSampling(page, SELECTOR.navPills);
        await navLink(page, CONTACT).click();
        const frames = await finishSampling(page, SELECTOR.navPills, { active: CONTACT });
        expectTravel(frames, { from: ABOUT, to: CONTACT, motion });
      });

      test("a second click mid-way: the pill turns from where it is", async ({ page }) => {
        await openView(page, VIEW_PATHS[VIEW.work], { theme });
        const motion = await motionTokens(page);
        const run = await clickTwice(page, ABOUT, CONTACT);

        // The first click started a move, which was still under way (held mid-way) when the second click came...
        expect(run.firstStarted, `the ${ABOUT} pill animation the first click starts`).toEqual(["running"]);
        expect(run.firstBefore, `the ${ABOUT} pill animation when the second click comes`).toEqual(["paused"]);
        const baseline = run.frames[0];
        const shown = run.frames.filter((frame) => activeKeys(frame).join() === ABOUT).at(-1);
        if (!baseline || !shown || !run.interruptedAt) throw new Error("no baseline frame, no About frame or no pill");
        const progress = progressOf(run.interruptedAt, itemOf(baseline, WORK), controlOf(itemOf(baseline, ABOUT)));
        expect(
          progress > 0.02 && progress < 0.98,
          `pill between ${WORK} and ${ABOUT} at the second click (${formatBox(run.interruptedAt)}, progress ${progress})`,
        ).toBe(true);
        expectBoxNear(
          itemOf(shown, ABOUT),
          run.interruptedAt,
          0.5,
          `the last frame before the second click shows it there`,
        );
        // ...the second click cancelled it (not finished: no jump to the end)...
        expect(run.firstAfter, `the first animation after the second click`).toEqual(["idle"]);
        // ...and the new animation starts where the pill was on screen.
        expectTravel(run.frames, { from: run.interruptedAt, to: CONTACT, motion });
      });
    });
  }
}

test.describe("nav pill follows every way to change page", () => {
  test.describe("desktop, light", () => {
    test.use({ viewport: VIEWPORTS.desktop, colorScheme: "light" });

    test(`footer link: ${ABOUT} to ${CONTACT}`, async ({ page }) => {
      await openView(page, VIEW_PATHS[VIEW.about]);
      const motion = await motionTokens(page);
      const footerLink = page.getByRole("navigation", { name: "Explore" }).getByRole("link", { name: CONTACT });
      await footerLink.scrollIntoViewIfNeeded();
      await startSampling(page, SELECTOR.navPills);
      await footerLink.click();
      const frames = await finishSampling(page, SELECTOR.navPills, { active: CONTACT });
      expectTravel(frames, { from: ABOUT, to: CONTACT, motion });
    });
  });

  test.describe("phone, dark", () => {
    test.use({ viewport: VIEWPORTS.phone, colorScheme: "dark" });

    test(`in-page link: ${ABOUT} to ${WORK}`, async ({ page }) => {
      await openView(page, VIEW_PATHS[VIEW.about], { theme: "dark" });
      const motion = await motionTokens(page);
      await startSampling(page, SELECTOR.navPills);
      await page.getByRole("link", { name: "Explore Selected Work" }).click();
      const frames = await finishSampling(page, SELECTOR.navPills, { active: WORK });
      expectTravel(frames, { from: ABOUT, to: WORK, motion });
    });
  });

  test.describe("desktop, dark", () => {
    test.use({ viewport: VIEWPORTS.desktop, colorScheme: "dark" });

    test(`breadcrumb: ${CONTACT} to ${WORK}`, async ({ page }) => {
      await openView(page, VIEW_PATHS[VIEW.contact], { theme: "dark" });
      const motion = await motionTokens(page);
      await startSampling(page, SELECTOR.navPills);
      await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: WORK }).click();
      const frames = await finishSampling(page, SELECTOR.navPills, { active: WORK });
      expectTravel(frames, { from: CONTACT, to: WORK, motion });
    });

    test(`same item (case study to ${WORK}): the pill stays still`, async ({ page }) => {
      await openView(page, VIEW_PATHS[VIEW.caseProjectPlanning], { theme: "dark" });
      await startSampling(page, SELECTOR.navPills);
      await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: WORK }).click();
      await expect(navLink(page, WORK)).toHaveAttribute("aria-current", "page");
      const frames = await finishSampling(page, SELECTOR.navPills, { active: WORK });
      expect(summariseAnimations(frames), "pill animations").toEqual([]);
      for (const frame of frames) {
        const pill = itemOf(frame, WORK);
        expect(pill.opacity, `${WORK} pill opacity at ${Math.round(frame.t)}ms`).toBe(1);
        expectBoxNear(pill, controlOf(pill), 0.5, `${WORK} pill at ${Math.round(frame.t)}ms`);
      }
    });
  });

  test.describe("phone, light", () => {
    test.use({ viewport: VIEWPORTS.phone, colorScheme: "light" });

    test("Back and Forward", async ({ page }) => {
      await openView(page, VIEW_PATHS[VIEW.about]);
      const motion = await motionTokens(page);
      await navLink(page, CONTACT).click();
      await expect(navLink(page, CONTACT)).toHaveAttribute("aria-current", "page");
      await waitIdle(page, SELECTOR.navPills);

      await test.step(`Back: ${CONTACT} to ${ABOUT}`, async () => {
        await startSampling(page, SELECTOR.navPills);
        await page.goBack();
        const frames = await finishSampling(page, SELECTOR.navPills, { active: ABOUT });
        expectTravel(frames, { from: CONTACT, to: ABOUT, motion });
      });
      await test.step(`Forward: ${ABOUT} to ${CONTACT}`, async () => {
        await startSampling(page, SELECTOR.navPills);
        await page.goForward();
        const frames = await finishSampling(page, SELECTOR.navPills, { active: CONTACT });
        expectTravel(frames, { from: ABOUT, to: CONTACT, motion });
      });
    });
  });
});

test.describe("nav pill with no item on one side (/cv is not in the nav)", () => {
  test(`from /cv to ${ABOUT}: the pill fades in`, async ({ page }) => {
    await openView(page, VIEW_PATHS[VIEW.cv]);
    await startSampling(page, SELECTOR.navPills);
    await navLink(page, ABOUT).click();
    const frames = await finishSampling(page, SELECTOR.navPills, { active: ABOUT });
    expectFade(frames, { key: ABOUT, direction: "in" });
  });

  test(`Back from ${ABOUT} to /cv: the pill fades out`, async ({ page }) => {
    await openView(page, VIEW_PATHS[VIEW.cv]);
    await navLink(page, ABOUT).click();
    await expect(navLink(page, ABOUT)).toHaveAttribute("aria-current", "page");
    await waitIdle(page, SELECTOR.navPills);
    await startSampling(page, SELECTOR.navPills);
    await page.goBack();
    const frames = await finishSampling(page, SELECTOR.navPills, { active: null });
    expectFade(frames, { key: ABOUT, direction: "out" });
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nav: the pill appears on the new item, nothing animates", async ({ page }) => {
    await openView(page, VIEW_PATHS[VIEW.about]);
    await startSampling(page, SELECTOR.navPills);
    await navLink(page, CONTACT).click();
    expectJump(await finishSampling(page, SELECTOR.navPills, { active: CONTACT }), CONTACT);
    expect(await pillLog(page), "pill animations since the document started").toEqual([]);
  });

  test("theme: the pill appears on the new button, no view transition", async ({ page }) => {
    await openView(page, VIEW_PATHS[VIEW.work]);
    await startSampling(page, SELECTOR.themePills);
    await themeButton(page, "dark").click();
    expectJump(await finishSampling(page, SELECTOR.themePills, { active: THEME_LABEL.dark }), THEME_LABEL.dark);
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    expect(await viewTransitionCalls(page), "document.startViewTransition calls").toBe(0);
    expect(await pillLog(page), "pill animations since the document started").toEqual([]);
  });
});

test.describe("theme switch", () => {
  test("the pill travels to Dark and back to Light", async ({ page }) => {
    await openView(page, VIEW_PATHS[VIEW.work]);
    const motion = await motionTokens(page);
    for (const [from, to] of [
      ["light", "dark"],
      ["dark", "light"],
    ] as const) {
      await test.step(`${THEME_LABEL[from]} to ${THEME_LABEL[to]}`, async () => {
        await startSampling(page, SELECTOR.themePills);
        await themeButton(page, to).click();
        const frames = await finishSampling(page, SELECTOR.themePills, { active: THEME_LABEL[to] });
        expectTravel(frames, { from: THEME_LABEL[from], to: THEME_LABEL[to], motion });
        await viewTransitionFinished(page);
      });
    }
  });

  test("cross-fade: one view transition per click; the toggle keeps its own layer", async ({ page }) => {
    await openView(page, VIEW_PATHS[VIEW.work]);
    const supported = await page.evaluate(() => "startViewTransition" in document);
    test.skip(!supported, "no document.startViewTransition in this browser");
    expect(await viewTransitionCalls(page), "view transitions on load").toBe(0);

    await themeButton(page, "dark").click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await viewTransitionFinished(page);
    expect(await viewTransitionCalls(page), "document.startViewTransition calls after one click").toBe(1);
    const name = await page
      .locator(SELECTOR.themeGroup)
      .evaluate((group) => getComputedStyle(group).getPropertyValue("view-transition-name"));
    expect(name, "view-transition-name of the theme group").toBe("theme-toggle");
  });
});

test.describe("theme switch without the View Transitions API (older browsers)", () => {
  test("the theme switches in one frame: kb-theme-switching for about two frames, no colour lags", async ({ page }) => {
    await openView(page, VIEW_PATHS[VIEW.work], { removeViewTransitions: true });
    expect(await page.evaluate(() => "startViewTransition" in document), "API removed").toBe(false);

    for (const to of ["dark", "light"] as const) {
      await test.step(`to ${to}`, async () => {
        const run = await switchThemeInPage(page, to);
        const perFrame = run.frames.map((frame) => (frame.switching ? "on" : "off")).join(" ");
        expect(run.classAdded, "<html> gets kb-theme-switching during the change").toBe(true);
        expect(
          run.frames.map((frame) => frame.switching).lastIndexOf(true),
          `kb-theme-switching gone within about two frames (per frame: ${perFrame})`,
        ).toBeLessThanOrEqual(1);
        expect(run.frames[0]?.dark, "theme applied by the first frame").toBe(to === "dark");
        expect(
          run.frames.map((frame) => frame.background),
          `header background per frame after the click = ${to} canvas ${CANVAS[to]}`,
        ).toEqual(run.frames.map(() => run.canvas));
        await expect(themeButton(page, to)).toHaveAttribute("aria-pressed", "true");
        await waitIdle(page, SELECTOR.themePills);
      });
    }
  });
});

test.describe("forced colours", () => {
  test.use({ forcedColors: "active" });

  test("the visible pill keeps a 1px border in a system colour", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit matches (forced-colors: active) but does not force any colours");
    await openView(page, VIEW_PATHS[VIEW.about]);
    const pill = page.locator(`${SELECTOR.primaryNav} a[aria-current] [data-pill]`);
    await expect(pill, "the active link's pill").toHaveCount(1);
    const border = await pill.evaluate(borderOf);
    expect(border.widths, "border widths").toEqual(["1px", "1px", "1px", "1px"]);
    expect(border.styles, "border styles").toEqual(["solid", "solid", "solid", "solid"]);
    expect(border.colors.some(isTransparent), `border colours ${border.colors.join(", ")}`).toBe(false);
  });
});

/* Spec helpers */

interface Border {
  widths: string[];
  styles: string[];
  colors: string[];
}

/** Runs in the page (evaluate): the computed border of each side. */
function borderOf(element: Element): Border {
  const style = getComputedStyle(element);
  const sides = ["top", "right", "bottom", "left"];
  return {
    widths: sides.map((side) => style.getPropertyValue(`border-${side}-width`)),
    styles: sides.map((side) => style.getPropertyValue(`border-${side}-style`)),
    colors: sides.map((side) => style.getPropertyValue(`border-${side}-color`)),
  };
}

const isTransparent = (color: string): boolean =>
  color === "transparent" || /^rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)$/.test(color);

interface InterruptRun {
  frames: FrameSample[];
  /** The first pill's box on screen right before the second click. */
  interruptedAt: Box | null;
  /** playState of the first pill's animations as the app starts them, right before / after the second click. */
  firstStarted: string[];
  firstBefore: string[];
  firstAfter: string[];
}

/**
 * Clicks `first`, holds the move it starts at a fifth of its time, then clicks `second` two
 * frames later, inside the page (so the gap is exact), sampling the nav pills throughout.
 */
async function clickTwice(page: Page, first: string, second: string): Promise<InterruptRun> {
  return page.evaluate(
    async ({ nav, pills, first, second }) => {
      const kb = window.__kb;
      if (!kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
      const link = (label: string): HTMLAnchorElement => {
        const found = Array.from(document.querySelectorAll<HTMLAnchorElement>(`${nav} a`)).find(
          (anchor) => anchor.textContent.trim() === label,
        );
        if (!found) throw new Error(`no nav link "${label}"`);
        return found;
      };
      kb.startSampling(pills);
      const firstPill = link(first).querySelector("[data-pill]");
      const started = kb.nextPillAnimation(first, 2000);
      link(first).click();
      // Take hold of the first move in the click's own task, before any frame. WebKit starts an
      // animation at the time of the last frame, so the first frame that paints it can already be
      // most of the way through; one slow frame and a task more, and it would be over before a
      // hold that waits for frames.
      await started;
      const firstAnimations = firstPill?.getAnimations() ?? [];
      const firstStarted = firstAnimations.map((animation) => animation.playState);
      // Hold the pill at a fifth of the move's time (about half-way with the standard easing), so the
      // spot depends neither on how busy the machine is nor on when exactly the app reads it.
      for (const animation of firstAnimations) {
        const duration = animation.effect?.getTiming().duration;
        animation.pause();
        if (typeof duration === "number") animation.currentTime = duration / 5;
      }
      // Let the held pill paint, then click from a task, like a real click, not from inside a frame
      // callback: an animation created during a frame callback starts with that frame, so the next
      // sample would already be one frame in.
      await kb.nextFrames(2);
      await new Promise((resolve) => setTimeout(resolve, 0));
      const firstBefore = firstAnimations.map((animation) => animation.playState);
      const rect = firstPill?.getBoundingClientRect();
      const interruptedAt = rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null;
      link(second).click();
      await kb.waitActive(pills, second, 2000);
      await kb.waitIdle(pills, 4000);
      const frames = await kb.stopSampling();
      const firstAfter = firstAnimations.map((animation) => animation.playState);
      return { frames, interruptedAt, firstStarted, firstBefore, firstAfter };
    },
    { nav: SELECTOR.primaryNav, pills: SELECTOR.navPills, first, second },
  );
}

interface ThemeSwitchRun {
  /** A class mutation on <html> left kb-theme-switching on it. */
  classAdded: boolean;
  /** One entry per animation frame after the click. */
  frames: Array<{ switching: boolean; dark: boolean; background: string }>;
  /** The new theme's canvas colour, as this browser serialises it. */
  canvas: string;
}

/** Clicks a theme button inside the page and reads <html> and the header in each of the next six frames. */
async function switchThemeInPage(page: Page, to: Theme): Promise<ThemeSwitchRun> {
  return page.evaluate(
    async ({ nav, group, label, canvasHex }) => {
      const kb = window.__kb;
      if (!kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
      const root = document.documentElement;
      const header = document.querySelector(nav)?.closest("header");
      const button = document.querySelector(`${group} button[aria-label="${label}"]`);
      if (!header || !(button instanceof HTMLElement)) throw new Error("header or theme button missing");

      const probe = document.createElement("div");
      probe.style.backgroundColor = canvasHex;
      document.body.append(probe);
      const canvas = getComputedStyle(probe).backgroundColor;
      probe.remove();

      // Every class value <html> passes through (records carry the old value; the last one ends at the current).
      let classAdded = false;
      const observer = new MutationObserver((records) => {
        for (let index = 0; index < records.length; index++) {
          const value = records[index + 1]?.oldValue ?? root.className;
          if (value.split(/\s+/).includes("kb-theme-switching")) classAdded = true;
        }
      });
      observer.observe(root, { attributes: true, attributeFilter: ["class"], attributeOldValue: true });

      button.click();
      const frames = [];
      for (let i = 0; i < 6; i++) {
        await kb.nextFrames(1);
        frames.push({
          switching: root.classList.contains("kb-theme-switching"),
          dark: root.classList.contains("dark"),
          background: getComputedStyle(header).backgroundColor,
        });
      }
      observer.disconnect();
      return { classAdded, frames, canvas };
    },
    { nav: SELECTOR.primaryNav, group: SELECTOR.themeGroup, label: THEME_LABEL[to], canvasHex: CANVAS[to] },
  );
}
