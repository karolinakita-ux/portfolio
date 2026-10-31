import { useEffect, type RefObject } from "react";

import { prefersReducedMotion } from "#shared/lib/ui/ui.utils.ts";

import { ANCHOR_HELD_ATTRIBUTE } from "./anchor.constants.ts";
import { findAnchorTarget } from "./anchor.utils.ts";
import type { Route } from "./history.types.ts";

/**
 * After each navigation: restore scroll (Back / Forward), land on an anchor, or go to the top,
 * and move focus to the new view (or the anchored heading). `route` is a new object on every
 * navigation (route.key increments), so it is the trigger. The first load only acts on a deep
 * link to a section (/about#career). On a prerendered page the section-link script in index.html
 * has already landed it and keeps it in place (ANCHOR_HELD_ATTRIBUTE), and the visitor may have
 * scrolled on since: the app only moves focus there. Without that HTML (the dev server, a one-page
 * build) the app scrolls to it once. A link to a section of the open page that the browser follows
 * itself (route.afterBrowserJump) lands after the browser's own jump to the section.
 */
export function useRouteFocus(route: Route, mainRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (route.key === 0) {
      const target = findAnchorTarget(route.anchor);
      if (!target) return undefined;
      const landed = document.documentElement.hasAttribute(ANCHOR_HELD_ATTRIBUTE);
      const frame = window.requestAnimationFrame(() => {
        if (!landed) target.scrollIntoView({ block: "start", behavior: "auto" });
        target.focus({ preventScroll: true });
      });
      return () => window.cancelAnimationFrame(frame);
    }
    const focusMain = () => mainRef.current?.focus({ preventScroll: true });

    if (route.restoreY !== null) {
      const top = route.restoreY;
      const frame = window.requestAnimationFrame(() => {
        window.scrollTo({ top, behavior: "auto" });
        focusMain();
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const smooth = route.smooth && !prefersReducedMotion();
    const land = () => {
      const target = findAnchorTarget(route.anchor);
      if (target) {
        target.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
        target.focus({ preventScroll: true });
      } else {
        window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
        focusMain();
      }
    };
    if (!route.afterBrowserJump) {
      land();
      return undefined;
    }
    // The browser jumps to the section (its top, not its heading) as part of the navigation, which may come after
    // this effect: land in the next frame, after that jump and before it is painted.
    const frame = window.requestAnimationFrame(land);
    return () => window.cancelAnimationFrame(frame);
  }, [mainRef, route]);
}
