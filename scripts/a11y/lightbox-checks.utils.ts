import { writeFile } from "node:fs/promises";
import type { Page } from "playwright";

import { LIGHTBOX_TAB_PRESSES, LIGHTBOX_VIEW, OUT, THEMES, VIEWPORTS } from "./a11y.constants.ts";
import type { AuditContext, TabStop, ViewportName } from "./a11y.types.ts";
import { clip } from "./a11y.utils.ts";
import { runAxe } from "./axe.utils.ts";
import { newPage, openView } from "./pages.utils.ts";
import { loadScreenReader, screenReaderTranscript } from "./screen-reader.utils.ts";

/** Presses Tab inside the open viewer and records where focus goes; focus on <body> is the browser's own UI. */
async function dialogTabStops(page: Page): Promise<TabStop[]> {
  const stops: TabStop[] = [];
  for (let i = 0; i < LIGHTBOX_TAB_PRESSES; i++) {
    await page.keyboard.press("Tab");
    // Focus on <body> means it went to the browser's own UI, which a native modal dialog allows.
    const inDialog = await page.evaluate(
      () =>
        !document.activeElement ||
        document.activeElement === document.body ||
        document.activeElement.closest("dialog[open]") !== null,
    );
    const name = await page.evaluate(() =>
      (document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent ?? "").trim(),
    );
    stops.push({
      index: i,
      tag: await page.evaluate(() => document.activeElement?.tagName.toLowerCase() ?? "none"),
      role: null,
      name: clip(name.replace(/\s+/g, " "), 90),
      href: null,
      focusStyle: "",
      visibleIndicator: true,
      rect: { x: 0, y: 0, w: 0, h: 0 },
      inDialog,
      shown: 1,
      coveredBy: null,
    });
  }
  return stops;
}

/**
 * The image viewer opened with the large text size (checkLargeText): its toolbar wraps rather than leaving the panel,
 * so the dialog does not scroll sideways and every control sits inside the panel (WCAG 1.4.4). Returns what breaks.
 */
export async function openLightboxMisses(page: Page, base: string): Promise<string[]> {
  await openView(page, base, LIGHTBOX_VIEW);
  await page
    .getByRole("button", { name: /^View full size/ })
    .first()
    .click();
  const dialog = page.locator("dialog[open]");
  await dialog.waitFor();
  await page.waitForTimeout(300);
  return dialog.evaluate((element) => {
    const misses: string[] = [];
    const sideways = element.scrollWidth - element.clientWidth;
    if (sideways > 1) misses.push(`the dialog scrolls ${sideways}px sideways`);
    const panel = element.querySelector("figure")?.getBoundingClientRect();
    if (!panel) return [...misses, "no panel"];
    for (const control of element.querySelectorAll<HTMLElement>("figure button, figure [role='group'] p")) {
      const box = control.getBoundingClientRect();
      if (box.width > 0 && (box.left < panel.left - 1 || box.right > panel.right + 1))
        misses.push(`"${control.getAttribute("aria-label") ?? control.textContent.trim()}" outside the panel`);
    }
    return misses;
  });
}

/** 4. Image viewer: open, axe, screen reader inside the dialog, Tab containment, zoom, Escape. */
export async function checkLightbox({ browser, base, vsrBundle, axeRuns, notes }: AuditContext): Promise<void> {
  for (const viewport of Object.keys(VIEWPORTS) as ViewportName[]) {
    for (const theme of THEMES) {
      const page = await newPage(browser, viewport, theme);
      await openView(page, base, LIGHTBOX_VIEW);
      const trigger = page.getByRole("button", { name: /^View full size/ }).first();
      const triggerName = (await trigger.textContent())?.replace(/\s+/g, " ").trim() ?? "";
      await trigger.evaluate((el) => (el.dataset.a11yTrigger = "1"));
      await trigger.click();
      const dialog = page.locator("dialog[open]");
      await dialog.waitFor();
      await page.waitForTimeout(300);
      axeRuns.push(await runAxe(page, `lightbox open | ${theme} | ${viewport}`));

      if (theme === "light") {
        await loadScreenReader(page, vsrBundle);
        const transcript = await screenReaderTranscript(page, "dialog[open]");
        await writeFile(`${OUT}/sr/lightbox-${viewport}.txt`, transcript.join("\n") + "\n");
        const stops = await dialogTabStops(page);
        const escaped = stops.filter((s) => !s.inDialog);
        await writeFile(
          `${OUT}/tab/lightbox-${viewport}.txt`,
          stops
            .map((s) => `${s.index + 1}. <${s.tag}> "${s.name}"${s.inDialog ? "" : "  !! OUTSIDE DIALOG"}`)
            .join("\n") + "\n",
        );
        if (escaped.length) notes.push(`Lightbox (${viewport}): Tab left the open dialog ${escaped.length} time(s)`);
      }

      // The zoom buttons show on every screen, phones included.
      const zoomIn = page.getByRole("button", { name: "Zoom in" });
      if (await zoomIn.isVisible()) {
        await zoomIn.click();
        await zoomIn.click();
        await page.waitForTimeout(300);
        axeRuns.push(await runAxe(page, `lightbox zoomed | ${theme} | ${viewport}`));
      } else notes.push(`Lightbox (${viewport}, ${theme}): no visible "Zoom in" button`);

      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      const focus = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return {
          onTrigger: el?.dataset.a11yTrigger === "1",
          text: (el?.getAttribute("aria-label") ?? el?.textContent ?? "").replace(/\s+/g, " ").trim(),
        };
      });
      const stillOpen = await page.locator("dialog[open]").count();
      if (stillOpen) notes.push(`Lightbox (${viewport}, ${theme}): Escape did not close the dialog`);
      if (!focus.onTrigger)
        notes.push(
          `Lightbox (${viewport}, ${theme}): focus after Escape is on "${clip(focus.text, 80)}", not the trigger "${clip(triggerName, 80)}"`,
        );
      await page.context().close();
    }
  }
}
