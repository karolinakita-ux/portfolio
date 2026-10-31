/**
 * Closing the image viewer lands on the screenshot it shows (features/image-viewer landOnPage, features/case-studies
 * imagePlace), in real browsers, at desktop and phone widths:
 * - opened on a case's first screenshot and moved on twice, the close button and Escape land on the third: its row just
 *   below the sticky header with its description in view, focus on its button; Go to Description lands the same row
 *   with focus on its title;
 * - opening and closing without browsing moves nothing;
 * - with reduced motion the page is there at once;
 * - Go to Description starts the description below the header in every layout, also where the screenshot then sits
 *   below the window: a feature section taller than a phone's window (Project Planning), the operations console, whose
 *   figures hold only a caption (its section's heading), and a before / after column (its label). Close keeps the
 *   screenshot itself in view there;
 * - while the statistics consent box keeps space at the bottom (--kb-consent-h), the landing stays above it;
 * - Go to Description sits in the title row: beside Close from md, on a row of its own under it below md (Figma);
 * - on an Android phone in Messenger's in-app browser (tag @android): a swipe to the next screenshot, then a tap on
 *   Go to Description shows that screenshot's row.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { nextFrames, openView } from "./helpers/page.utils.ts";
import { straightPath, touchPath } from "./helpers/touch.utils.ts";

/** Automotive: one screenshot per row, each row with its title and description (ShowcaseRow). */
const CASE = VIEW_PATHS[VIEW.caseAutomotive];
const SHOT = /^View full size/;
const PHONE = { width: 390, height: 844 };
/** The space the consent box keeps at the bottom of a 390 x 844 phone is about 384px; a round 300px here. */
const CONSENT_SPACE = 300;

/** Waits until the page stops scrolling (a smooth scroll has ended): the scroll position still for 10 frames. */
const scrollSettled = (page: Page): Promise<number> =>
  page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const deadline = performance.now() + 4000;
    let last = window.scrollY;
    let still = 0;
    while (still < 10 && performance.now() < deadline) {
      await frame();
      if (Math.abs(window.scrollY - last) < 0.5) still++;
      else [still, last] = [0, window.scrollY];
    }
    return window.scrollY;
  });

/** Opens the screenshot and waits until the viewer shows it and stands still (the panel fades in with an 8px rise). */
async function openViewer(page: Page, shot: Locator) {
  await shot.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).not.toHaveClass(/opacity-0/);
  await dialog.evaluate(async (element) => {
    const running = [element, ...element.querySelectorAll("*")].flatMap((node) => node.getAnimations());
    await Promise.allSettled(running.map((animation) => animation.finished));
  });
  return dialog;
}

/** Where a screenshot's row sits in the window, with the space the sticky header and the consent box take. */
const placeOf = (shot: Locator) =>
  shot.evaluate((button) => {
    const row = button.closest("article");
    const heading = row?.querySelector("h3");
    const description = row?.querySelector("p");
    if (!row || !heading || !description) throw new Error("the screenshot has no row with a title and a description");
    const header = document.querySelector("header")?.getBoundingClientRect();
    const padding = getComputedStyle(document.documentElement);
    return {
      clear: parseFloat(padding.scrollPaddingTop),
      bottom: window.innerHeight - (parseFloat(padding.scrollPaddingBottom) || 0),
      headerBottom: header?.bottom ?? 0,
      row: row.getBoundingClientRect().top,
      heading: heading.getBoundingClientRect().top,
      description: description.getBoundingClientRect(),
      shot: button.getBoundingClientRect(),
    };
  });

/**
 * The row starts just below the header, its title and the start of its description show above the bottom of the free
 * band (the window's, or the consent box's top), and so does the screenshot. Focus: the screenshot's button, or the
 * row's title after Go to Description.
 */
async function expectLandedOn(page: Page, shot: Locator, focus: "image" | "title" = "image") {
  await expect(focus === "image" ? shot : shot.locator("xpath=ancestor::article[1]").locator("h3")).toBeFocused();
  await scrollSettled(page);
  const place = await placeOf(shot);
  expect(Math.abs(place.row - place.clear), "the row just below the header").toBeLessThanOrEqual(2);
  expect(place.row, "below the header").toBeGreaterThanOrEqual(place.headerBottom - 1);
  expect(place.heading, "its title in view").toBeGreaterThanOrEqual(place.headerBottom - 1);
  expect(place.description.top, "its description in view").toBeLessThan(place.bottom - 40);
  expect(place.shot.top, "the screenshot in view").toBeLessThan(place.bottom);
}

const WAYS = {
  "the close button": (dialog: Locator) => dialog.getByRole("button", { name: "Close image viewer" }).click(),
  Escape: (dialog: Locator) => dialog.page().keyboard.press("Escape"),
  "Go to Description": (dialog: Locator) => dialog.getByRole("button", { name: "Go to Description" }).click(),
};

/**
 * Opens the viewer on a screenshot (its card id), moves `steps` images on (back while negative) and closes it with
 * `way`. Returns the title of the image it closed on.
 */
async function browseAndClose(page: Page, id: string, steps: number, way: keyof typeof WAYS) {
  const dialog = await openViewer(page, page.locator(`button[data-image="${id}"]`));
  for (let step = 0; step < Math.abs(steps); step++) await page.keyboard.press(steps > 0 ? "ArrowRight" : "ArrowLeft");
  const title = await dialog.getByRole("heading", { level: 2 }).textContent();
  await WAYS[way](dialog);
  await expect(dialog).toBeHidden();
  await scrollSettled(page);
  return title ?? "";
}

/**
 * The focused element and the window's free band: below the header, above the consent box's space. `start`: where
 * the description it starts begins, the top of its image's area (a row, a feature section's columns, a comparison
 * column) or else its own top less the room its scroll margin keeps for the eyebrow (a section's heading).
 */
const focusedPlace = (page: Page) =>
  page.evaluate(() => {
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement)) throw new Error("nothing has focus");
    const padding = getComputedStyle(document.documentElement);
    const box = focused.getBoundingClientRect();
    const area = focused.closest("[data-image-area]");
    return {
      tag: focused.tagName,
      text: focused.textContent.trim(),
      image: focused.dataset.image ?? null,
      top: box.top,
      bottom: box.bottom,
      start: area
        ? area.getBoundingClientRect().top
        : box.top - (parseFloat(getComputedStyle(focused).scrollMarginTop) || 0),
      headerBottom: document.querySelector("header")?.getBoundingClientRect().bottom ?? 0,
      clear: parseFloat(padding.scrollPaddingTop),
      end: window.innerHeight - (parseFloat(padding.scrollPaddingBottom) || 0),
    };
  });

/** The description's start has focus, its text starts at the top of the free band, and all of it shows. */
async function expectDescriptionShown(page: Page, tag: string, text: string | RegExp) {
  const place = await focusedPlace(page);
  expect(place.tag, "focus on the description's start").toBe(tag);
  expect(place.text).toMatch(text);
  expect(Math.abs(place.start - place.clear), "the description just below the header").toBeLessThanOrEqual(2);
  expect(place.top, "below the header").toBeGreaterThanOrEqual(place.headerBottom - 1);
  expect(place.bottom, "above the bottom of the window").toBeLessThan(place.end);
}

for (const [size, viewport] of [
  ["desktop", null],
  ["phone", PHONE],
] as const) {
  test.describe(`at ${size} width`, () => {
    if (viewport) test.use({ viewport });

    test.describe("Automotive", () => {
      test.beforeEach(async ({ page }) => {
        await openView(page, CASE);
      });

      for (const [way, close] of Object.entries(WAYS)) {
        test(`${way} lands on the third screenshot after browsing to it`, async ({ page }) => {
          const shots = page.getByRole("button", { name: SHOT });
          const dialog = await openViewer(page, shots.first());
          await page.keyboard.press("ArrowRight");
          await page.keyboard.press("ArrowRight");
          await expect(dialog.getByText(/^3 \/ \d+$/)).toBeVisible();
          const before = await page.evaluate(() => window.scrollY);

          await close(dialog);
          await expect(dialog).toBeHidden();
          await expectLandedOn(page, shots.nth(2), way === "Go to Description" ? "title" : "image");
          expect(await page.evaluate(() => window.scrollY), "the page moved down to it").toBeGreaterThan(before);
        });
      }

      test("opening and closing without browsing moves nothing", async ({ page }) => {
        const first = page.getByRole("button", { name: SHOT }).first();
        await first.scrollIntoViewIfNeeded();
        const before = await page.evaluate(() => window.scrollY);
        for (const close of [WAYS["the close button"], WAYS.Escape]) {
          const dialog = await openViewer(page, first);
          await close(dialog);
          await expect(dialog).toBeHidden();
          await expect(first).toBeFocused();
          expect(await scrollSettled(page)).toBe(before);
        }
      });

      test("with reduced motion the page is there at once", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        const shots = page.getByRole("button", { name: SHOT });
        const dialog = await openViewer(page, shots.first());
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await dialog.getByRole("button", { name: "Close image viewer" }).click();
        await expect(shots.nth(2)).toBeFocused();
        await nextFrames(page, 1);
        const landed = await page.evaluate(() => window.scrollY);
        expect(await scrollSettled(page)).toBe(landed);
        await expectLandedOn(page, shots.nth(2));
      });

      test("keeps the landing above the statistics consent box while it keeps space at the bottom", async ({
        page,
      }) => {
        /** What useConsentSpace publishes while the box shows (the e2e pages never show the box itself). */
        const keepSpace = (space: number | null) =>
          page.evaluate((px) => {
            if (px === null) document.documentElement.style.removeProperty("--kb-consent-h");
            else document.documentElement.style.setProperty("--kb-consent-h", String(px) + "px");
          }, space);
        await keepSpace(CONSENT_SPACE);
        const shots = page.getByRole("button", { name: SHOT });
        // Close: the screenshot starts between the header and the box (its row from the top where that leaves the
        // screenshot above the box; else the screenshot's end at the box's top).
        await browseAndClose(page, "multi-market-survey", 2, "the close button");
        const shot = await focusedPlace(page);
        expect(shot.image, "focus on the third screenshot").toBe("b2b-persona");
        expect(shot.end, "the band ends at the consent box's space").toBe(
          (viewport ?? { height: 800 }).height - CONSENT_SPACE,
        );
        expect(shot.top, "the screenshot below the header").toBeGreaterThanOrEqual(shot.headerBottom - 1);
        expect(shot.top, "the screenshot starts above the box").toBeLessThan(shot.end - 40);

        // A row that shows in full in the window, its lower part where the box is: Go to Description moves it up below
        // the header. Measured against the window alone, it would stay where it is, half behind the box. The box keeps
        // its space from when the viewer is open: before, the click that opens the viewer would scroll the screenshot
        // clear of it already (Firefox, WebKit).
        await keepSpace(null);
        await shots.nth(4).evaluate((shot) => {
          const row = shot.closest("article")?.getBoundingClientRect();
          if (row) window.scrollTo({ top: window.scrollY + row.bottom - window.innerHeight + 8, behavior: "instant" });
        });
        await scrollSettled(page);
        const dialog = await openViewer(page, shots.nth(4));
        await keepSpace(CONSENT_SPACE);
        await WAYS["Go to Description"](dialog);
        await expect(dialog).toBeHidden();
        await expectLandedOn(page, shots.nth(4), "title");
      });
    });

    // Each opens the viewer on a screenshot far from the one it closes on, so the page has to move to it.
    test.describe("Go to Description in the other layouts", () => {
      for (const { from, steps, heading } of [
        // The second screenshot of a section, from the case's last one: its section starts above the window.
        { from: "projects-budget-table", steps: -4, heading: "A Calm Interface for People Who Read Numbers All Day" },
        // The only screenshot of its section, and the second of the last section, from the first.
        { from: "brand-primary-actions", steps: 3, heading: "Goals & Milestones Timeline (Proposal)" },
        { from: "brand-primary-actions", steps: 5, heading: "From One Project’s Budget to the Whole Portfolio" },
      ]) {
        test(`Project Planning: lands on the feature section's heading, ${heading}`, async ({ page }) => {
          await openView(page, VIEW_PATHS[VIEW.caseProjectPlanning]);
          await browseAndClose(page, from, steps, "Go to Description");
          await expectDescriptionShown(page, "H2", heading);
        });
      }

      test("Project Planning: Close keeps the whole screenshot in view instead", async ({ page }) => {
        await openView(page, VIEW_PATHS[VIEW.caseProjectPlanning]);
        await browseAndClose(page, "brand-primary-actions", 3, "the close button");
        const place = await focusedPlace(page);
        expect(place.image).toBe("goals-milestones-timeline");
        expect(place.top, "the screenshot below the header").toBeGreaterThanOrEqual(place.headerBottom - 1);
        expect(place.bottom, "all of it in the window").toBeLessThanOrEqual(place.end + 2);
      });

      test("the operations console: lands on its section's heading, not on the screen's caption", async ({ page }) => {
        await openView(page, VIEW_PATHS[VIEW.caseSmartTicket]);
        // The console's last two screens, far below its heading and text.
        const title = await browseAndClose(page, "admin-audit-trail", 1, "Go to Description");
        expect(title).toMatch(/^Admin \//);
        await expectDescriptionShown(page, "H2", "Run the Network (Operations Console)");

        await browseAndClose(page, "admin-audit-trail", 1, "the close button");
        const screen = await focusedPlace(page);
        expect(screen.image, "Close: focus on the screen").toBe("admin-app-security");
        expect(screen.top).toBeGreaterThanOrEqual(screen.headerBottom - 1);
        expect(screen.bottom).toBeLessThanOrEqual(screen.end + 2);
      });

      test("a before / after comparison: lands on the column's label", async ({ page }) => {
        await openView(page, VIEW_PATHS[VIEW.caseSmartTicket]);
        // Back from the operations console's first screen to the first comparison's first "after" screen.
        await browseAndClose(page, "admin-operations-dashboard", -11, "Go to Description");
        await expectDescriptionShown(page, "P", /^2026 Decision$/i);
        const ownColumn = await page.evaluate(
          () =>
            document.activeElement
              ?.closest("[data-image-area]")
              ?.querySelector('[data-image="create-account-details-light"]') != null,
        );
        expect(ownColumn, "the label of the screen's own column").toBe(true);
      });
    });
  });
}

test("Go to Description sits beside Close from md, and on a row of its own under it on a phone", async ({ page }) => {
  await openView(page, CASE);
  const rowOf = async (dialog: Locator) => {
    const box = async (name: string) => {
      const found = await dialog.getByRole("button", { name }).boundingBox();
      if (!found) throw new Error(name + " has no box");
      return found;
    };
    const title = await dialog.getByRole("heading", { level: 2 }).boundingBox();
    return { close: await box("Close image viewer"), describe: await box("Go to Description"), title };
  };

  let dialog = await openViewer(page, page.getByRole("button", { name: SHOT }).first());
  const wide = await rowOf(dialog);
  // One row: Go to Description, then Close 8px to its right, Close centred against it.
  expect(wide.describe.x + wide.describe.width + 8).toBeCloseTo(wide.close.x, 0);
  expect(wide.close.y + wide.close.height / 2).toBeCloseTo(wide.describe.y + wide.describe.height / 2, 0);
  await page.keyboard.press("Escape");

  await page.setViewportSize(PHONE);
  dialog = await openViewer(page, page.getByRole("button", { name: SHOT }).first());
  const narrow = await rowOf(dialog);
  // Below Close, 4px down, its right edge lined up with Close's; the title keeps the row beside Close.
  expect(narrow.describe.y).toBeCloseTo(
    Math.max(narrow.close.y + narrow.close.height, (narrow.title?.y ?? 0) + (narrow.title?.height ?? 0)) + 4,
    0,
  );
  expect(narrow.describe.x + narrow.describe.width).toBeCloseTo(narrow.close.x + narrow.close.width, 0);
  // The panel fits the window with a one-line title: no scrolling inside the dialog.
  expect(await dialog.evaluate((element) => element.scrollHeight - element.clientHeight)).toBeLessThanOrEqual(0);
});

test.describe("on an Android phone in Messenger", { tag: "@android" }, () => {
  test("a swipe to the next screenshot, then Go to Description shows that screenshot's row", async ({ page }) => {
    await openView(page, CASE);
    const shots = page.getByRole("button", { name: SHOT });
    await shots.first().tap();
    const dialog = page.getByRole("dialog");
    const image = dialog.locator("img");
    await expect(image).not.toHaveClass(/opacity-0/);
    const box = await image.boundingBox();
    if (!box) throw new Error("the image has no box");
    const y = box.y + box.height / 2;
    const x = box.x + box.width / 2;
    await touchPath(page, straightPath({ x: x + 120, y }, { x: x - 120, y }));
    await expect(dialog.getByText(/^2 \/ \d+$/)).toBeVisible();

    await dialog.getByRole("button", { name: "Go to Description" }).tap();
    await expect(dialog).toBeHidden();
    await expectLandedOn(page, shots.nth(1), "title");
  });

  test("a phone-tall feature section: Go to Description shows its heading", async ({ page }) => {
    await openView(page, VIEW_PATHS[VIEW.caseProjectPlanning]);
    await page.locator('button[data-image="brand-primary-actions"]').tap();
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("img")).not.toHaveClass(/opacity-0/);
    for (let step = 0; step < 3; step++) await dialog.getByRole("button", { name: "Next image" }).tap();
    await expect(dialog.getByText(/^4 \/ \d+$/)).toBeVisible();
    await dialog.getByRole("button", { name: "Go to Description" }).tap();
    await expect(dialog).toBeHidden();
    await scrollSettled(page);
    await expectDescriptionShown(page, "H2", "Goals & Milestones Timeline (Proposal)");
  });
});
