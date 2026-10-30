/**
 * The CV page (/cv) in every browser: the sheet in both themes, light and alone in print (in two columns even on
 * a page narrower than md, as A4 is), the PDF download (its address and download attribute, and the server sends
 * a PDF), the hint for in-app browsers, the old /resume link, no sideways scrolling at 320px (WCAG 1.4.10), and
 * a section link that lands like other pages' sections. The ways to the CV: the Work hero's two buttons line up,
 * and on Contact the CV links sit as close to their label as LinkedIn's and keep "(2 pages)" on one line.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";

import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";
import { UA } from "#test/user-agents.ts";

import { THEMES } from "./helpers/helpers.constants.ts";
import type { Theme } from "./helpers/helpers.types.ts";
import { openView } from "./helpers/page.utils.ts";

const CV = VIEW_PATHS[VIEW.cv];
/**
 * PROFILE.cvPdfUrl and its label (profile.ts reads Vite's env, which Playwright's Node does not have). The label
 * has a no-break space in "2 pages"; Playwright matches names with any space.
 */
const PDF = "/karolina-kita-cv.pdf";
const DOWNLOAD = "Download PDF (2 pages)";
const PAGE_COUNT = /\(2\spages\)/;
const IN_APP_HINT = /^The PDF opens best in your phone’s browser/;

const { kitaBranding } = JSON.parse(
  readFileSync(join(process.cwd(), "src", "styles", "kita-branding.tokens.json"), "utf8"),
) as { kitaBranding: Record<Theme, Record<string, string | number>> };

/** A colour token as the browser reports a computed colour: rgb(r, g, b). */
function rgb(theme: Theme, token: string): string {
  const hex = kitaBranding[theme][token];
  if (typeof hex !== "string") throw new Error(`no colour ${token} in ${theme}`);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
  return `rgb(${String(r)}, ${String(g)}, ${String(b)})`;
}

const sheet = (page: Page) => page.getByRole("article", { name: "Karolina Kita" });

/** The Experience label sits beside the first job (Figma's two columns), not above it. */
async function expectTwoColumns(page: Page): Promise<void> {
  const label = await sheet(page).getByRole("heading", { level: 2, name: "Experience" }).boundingBox();
  const job = await sheet(page).getByRole("heading", { level: 3 }).first().boundingBox();
  if (!label || !job) throw new Error("no Experience label or first job");
  expect(label.x + label.width).toBeLessThan(job.x);
  expect(Math.abs(label.y - job.y)).toBeLessThan(job.height);
}

for (const theme of THEMES) {
  test(`${theme} theme: the CV sheet in the page's colours, in two columns on desktop`, async ({ page }) => {
    await openView(page, CV, { theme });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Karolina Kita");
    await expect(sheet(page)).toHaveCSS("background-color", rgb(theme, "bgCanvas"));
    await expect(sheet(page).getByRole("heading", { level: 1 })).toHaveCSS("color", rgb(theme, "textPrimary"));
    await expect(sheet(page).getByRole("heading", { level: 2 })).toHaveText([
      "Summary",
      "Experience",
      "Skills",
      "Education",
    ]);
    await expectTwoColumns(page);
  });
}

test("print: light whatever the theme, only the sheet, without its frame, in two columns on A4 width", async ({
  page,
}) => {
  await openView(page, CV, { theme: "dark" });
  // A4 inside the print margins is about 666px wide: narrower than md (768px).
  await page.setViewportSize({ width: 666, height: 900 });
  await page.emulateMedia({ media: "print" });
  await expect(sheet(page)).toHaveCSS("background-color", rgb("light", "bgCanvas"));
  await expect(sheet(page).getByRole("heading", { level: 1 })).toHaveCSS("color", rgb("light", "textPrimary"));
  await expect(sheet(page)).toHaveCSS("border-top-width", "0px");
  // shadow-none: Tailwind's shadow layers, each transparent and without size.
  const shadow = await sheet(page).evaluate((element) => getComputedStyle(element).boxShadow);
  expect(shadow.replaceAll("rgba(0, 0, 0, 0) 0px 0px 0px 0px", "").replace(/[,\s]/g, "") || "none").toBe("none");
  for (const hidden of [
    page.getByRole("link", { name: DOWNLOAD }),
    page.getByRole("navigation", { name: "Breadcrumb" }),
    page.getByRole("banner"),
    page.getByRole("contentinfo"),
  ])
    await expect(hidden).toBeHidden();
  await expectTwoColumns(page);
});

test("the Download button saves the PDF, which the server sends as a PDF", async ({ page }) => {
  await openView(page, CV);
  const link = page.getByRole("link", { name: DOWNLOAD });
  await expect(link).toHaveAttribute("href", PDF);
  await expect(link).toHaveAttribute("download", "");
  await expect(page.getByText(IN_APP_HINT)).toHaveCount(0);

  const response = await page.request.get(PDF);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect((await response.body()).subarray(0, 5).toString("latin1")).toBe("%PDF-");

  const [download] = await Promise.all([page.waitForEvent("download"), link.click()]);
  expect(download.suggestedFilename()).toBe("karolina-kita-cv.pdf");
});

test.describe("in Messenger's built-in browser on Android", () => {
  test.use({ userAgent: UA.messengerAndroid });

  test("says that the PDF opens best in the phone's browser, as the Download link's description", async ({ page }) => {
    await openView(page, CV);
    await expect(page.getByText(IN_APP_HINT)).toBeVisible();
    const link = page.getByRole("link", { name: DOWNLOAD });
    await expect(link).toBeVisible();
    await expect(link).toHaveAccessibleDescription(IN_APP_HINT);
  });
});

test("an old /resume link opens the CV", async ({ page }) => {
  await openView(page, "/resume");
  await expect(page).toHaveURL(/\/cv$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Karolina Kita");
});

for (const theme of THEMES) {
  test(`${theme} theme: no sideways scrolling at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openView(page, CV, { theme });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.getByRole("link", { name: DOWNLOAD })).toBeInViewport();
  });
}

/** Space between the sticky header and a section heading, once the page has stopped scrolling to it. */
async function gapUnderHeader(page: Page, path: string, heading: string): Promise<number> {
  await openView(page, path);
  const title = page.getByRole("heading", { level: 2, name: heading });
  await expect(title).toBeInViewport();
  const measure = async () => {
    const [header, box] = await Promise.all([page.getByRole("banner").boundingBox(), title.boundingBox()]);
    if (!header || !box) throw new Error(`no header or heading ${heading}`);
    return Math.round(box.y - (header.y + header.height));
  };
  let last = Number.NaN;
  await expect
    .poll(async () => {
      const [now, previous] = [await measure(), last];
      last = now;
      return now === previous;
    })
    .toBe(true);
  return last;
}

test("a link to a CV section leaves as much space under the header as a link to another page's section", async ({
  page,
}) => {
  const about = await gapUnderHeader(page, "/about#career", "Career Progression");
  const cv = await gapUnderHeader(page, CV + "#experience", "Experience");
  expect(about).toBeGreaterThan(0);
  expect(Math.abs(cv - about)).toBeLessThanOrEqual(1);
});

/** The Work hero's only two links: the case studies (primary), then the CV. */
const workHeroLinks = async (page: Page) => {
  const links = page.getByRole("region", { name: "Clarity for Complex Enterprise Software" }).getByRole("link");
  await expect(links).toHaveText(["Explore Case Studies", "View CV"]);
  const [cases, cv] = await Promise.all([links.nth(0).boundingBox(), links.nth(1).boundingBox()]);
  if (!cases || !cv) throw new Error("no hero buttons");
  return { cases, cv };
};

for (const width of [480, 1280]) {
  test(`${String(width)}px: the Work hero's two buttons sit in one row, at one height and bottom edge`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await openView(page, "/");
    const { cases, cv } = await workHeroLinks(page);
    expect(Math.abs(cases.y - cv.y), "side by side").toBeLessThan(1);
    expect(cv.x).toBeGreaterThan(cases.x + cases.width);
    expect(Math.abs(cases.height - cv.height)).toBeLessThan(0.5);
    expect(Math.abs(cases.y + cases.height - (cv.y + cv.height))).toBeLessThan(0.5);
  });
}

test("390px: the Work hero's two buttons stack, each as wide as its label", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openView(page, "/");
  const { cases, cv } = await workHeroLinks(page);
  expect(cv.y, "the CV under the case studies").toBeGreaterThan(cases.y + cases.height);
  expect(Math.abs(cases.x - cv.x), "one left edge").toBeLessThan(0.5);
  expect(cv.width).toBeLessThan(cases.width);
});

/** The tops of the lines that a link's "(2 pages)" sits on: one top when it does not break. */
const pageCountLines = (link: Locator) =>
  link.evaluate((element, source) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const pattern = new RegExp(source);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const match = pattern.exec(node.textContent ?? "");
      if (!match) continue;
      const range = document.createRange();
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      return [...new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)))];
    }
    throw new Error("no page count in the link");
  }, PAGE_COUNT.source);

/** Space from a Contact cell's label to the text of its first link (the text, not the link's padded box). */
const labelToLinkText = (page: Page, label: string) =>
  page.evaluate((label) => {
    const term = [...document.querySelectorAll("dt")].find((dt) => dt.textContent === label);
    const link = term?.nextElementSibling?.querySelector("a");
    if (!term || !link) throw new Error(`no Contact cell ${label}`);
    const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => (node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
    });
    const text = walker.nextNode();
    if (!text) throw new Error(`no text in the ${label} link`);
    const range = document.createRange();
    range.selectNodeContents(text);
    return range.getBoundingClientRect().top - term.getBoundingClientRect().bottom;
  }, label);

for (const width of [320, 1280]) {
  test(`${String(width)}px: on Contact the CV links sit like LinkedIn's under their label, "(2 pages)" on one line`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await openView(page, "/contact");
    const download = page.getByRole("main").getByRole("link", { name: DOWNLOAD });
    expect(await pageCountLines(download)).toHaveLength(1);
    const [cv, linkedin] = [await labelToLinkText(page, "CV"), await labelToLinkText(page, "LinkedIn Profile")];
    expect(Math.abs(cv - linkedin), `CV ${String(cv)}px, LinkedIn ${String(linkedin)}px`).toBeLessThanOrEqual(2);
  });
}

test('320px: the CV page\'s Download button keeps "(2 pages)" on one line', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openView(page, CV);
  expect(await pageCountLines(page.getByRole("link", { name: DOWNLOAD }))).toHaveLength(1);
});
