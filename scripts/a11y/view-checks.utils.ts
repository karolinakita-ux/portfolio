import { writeFile } from "node:fs/promises";

import { VIEWS } from "#shared/lib/routes/routes.constants.ts";

import { OUT, THEMES, VIEWPORTS } from "./a11y.constants.ts";
import type { AuditContext, ViewportName } from "./a11y.types.ts";
import { runAxe } from "./axe.utils.ts";
import { newPage, openView } from "./pages.utils.ts";
import { reflow } from "./reflow.utils.ts";
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
      process.stdout.write("+");
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
