/**
 * Accessibility audit in real Chromium: `yarn a11y`.
 *
 * For every view (light + dark, phone + desktop width) it records:
 *   - axe-core results for WCAG 2.0 / 2.1 / 2.2, levels A and AA (plus best-practice hints)
 *   - what an emulated screen reader (Guidepup Virtual Screen Reader) announces, top to bottom
 *   - the Tab order, with each stop's focus style, size, position and whether anything hides it
 *     (WCAG 2.4.11), also with the statistics consent box showing
 *   - horizontal overflow at 320 px wide (WCAG 1.4.10 Reflow)
 *   - the browser's default text size at 200%: no sideways scrolling, no text cut off (WCAG 1.4.4)
 *   - forced colours (Windows contrast themes): a focus outline on every Tab stop, and a screenshot per view
 * plus the image viewer: opened, zoomed, Tab containment and focus return on Escape.
 * The checks live in scripts/a11y/.
 *
 * Output goes to a11y-report/ (gitignored): summary.md, axe.json, sr/*.txt, tab/*.txt, forced-colors/*.png.
 * Exits with code 1 when axe finds WCAG A/AA violations.
 */
import { mkdir, readFile, rm } from "node:fs/promises";
import { chromium } from "playwright";
import { createServer } from "vite";

import { OUT } from "./a11y/a11y.constants.ts";
import type { AuditContext } from "./a11y/a11y.types.ts";
import { checkLightbox } from "./a11y/lightbox-checks.utils.ts";
import { writeReport } from "./a11y/report.utils.ts";
import { vsrBundlePath } from "./a11y/screen-reader.utils.ts";
import { checkForcedColors, checkLargeText } from "./a11y/settings-checks.utils.ts";
import { checkAxe, checkFocusWithConsent, checkReflow, checkScreenReaderAndTab } from "./a11y/view-checks.utils.ts";

async function main(): Promise<void> {
  // Clear the contents, not the folder: Windows will not remove a folder that a shell or editor has open.
  for (const entry of ["sr", "tab", "forced-colors", "axe.json", "summary.md"])
    await rm(`${OUT}/${entry}`, { recursive: true, force: true });
  await mkdir(`${OUT}/sr`, { recursive: true });
  await mkdir(`${OUT}/tab`, { recursive: true });

  const server = await createServer({ logLevel: "error", server: { port: 5199, strictPort: false } });
  await server.listen();
  const base = server.resolvedUrls?.local[0];
  if (!base) throw new Error("Vite dev server did not report a URL");
  const context: AuditContext = {
    browser: await chromium.launch(),
    base,
    vsrBundle: await readFile(vsrBundlePath, "utf8"),
    axeRuns: [],
    notes: [],
  };

  try {
    await checkAxe(context);
    await checkScreenReaderAndTab(context);
    await checkFocusWithConsent(context);
    await checkReflow(context);
    await checkLargeText(context);
    await checkForcedColors(context);
    await checkLightbox(context);
  } finally {
    await context.browser.close();
    await server.close();
  }

  if (await writeReport(context.axeRuns, context.notes)) process.exitCode = 1;
}

await main();
