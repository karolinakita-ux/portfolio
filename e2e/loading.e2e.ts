/**
 * What the Work page downloads, in real browsers against the production build:
 * - no case-study screenshots until a visitor shows interest in a case (usePreloadCaseImages),
 *   then only that case's;
 * - every web font once (no font preload: see the last test).
 */
import { expect, test, type Page } from "@playwright/test";

import { waitForApp } from "./helpers/page.utils.ts";

/** A case screenshot: any image under /assets/cases/<case>/ that is not a thumbnail. */
const SCREENSHOT = /^\/assets\/cases\/[^/]+\/(?!thumbnail)[^/]+\.webp$/;

/** Paths of every request the page makes from now on. */
function requests(page: Page): string[] {
  const paths: string[] = [];
  page.on("request", (request) => paths.push(new URL(request.url()).pathname));
  return paths;
}

const cardLink = (page: Page, title: RegExp) =>
  page.getByRole("article", { name: title }).getByRole("link", { name: /^View/ });

test("loads no case screenshots until a visitor points at a case, then only that case's", async ({ page }) => {
  const paths = requests(page);
  await page.goto("/");
  await waitForApp(page);
  await page.waitForLoadState("networkidle");
  // The old background loading started on the first idle moment after load: give it that time.
  await page.waitForTimeout(1500);
  expect(paths.filter((path) => SCREENSHOT.test(path))).toEqual([]);

  await cardLink(page, /^Project Planning/).hover();
  await expect
    .poll(
      () => paths.filter((path) => SCREENSHOT.test(path) && path.startsWith("/assets/cases/project-planning/")).length,
    )
    .toBeGreaterThan(0);
  expect(paths.filter((path) => SCREENSHOT.test(path) && !path.startsWith("/assets/cases/project-planning/"))).toEqual(
    [],
  );
});

// No <link rel="preload"> for fonts: checked 2026-10-20, WebKit downloads a font preloaded with
// `crossorigin` twice, and Chromium and Firefox download it twice without. This keeps it that way.
test("downloads every web font once", async ({ page }) => {
  const paths = requests(page);
  await page.goto("/");
  await waitForApp(page);
  await page.waitForLoadState("networkidle");
  const fonts = paths.filter((path) => /\.woff2?$/.test(path));
  expect(fonts.length).toBeGreaterThan(0);
  expect(fonts).toEqual([...new Set(fonts)]);
  const loaded = await page.evaluate(() => [
    document.fonts.check('400 16px "Zilla Slab"'),
    document.fonts.check("400 16px Inter"),
  ]);
  expect(loaded).toEqual([true, true]);
});
