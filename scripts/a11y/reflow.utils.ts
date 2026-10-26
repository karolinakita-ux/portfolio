import type { Locator, Page } from "playwright";

import type { ReflowResult } from "./a11y.types.ts";

/**
 * Whether all of an element can be scrolled to: it sits in the page (a fixed box taller than the window
 * keeps its top out of reach for good) and starts within the page's top and side edges (WCAG 1.4.10).
 */
export async function inReach(element: Locator): Promise<boolean> {
  return element.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const inPage = getComputedStyle(node).position !== "fixed";
    const width = document.documentElement.clientWidth;
    return inPage && rect.top + window.scrollY >= 0 && rect.left >= 0 && rect.right <= width + 1;
  });
}

/** Elements that stick out past the right edge at 320 px (WCAG 1.4.10). */
export async function reflow(page: Page): Promise<ReflowResult> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const pageScrolls = document.documentElement.scrollWidth > vw + 1;
    const offenders: string[] = [];
    for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.right <= vw + 1) continue;
      // Skip children of a container that scrolls on purpose (e.g. tables, code).
      let scrollParent = el.parentElement;
      let insideScroller = false;
      while (scrollParent && scrollParent !== document.body) {
        const ox = getComputedStyle(scrollParent).overflowX;
        if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") {
          insideScroller = true;
          break;
        }
        scrollParent = scrollParent.parentElement;
      }
      if (insideScroller) continue;
      const cls = typeof el.className === "string" ? el.className.slice(0, 80) : "";
      offenders.push(`${el.tagName.toLowerCase()}.${cls} right=${Math.round(rect.right)}px`);
      if (offenders.length >= 10) break;
    }
    return { pageScrolls, offenders };
  });
}
