import { writeFile } from "node:fs/promises";

import { VIEWS } from "#shared/lib/routes/routes.constants.ts";

import { CONSENT_VIEWS, OUT, THEMES, VIEWPORTS } from "./a11y.constants.ts";
import type { AuditContext, ViewportName } from "./a11y.types.ts";
import { runAxe } from "./axe.utils.ts";
import { consentBox, newPage, openView, showConsentBox } from "./pages.utils.ts";
import { inReach, reflow } from "./reflow.utils.ts";
import { loadScreenReader, screenReaderTranscript } from "./screen-reader.utils.ts";
import { formatTab, tabOrder } from "./tab-order.utils.ts";

const VIEWPORT_NAMES = Object.keys(VIEWPORTS) as ViewportName[];

/** 1. axe on every view × theme × viewport. */
export async function checkAxe({ browser, base, axeRuns }: AuditContext): Promise<void> {
  for (const theme of THEMES) {
    for (const viewport of VIEWPORT_NAMES) {
      const page = await newPage(browser, viewport, theme);
      for (const view of VIEWS) {
        await openView(page, base, view);
        axeRuns.push(await runAxe(page, `${view} | ${theme} | ${viewport}`));
        process.stdout.write(".");
      }
      await page.context().close();
    }
  }
}

/** 2. Emulated screen reader + Tab order (light theme, both widths). */
export async function checkScreenReaderAndTab({ browser, base, vsrBundle, notes }: AuditContext): Promise<void> {
  for (const viewport of VIEWPORT_NAMES) {
    const page = await newPage(browser, viewport, "light");
    for (const view of VIEWS) {
      await openView(page, base, view);
      await loadScreenReader(page, vsrBundle);
      const transcript = await screenReaderTranscript(page, "body");
      await writeFile(`${OUT}/sr/${view}-${viewport}.txt`, transcript.join("\n") + "\n");
      await openView(page, base, view);
      const stops = await tabOrder(page);
      await writeFile(`${OUT}/tab/${view}-${viewport}.txt`, formatTab(stops) + "\n");
      const missing = stops.filter((s) => !s.visibleIndicator).length;
      if (missing) notes.push(`${view} (${viewport}): ${missing} Tab stop(s) without a detectable focus style`);
      const hidden = stops.filter((s) => s.shown === 0);
      if (hidden.length)
        notes.push(
          `${view} (${viewport}): ${hidden.length} Tab stop(s) hidden when focused (2.4.11), e.g. "${hidden[0]?.name}"`,
        );
      process.stdout.write("+");
    }
    await page.context().close();
  }
}

/**
 * 2b. Tab order with the statistics consent box showing (WCAG 2.4.11 Focus Not Obscured): the box stays at
 * the bottom of every page until the visitor answers, so no focused element may end up entirely behind it.
 * Phone and desktop width, a 320 x 568 phone, where a fixed box would reach under the header, and a 1280 x 1024
 * screen at 400% zoom, where the box is taller than the window; on both it sits in the page instead, all of it
 * within reach of scrolling (WCAG 1.4.10 Reflow).
 */
export async function checkFocusWithConsent({ browser, base, notes }: AuditContext): Promise<void> {
  for (const viewport of [...VIEWPORT_NAMES, "small", "zoom"] as const) {
    const page = await newPage(browser, viewport, "light");
    await showConsentBox(page);
    for (const view of CONSENT_VIEWS) {
      await openView(page, base, view);
      const box = consentBox(page);
      if (!(await box.isVisible())) {
        notes.push(`Consent box did not show on ${view} (${viewport}): the 2.4.11 check did not run`);
        continue;
      }
      if ((viewport === "zoom" || viewport === "small") && !(await inReach(box)))
        notes.push(`${view} (${viewport}): part of the consent box cannot be scrolled to (1.4.10)`);
      const stops = await tabOrder(page);
      await writeFile(`${OUT}/tab/${view}-${viewport}-consent.txt`, formatTab(stops) + "\n");
      const hidden = stops.filter((s) => s.shown === 0);
      if (hidden.length)
        notes.push(
          `${view} (${viewport}, consent box showing): ${hidden.length} Tab stop(s) hidden when focused (2.4.11), e.g. "${hidden[0]?.name}" by ${hidden[0]?.coveredBy ?? "?"}`,
        );
      process.stdout.write("c");
    }
    await page.context().close();
  }
}

/** 3. Reflow at 320 px. */
export async function checkReflow({ browser, base, notes }: AuditContext): Promise<void> {
  const page = await newPage(browser, "reflow", "light");
  for (const view of VIEWS) {
    await openView(page, base, view);
    const r = await reflow(page);
    if (r.pageScrolls || r.offenders.length)
      notes.push(`Reflow 320px ${view}: page scrolls sideways=${r.pageScrolls}; ${r.offenders.join("; ")}`);
  }
  await page.context().close();
}
