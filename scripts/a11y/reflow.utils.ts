import type { Page } from "playwright";

import type { ReflowResult } from "./a11y.types.ts";

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
