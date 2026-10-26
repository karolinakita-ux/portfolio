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
      // The name from content, roughly as a screen reader builds it: hidden parts out, images by their alt text.
      const content = el.cloneNode(true) as HTMLElement;
      for (const hidden of content.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
      for (const img of content.querySelectorAll("img")) img.replaceWith(img.alt);
      const name = (el.getAttribute("aria-label") ?? content.textContent).replace(/\s+/g, " ").trim();
      // WCAG 2.4.11 Focus Not Obscured: hit-test a 5 x 5 grid over the part of the element inside the
      // viewport. A point counts as shown when the topmost element there is the focused one, inside it, or
      // one of its ancestors; anything else (sticky header, consent box) covers it.
      const left = Math.max(rect.left, 0);
      const right = Math.min(rect.right, window.innerWidth);
      const top = Math.max(rect.top, 0);
      const bottom = Math.min(rect.bottom, window.innerHeight);
      let shown = 0;
      let total = 0;
      let cover: Element | null = null;
      if (right > left && bottom > top) {
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            const hit = document.elementFromPoint(
              left + ((right - left) * (i + 0.5)) / 5,
              top + ((bottom - top) * (j + 0.5)) / 5,
            );
            total++;
            if (hit && (hit === el || el.contains(hit) || hit.contains(el))) shown++;
            else cover ??= hit;
          }
        }
      }
      const describe = (n: Element | null): string => {
        const box = n?.closest("header, footer, aside, dialog, nav, section[aria-labelledby], [role]") ?? n;
        if (!box) return "nothing (off screen)";
        const labelledBy = box.getAttribute("aria-labelledby");
        const label =
          box.getAttribute("aria-label") ??
          (labelledBy ? document.getElementById(labelledBy)?.textContent.trim() : undefined) ??
          box.id;
        return `<${box.tagName.toLowerCase()}${label ? ` "${label}"` : ""}>`;
      };
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
        shown: total ? shown / total : 0,
        coveredBy: shown === total && total > 0 ? null : describe(cover),
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

/** WCAG 2.4.11 fails only when the focused element is entirely hidden; partly covered is noted (AAA 2.4.12). */
function coverNote(s: TabStop): string {
  if (s.shown === 0) return `  !! HIDDEN (2.4.11) by ${s.coveredBy ?? "?"}`;
  if (s.shown < 1) return `  partly covered by ${s.coveredBy ?? "?"} (${String(Math.round(s.shown * 100))}% shown)`;
  return "";
}

/** One line per Tab stop, flagging stops without a visible focus style and stops something hides. */
export const formatTab = (stops: TabStop[]): string =>
  stops
    .map(
      (s) =>
        `${String(s.index + 1).padStart(3)}. <${s.tag}${s.role ? ` role=${s.role}` : ""}> "${s.name}"` +
        `${s.href ? ` href=${s.href}` : ""}${s.inDialog ? " [dialog]" : ""}` +
        ` @(${String(s.rect.x)},${String(s.rect.y)} ${String(s.rect.w)}x${String(s.rect.h)})` +
        (s.visibleIndicator ? "" : "  !! NO VISIBLE FOCUS STYLE") +
        coverNote(s) +
        `\n      ${s.focusStyle}`,
    )
    .join("\n");
