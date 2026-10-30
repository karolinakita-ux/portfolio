import { mkdir, writeFile } from "node:fs/promises";
import type { Page } from "playwright";

import { VIEWS } from "#shared/lib/routes/routes.constants.ts";

import { LARGE_TEXT_PX, OUT, VIEWPORTS } from "./a11y.constants.ts";
import type { AuditContext } from "./a11y.types.ts";
import { newPage, openView } from "./pages.utils.ts";
import { reflow } from "./reflow.utils.ts";
import { formatTab, tabOrder } from "./tab-order.utils.ts";

/** Elements whose text overflow: hidden or clip cuts off; visually hidden text (1 x 1 px) is skipped. */
async function clippedText(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
      const style = getComputedStyle(el);
      if (!/hidden|clip/.test(style.overflowX + style.overflowY) || el.clientWidth <= 2 || el.clientHeight <= 2)
        continue;
      const cut = el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
      const text = el.textContent.trim();
      if (cut && text) out.push(`<${el.tagName.toLowerCase()}> "${text.slice(0, 40)}"`);
    }
    return out;
  });
}

/**
 * 4. A larger default text size, set the way the browser's own font-size setting sets it (DevTools
 * Page.setFontSizes; WCAG 1.4.4 Resize Text). Text, spacing and layout are in rem, so the page grows as it
 * does with zoom: at phone and desktop width nothing may scroll sideways or be cut off.
 */
export async function checkLargeText({ browser, base, notes }: AuditContext): Promise<void> {
  for (const viewport of ["phone", "desktop"] as const) {
    const page = await newPage(browser, viewport, "light");
    const devtools = await page.context().newCDPSession(page);
    await devtools.send("Page.enable");
    await devtools.send("Page.setFontSizes", {
      fontSizes: { standard: LARGE_TEXT_PX, fixed: Math.round(LARGE_TEXT_PX * 0.8125) },
    });
    for (const view of VIEWS) {
      await openView(page, base, view);
      const root = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
      if (root !== `${LARGE_TEXT_PX}px`) {
        notes.push(`Large text ${view} (${viewport}): the browser text size did not apply (root ${root})`);
        continue;
      }
      const r = await reflow(page);
      if (r.pageScrolls || r.offenders.length)
        notes.push(
          `Large text ${view} (${viewport}): page scrolls sideways=${r.pageScrolls}; ${r.offenders.join("; ")}`,
        );
      const cut = await clippedText(page);
      if (cut.length) notes.push(`Large text ${view} (${viewport}): text cut off in ${cut.join("; ")} (1.4.4)`);
      process.stdout.write("t");
    }
    await page.context().close();
  }
}

/**
 * 5. Windows contrast themes (forced colours): the browser replaces every colour and drops box shadows, so a
 * focus style has to be an outline, and a state must not rest on a background colour alone. The Tab order
 * at desktop width with forced colours on, and a screenshot of each view for the reviewer
 * (a11y-report/forced-colors/).
 */
export async function checkForcedColors({ browser, base, notes }: AuditContext): Promise<void> {
  const context = await browser.newContext({
    viewport: VIEWPORTS.desktop,
    reducedMotion: "reduce",
    forcedColors: "active",
  });
  const page = await context.newPage();
  await mkdir(`${OUT}/forced-colors`, { recursive: true });
  for (const view of VIEWS) {
    await openView(page, base, view);
    await page.screenshot({ path: `${OUT}/forced-colors/${view}.png`, fullPage: true });
    const stops = await tabOrder(page);
    await writeFile(`${OUT}/tab/${view}-forced-colors.txt`, formatTab(stops) + "\n");
    const missing = stops.filter((s) => !s.visibleIndicator);
    if (missing.length)
      notes.push(
        `Forced colours ${view}: ${missing.length} Tab stop(s) without a focus outline (2.4.7), e.g. "${missing[0]?.name}"`,
      );
    process.stdout.write("f");
  }
  await context.close();
}
