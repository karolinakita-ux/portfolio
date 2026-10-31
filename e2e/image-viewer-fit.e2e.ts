/**
 * The image viewer's panel fits the window (lightbox.css .kb-lightbox-pane: the image pane takes the height the title
 * rows and the toolbar leave), in real browsers, with the case studies' longest screenshot titles:
 * - on a phone, a small phone and desktop: the title row (Go to Description on a row of its own below md), the image
 *   and the toolbar show in full, and the dialog does not scroll either way;
 * - on a 390px phone at 200% page zoom (195px) or with a 200% text size, where the toolbar takes two rows, too: the
 *   counter shares Close's row and the title takes the full width under them (LightboxHeader);
 * - Previous / Next stay in place from image to image, whatever the title's length;
 * - Go to Description's label, wrapped at a 200% text size, keeps its lines to the end, under Close.
 */
import { expect, test, type Browser, type Locator, type Page } from "@playwright/test";

import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { nextFrames, openView } from "./helpers/page.utils.ts";

interface Size {
  name: string;
  width: number;
  height: number;
  touch: boolean;
  /** The browser's own text size (Chromium's DevTools protocol), as yarn a11y's large-text check sets it. */
  fontSize?: number;
  /** Narrower than viewer-toolbar: the title under the counter and Close. */
  stacked: boolean;
}

const SIZES: Size[] = [
  { name: "a phone (390 x 844)", width: 390, height: 844, touch: true, stacked: false },
  { name: "a small phone (320 x 568)", width: 320, height: 568, touch: true, stacked: false },
  { name: "a phone at 200% page zoom (195 x 422)", width: 195, height: 422, touch: true, stacked: true },
  { name: "a phone with a 200% text size", width: 390, height: 844, touch: true, fontSize: 32, stacked: true },
  { name: "desktop (1280 x 800)", width: 1280, height: 800, touch: false, stacked: false },
];

/** The longest titles: 5 lines at 195px, 3 beside Close at 320px. */
const LONGEST = [
  {
    path: VIEW_PATHS[VIEW.caseDataGovernance],
    shot: /^View full size: State rules for 4 brand colours/,
    title: "Automated Component States from One Base Colour",
  },
  {
    path: VIEW_PATHS[VIEW.caseSmartTicket],
    shot: /^View full size: Automated transit feeds/,
    title: "Admin / Automated Transit Feeds & Alerts Engine",
  },
];

/**
 * A page at the size. Chromium keeps a 15px classic scrollbar beside the page, which narrows a 195px window by 8%,
 * unless it plays a phone (isMobile), whose scrollbars overlay the page as phones' do.
 */
async function pageAt(browser: Browser, browserName: string, size: Size): Promise<Page> {
  const context = await browser.newContext({
    hasTouch: size.touch,
    isMobile: size.touch && browserName === "chromium",
    viewport: { width: size.width, height: size.height },
  });
  const page = await context.newPage();
  if (size.fontSize) {
    const devtools = await context.newCDPSession(page);
    await devtools.send("Page.enable");
    await devtools.send("Page.setFontSizes", { fontSizes: { standard: size.fontSize, fixed: 26 } });
  }
  return page;
}

/** Waits until the viewer's image shows and stands still (the panel fades in with an 8px rise, images slide in). */
async function settle(page: Page, dialog: Locator) {
  await expect(dialog.locator("img")).not.toHaveClass(/opacity-0/);
  await dialog.evaluate(async (element) => {
    const running = [element, ...element.querySelectorAll("*")].flatMap((node) => node.getAnimations());
    await Promise.allSettled(running.map((animation) => animation.finished));
  });
  await nextFrames(page, 2);
}

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("no box");
  return box;
}

/** Where each line of a button's label ends (its right edge), top line first. */
const labelLines = (button: Locator) =>
  button.evaluate((element) => {
    const text = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
    if (!text) return [];
    const range = document.createRange();
    range.selectNodeContents(text);
    const ends = new Map<number, number>();
    for (const line of range.getClientRects()) {
      const top = Math.round(line.top);
      ends.set(top, Math.max(ends.get(top) ?? 0, line.right));
    }
    return [...ends.values()];
  });

/** Everything inside the panel, the panel inside the window, and no scrolling in the dialog. */
async function expectFits(dialog: Locator, size: Size) {
  const fit = await dialog.evaluate((element) => {
    const figure = element.querySelector("figure");
    const pane = element.querySelector(".kb-lightbox-pane");
    const image = element.querySelector("img");
    if (!figure || !pane || !image) throw new Error("the viewer has no panel, pane or image");
    const inside = (inner: DOMRect, outer: DOMRect) =>
      inner.top >= outer.top - 0.5 &&
      inner.bottom <= outer.bottom + 0.5 &&
      inner.left >= outer.left - 0.5 &&
      inner.right <= outer.right + 0.5;
    const shown = image.getBoundingClientRect();
    return {
      down: element.scrollHeight - element.clientHeight,
      across: element.scrollWidth - element.clientWidth,
      panelInWindow: inside(figure.getBoundingClientRect(), new DOMRect(0, 0, innerWidth, innerHeight)),
      imageInPane: inside(shown, pane.getBoundingClientRect()),
      imageSize: Math.min(shown.width, shown.height),
    };
  });
  expect(fit.down, "the dialog does not scroll down").toBeLessThanOrEqual(0);
  expect(fit.across, "the dialog does not scroll sideways").toBeLessThanOrEqual(0);
  expect(fit.panelInWindow, "the panel inside the window").toBe(true);
  expect(fit.imageInPane, "the fitted image inside its pane").toBe(true);
  expect(fit.imageSize, "the image shows").toBeGreaterThan(16);

  const panel = await boxOf(dialog.getByRole("figure"));
  const close = await boxOf(dialog.getByRole("button", { name: "Close image viewer" }));
  const describe = await boxOf(dialog.getByRole("button", { name: "Go to Description" }));
  const next = await boxOf(dialog.getByRole("button", { name: "Next image" }));
  const title = await boxOf(dialog.getByRole("heading", { level: 2 }));
  for (const box of [close, describe, next, title]) {
    expect(box.y, "inside the panel").toBeGreaterThanOrEqual(panel.y);
    expect(box.y + box.height, "inside the panel").toBeLessThanOrEqual(panel.y + panel.height + 0.5);
  }
  // Wrapped at a large text size, Go to Description's lines keep to the end, under Close, not centred in the row.
  const lines = await labelLines(dialog.getByRole("button", { name: "Go to Description" }));
  if (size.fontSize) expect(lines.length, "the label wraps at a 200% text size").toBeGreaterThan(1);
  for (const right of lines) expect(Math.max(...lines) - right, "each line ends at the end").toBeLessThanOrEqual(1);
  if (size.stacked) {
    expect(title.y, "the title under Close").toBeGreaterThanOrEqual(close.y + close.height);
    const counter = await boxOf(dialog.getByText(/^\d+ \/ \d+$/));
    const middle = (box: { y: number; height: number }) => box.y + box.height / 2;
    expect(Math.abs(middle(counter) - middle(close)), "the counter beside Close").toBeLessThanOrEqual(1);
  } else {
    expect(title.y, "the title beside Close").toBeLessThan(close.y + close.height);
  }
}

for (const size of SIZES) {
  test(`on ${size.name} the viewer fits the window with the longest titles`, async ({ browser, browserName }) => {
    test.skip(!!size.fontSize && browserName !== "chromium", "the text size is set through Chromium's protocol");
    const page = await pageAt(browser, browserName, size);
    for (const { path, shot, title } of LONGEST) {
      await openView(page, path);
      if (size.fontSize)
        expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe("32px");
      await page.getByRole("button", { name: shot }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(title);
      await settle(page, dialog);
      await expectFits(dialog, size);

      // Another title, another length: the toolbar stays where it was.
      const next = dialog.getByRole("button", { name: "Next image" });
      const before = await boxOf(next);
      await page.keyboard.press("ArrowRight");
      await expect(dialog.getByRole("heading", { level: 2 })).not.toHaveText(title);
      await settle(page, dialog);
      expect(await boxOf(next), "Next stays in place").toEqual(before);
      await expectFits(dialog, size);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
    await page.context().close();
  });
}
