/**
 * The CV as a PDF, made from the /cv page: `yarn cv-pdf`. Run it after changing the CV's content
 * (src/features/cv/cv.content.ts) or its styles, and commit both files it writes:
 *   public/karolina-kita-cv.pdf   A4, always light; tagged (headings, lists, links, the Polish consent marked as
 *                                 Polish), with a document outline from the headings and clickable links
 *   scripts/cv-pdf.lock.json      hashes of the sheet's text and of its elements and classes, and the page count
 * src/app/seo/cv-pdf.test.tsx compares the lock with the page, so `yarn verify` fails when the CV's text, markup or
 * classes changed and the PDF did not. It cannot see a change in tokens.css or print.css: after one of those, run
 * this by hand. Netlify never runs it: the PDF is committed, like the favicons. Every run writes a new file
 * (Chromium stamps the date into it), so run it only when the CV changed.
 *
 * How: a production build in node_modules/.tmp/cv-pdf (never dist/), served by Vite's preview server, opened in
 * Playwright's Chromium in the light theme with reduced motion and printed by Chromium's own PDF writer. Links that
 * carry data-pdf-href (the portfolio link, tagged ?ref=cv) get that address first. When the CV no longer fits
 * MAX_PAGES pages, or a link would not work from a PDF, it stops and writes nothing.
 */
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { chromium, type Page } from "playwright";
import { build, preview } from "vite";

import { CV_PDF_ATTRIBUTE, CV_SHEET_ID } from "#features/cv/cv.constants.ts";
import { THEME_STORAGE_KEY } from "#shared/hooks/theme/theme.constants.ts";
import { VIEW, VIEW_PATHS } from "#shared/lib/routes/routes.constants.ts";

const OUT_DIR = "node_modules/.tmp/cv-pdf";
const PDF = "public/karolina-kita-cv.pdf";
const LOCK = "scripts/cv-pdf.lock.json";
/** The Download buttons say "(2 pages)" (PROFILE.cvPdfPages); a third page needs shorter copy, not a longer PDF. */
const MAX_PAGES = 2;
/** Figma's CV frame at 96 dpi: 48px at the top, 64px at the sides and at the bottom, where the footer sits. */
const MARGIN = { top: "12.7mm", right: "16.93mm", bottom: "16.93mm", left: "16.93mm" };
/** The footer's type style and colour in Figma (Label/Small, text/secondary), as token utilities. */
const FOOTER_CLASSES = ["text-label-sm", "text-text-secondary"];

const SHEET = "#" + CV_SHEET_ID;

/**
 * The PDF's page: its margins, and the footer in the bottom margin: the name and role on the left, "1 / 2" on the
 * right. CSS margin boxes use the page's own web fonts, which Chromium's header and footer templates cannot load.
 * Chromium writes the right box first, so it ends with a kept space: text extractors then read "1 / 2 Karolina
 * Kita", not "1 / 2Karolina". JSON.stringify makes a CSS string.
 */
const pageCss = (footer: string, font: string): string => `@page {
  margin: ${MARGIN.top} ${MARGIN.right} ${MARGIN.bottom} ${MARGIN.left};
  @bottom-left { content: ${JSON.stringify(footer)}; ${font} }
  @bottom-right { content: counter(page) " / " counter(pages) " "; white-space: pre; ${font} }
}`;

/** Hashed the same way as src/app/seo/cv-pdf.test.tsx does. */
const hash = (text: string): string => "sha256-" + createHash("sha256").update(text).digest("hex");

/** Pages in a PDF from Chromium: one /Type /Page object each (the page tree is /Type /Pages). */
const pageCount = (pdf: Buffer): number => pdf.toString("latin1").match(/\/Type\s*\/Page(?![a-zA-Z])/g)?.length ?? 0;

async function openCv(page: Page, base: string): Promise<void> {
  await page.goto(new URL(VIEW_PATHS[VIEW.cv].slice(1), base).href, { waitUntil: "networkidle" });
  await page.locator(SHEET).locator("h1").waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/**
 * The footer's font and colour as CSS, read from an element with FOOTER_CLASSES in print: theme.css inlines the
 * tokens into the utilities, so there are no type variables to read, and a token change in Figma reaches the footer.
 */
async function footerFont(page: Page): Promise<string> {
  const font = await page.evaluate(
    ({ sheet, classes }) => {
      const selectors = new Set<string>();
      const collect = (rules: CSSRuleList): void => {
        for (const rule of rules) {
          if (rule instanceof CSSStyleRule) selectors.add(rule.selectorText);
          if ("cssRules" in rule) collect(rule.cssRules as CSSRuleList);
        }
      };
      for (const styleSheet of document.styleSheets) collect(styleSheet.cssRules);
      const missing = classes.filter((name) => !selectors.has("." + name));
      if (missing.length) return { missing, css: "" };
      const probe = document.createElement("span");
      probe.className = classes.join(" ");
      document.querySelector(sheet)?.append(probe);
      const style = getComputedStyle(probe);
      const css = `font: ${style.fontWeight} ${style.fontSize}/${style.lineHeight} ${style.fontFamily}; letter-spacing: ${style.letterSpacing}; color: ${style.color};`;
      probe.remove();
      return { missing, css };
    },
    { sheet: SHEET, classes: FOOTER_CLASSES },
  );
  if (font.missing.length) throw new Error(`cv-pdf: no footer style in the build: ${font.missing.join(", ")}`);
  return font.css;
}

/** Gives the PDF its own addresses (data-pdf-href) and checks that every link it shows works from a file. */
async function preparePdfLinks(page: Page): Promise<void> {
  const broken = await page.evaluate(
    ({ sheet, attribute }) => {
      for (const link of document.querySelectorAll<HTMLAnchorElement>(`${sheet} a[${attribute}]`))
        link.setAttribute("href", link.getAttribute(attribute) ?? "");
      return [...document.querySelectorAll<HTMLAnchorElement>(`${sheet} a`)]
        .filter((link) => link.checkVisibility())
        .map((link) => link.getAttribute("href") ?? "")
        .filter((href) => !/^(?:https:\/\/|mailto:)/.test(href));
    },
    { sheet: SHEET, attribute: CV_PDF_ATTRIBUTE.href },
  );
  if (broken.length) throw new Error(`cv-pdf: links that would not work in the PDF: ${broken.join(", ")}`);
}

async function main(): Promise<void> {
  await build({ build: { outDir: OUT_DIR, emptyOutDir: true }, logLevel: "warn" });
  const server = await preview({
    build: { outDir: OUT_DIR },
    preview: { host: "127.0.0.1", port: 5197, strictPort: false },
    logLevel: "warn",
  });
  const base = server.resolvedUrls?.local[0];
  if (!base) throw new Error("cv-pdf: the preview server reported no address");
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ colorScheme: "light", reducedMotion: "reduce", locale: "en-GB" });
    await context.addInitScript((key) => {
      localStorage.setItem(key, "light");
    }, THEME_STORAGE_KEY);
    const page = await context.newPage();
    await openCv(page, base);

    const sheet = page.locator(SHEET);
    const footer = (await sheet.getAttribute(CV_PDF_ATTRIBUTE.footer)) ?? "";
    if (!footer) throw new Error(`cv-pdf: the sheet has no ${CV_PDF_ATTRIBUTE.footer}`);
    const text = (await sheet.textContent()) ?? "";
    // Each element and its classes, in document order: as src/app/seo/cv-pdf.test.tsx lists them.
    const classes = await sheet.evaluate((element) =>
      [element, ...element.querySelectorAll("*")]
        .map((node) => node.localName + "." + (node.getAttribute("class") ?? ""))
        .join("\n"),
    );

    await page.emulateMedia({ media: "print", colorScheme: "light" });
    // After print.css, so these margins win over its 17mm for other printouts.
    await page.addStyleTag({ content: pageCss(footer, await footerFont(page)) });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await preparePdfLinks(page);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      tagged: true,
      outline: true,
      margin: MARGIN,
    });
    const pages = pageCount(pdf);
    if (pages < 1 || pages > MAX_PAGES)
      throw new Error(`cv-pdf: the CV takes ${String(pages)} pages, at most ${String(MAX_PAGES)} fit: shorten it`);
    if (!pdf.includes("/StructTreeRoot")) throw new Error("cv-pdf: the PDF is not tagged");

    await writeFile(PDF, pdf);
    const lock = { textHash: hash(text + "\n" + footer), classHash: hash(classes), pages };
    await writeFile(LOCK, JSON.stringify(lock, null, 2) + "\n");
    console.log(`cv-pdf: ${PDF} (${String(pages)} pages, ${String(Math.round(pdf.length / 1024))} KB) and ${LOCK}`);
  } finally {
    await browser.close();
    await server.close();
  }
}

await main();
