import type { Page } from "playwright";

import { MAX_TAB_STOPS } from "./a11y.constants.ts";
import type { TabStop } from "./a11y.types.ts";

/** Presses Tab through the page and records each stop: element, name, focus style, size and position. */
export async function tabOrder(page: Page): Promise<TabStop[]> {
  // The app moves focus to <main> after a view loads (in an animation frame): let that settle first.
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    window.scrollTo(0, 0);
  });
  const stops: TabStop[] = [];
  for (let index = 0; index < MAX_TAB_STOPS; index++) {
    await page.keyboard.press("Tab");
    // Let focus styles settle (two frames) so the report shows the ring as it ends, not the first frame of a transition.
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    );
    const stop = await page.evaluate((index) => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      // Focused by script, not by Tab (e.g. <main tabindex="-1"> after navigation): not a Tab stop.
      if (el.getAttribute("tabindex") === "-1") return "skip" as const;
      if (el.dataset.a11yVisited) return "wrapped" as const;
      el.dataset.a11yVisited = "1";
      const style = getComputedStyle(el);
      const outline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
      const shadow = style.boxShadow !== "none" && style.boxShadow !== "";
      const rect = el.getBoundingClientRect();
      const name = (el.getAttribute("aria-label") ?? el.textContent).replace(/\s+/g, " ").trim();
      return {
        index,
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute("role"),
        name: name.length > 90 ? name.slice(0, 90) + "…" : name,
        href: el.getAttribute("href"),
        focusStyle: `outline: ${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}; box-shadow: ${style.boxShadow}`,
        visibleIndicator: outline || shadow,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        inDialog: el.closest("dialog[open]") !== null,
      };
    }, index);
    if (stop === "wrapped") break;
    if (stop === "skip") continue;
    if (!stop) {
      if (index > 0) break; // focus left the page (back to the browser UI)
      continue;
    }
    stops.push(stop);
  }
  return stops;
}

/** One line per Tab stop, flagging stops without a visible focus style. */
export const formatTab = (stops: TabStop[]): string =>
  stops
    .map(
      (s) =>
        `${String(s.index + 1).padStart(3)}. <${s.tag}${s.role ? ` role=${s.role}` : ""}> "${s.name}"` +
        `${s.href ? ` href=${s.href}` : ""}${s.inDialog ? " [dialog]" : ""}` +
        ` @(${s.rect.x},${s.rect.y} ${s.rect.w}x${s.rect.h})` +
        `${s.visibleIndicator ? "" : "  !! NO VISIBLE FOCUS STYLE"}\n      ${s.focusStyle}`,
    )
    .join("\n");
