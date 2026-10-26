import type { Page } from "@playwright/test";

import type { RingTransition } from "./helpers.types.ts";

/**
 * Every keyboard-focusable element on the page (visible, not inert, not tabindex -1) and the ones whose
 * focus ring would fade in instead of appearing at once: a transition on the outline, or on the opacity of
 * an element that is hidden until hover or focus (opacity 0), which fades its ring in with it. Listed from
 * the DOM rather than by pressing Tab, because WebKit's Tab skips links by default (as Safari does), and the
 * transition settings do not depend on focus.
 */
export async function focusRingFades(page: Page): Promise<{ focusable: number; transitions: RingTransition[] }> {
  return page.evaluate(() => {
    const FOCUSABLE = "a[href], button, input, select, textarea, summary, [tabindex]";
    const OUTLINE = ["all", "outline", "outline-color", "outline-width", "outline-offset"];
    const elements = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) =>
        el.getAttribute("tabindex") !== "-1" &&
        !el.closest("[inert]") &&
        !(el as HTMLButtonElement).disabled &&
        el.getClientRects().length > 0,
    );
    const transitions = elements.flatMap((el) => {
      const style = getComputedStyle(el);
      const watched = style.opacity === "0" ? [...OUTLINE, "opacity"] : OUTLINE;
      const properties = style.transitionProperty.split(",").map((value) => value.trim());
      const durations = style.transitionDuration.split(",").map((value) => value.trim());
      const name = (el.getAttribute("aria-label") ?? el.textContent).replace(/\s+/g, " ").trim().slice(0, 60);
      return properties.flatMap((property, i) => {
        // transition-duration repeats its list when it is shorter than transition-property.
        const duration = durations[i % durations.length] ?? "0s";
        return parseFloat(duration) > 0 && watched.includes(property)
          ? [{ element: `${el.tagName.toLowerCase()} "${name}"`, property, duration }]
          : [];
      });
    });
    return { focusable: elements.length, transitions };
  });
}
