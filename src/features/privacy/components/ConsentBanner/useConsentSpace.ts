import { useEffect, type RefObject } from "react";

/**
 * While the consent box floats over the page, publishes the strip it covers at the bottom of the window
 * (from its top edge down, plus a 16px gap) as --kb-consent-h on <html>. base.css turns it into
 * scroll-padding-bottom, so the browser scrolls a newly focused element above the box, and into the same
 * space at the end of the page, so the last links can scroll clear of it too (WCAG 2.4.11 Focus Not
 * Obscured). On short viewports the box sits in the page instead (short:static, WCAG 1.4.10) and covers
 * nothing. Removed with the box.
 */
export function useConsentSpace(boxRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const node = boxRef.current;
    if (!node) return undefined;
    const root = document.documentElement;
    const publish = () => {
      if (getComputedStyle(node).position !== "fixed") {
        root.style.removeProperty("--kb-consent-h");
        return;
      }
      const covers = Math.max(0, Math.round(window.innerHeight - node.getBoundingClientRect().top));
      root.style.setProperty("--kb-consent-h", String(covers + 16) + "px");
    };
    publish();
    window.addEventListener("resize", publish);
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(publish) : null;
    observer?.observe(node);
    return () => {
      window.removeEventListener("resize", publish);
      observer?.disconnect();
      root.style.removeProperty("--kb-consent-h");
    };
  }, [boxRef]);
}
