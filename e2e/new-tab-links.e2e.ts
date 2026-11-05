/**
 * Cmd or Ctrl + click on a link to another page of the site opens it in a new tab, in real browsers, and the page
 * the visitor is reading stays where it was. The app follows such a link in place only on a plain left click
 * (isPlainLeftClick); src/app/new-tab-links.test.tsx checks every link on every page in jsdom. Before 5.19.1 the
 * case cards, the previous / next links, Explore Case Studies and the logo opened their page in the same tab.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

import { openView } from "./helpers/page.utils.ts";

/**
 * Cmd + click on a Mac, Ctrl + click elsewhere; asserts that `link` opened `address` (path and hash) in a new tab
 * and that the page stayed on its path. Only the path: scrolling the link into view moves the address's hash to
 * the section in view (useSectionHash).
 */
async function opensInNewTab(page: Page, link: Locator, address: string): Promise<void> {
  const path = () => new URL(page.url()).pathname;
  const before = path();
  const [tab] = await Promise.all([page.context().waitForEvent("page"), link.click({ modifiers: ["ControlOrMeta"] })]);
  await tab.waitForLoadState("domcontentloaded");
  const opened = new URL(tab.url());
  expect(opened.pathname + opened.hash).toBe(address);
  await tab.close();
  expect(path()).toBe(before);
}

test("the Work page's links to other pages open in a new tab", async ({ page }) => {
  await openView(page, "/");
  await opensInNewTab(page, page.getByRole("link", { name: "View Case Study" }).first(), "/work/smart-ticket");
  await opensInNewTab(page, page.getByRole("link", { name: /^K\.Kita/ }), "/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Clarity for Complex Enterprise Software");
});

test("a case study's previous and next links open in a new tab", async ({ page }) => {
  await openView(page, "/work/automotive");
  const next = page.getByRole("link", { name: /^Next Case Study/ });
  await opensInNewTab(page, next.first(), "/work/project-planning");
  await opensInNewTab(page, next.last(), "/work/project-planning");
  await opensInNewTab(page, page.getByRole("link", { name: /^Previous Case Study/ }).last(), "/work/smart-ticket");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Automotive B2B Marketplace");

  await openView(page, "/work/smart-ticket");
  await opensInNewTab(page, page.getByRole("link", { name: "Back to All Work" }), "/#enterprise-cases");
});

test("About's Explore Case Studies opens the case list in a new tab", async ({ page }) => {
  await openView(page, "/about");
  await opensInNewTab(page, page.getByRole("link", { name: "Explore Case Studies" }).first(), "/#enterprise-cases");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Designing Clarity for Complex Software");
});
