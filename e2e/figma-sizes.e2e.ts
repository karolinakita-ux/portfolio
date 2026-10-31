/**
 * Small sizes the site takes from Figma (Karolina, 2026-10-31), measured in every browser at the default text size,
 * where the site's rem is Figma's px:
 * - Badge: 22px tall in every tone, as Figma's fixed 22px frame (Label Small's 16px line, 2px padding and a 1px
 *   border, transparent on the neutral tone).
 * - Breadcrumb: 16px icons (the chevron, and the house on Home), 8px between a crumb and the chevron on each side.
 * - Bento card title: Title Medium in its own medium weight (500), not semibold.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

import { openView } from "./helpers/page.utils.ts";

const ABOUT = VIEW_PATHS[VIEW.about];
const THEME_GENERATOR = VIEW_PATHS[VIEW.caseDataGovernance];
const SMART_TICKET = VIEW_PATHS[VIEW.caseSmartTicket];
/** Theme Generator's first bento card: a success badge, a title and neutral tags. */
const BENTO_TITLE = "Self-Service Theming";
/** Figma's sizes in px. */
const BADGE_HEIGHT = 22;
const ICON = 16;
const GAP = 8;

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error(`not rendered: ${locator.toString()}`);
  return rect;
}

/** The root crumb's link, the chevron and the current page sit 8px apart; the icons are 16px squares. */
async function expectBreadcrumb(page: Page, root: string, current: string): Promise<void> {
  const nav = page.getByRole("navigation", { name: "Breadcrumb" });
  const link = await box(nav.getByRole("link", { name: root }));
  const chevron = await box(nav.getByRole("listitem").nth(1).locator("svg"));
  const here = await box(nav.getByText(current, { exact: true }));
  expect(chevron.width, "chevron width").toBeCloseTo(ICON, 0);
  expect(chevron.height, "chevron height").toBeCloseTo(ICON, 0);
  expect(chevron.x - (link.x + link.width), `gap after ${root}`).toBeCloseTo(GAP, 0);
  expect(here.x - (chevron.x + chevron.width), `gap before ${current}`).toBeCloseTo(GAP, 0);
}

test("success, warning and neutral badges are 22px tall, as in Figma (Theme Generator's bento cards)", async ({
  page,
}) => {
  await openView(page, THEME_GENERATOR);
  const card = (title: string) =>
    page.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3, name: title, exact: true }) });
  const badges: Array<[tone: string, badge: Locator]> = [
    ["success", card(BENTO_TITLE).getByText("Shipped · MVP", { exact: true })],
    ["warning", card("Colour-Vision Accessibility Preview").getByText("Phase 2 · Roadmap", { exact: true })],
    [
      "neutral",
      card(BENTO_TITLE)
        .getByRole("listitem")
        .filter({ hasText: /^Enterprise$/ }),
    ],
  ];
  for (const [tone, badge] of badges) {
    const { height } = await box(badge);
    expect(height, `${tone} badge`).toBeCloseTo(BADGE_HEIGHT, 0);
  }
});

test("an error badge is 22px tall too (Smart Ticket's before and after)", async ({ page }) => {
  await openView(page, SMART_TICKET);
  const { height } = await box(page.getByRole("listitem").filter({ hasText: /^3 text contrast failures$/ }));
  expect(height, "error badge").toBeCloseTo(BADGE_HEIGHT, 0);
});

test("a page's breadcrumb has a 16px house and chevron, 8px apart from the crumbs, as in Figma", async ({ page }) => {
  await openView(page, ABOUT);
  await expectBreadcrumb(page, "Home", "About");
  const house = await box(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link").locator("svg"));
  expect(house.width, "house width").toBeCloseTo(ICON, 0);
  expect(house.height, "house height").toBeCloseTo(ICON, 0);
});

test("a case study's breadcrumb has a 16px chevron, 8px apart from the crumbs, as in Figma", async ({ page }) => {
  await openView(page, THEME_GENERATOR);
  await expectBreadcrumb(page, "Work", "Theme Generator");
});

test("a bento card's title is Title Medium in its medium weight, as in Figma", async ({ page }) => {
  await openView(page, THEME_GENERATOR);
  const title = page.getByRole("heading", { level: 3, name: BENTO_TITLE, exact: true });
  await expect(title).toHaveCSS("font-size", "16px");
  await expect(title).toHaveCSS("line-height", "24px");
  await expect(title).toHaveCSS("font-weight", "500");
});
