/**
 * Scroll reveal on cards (`reveal-on-scroll` in src/styles/app.css). The contract:
 * - Where the browser has scroll-driven animations (CSS.supports("animation-timeline: view()"))
 *   and motion is allowed, a card below the viewport waits transparent and 16px low (spacingMd).
 *   It fades up over the first 96px (spacing4xl) of scrolling after its top enters the viewport,
 *   then is exactly its own state again: opacity 1, no translate. It follows the scroll position,
 *   so scrolling back hides it again below the fold.
 * - Nothing moves at page load: a card inside the viewport is fully shown from the first frame
 *   (prerendered HTML and the React takeover included).
 * - Jumping to the case studies (link, button) leaves the first case card fully shown.
 * - Reduced motion, print and browsers without scroll-driven animations: every card is fully
 *   shown, with no animation, at any scroll position.
 * - axe finds no WCAG 2.2 A/AA violations at several scroll positions, half-revealed cards included.
 *   Early in a reveal (the card's top less than about 40px inside) axe does report colour-contrast
 *   on that card's text, because it applies the card's opacity and ignores the viewport: the
 *   flagged text is below the fold or cut by the viewport edge. A line of text is fully on screen
 *   only once the card is far enough in to pass; the early-reveal test holds axe to exactly that.
 *   A page can open with a card just inside the fold (Work at 1280 x 800 since its hero has two rows
 *   of buttons), so the other audits leave out the same artefact, and only that: colour contrast on
 *   text of a card still fading in that is not fully on screen (fadingOffScreen).
 * Bundled engines (Playwright 1.64): Chromium and WebKit support it; Firefox does not (behind a
 * pref there), so it runs the fallback expectations.
 */
import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { WORK_CASES } from "#features/work/work.content.ts";
import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { THEMES, VIEWPORTS } from "./helpers/helpers.constants.ts";
import type { Theme } from "./helpers/helpers.types.ts";
import { openView } from "./helpers/page.utils.ts";

/** The cards that reveal (the utility's class: the Vitest component tests pin which elements get it). */
const CARD = ".reveal-on-scroll";
/** spacing4xl: scrolling it takes to reveal a card fully. */
const REVEAL_PX = 96;
/** spacingMd: how far below its place a waiting card sits. */
const OFFSET_PX = 16;
/** Where a card is half-way: its top this far inside the viewport. */
const HALF_PX = REVEAL_PX / 2;
/** Early in a reveal: the card's top this far inside the viewport, its text still faint. */
const EARLY_PX = [12, 24, 36];
/** Same tags as scripts/a11y-audit.ts (without best-practice hints). */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

const PAGES = [
  VIEW.work,
  VIEW.about,
  VIEW.caseSmartTicket,
  VIEW.caseDataGovernance,
  VIEW.caseProjectPlanning,
  VIEW.caseAutomotive,
].map((view) => VIEW_PATHS[view]);
/** A tall screen (a large monitor, or zoomed out): most pages then have cards on their first screen. */
const TALL = { width: 1280, height: 2000 };
const NO_CARDS_ON_TALL_FIRST_SCREEN = new Set<string>([
  VIEW_PATHS[VIEW.caseSmartTicket],
  VIEW_PATHS[VIEW.caseProjectPlanning],
]);

interface CardState {
  /** Heading or caption text, for messages. */
  name: string;
  /** Layout box relative to the viewport, without the reveal's own translate (the timeline ignores it too). */
  top: number;
  bottom: number;
  opacity: number;
  translate: string;
  translateY: number;
  /** CSS animations attached to the card. */
  animations: number;
}

interface Snapshot {
  scrollY: number;
  maxScrollY: number;
  /** Height of the scrollport (the view timeline's viewport). */
  viewport: number;
  /** The page's scroll padding under the sticky header (base.css), in px. */
  scrollPaddingTop: number;
  cards: CardState[];
}

interface FrameRecord extends Snapshot {
  /** Milliseconds since the document started. */
  t: number;
}

interface RevealProbe {
  snapshot: () => Snapshot;
  /** Jumps there and returns the cards once the layout holds still (see stableSnapshot). */
  scrollTo: (y: number) => Promise<Snapshot>;
  /**
   * Scrolls until card `index` has its top `inside` px inside the viewport, measuring again after
   * each jump (lazy screenshots above it can still load and push it down). Null when the page
   * does not scroll that far.
   */
  placeCard: (index: number, inside: number) => Promise<Snapshot | null>;
  /** Waits until scrolling has stopped for three frames; with `from`, first until it has left `from`. */
  settle: (from: number | null, timeoutMs: number) => Promise<void>;
  /** Ends the per-frame record and returns it. */
  stopRecording: () => FrameRecord[];
}

declare global {
  interface Window {
    __reveal?: RevealProbe;
  }
}

interface ProbeOptions {
  selector: string;
  /** Snapshot the cards in every frame from the start of the document. */
  record: boolean;
}

/** Runs in the page before any of its scripts (addInitScript): self-contained on purpose. */
function installRevealProbe({ selector, record }: ProbeOptions): void {
  const nextFrame = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  const translateYOf = (translate: string): number => {
    const [, y = "0px"] = translate === "none" ? [] : translate.split(" ");
    return Number.parseFloat(y);
  };
  const nameOf = (card: Element): string =>
    (card.querySelector("h3, figcaption")?.textContent ?? card.tagName).replace(/\s+/g, " ").trim();
  const read = (card: Element): CardState => {
    const style = getComputedStyle(card);
    const translateY = translateYOf(style.translate);
    const box = card.getBoundingClientRect();
    return {
      name: nameOf(card),
      top: box.top - translateY,
      bottom: box.bottom - translateY,
      opacity: Number(style.opacity),
      translate: style.translate,
      translateY,
      animations: card.getAnimations().length,
    };
  };
  const snapshot = (): Snapshot => {
    const root = document.documentElement;
    return {
      scrollY: window.scrollY,
      maxScrollY: root.scrollHeight - root.clientHeight,
      viewport: root.clientHeight,
      scrollPaddingTop: Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0,
      cards: Array.from(document.querySelectorAll(selector), read),
    };
  };

  const sameLayout = (a: Snapshot, b: Snapshot): boolean =>
    a.scrollY === b.scrollY &&
    a.viewport === b.viewport &&
    a.cards.length === b.cards.length &&
    a.cards.every((card, index) => {
      const other = b.cards[index];
      return card.top === other?.top && card.bottom === other.bottom;
    });
  /**
   * Scroll timelines are sampled once per frame, so a layout change (a lazy image loading, say)
   * reaches the animations a frame later. Two frames in a row with the same layout: the cards'
   * opacity and translate belong to the boxes read with them. Starts two frames after the call.
   */
  const stableSnapshot = async (): Promise<Snapshot> => {
    await nextFrame();
    await nextFrame();
    let previous = snapshot();
    for (let i = 0; i < 120; i++) {
      await nextFrame();
      const current = snapshot();
      if (sameLayout(previous, current)) return current;
      previous = current;
    }
    return previous;
  };

  const frames: FrameRecord[] = [];
  let recording = record;
  const tick = () => {
    if (!recording) return;
    frames.push({ ...snapshot(), t: performance.now() });
    if (frames.length < 3000) requestAnimationFrame(tick);
  };
  if (record) requestAnimationFrame(tick);

  window.__reveal = {
    snapshot,
    scrollTo: async (y) => {
      window.scrollTo({ top: y, behavior: "instant" });
      return stableSnapshot();
    },
    placeCard: async (index, inside) => {
      let snap = await stableSnapshot();
      for (let attempt = 0; attempt < 10; attempt++) {
        const card = snap.cards[index];
        if (!card) throw new Error(`no card ${index} (${snap.cards.length} on the page)`);
        const y = Math.round(snap.scrollY + card.top - (snap.viewport - inside));
        if (y < 0 || y > snap.maxScrollY) return null;
        if (Math.abs(snap.viewport - card.top - inside) <= 1) return snap;
        window.scrollTo({ top: y, behavior: "instant" });
        snap = await stableSnapshot();
      }
      return snap;
    },
    settle: async (from, timeoutMs) => {
      const deadline = performance.now() + timeoutMs;
      const check = (what: string) => {
        if (performance.now() > deadline) throw new Error(`${what} after ${timeoutMs}ms (scrollY ${window.scrollY})`);
      };
      while (from !== null && window.scrollY === from) {
        check("the page never scrolled");
        await nextFrame();
      }
      let last = window.scrollY;
      let still = 0;
      while (still < 3) {
        check("still scrolling");
        await nextFrame();
        if (window.scrollY === last) still++;
        else [last, still] = [window.scrollY, 0];
      }
    },
    stopRecording: () => {
      recording = false;
      return frames;
    },
  };
}

/** Installs the probe (and the e2e toolkit), opens the page and waits for the app. */
async function openCards(
  page: Page,
  path: string,
  { record = false, theme = "light" }: { record?: boolean; theme?: Theme } = {},
): Promise<void> {
  await page.addInitScript(installRevealProbe, { selector: CARD, record });
  await openView(page, path, { theme });
}

async function supportsScrollTimelines(page: Page): Promise<boolean> {
  return page.evaluate(() => CSS.supports("animation-timeline: view()"));
}

async function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => {
    if (!window.__reveal) throw new Error("reveal probe missing: open the page with openCards()");
    return window.__reveal.snapshot();
  });
}

async function scrollToY(page: Page, y: number): Promise<Snapshot> {
  return page.evaluate(async (top) => {
    if (!window.__reveal) throw new Error("reveal probe missing: open the page with openCards()");
    return window.__reveal.scrollTo(top);
  }, y);
}

async function placeCard(page: Page, index: number, inside: number): Promise<Snapshot | null> {
  return page.evaluate(
    async ({ i, px }) => {
      if (!window.__reveal) throw new Error("reveal probe missing: open the page with openCards()");
      return window.__reveal.placeCard(i, px);
    },
    { i: index, px: inside },
  );
}

async function settleScroll(page: Page, from: number | null, timeoutMs = 5000): Promise<void> {
  await page.evaluate(
    async ({ start, timeout }) => {
      if (!window.__reveal) throw new Error("reveal probe missing: open the page with openCards()");
      await window.__reveal.settle(start, timeout);
    },
    { start: from, timeout: timeoutMs },
  );
}

async function stopRecording(page: Page): Promise<FrameRecord[]> {
  return page.evaluate(() => {
    if (!window.__reveal) throw new Error("reveal probe missing: open the page with openCards()");
    return window.__reveal.stopRecording();
  });
}

const round = (value: number): number => Math.round(value * 1000) / 1000;
const describeCard = (card: CardState, snap: Snapshot): string =>
  `"${card.name}" (top ${Math.round(snap.viewport - card.top)}px inside the viewport at scrollY ${snap.scrollY}): ` +
  `opacity ${round(card.opacity)}, translate ${card.translate}, ${card.animations} animation(s)`;

/** Fully shown and not animated (reduced motion, print, no support). */
const isShown = (card: CardState): boolean => card.opacity === 1 && card.translate === "none" && card.animations === 0;
/** Part-way through the reveal: neither hidden nor shown, neither low nor in place. */
const isHalfWay = (card: CardState): boolean =>
  card.opacity > 0 && card.opacity < 1 && card.translateY > 0 && card.translateY < OFFSET_PX;

/** Cards not fully shown. */
function shownProblems(snap: Snapshot): string[] {
  return snap.cards.filter((card) => !isShown(card)).map((card) => describeCard(card, snap));
}

/**
 * Each card where the reveal says it should be for its position: waiting below the viewport,
 * fully shown once its top is 96px inside, part-way in between. The two pixels at each end of
 * the range are left out: sub-pixel layout puts them on either side.
 */
function revealProblems(snap: Snapshot): string[] {
  return snap.cards.flatMap((card) => {
    const inside = snap.viewport - card.top;
    const waiting = card.opacity === 0 && Math.abs(card.translateY - OFFSET_PX) < 0.01;
    // WebKit 26 ends a view timeline at the scroll padding, and at the one position where a card's bottom edge sits
    // exactly on it, it shows the animation's end state (translate: 0px) instead of letting go: the same look,
    // one pixel of scrolling. Found on 2026-10-30 when the About hero grew 2px and a scroll stop landed there.
    const atTimelineEnd = card.translate === "0px" && Math.abs(card.bottom - snap.scrollPaddingTop) < 0.5;
    const shown = card.opacity === 1 && (card.translate === "none" || atTimelineEnd);
    const between = card.opacity >= 0 && card.opacity <= 1 && card.translateY >= 0 && card.translateY <= OFFSET_PX;
    const ok = inside <= -2 ? waiting : inside >= REVEAL_PX + 2 ? shown : between;
    return ok ? [] : [describeCard(card, snap)];
  });
}

/**
 * Scrolls from the top to the bottom, a little under half a screen at a time, and hands each stop
 * to `visit`. The bottom is read again at every stop: lazy screenshots make the page grow.
 */
async function walkToBottom(page: Page, visit: (snap: Snapshot) => Promise<void> | void): Promise<void> {
  let snap = await scrollToY(page, 0);
  for (let stop = 0; stop < 200; stop++) {
    await visit(snap);
    if (snap.scrollY >= snap.maxScrollY) return;
    snap = await scrollToY(page, Math.min(snap.scrollY + Math.round(snap.viewport * 0.45), snap.maxScrollY));
  }
  throw new Error("never reached the bottom of the page");
}

/** The card's top sits `inside` px inside the viewport, give or take a pixel (sub-pixel layout, whole-pixel scrolling). */
function expectPlaced(snap: Snapshot, card: CardState, inside: number): void {
  const actual = snap.viewport - card.top;
  expect(
    Math.abs(actual - inside),
    `"${card.name}" placed ${inside}px inside the viewport (is ${actual}px)`,
  ).toBeLessThanOrEqual(1);
}

/** Places each card in turn half-way through its reveal (top 48px inside); cards the page cannot scroll there are skipped. */
async function eachCardHalfWay(page: Page, visit: (card: CardState, snap: Snapshot) => void): Promise<number> {
  const count = (await snapshot(page)).cards.length;
  let placed = 0;
  for (let index = 0; index < count; index++) {
    const snap = await placeCard(page, index, HALF_PX);
    const card = snap?.cards[index];
    if (!snap || !card) continue;
    expectPlaced(snap, card, HALF_PX);
    visit(card, snap);
    placed++;
  }
  return placed;
}

interface Violation {
  rule: string;
  /** CSS selector of the failing element. */
  target: string;
  /** axe's message (for colour-contrast: ratio and colours). */
  detail: string;
}

/** axe with the WCAG 2.2 A/AA rules, or only `rule` when given. */
async function wcagViolations(page: Page, rule?: string): Promise<Violation[]> {
  const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  const { violations } = await (rule ? builder.withRules([rule]) : builder).analyze();
  return violations.flatMap((violation) =>
    violation.nodes.map((node) => ({
      rule: violation.id,
      target: node.target.map((part) => (typeof part === "string" ? part : part.join(" > "))).join(" "),
      detail: node.any[0]?.message ?? node.failureSummary ?? "",
    })),
  );
}
const formatViolation = ({ rule, target, detail }: Violation): string => `${rule} ${target}: ${detail}`;

/**
 * Whether the element is inside card `index` or a card in the same row (cards side by side enter together),
 * and whether its box is fully inside the viewport.
 */
async function placeOf(page: Page, target: string, index: number): Promise<{ inCard: boolean; onScreen: boolean }> {
  return page.evaluate(
    ({ selector, cardSelector, cardIndex }) => {
      const element = document.querySelector(selector);
      if (!element) return { inCard: false, onScreen: false };
      const box = element.getBoundingClientRect();
      const cards = [...document.querySelectorAll(cardSelector)];
      const rowTop = cards[cardIndex]?.getBoundingClientRect().top;
      const inRow = (card: Element) =>
        rowTop !== undefined && Math.abs(card.getBoundingClientRect().top - rowTop) < 2 && card.contains(element);
      return {
        inCard: cards.some(inRow),
        onScreen: box.top >= 0 && box.bottom <= document.documentElement.clientHeight,
      };
    },
    { selector: target, cardSelector: CARD, cardIndex: index },
  );
}

/**
 * The axe artefact of an entering card (see the header): a colour-contrast hit on text inside a card that is still
 * fading in (opacity below 1) and is not fully on screen. Faint text that is fully on screen still counts.
 */
async function fadingOffScreen(page: Page, { rule, target }: Violation): Promise<boolean> {
  if (rule !== "color-contrast") return false;
  return page.evaluate(
    ({ selector, cardSelector }) => {
      const element = document.querySelector(selector);
      const card = element?.closest(cardSelector);
      if (!element || !card) return false;
      const box = element.getBoundingClientRect();
      const onScreen = box.top >= 0 && box.bottom <= document.documentElement.clientHeight;
      return Number(getComputedStyle(card).opacity) < 1 && !onScreen;
    },
    { selector: target, cardSelector: CARD },
  );
}

test.describe("motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });

  test("a case card far below the fold waits hidden, fades up over 96px of scrolling, then rests", async ({ page }) => {
    await openCards(page, VIEW_PATHS[VIEW.work]);
    const supported = await supportsScrollTimelines(page);
    const automotive = WORK_CASES.at(-1);
    if (!automotive) throw new Error("no case studies in WORK_CASES");
    await expect(page.getByRole("article", { name: automotive.title })).toHaveClass(/\breveal-on-scroll\b/);

    const atRest = await scrollToY(page, 0);
    const index = atRest.cards.findIndex((candidate) => candidate.name === automotive.title);
    const start = atRest.cards[index];
    if (!start) throw new Error(`no revealing card named "${automotive.title}"`);
    expect(start.top, "the card starts more than a reveal below the fold").toBeGreaterThan(atRest.viewport + REVEAL_PX);
    if (supported) {
      expect(start.opacity, "waiting below the fold: transparent").toBe(0);
      expect(start.translateY, "waiting below the fold: 16px low").toBeCloseTo(OFFSET_PX, 2);
    } else {
      expect(shownProblems(atRest), "no scroll-driven animations: every card shown").toEqual([]);
    }

    const half = await placeCard(page, index, HALF_PX);
    const halfCard = half?.cards[index];
    if (!half || !halfCard) throw new Error("the page does not scroll far enough to place the card");
    expectPlaced(half, halfCard, HALF_PX);
    if (supported) {
      expect(isHalfWay(halfCard), `half-way: part-way visible and part-way up: ${describeCard(halfCard, half)}`).toBe(
        true,
      );
    } else {
      expect(shownProblems(half), "no scroll-driven animations: every card shown").toEqual([]);
    }

    const inView = await placeCard(page, index, Math.round((half.viewport * 2) / 3));
    const restCard = inView?.cards[index];
    if (!restCard) throw new Error("the page does not scroll far enough to bring the card into view");
    expect(restCard.opacity, "well into view: fully shown").toBe(1);
    expect(restCard.translate, "well into view: in its place").toBe("none");

    const back = await scrollToY(page, 0);
    expect(back.cards[index]?.opacity, "scrolled back up: waiting again (it follows the scroll position)").toBe(
      supported ? 0 : 1,
    );
  });

  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const path of PAGES) {
      test(`${path} at ${viewportName} width: every card where its scroll position says, top to bottom`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await openCards(page, path);
        const supported = await supportsScrollTimelines(page);

        const problems: string[] = [];
        let stops = 0;
        await walkToBottom(page, (snap) => {
          expect(snap.cards.length, "revealing cards on the page").toBeGreaterThan(0);
          problems.push(...(supported ? revealProblems(snap) : shownProblems(snap)));
          stops++;
        });
        expect(stops, "scroll stops").toBeGreaterThan(1);
        expect(problems, supported ? "cards out of step with the scroll" : "cards not fully shown").toEqual([]);

        const halfWay: string[] = [];
        const placed = await eachCardHalfWay(page, (card, snap) => {
          if (!(supported ? isHalfWay(card) : isShown(card))) halfWay.push(describeCard(card, snap));
        });
        expect(placed, "cards placed half-way").toBeGreaterThan(0);
        expect(halfWay, supported ? "half-way cards that are not part-way" : "cards not fully shown").toEqual([]);
      });
    }
  }

  for (const [viewportName, viewport] of Object.entries({ desktop: VIEWPORTS.desktop, tall: TALL })) {
    for (const path of PAGES) {
      test(`${path} on a ${viewportName} screen: nothing moves at load, cards on the first screen are fully shown`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await openCards(page, path, { record: true });
        // A few more frames after the takeover and the fonts, then the record.
        await scrollToY(page, 0);
        const frames = await stopRecording(page);
        expect(frames.length, "frames recorded since the document started").toBeGreaterThan(2);

        // A card counts as inside once it has been fully inside for three frames running: animations
        // are sampled once per frame, so a layout shift (fonts, the takeover) shows up a frame late.
        const checked = new Set<string>();
        const problems: string[] = [];
        frames.forEach((frame, index) => {
          if (frame.scrollY !== 0) problems.push(`scrolled to ${frame.scrollY} at ${Math.round(frame.t)}ms`);
          frame.cards.forEach((card, cardIndex) => {
            const insideSince = [0, 1, 2].every((back) => {
              const earlierFrame = frames[index - back];
              const earlier = earlierFrame?.cards[cardIndex];
              return earlier !== undefined && earlier.top >= 0 && earlier.bottom <= (earlierFrame?.viewport ?? 0);
            });
            if (!insideSince) return;
            checked.add(card.name);
            if (card.opacity !== 1 || card.translateY !== 0) {
              problems.push(`${Math.round(frame.t)}ms: ${describeCard(card, frame)}`);
            }
          });
        });
        expect(problems, "cards on the first screen, frame by frame").toEqual([]);
        const last = frames.at(-1);
        const inside = last?.cards.filter((card) => card.top >= 0 && card.bottom <= last.viewport) ?? [];
        expect([...checked].sort(), "cards checked: every card inside the viewport at the end").toEqual(
          expect.arrayContaining(inside.map((card) => card.name)),
        );
        // Smart Ticket and Project Planning open with details, a summary and screens that do not fade: no card in 2000px.
        if (viewport === TALL && !NO_CARDS_ON_TALL_FIRST_SCREEN.has(path)) {
          expect(checked.size, "cards on the tall first screen").toBeGreaterThan(0);
        }
      });
    }
  }

  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test(`at ${viewportName} width, jumping to the case studies leaves the first case card fully shown`, async ({
      page,
    }) => {
      const first = WORK_CASES[0];
      if (!first) throw new Error("no case studies in WORK_CASES");
      await page.setViewportSize(viewport);
      const expectFirstCardShown = async (what: string) => {
        const snap = await snapshot(page);
        const card = snap.cards.find((candidate) => candidate.name === first.title);
        if (!card) throw new Error(`no revealing card named "${first.title}"`);
        expect(card.bottom > 0 && card.top < snap.viewport, `${what}: the first case card is in view`).toBe(true);
        expect(card.opacity, `${what}: ${describeCard(card, snap)}`).toBe(1);
        expect(card.translate, `${what}: ${describeCard(card, snap)}`).toBe("none");
      };

      await test.step("a link to /#enterprise-cases", async () => {
        await openCards(page, `${VIEW_PATHS[VIEW.work]}#enterprise-cases`);
        await settleScroll(page, null);
        expect(await page.evaluate(() => window.scrollY), "scrolled to the section").toBeGreaterThan(0);
        await expectFirstCardShown("after the link");
      });

      await test.step("the Explore Case Studies button", async () => {
        await scrollToY(page, 0);
        await page.getByRole("link", { name: "Explore Case Studies" }).click();
        await settleScroll(page, 0);
        await expectFirstCardShown("after the button");
      });
    });
  }

  for (const theme of THEMES) {
    for (const path of PAGES) {
      test(`${path} (${theme}): no WCAG violations while scrolling, half-revealed cards included`, async ({ page }) => {
        test.slow(); // axe runs several times on a long page
        await openCards(page, path, { theme });
        const found: string[] = [];
        const artefacts: string[] = [];
        const audit = async (what: string) => {
          const { scrollY } = await snapshot(page);
          for (const violation of await wcagViolations(page)) {
            const line = `${what} (scrollY ${scrollY}): ${formatViolation(violation)}`;
            ((await fadingOffScreen(page, violation)) ? artefacts : found).push(line);
          }
        };

        await audit("top");
        const { cards } = await snapshot(page);
        const middle = Math.floor(cards.length / 2);
        if (await placeCard(page, middle, HALF_PX)) await audit(`"${cards[middle]?.name ?? middle}" half-way`);
        // axe leaves out the contrast of cards still waiting below the fold (opacity 0); at the bottom
        // every card has been revealed, so this run checks them all.
        await walkToBottom(page, () => undefined);
        await audit("bottom");
        test.info().annotations.push({
          type: "colour-contrast on fading card text not fully on screen (axe artefact)",
          description: artefacts.join("\n") || "none",
        });
        expect(found, "axe WCAG 2.2 A/AA violations").toEqual([]);
      });

      test(`${path} (${theme}): early in a reveal, axe flags only the entering card's text that is not fully on screen`, async ({
        page,
      }) => {
        test.slow();
        await openCards(page, path, { theme });
        const { cards } = await snapshot(page);
        const index = Math.floor(cards.length / 2);
        const offScreen: string[] = [];
        const other: string[] = [];
        let audits = 0;
        for (const inside of EARLY_PX) {
          const snap = await placeCard(page, index, inside);
          const card = snap?.cards[index];
          if (!snap || !card) continue;
          expectPlaced(snap, card, inside);
          audits++;
          // Colour contrast only: every other rule is checked by the test above.
          for (const violation of await wcagViolations(page, "color-contrast")) {
            const { inCard, onScreen } = await placeOf(page, violation.target, index);
            const line = `top ${inside}px inside, opacity ${round(card.opacity)}: ${formatViolation(violation)}`;
            if (violation.rule === "color-contrast" && inCard && !onScreen) offScreen.push(line);
            else other.push(line);
          }
        }
        expect(audits, "audits early in a reveal").toBe(EARLY_PX.length);
        test.info().annotations.push({
          type: "colour-contrast on entering-card text not fully on screen",
          description: offScreen.join("\n") || "none",
        });
        expect(
          other,
          "colour-contrast failures other than faint entering-card text that is not fully on screen",
        ).toEqual([]);
      });
    }
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  for (const path of PAGES) {
    test(`${path}: every card fully shown, no animation, at any scroll position`, async ({ page }) => {
      await openCards(page, path);
      const problems: string[] = [];
      await walkToBottom(page, (snap) => {
        expect(snap.cards.length, "revealing cards on the page").toBeGreaterThan(0);
        problems.push(...shownProblems(snap));
      });
      await eachCardHalfWay(page, (card, snap) => {
        if (!isShown(card)) problems.push(describeCard(card, snap));
      });
      expect(problems, "cards not fully shown").toEqual([]);
    });
  }
});

test.describe("print", () => {
  // Motion allowed, so it is print that switches the reveal off.
  test.use({ reducedMotion: "no-preference" });

  for (const path of PAGES) {
    test(`${path}: every card fully shown`, async ({ page }) => {
      await openCards(page, path);
      await page.emulateMedia({ media: "print" });
      const snap = await scrollToY(page, 0);
      expect(snap.cards.length, "revealing cards on the page").toBeGreaterThan(0);
      expect(shownProblems(snap), "cards in print").toEqual([]);
    });
  }
});
